import aiohttp
from app.core.config import settings

async def verify_recaptcha(token: str) -> bool:
    """
    Verifica token do reCAPTCHA.
    
    Args:
        token: Token do reCAPTCHA
        
    Returns:
        bool: True se verificação bem sucedida
    """
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://www.google.com/recaptcha/api/siteverify",
                data={
                    "secret": settings.RECAPTCHA_SECRET_KEY,
                    "response": token
                }
            ) as response:
                result = await response.json()
                return result.get("success", False)
                
    except Exception:
        return False 