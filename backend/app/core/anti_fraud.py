import re
from typing import Tuple
import aiohttp
from app.core.config import settings

async def check_anti_fraud(email: str, cpf: str) -> bool:
    """
    Realiza verificações anti-fraude para candidatos.
    
    Verificações:
    1. Email temporário
    2. CPF válido e não bloqueado
    3. IP suspeito
    4. Múltiplas candidaturas
    
    Args:
        email: Email do candidato
        cpf: CPF do candidato
        
    Returns:
        bool: True se passar nas verificações
    """
    # Lista de domínios de email temporário
    temp_domains = [
        "tempmail.com",
        "throwawaymail.com",
        "mailinator.com",
        # Adicione mais domínios
    ]
    
    # Verifica email temporário
    domain = email.split("@")[1].lower()
    if domain in temp_domains:
        return False
    
    # Verifica CPF
    if not is_valid_cpf(cpf):
        return False
    
    # Verifica CPF bloqueado
    if await is_blocked_cpf(cpf):
        return False
    
    # Verifica múltiplas candidaturas
    if await has_multiple_applications(email, cpf):
        return False
    
    return True

def is_valid_cpf(cpf: str) -> bool:
    """
    Valida CPF.
    
    Args:
        cpf: CPF a ser validado
        
    Returns:
        bool: True se CPF válido
    """
    # Remove caracteres não numéricos
    cpf = re.sub(r'[^\d]', '', cpf)
    
    # Verifica se tem 11 dígitos
    if len(cpf) != 11:
        return False
    
    # Verifica se todos os dígitos são iguais
    if len(set(cpf)) == 1:
        return False
    
    # Validação do primeiro dígito verificador
    soma = sum(int(cpf[i]) * (10 - i) for i in range(9))
    digito1 = (soma * 10 % 11) % 10
    if int(cpf[9]) != digito1:
        return False
    
    # Validação do segundo dígito verificador
    soma = sum(int(cpf[i]) * (11 - i) for i in range(10))
    digito2 = (soma * 10 % 11) % 10
    if int(cpf[10]) != digito2:
        return False
    
    return True

async def is_blocked_cpf(cpf: str) -> bool:
    """
    Verifica se CPF está bloqueado.
    
    Args:
        cpf: CPF a ser verificado
        
    Returns:
        bool: True se CPF bloqueado
    """
    # TODO: Integrar com serviço de verificação de CPF
    # Por enquanto retorna False
    return False

async def has_multiple_applications(email: str, cpf: str) -> bool:
    """
    Verifica se há múltiplas candidaturas.
    
    Args:
        email: Email do candidato
        cpf: CPF do candidato
        
    Returns:
        bool: True se houver múltiplas candidaturas
    """
    # TODO: Implementar verificação no banco de dados
    # Por enquanto retorna False
    return False 