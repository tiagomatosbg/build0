from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.api import deps
from app.crud import crud_job
from app.schemas.job import Job, JobCreate, JobUpdate
from app.models.job import JobStatus, JobType

router = APIRouter()

@router.get("/", response_model=List[Job])
def search_jobs(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    title: Optional[str] = None,
    department_id: Optional[int] = None,
    location: Optional[str] = None,
    type: Optional[JobType] = None,
    status: Optional[JobStatus] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user = Depends(deps.get_current_user)
):
    """
    Search jobs with various filters.
    """
    search_params = {
        "title": title,
        "department_id": department_id,
        "location": location,
        "type": type,
        "status": status,
        "date_range": {
            "start": start_date,
            "end": end_date
        } if start_date or end_date else None
    }
    
    jobs = crud_job.search(
        db=db,
        search_params=search_params,
        skip=skip,
        limit=limit
    )
    return jobs

@router.post("/", response_model=Job)
def create_job(
    *,
    db: Session = Depends(deps.get_db),
    job_in: JobCreate,
    current_user = Depends(deps.get_current_user)
):
    """
    Create new job.
    """
    job = crud_job.create(db=db, obj_in=job_in)
    return job

@router.get("/{job_id}", response_model=Job)
def get_job(
    *,
    db: Session = Depends(deps.get_db),
    job_id: int,
    current_user = Depends(deps.get_current_user)
):
    """
    Get job by ID.
    """
    job = crud_job.get(db=db, id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.put("/{job_id}", response_model=Job)
def update_job(
    *,
    db: Session = Depends(deps.get_db),
    job_id: int,
    job_in: JobUpdate,
    current_user = Depends(deps.get_current_user)
):
    """
    Update job.
    """
    job = crud_job.get(db=db, id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job = crud_job.update(db=db, db_obj=job, obj_in=job_in)
    return job

@router.delete("/{job_id}", response_model=Job)
def delete_job(
    *,
    db: Session = Depends(deps.get_db),
    job_id: int,
    current_user = Depends(deps.get_current_user)
):
    """
    Delete job.
    """
    job = crud_job.get(db=db, id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job = crud_job.remove(db=db, id=job_id)
    return job 