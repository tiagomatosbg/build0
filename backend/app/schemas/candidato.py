from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, EmailStr, constr, validator
import re

class CandidatoBase(BaseModel):
    """Schema base para Candidato"""
    nome: str
    sobrenome: str
    email: EmailStr
    cpf: constr(regex=r'^\d{3}\.\d{3}\.\d{3}-\d{2}$')
    data_nascimento: date
    telefone: constr(regex=r'^\(\d{2}\) \d{5}-\d{4}$')
    foto: Optional[str] = None
    endereco: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None
    resumo: Optional[str] = None
    
    @validator('cpf')
    def validate_cpf(cls, v):
        # Remove caracteres especiais
        cpf = re.sub(r'[^\d]', '', v)
        
        # Verifica se tem 11 dígitos
        if len(cpf) != 11:
            raise ValueError('CPF deve ter 11 dígitos')
        
        # Verifica se todos os dígitos são iguais
        if len(set(cpf)) == 1:
            raise ValueError('CPF inválido')
        
        # Validação do primeiro dígito verificador
        soma = sum(int(cpf[i]) * (10 - i) for i in range(9))
        digito1 = (soma * 10 % 11) % 10
        if int(cpf[9]) != digito1:
            raise ValueError('CPF inválido')
        
        # Validação do segundo dígito verificador
        soma = sum(int(cpf[i]) * (11 - i) for i in range(10))
        digito2 = (soma * 10 % 11) % 10
        if int(cpf[10]) != digito2:
            raise ValueError('CPF inválido')
        
        return v

class CandidatoCreate(CandidatoBase):
    """Schema para criação de Candidato"""
    senha: constr(min_length=8)
    empresa_id: int

class CandidatoUpdate(BaseModel):
    """Schema para atualização de Candidato"""
    nome: Optional[str] = None
    sobrenome: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[constr(regex=r'^\(\d{2}\) \d{5}-\d{4}$')] = None
    foto: Optional[str] = None
    endereco: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None
    resumo: Optional[str] = None
    senha: Optional[constr(min_length=8)] = None
    status: Optional[bool] = None

class CandidatoInDB(CandidatoBase):
    """Schema para Candidato no banco de dados"""
    id: int
    empresa_id: int
    status: bool
    data_criacao: datetime
    data_atualizacao: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class Candidato(CandidatoInDB):
    """Schema para resposta de Candidato"""
    pass

class CandidatoList(BaseModel):
    """Schema para listagem de Candidatos"""
    items: List[Candidato]
    total: int
    page: int
    size: int
    pages: int 