from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import engine
import jwt
from config import settings
from sqlalchemy import text
import bcrypt
import uuid
import httpx
import os
import base64
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from deepagents import create_deep_agent
from google import genai


from middleware.authmiddleware import AuthMiddleware

os.environ["GEMINI_API_KEY"] = settings.GEMINI_API_KEY
os.environ["GOOGLE_API_KEY"] = settings.GOOGLE_API_KEY
# os.environ["OPENROUTER_API_KEY"] = settings.OPENROUTER_API_KEY


app=FastAPI()
client = genai.Client()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://nobelium-nine-liart.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add authentication middleware
app.add_middleware(AuthMiddleware)

class SignUpSchema(BaseModel):
    email:str
    password:str

class SignInSchema(BaseModel):
    email:str
    password:str

class EmailAgentSchema(BaseModel):
    email:str 


class SuggestAgent(BaseModel):
    prompt: str
    thread_id: str | None = None


def init_db():
    conn=engine.connect()
    with open("migrations/init.sql") as f:
        conn.execute(text(f.read()))
        conn.commit()

init_db() 



@app.post("/signup")
async def signup(req:SignUpSchema):
    email=req.email
    password=req.password
    id=uuid.uuid4()
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    try:
        conn=engine.connect()
        conn.execute(text('INSERT INTO "USER" (id,email, password) VALUES(:id,:email, :password)'),{"id":id,"email":email,"password":hashed})
        conn.commit()
        return ({"message": "signup successful"})
    except Exception as e:
        print(f"Error: {e}")
        return ({"error": "email already exists"})

@app.post("/signin")
async def signin(req:SignInSchema):
    email=req.email
    password=req.password   
    conn=engine.connect()
    result=conn.execute(text('SELECT * FROM "USER" WHERE email = :email'),{"email":email})
    user=result.fetchone()
    if not user:
        return({"message":"email not exist"})
    hashed=user.password.encode('utf-8')
    if bcrypt.checkpw(password.encode('utf-8'), hashed):
        token=jwt.encode({"sub": email},settings.JWT_SECRET,algorithm="HS256")
        response=JSONResponse({"message":"signin successful","token":token})
        response.set_cookie(
            key="token",
            value=token,
            httponly=True,
            samesite="lax",
            secure=False 
        )
        return response
    else:
        return({"message":"wrong password"})
    

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

@app.get("/google/oauth")
async def google_oauth():
    params = {
        "client_id": settings.CLIENT_ID,
        "redirect_uri": settings.REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar",
        "access_type": "offline",
        "prompt": "consent",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    print(f"={GOOGLE_AUTH_URL}?{query}")
    return RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{query}")

@app.get("/google/oauth/callback")
async def google_oauth_callback(code: str):
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": settings.CLIENT_ID,
            "client_secret": settings.CLIENT_SECRET,
            "redirect_uri": settings.REDIRECT_URI,
            "grant_type": "authorization_code",
        })
    if token_resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to exchange code for token")

    token_data = token_resp.json()
    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")

    async with httpx.AsyncClient() as client:
        userinfo_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if userinfo_resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch user info")

    userinfo = userinfo_resp.json()
    email = userinfo.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="No email in Google account")

    with engine.connect() as conn:
        result = conn.execute(text('SELECT * FROM "USER" WHERE email = :email'), {"email": email})
        user = result.fetchone()
        if not user:
            new_id = uuid.uuid4()
            conn.execute(
                text('INSERT INTO "USER" (id, email, password, google_access_token, google_refresh_token) VALUES (:id, :email, :password, :access_token, :refresh_token)'),
                {"id": new_id, "email": email, "password": "", "access_token": access_token, "refresh_token": refresh_token},
            )
        else:
            conn.execute(
                text('UPDATE "USER" SET google_access_token = :access_token, google_refresh_token = :refresh_token WHERE email = :email'),
                {"access_token": access_token, "refresh_token": refresh_token, "email": email},
            )
        conn.commit()

    jwt_token = jwt.encode({"sub": email}, settings.JWT_SECRET, algorithm="HS256")
    response= RedirectResponse(url=f"{settings.FRONTEND_URL}/user")
    response.set_cookie(
        key="token",
        value=jwt_token,
        httponly=True,
        samesite="lax",
        secure=False 
    )
    return response


GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me"
CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3"


def messages_to_dict(messages):
    """Convert LangChain message objects to JSON-serializable dictionaries"""
    result = []
    for msg in messages:
        if hasattr(msg, 'dict'):
            result.append(msg.dict())
        elif hasattr(msg, 'model_dump'):
            result.append(msg.model_dump())
        elif isinstance(msg, dict):
            result.append(msg)
        else:
            result.append({
                "role": getattr(msg, 'type', 'unknown'),
                "content": getattr(msg, 'content', str(msg))
            })
    return result


@app.get("/me")
def get_me(request: Request):
    token = request.cookies.get("token")

    if not token:
        raise HTTPException(status_code=401)

    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    return {"email": payload["sub"]}



def search_emails(query: str, access_token: str) -> str:
    """Search the Gmail inbox using a search query and return matching emails.
    Returns a JSON string with a list of emails including id, subject, sender, snippet, and date.
    Use standard Gmail search syntax for the query (e.g. 'from:boss@company.com', 'subject:invoice', 'is:unread').
    access_token is the user's Google OAuth access token."""
    headers = {"Authorization": f"Bearer {access_token}"}

    list_resp = httpx.get(
        f"{GMAIL_API_BASE}/messages",
        headers=headers,
        params={"q": query, "maxResults": 10},
    )
    if list_resp.status_code != 200:
        return json.dumps({"error": f"Gmail API error: {list_resp.text}"})

    messages = list_resp.json().get("messages", [])
    if not messages:
        return json.dumps({"results": [], "message": "No emails found matching your query."})

    emails = []
    for msg in messages:
        msg_resp = httpx.get(
            f"{GMAIL_API_BASE}/messages/{msg['id']}",
            headers=headers,
            params={"format": "metadata", "metadataHeaders": ["Subject", "From", "Date"]},
        )
        if msg_resp.status_code != 200:
            continue
        msg_data = msg_resp.json()
        headers_list = msg_data.get("payload", {}).get("headers", [])
        header_map = {h["name"]: h["value"] for h in headers_list}
        emails.append({
            "id": msg_data["id"],
            "threadId": msg_data.get("threadId"),
            "subject": header_map.get("Subject", "(no subject)"),
            "from": header_map.get("From", ""),
            "date": header_map.get("Date", ""),
            "snippet": msg_data.get("snippet", ""),
        })

    return json.dumps({"results": emails})


def send_email(to: str, subject: str, body: str, access_token: str) -> str:
    """Send a new email via Gmail.
    to: recipient email address.
    subject: email subject line.
    body: plain-text email body.
    access_token is the user's Google OAuth access token.
    Returns a JSON string confirming the sent message id."""
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

    mime_msg = MIMEText(body, "plain")
    mime_msg["To"] = to
    mime_msg["Subject"] = subject
    raw = base64.urlsafe_b64encode(mime_msg.as_bytes()).decode("utf-8")

    send_resp = httpx.post(
        f"{GMAIL_API_BASE}/messages/send",
        headers=headers,
        json={"raw": raw},
    )
    if send_resp.status_code not in (200, 201):
        return json.dumps({"error": f"Failed to send email: {send_resp.text}"})

    sent = send_resp.json()
    return json.dumps({"success": True, "messageId": sent.get("id"), "threadId": sent.get("threadId")})


def reply_to_email(message_id: str, body: str, access_token: str) -> str:
    """Reply to an existing Gmail message by its message ID.
    message_id: the Gmail message ID to reply to.
    body: plain-text reply body.
    access_token is the user's Google OAuth access token.
    Returns a JSON string confirming the sent reply."""
    headers = {"Authorization": f"Bearer {access_token}"}

    orig_resp = httpx.get(
        f"{GMAIL_API_BASE}/messages/{message_id}",
        headers=headers,
        params={"format": "metadata", "metadataHeaders": ["Subject", "From", "Message-ID"]},
    )
    if orig_resp.status_code != 200:
        return json.dumps({"error": f"Could not fetch original message: {orig_resp.text}"})

    orig_data = orig_resp.json()
    thread_id = orig_data.get("threadId")
    header_map = {h["name"]: h["value"] for h in orig_data.get("payload", {}).get("headers", [])}

    original_subject = header_map.get("Subject", "")
    reply_subject = original_subject if original_subject.lower().startswith("re:") else f"Re: {original_subject}"
    reply_to_addr = header_map.get("From", "")
    original_message_id = header_map.get("Message-ID", "")

    mime_msg = MIMEText(body, "plain")
    mime_msg["To"] = reply_to_addr
    mime_msg["Subject"] = reply_subject
    if original_message_id:
        mime_msg["In-Reply-To"] = original_message_id
        mime_msg["References"] = original_message_id
    raw = base64.urlsafe_b64encode(mime_msg.as_bytes()).decode("utf-8")

    send_resp = httpx.post(
        f"{GMAIL_API_BASE}/messages/send",
        headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
        json={"raw": raw, "threadId": thread_id},
    )
    if send_resp.status_code not in (200, 201):
        return json.dumps({"error": f"Failed to send reply: {send_resp.text}"})

    sent = send_resp.json()
    return json.dumps({"success": True, "messageId": sent.get("id"), "threadId": sent.get("threadId")})



def search_calendar_events(query: str, time_min: str, time_max: str, access_token: str) -> str:
    """Search Google Calendar events within a time range.
    query: free-text search term to filter events (can be empty string for all events).
    time_min: start of time range in RFC3339 format (e.g. '2025-01-01T00:00:00Z').
    time_max: end of time range in RFC3339 format (e.g. '2025-12-31T23:59:59Z').
    access_token is the user's Google OAuth access token.
    Returns a JSON string with a list of calendar events including id, summary, start, end, and location."""
    headers = {"Authorization": f"Bearer {access_token}"}

    params = {
        "timeMin": time_min,
        "timeMax": time_max,
        "singleEvents": "true",
        "orderBy": "startTime",
        "maxResults": 20,
    }
    if query:
        params["q"] = query

    resp = httpx.get(
        f"{CALENDAR_API_BASE}/calendars/primary/events",
        headers=headers,
        params=params,
    )
    if resp.status_code != 200:
        return json.dumps({"error": f"Calendar API error: {resp.text}"})

    events = resp.json().get("items", [])
    if not events:
        return json.dumps({"results": [], "message": "No calendar events found matching your query."})

    results = []
    for event in events:
        results.append({
            "id": event.get("id"),
            "summary": event.get("summary", "(no title)"),
            "start": event.get("start", {}).get("dateTime") or event.get("start", {}).get("date", ""),
            "end": event.get("end", {}).get("dateTime") or event.get("end", {}).get("date", ""),
            "location": event.get("location", ""),
            "description": event.get("description", ""),
            "htmlLink": event.get("htmlLink", ""),
            "hangoutLink": event.get("hangoutLink", ""),
        })

    return json.dumps({"results": results})


def create_calendar_event(summary: str, start_time: str, end_time: str, description: str, attendees: str, access_token: str) -> str:
    """Create a new Google Calendar event.
    summary: title of the event.
    start_time: event start in RFC3339 format (e.g. '2025-06-01T10:00:00-05:00').
    end_time: event end in RFC3339 format (e.g. '2025-06-01T11:00:00-05:00').
    description: optional description/notes for the event.
    attendees: comma-separated email addresses of attendees (can be empty string for no attendees).
    access_token is the user's Google OAuth access token.
    Returns a JSON string with the created event details."""
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

    event_body = {
        "summary": summary,
        "start": {"dateTime": start_time},
        "end": {"dateTime": end_time},
    }
    if description:
        event_body["description"] = description
    if attendees:
        event_body["attendees"] = [{"email": e.strip()} for e in attendees.split(",") if e.strip()]

    resp = httpx.post(
        f"{CALENDAR_API_BASE}/calendars/primary/events",
        headers=headers,
        json=event_body,
    )
    if resp.status_code not in (200, 201):
        return json.dumps({"error": f"Failed to create calendar event: {resp.text}"})

    created = resp.json()
    return json.dumps({
        "success": True,
        "eventId": created.get("id"),
        "summary": created.get("summary"),
        "start": created.get("start", {}).get("dateTime", ""),
        "end": created.get("end", {}).get("dateTime", ""),
        "htmlLink": created.get("htmlLink", ""),
    })


def create_google_meet(summary: str, start_time: str, end_time: str, description: str, attendees: str, access_token: str) -> str:
    """Create a Google Meet meeting by creating a calendar event with a video conference link.
    summary: title of the meeting.
    start_time: meeting start in RFC3339 format (e.g. '2025-06-01T10:00:00-05:00').
    end_time: meeting end in RFC3339 format (e.g. '2025-06-01T11:00:00-05:00').
    description: optional description/agenda for the meeting.
    attendees: comma-separated email addresses of attendees (can be empty string for no attendees).
    access_token is the user's Google OAuth access token.
    Returns a JSON string with the meeting details including the Google Meet link."""
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

    event_body = {
        "summary": summary,
        "start": {"dateTime": start_time},
        "end": {"dateTime": end_time},
        "conferenceData": {
            "createRequest": {
                "requestId": str(uuid.uuid4()),
                "conferenceSolutionKey": {"type": "hangoutsMeet"},
            }
        },
    }
    if description:
        event_body["description"] = description
    if attendees:
        event_body["attendees"] = [{"email": e.strip()} for e in attendees.split(",") if e.strip()]

    resp = httpx.post(
        f"{CALENDAR_API_BASE}/calendars/primary/events",
        headers=headers,
        params={"conferenceDataVersion": 1},
        json=event_body,
    )
    if resp.status_code not in (200, 201):
        return json.dumps({"error": f"Failed to create Google Meet: {resp.text}"})

    created = resp.json()
    meet_link = created.get("hangoutLink", "")
    conference_data = created.get("conferenceData", {})
    if not meet_link and conference_data:
        entry_points = conference_data.get("entryPoints", [])
        for ep in entry_points:
            if ep.get("entryPointType") == "video":
                meet_link = ep.get("uri", "")
                break

    return json.dumps({
        "success": True,
        "eventId": created.get("id"),
        "summary": created.get("summary"),
        "start": created.get("start", {}).get("dateTime", ""),
        "end": created.get("end", {}).get("dateTime", ""),
        "meetLink": meet_link,
        "htmlLink": created.get("htmlLink", ""),
    })


def extract_text(agent_result):
    content = agent_result.get("content", "")

    if isinstance(content, str):
        return content

    if isinstance(content, list):
        texts = []
        for item in content:
            if isinstance(item, dict) and item.get("type") == "text":
                texts.append(item.get("text", ""))
        return "\n".join(texts)

    return ""


# Friendly display names for available tools
TOOL_DISPLAY_NAMES = {
    "search_emails": "Search Gmail",
    "send_email": "Send Gmail",
    "reply_to_email": "Reply Gmail",
    "search_calendar_events": "Google Calendar",
    "create_calendar_event": "Google Calendar",
    "create_google_meet": "Meet",
}


def extract_agent_metadata(prompt: str, existing_steps: list | None = None) -> dict:
    """
    Dedicated Gemini call that extracts structured metadata from the user's prompt.
    - On initial call (existing_steps=None): returns title, watcheTool, updateTool, new_steps
    - On subsequent calls: returns updateTool (if changed) and only genuinely new steps
    """
    is_initial = existing_steps is None
    tools_desc = "\n".join(f'- {k} → "{v}"' for k, v in TOOL_DISPLAY_NAMES.items())

    existing_note = ""
    if existing_steps:
        existing_note = (
            f"\nSteps already recorded for this automation: {json.dumps(existing_steps)}\n"
            "Only include steps in new_steps that represent genuinely NEW capabilities "
            "not already covered by the existing steps. Return an empty array if nothing is new."
        )

    title_field = '"title": "4-7 word human-readable title for the automation",' if is_initial else ""

    next_step_number = (len(existing_steps) + 1) if existing_steps else 1

    extraction_prompt = f"""Analyze this automation request and return a JSON object.

User prompt: "{prompt}"

Available tools and their display names:
{tools_desc}
{existing_note}
Return ONLY valid JSON with no markdown or explanation:
{{
  {title_field}
  "watcheTool": "display name of the PRIMARY source/trigger tool (what this automation monitors)",
  "updateTool": "display name of the LAST output/action tool in the chain",
  "new_steps": [{{"step": {next_step_number}, "text": "short step description"}}, ...]
}}

Rules:
- watcheTool: the input source (e.g. "Search Gmail" when monitoring inbox)
- updateTool: the final action taken (e.g. "Reply Gmail" when sending replies); update this if the new prompt introduces a different output tool
- new_steps: number the steps starting from {next_step_number} (continuing from existing steps).
  Each step is an object with "step" (integer) and "text" (short plain-English description).
  Example format:
  [
    {{"step": {next_step_number}, "text": "Monitors Gmail for incoming order emails"}},
    {{"step": {next_step_number + 1}, "text": "Extracts PO number, quantities, sizes, and customer details"}}
  ]
  Return an empty array [] if there are no new capabilities introduced.
"""

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=extraction_prompt,
    )

    raw = response.text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)


@app.post("/agent")
async def task_suggestion_agent(data: SuggestAgent, req: Request):
    prompt = data.prompt
    user_id = req.state.user_id
    thread_id = data.thread_id
    is_new_thread = not thread_id

    if is_new_thread:
        thread_id = str(uuid.uuid4())

    with engine.connect() as conn:
        result = conn.execute(
            text('SELECT google_access_token FROM "USER" WHERE id = :id'),
            {"id": user_id},
        )
        row = result.fetchone()
    if not row or not row.google_access_token:
        raise HTTPException(status_code=401, detail="Google account not connected. Please sign in with Google first.")

    access_token = row.google_access_token

    # Fetch existing thread data for continuation
    existing_steps: list = []
    if not is_new_thread:
        with engine.connect() as conn:
            result = conn.execute(
                text('SELECT steps FROM "AGENT_THREAD" WHERE id = :id AND user_id = :user_id'),
                {"id": thread_id, "user_id": user_id},
            )
            thread_row = result.fetchone()
            if thread_row and thread_row.steps:
                existing_steps = thread_row.steps

    def _search_emails(query: str) -> str:
        return search_emails(query=query, access_token=access_token)

    def _send_email(to: str, subject: str, body: str) -> str:
        return send_email(to=to, subject=subject, body=body, access_token=access_token)

    def _reply_to_email(message_id: str, body: str) -> str:
        return reply_to_email(message_id=message_id, body=body, access_token=access_token)

    def _search_calendar_events(query: str, time_min: str, time_max: str) -> str:
        return search_calendar_events(query=query, time_min=time_min, time_max=time_max, access_token=access_token)

    def _create_calendar_event(summary: str, start_time: str, end_time: str, description: str, attendees: str) -> str:
        return create_calendar_event(summary=summary, start_time=start_time, end_time=end_time, description=description, attendees=attendees, access_token=access_token)

    def _create_google_meet(summary: str, start_time: str, end_time: str, description: str, attendees: str) -> str:
        return create_google_meet(summary=summary, start_time=start_time, end_time=end_time, description=description, attendees=attendees, access_token=access_token)

    _search_emails.__name__ = "search_emails"
    _search_emails.__doc__ = search_emails.__doc__
    _send_email.__name__ = "send_email"
    _send_email.__doc__ = send_email.__doc__
    _reply_to_email.__name__ = "reply_to_email"
    _reply_to_email.__doc__ = reply_to_email.__doc__
    _search_calendar_events.__name__ = "search_calendar_events"
    _search_calendar_events.__doc__ = search_calendar_events.__doc__
    _create_calendar_event.__name__ = "create_calendar_event"
    _create_calendar_event.__doc__ = create_calendar_event.__doc__
    _create_google_meet.__name__ = "create_google_meet"
    _create_google_meet.__doc__ = create_google_meet.__doc__

    agent = create_deep_agent(
        model="google_genai:gemini-2.0-flash",
        tools=[_search_emails, _send_email, _reply_to_email, _search_calendar_events, _create_calendar_event, _create_google_meet],
        system_prompt=(
            "You are a productivity assistant with access to Gmail, Google Calendar, and Google Meet. "
            "Use the available tools to help the user manage their emails, calendar events, and meetings. "
            "You can search emails, send new emails, reply to existing ones, search calendar events, "
            "create calendar events, and create Google Meet meetings. "
            "Always choose the right tool based on what the user is asking."
        ),
    )
    agent_result = agent.invoke({"messages": [{"role": "user", "content": prompt}]})

    messages_list = agent_result.get("messages", [])
    messages_dict = messages_to_dict(messages_list)
    messages_json = json.dumps(messages_dict)

    # Extract metadata via a dedicated LLM call
    metadata = extract_agent_metadata(
        prompt,
        existing_steps=None if is_new_thread else existing_steps,
    )
    new_steps: list = metadata.get("new_steps", [])
    update_tool: str = metadata.get("updateTool", "")

    with engine.connect() as conn:
        if is_new_thread:
            title: str = metadata.get("title", "")
            watch_tool: str = metadata.get("watcheTool", "")
            conn.execute(
                text(
                    'INSERT INTO "AGENT_THREAD" (id, user_id, message, title, "watcheTool", "updateTool", steps) '
                    "VALUES (:id, :user_id, :message, :title, :watcheTool, :updateTool, CAST(:steps AS jsonb))"
                ),
                {
                    "id": thread_id,
                    "user_id": user_id,
                    "message": messages_json,
                    "title": title,
                    "watcheTool": watch_tool,
                    "updateTool": update_tool,
                    "steps": json.dumps(new_steps),
                },
            )
        else:
            # Re-number new steps from where existing ones left off, in case the LLM restarted at 1
            offset = len(existing_steps)
            renumbered = [
                {"step": offset + i + 1, "text": s["text"]}
                for i, s in enumerate(new_steps)
            ]
            all_steps = existing_steps + renumbered
            conn.execute(
                text(
                    'UPDATE "AGENT_THREAD" '
                    'SET message = :message, "updateTool" = :updateTool, steps =CAST(:steps AS jsonb) '
                    "WHERE id = :id AND user_id = :user_id"
                ),
                {
                    "id": thread_id,
                    "user_id": user_id,
                    "message": messages_json,
                    "updateTool": update_tool,
                    "steps": json.dumps(all_steps),
                },
            )
        conn.commit()

    return JSONResponse(
        status_code=200,
        content={
            "message": "Agent created" if is_new_thread else "Agent updated",
            "thread_id": thread_id,
            "response": {
                "messages": messages_dict,
                "content": extract_text(agent_result),
            },
        },
    )

