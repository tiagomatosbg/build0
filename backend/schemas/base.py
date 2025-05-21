from pydantic import BaseModel, EmailStr, constr
from typing import Optional, List
from datetime import datetime
from models.base import UserRole

class CompanyBase(BaseModel):
    name: str
    cnpj: constr(min_length=14, max_length=14)
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class Company(CompanyBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole
    company_id: int

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class JobBase(BaseModel):
    title: str
    description: str
    requirements: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    benefits: Optional[str] = None
    contract_type: Optional[str] = None
    company_id: int
    recruiter_id: int

class JobCreate(JobBase):
    pass

class Job(JobBase):
    id: int
    status: str
    open_date: datetime
    close_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 