from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # ... existing code ...

    # SMTP Configuration
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    # WhatsApp API Configuration
    WHATSAPP_API_KEY: str = ""
    WHATSAPP_API_URL: str = "https://api.whatsapp.com/v1/messages"

    # Frontend URL
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings() 