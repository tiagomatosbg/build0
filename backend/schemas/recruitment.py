from pydantic import BaseModel, EmailStr, constr
from typing import Optional, List, Dict, Any
from datetime import datetime
from models.recruitment import InterviewType, TestType

class CandidateBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    cpf: Optional[constr(min_length=11, max_length=11)] = None
    address: Optional[str] = None
    resume_url: Optional[str] = None
    portfolio_url: Optional[str] = None

class CandidateCreate(CandidateBase):
    pass

class Candidate(CandidateBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class InterviewBase(BaseModel):
    job_id: int
    candidate_id: int
    interviewer_id: int
    type: InterviewType
    scheduled_at: datetime
    duration_minutes: int = 60
    meeting_link: Optional[str] = None
    notes: Optional[str] = None

class InterviewCreate(InterviewBase):
    pass

class Interview(InterviewBase):
    id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TestBase(BaseModel):
    job_id: int
    candidate_id: int
    type: TestType
    title: str
    description: Optional[str] = None
    questions: Optional[Dict[str, Any]] = None

class TestCreate(TestBase):
    pass

class Test(TestBase):
    id: int
    results: Optional[Dict[str, Any]] = None
    status: str
    score: Optional[int] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class JobApplicationBase(BaseModel):
    job_id: int
    candidate_id: int
    status: str = "applied"

class JobApplicationCreate(JobApplicationBase):
    pass

class JobApplication(JobApplicationBase):
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 