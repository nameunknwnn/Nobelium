from fastapi import Request, Response, HTTPException
from fastapi.responses import JSONResponse
import jwt
from config import settings
from database import engine
from sqlalchemy import text
from starlette.middleware.base import BaseHTTPMiddleware


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):

        if request.method == "OPTIONS":
            return await call_next(request)
        # Skip authentication for public routes
        public_routes = ["/signup", "/signin", "/google/oauth", "/google/oauth/callback", "/docs", "/openapi.json","/me","/send-email"]
        if request.url.path in public_routes:
            return await call_next(request)
        
        # Get token from cookie
        token = request.cookies.get("token")
        print(token)
        if not token:
            return JSONResponse(
                status_code=401,
                content={"message": "No token present in cookie"}
            )
        
        try:
            # Decode JWT token
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
            email = payload["sub"]
            
            if not email:
                return JSONResponse(
                    status_code=401,
                    content={"message": "Invalid token payload"}
                )
            
            # Verify user exists in database
            conn = engine.connect()
            result = conn.execute(
                text('SELECT * FROM "USER" WHERE email = :email'),
                {"email": email}
            )
            user = result.fetchone()
            conn.close()
            
            if not user:
                return JSONResponse(
                    status_code=401,
                    content={"message": "User not found"}
                )
            
            # Add user info to request state for use in route handlers
            request.state.user_email = email
            request.state.user_id = user.id
            
        except jwt.ExpiredSignatureError:
            return JSONResponse(
                status_code=401,
                content={"message": "Token has expired"}
            )
        except jwt.InvalidTokenError:
            return JSONResponse(
                status_code=401,
                content={"message": "Invalid token"}
            )
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"message": f"Authentication error: {str(e)}"}
            )
        
        # Proceed with the request
        response = await call_next(request)
        return response