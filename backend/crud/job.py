from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.base import Job
from schemas.base import JobCreate, Job as JobSchema
from typing import List, Optional
from datetime import datetime

def get_job(db: Session, job_id: int) -> Optional[Job]:
    """
    Get a job by ID
    """
    return db.query(Job).filter(Job.id == job_id).first()

def get_jobs(
    db: Session,
    company_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Job]:
    """
    Get all jobs with filters and pagination
    """
    query = db.query(Job)
    
    if company_id:
        query = query.filter(Job.company_id == company_id)
    if status:
        query = query.filter(Job.status == status)
    
    return query.offset(skip).limit(limit).all()

def create_job(
    db: Session,
    job: JobCreate
) -> Job:
    """
    Create a new job
    """
    db_job = Job(
        **job.model_dump(),
        status="open",
        open_date=datetime.utcnow()
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def update_job(
    db: Session,
    job_id: int,
    job: JobCreate
) -> Optional[Job]:
    """
    Update a job
    """
    db_job = get_job(db, job_id)
    if not db_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Update job
    for key, value in job.model_dump().items():
        setattr(db_job, key, value)
    
    db.commit()
    db.refresh(db_job)
    return db_job

def update_job_status(
    db: Session,
    job_id: int,
    status: str
) -> Optional[Job]:
    """
    Update job status
    """
    db_job = get_job(db, job_id)
    if not db_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    valid_statuses = ["open", "screening", "interviews", "closed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    db_job.status = status
    if status in ["closed", "cancelled"]:
        db_job.close_date = datetime.utcnow()
    
    db.commit()
    db.refresh(db_job)
    return db_job

def delete_job(
    db: Session,
    job_id: int
) -> bool:
    """
    Delete a job
    """
    db_job = get_job(db, job_id)
    if not db_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    db.delete(db_job)
    db.commit()
    return True 