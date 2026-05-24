from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    JWT_SECRET:str
    DATABASE_URL:str
    CLIENT_ID:str
    CLIENT_SECRET:str
    REDIRECT_URI:str
    GEMINI_API_KEY:str
    GOOGLE_API_KEY:str
    FRONTEND_URL:str
    # OPENROUTER_API_KEY:str
    class Config:
        env_file = ".env"
        
settings=Settings()