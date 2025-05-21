from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str

    # JWT settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Email settings
    SMTP_SERVER: str
    SMTP_PORT: int
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    EMAIL_FROM: str
    EMAIL_FROM_NAME: str

    # WhatsApp settings
    WHATSAPP_API_URL: str = "https://graph.facebook.com/v17.0"
    WHATSAPP_API_TOKEN: str
    WHATSAPP_PHONE_NUMBER_ID: str

    # LinkedIn settings
    LINKEDIN_CLIENT_ID: str
    LINKEDIN_CLIENT_SECRET: str
    LINKEDIN_REDIRECT_URI: str

    # reCAPTCHA settings
    RECAPTCHA_SECRET_KEY: str
    RECAPTCHA_SITE_KEY: str

    class Config:
        env_file = ".env"

settings = Settings() 