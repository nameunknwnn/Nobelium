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

from middleware.authmiddleware import AuthMiddleware

os.environ["GEMINI_API_KEY"] = settings.GEMINI_API_KEY
os.environ["GOOGLE_API_KEY"] = settings.GOOGLE_API_KEY


app=FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
    prompt:str

class ContinueAgent(BaseModel):
    prompt:str
    thread_id:str


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
        "scope": "openid email profile https://www.googleapis.com/auth/gmail.modify",
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





@app.post("/agent/suggest")
async def task_suggestion_agent(data: SuggestAgent, req: Request):
    prompt = data.prompt
    user_id = req.state.user_id
    

    with engine.connect() as conn:
        result = conn.execute(
            text('SELECT google_access_token FROM "USER" WHERE id = :id'),
            {"id": user_id},
        )
        row = result.fetchone()
    if not row or not row.google_access_token:
        raise HTTPException(status_code=401, detail="Google account not connected. Please sign in with Google first.")

    access_token = row.google_access_token

    def _search_emails(query: str) -> str:
        return search_emails(query=query, access_token=access_token)

    def _send_email(to: str, subject: str, body: str) -> str:
        return send_email(to=to, subject=subject, body=body, access_token=access_token)

    def _reply_to_email(message_id: str, body: str) -> str:
        return reply_to_email(message_id=message_id, body=body, access_token=access_token)

    _search_emails.__name__ = "search_emails"
    _search_emails.__doc__ = search_emails.__doc__
    _send_email.__name__ = "send_email"
    _send_email.__doc__ = send_email.__doc__
    _reply_to_email.__name__ = "reply_to_email"
    _reply_to_email.__doc__ = reply_to_email.__doc__

    agent = create_deep_agent(
        model="google_genai:gemini-3.5-flash",
        tools=[_search_emails, _send_email, _reply_to_email],
        system_prompt=(
            "You are a Gmail assistant. Use the available tools to help the user manage their emails. "
            "You can search emails, send new emails, and reply to existing ones. "
            "Always choose the right tool based on what the user is asking."
        ),
    )
    agent_result =  agent.invoke(
        {"messages": [{"role": "user", "content": prompt}]}
    )
    
    thread_id = str(uuid.uuid4())
    messages_list = agent_result.get('messages', [])
    messages_dict = messages_to_dict(messages_list)
    messages_json = json.dumps(messages_dict)
    
    with engine.connect() as conn:
        conn.execute(
            text('INSERT INTO "AGENT_THREAD" (id, user_id, message, status) VALUES(:id, :user_id, :message, :status)'),
            {"id": thread_id, "user_id": user_id, "message": messages_json, "status": "pending"},
        )
        conn.commit()
    
    return JSONResponse(status_code=200, content={
        "message": "Agent started", 
        "thread_id": thread_id,
        "response": {
            "messages": messages_dict,
            "content": agent_result.get('content', '')
        }
    })



@app.post("/agent/continue")
async def task_continue_agent(data: ContinueAgent, req: Request):
    prompt = data.prompt
    user_id = req.state.user_id
    thread_id = data.thread_id
    
    with engine.connect() as conn:
        thread_result = conn.execute(
            text('SELECT * FROM "AGENT_THREAD" WHERE id = :id AND user_id = :user_id'),
            {"id": thread_id, "user_id": user_id},
        )
        thread_row = thread_result.fetchone()
        
        if not thread_row:
            raise HTTPException(status_code=404, detail="Thread not found")
        
        user_result = conn.execute(
            text('SELECT google_access_token FROM "USER" WHERE id = :id'),
            {"id": user_id},
        )
        user_row = user_result.fetchone()
    
    if not user_row or not user_row.google_access_token:
        raise HTTPException(status_code=401, detail="Google account not connected")
    
    access_token = user_row.google_access_token
    previous_messages = json.loads(thread_row.message) if thread_row.message else []

    def _search_emails(query: str) -> str:
        return search_emails(query=query, access_token=access_token)

    def _send_email(to: str, subject: str, body: str) -> str:
        return send_email(to=to, subject=subject, body=body, access_token=access_token)

    def _reply_to_email(message_id: str, body: str) -> str:
        return reply_to_email(message_id=message_id, body=body, access_token=access_token)

    _search_emails.__name__ = "search_emails"
    _search_emails.__doc__ = search_emails.__doc__
    _send_email.__name__ = "send_email"
    _send_email.__doc__ = send_email.__doc__
    _reply_to_email.__name__ = "reply_to_email"
    _reply_to_email.__doc__ = reply_to_email.__doc__

    all_messages = previous_messages + [{"role": "user", "content": prompt}]
    
    agent = create_deep_agent(
        model="google_genai:gemini-3.5-flash",
        tools=[_search_emails, _send_email, _reply_to_email],
        system_prompt=(
            "You are a Gmail assistant. Use the available tools to help the user manage their emails. "
            "You can search emails, send new emails, and reply to existing ones. "
            "Always choose the right tool based on what the user is asking."
        ),
    )
    
    agent_result = await agent.invoke(
        {"messages": all_messages}
    )
    
    updated_messages = agent_result.get('messages', all_messages)
    messages_dict = messages_to_dict(updated_messages)
    messages_json = json.dumps(messages_dict)
    
    with engine.connect() as conn:
        conn.execute(
            text('UPDATE "AGENT_THREAD" SET status = :status, message = :message WHERE id = :id'),
            {"id": thread_id, "status": "completed", "message": messages_json},
        )
        conn.commit()
    
    return JSONResponse(status_code=200, content={
        "message": "Agent completed",
        "thread_id": thread_id,
        "response": {
            "messages": messages_dict,
            "content": agent_result.get('content', '')
        }
    })