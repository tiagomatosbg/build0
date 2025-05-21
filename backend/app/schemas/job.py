from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, validator
from app.models.job import JobStatus, JobType

class JobBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    requirements: str = Field(..., min_length=10)
    location: str = Field(..., min_length=3, max_length=255)
    salary_min: Optional[float] = Field(None, ge=0)
    salary_max: Optional[float] = Field(None, ge=0)
    benefits: Optional[str] = None
    type: JobType
    status: JobStatus = JobStatus.OPEN
    opening_date: datetime
    closing_date: Optional[datetime] = None
    department_id: int
    manager_id: int

    @validator('salary_max')
    def salary_max_must_be_greater_than_min(cls, v, values):
        if v is not None and 'salary_min' in values and values['salary_min'] is not None:
            if v < values['salary_min']:
                raise ValueError('salary_max must be greater than salary_min')
        return v

    @validator('closing_date')
    def closing_date_must_be_after_opening_date(cls, v, values):
        if v is not None and 'opening_date' in values:
            if v < values['opening_date']:
                raise ValueError('closing_date must be after opening_date')
        return v

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    requirements: Optional[str] = Field(None, min_length=10)
    location: Optional[str] = Field(None, min_length=3, max_length=255)
    salary_min: Optional[float] = Field(None, ge=0)
    salary_max: Optional[float] = Field(None, ge=0)
    benefits: Optional[str] = None
    type: Optional[JobType] = None
    status: Optional[JobStatus] = None
    opening_date: Optional[datetime] = None
    closing_date: Optional[datetime] = None
    department_id: Optional[int] = None
    manager_id: Optional[int] = None

    @validator('salary_max')
    def salary_max_must_be_greater_than_min(cls, v, values):
        if v is not None and 'salary_min' in values and values['salary_min'] is not None:
            if v < values['salary_min']:
                raise ValueError('salary_max must be greater than salary_min')
        return v

    @validator('closing_date')
    def closing_date_must_be_after_opening_date(cls, v, values):
        if v is not None and 'opening_date' in values:
            if v < values['opening_date']:
                raise ValueError('closing_date must be after opening_date')
        return v

class JobInDBBase(JobBase):
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Job(JobInDBBase):
    pass

class JobInDB(JobInDBBase):
    pass 