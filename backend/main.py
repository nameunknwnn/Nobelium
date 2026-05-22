from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from database import engine
import jwt
from config import settings
from sqlalchemy import text
import bcrypt
import uuid
import httpx
import os
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from deepagents import create_deep_agent

os.environ["GEMINI_API_KEY"] = settings.GEMINI_API_KEY
os.environ["GOOGLE_API_KEY"] = settings.GOOGLE_API_KEY


app=FastAPI()

class SignUpSchema(BaseModel):
    email:str
    password:str

class SignInSchema(BaseModel):
    email:str
    password:str

class EmailAgentSchema(BaseModel):
    email:str 

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
        return ({"message":"signin successful","token":token})
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
    return {"message": "signin successful", "token": jwt_token}


@app.post("/email/agent")
async def email_agent(req:EmailAgentSchema):
    email=req.email
    def search_emails(query: str) -> str:
        """Search the user's Gmail inbox using a Gmail search query and return matching email snippets."""
        with engine.connect() as conn:
            result = conn.execute(text('SELECT * FROM "USER" WHERE email = :email'), {"email": req.email})
            user = result.fetchone()
            if not user or not user.google_access_token:
                return "You need to sign in first"
            access_token = user.google_access_token

        resp = httpx.get(
            "https://www.googleapis.com/gmail/v1/users/me/messages",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"q": query, "maxResults": 10},
        )
        if resp.status_code != 200:
            return f"Gmail API error: {resp.text}"

        messages = resp.json().get("messages", [])
        if not messages:
            return "No emails found."

        snippets = []
        for msg in messages:
            detail = httpx.get(
                f"https://www.googleapis.com/gmail/v1/users/me/messages/{msg['id']}",
                headers={"Authorization": f"Bearer {access_token}"},
                params={"format": "metadata", "metadataHeaders": ["From", "Subject", "Date"]},
            )
            if detail.status_code == 200:
                headers = {h["name"]: h["value"] for h in detail.json().get("payload", {}).get("headers", [])}
                snippets.append(f"From: {headers.get('From')} | Subject: {headers.get('Subject')} | Date: {headers.get('Date')}")

        return "\n".join(snippets)




    agent = create_deep_agent(
    model="google_genai:gemini-3.5-flash",
    tools=[search_emails],
    system_prompt="You are a helpful assistant",
    )
    result=agent.invoke(
    {"messages": [{"role": "user", "content": "who all have send my the email realted to job in last 1 day?"}]}
    )
    print(result);

    