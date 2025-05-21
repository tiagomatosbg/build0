from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class JobAuditBase(BaseModel):
    job_id: int
    user_id: int
    action: str
    details: Optional[Dict[str, Any]] = None

class JobAuditCreate(JobAuditBase):
    pass

class JobAudit(JobAuditBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True 