from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from crud import job as job_crud
from schemas.base import Job, JobCreate
from auth.security import get_current_active_user
from models.base import User, UserRole

router = APIRouter(
    prefix="/jobs",
    tags=["jobs"]
)

@router.post("/", response_model=Job)
async def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new job
    """
    # Check if user has permission to create jobs for the company
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create jobs"
        )
    
    if current_user.role != UserRole.ADMIN and current_user.company_id != job.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create jobs for this company"
        )
    
    return job_crud.create_job(db=db, job=job)

@router.get("/", response_model=List[Job])
async def read_jobs(
    company_id: int = None,
    status: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all jobs with filters
    """
    # Check if user has permission to view jobs
    if current_user.role == UserRole.CANDIDATE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view jobs"
        )
    
    # If not admin, can only view jobs from their company
    if current_user.role != UserRole.ADMIN:
        company_id = current_user.company_id
    
    return job_crud.get_jobs(
        db=db,
        company_id=company_id,
        status=status,
        skip=skip,
        limit=limit
    )

@router.get("/{job_id}", response_model=Job)
async def read_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific job
    """
    db_job = job_crud.get_job(db=db, job_id=job_id)
    if db_job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check if user has permission to view the job
    if current_user.role == UserRole.CANDIDATE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view jobs"
        )
    
    if current_user.role != UserRole.ADMIN and current_user.company_id != db_job.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this job"
        )
    
    return db_job

@router.put("/{job_id}", response_model=Job)
async def update_job(
    job_id: int,
    job: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a job
    """
    db_job = job_crud.get_job(db=db, job_id=job_id)
    if db_job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check if user has permission to update the job
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update jobs"
        )
    
    if current_user.role != UserRole.ADMIN and current_user.company_id != db_job.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this job"
        )
    
    return job_crud.update_job(db=db, job_id=job_id, job=job)

@router.patch("/{job_id}/status")
async def update_job_status(
    job_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update job status
    """
    db_job = job_crud.get_job(db=db, job_id=job_id)
    if db_job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check if user has permission to update the job status
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update job status"
        )
    
    if current_user.role != UserRole.ADMIN and current_user.company_id != db_job.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this job's status"
        )
    
    return job_crud.update_job_status(db=db, job_id=job_id, status=status)

@router.delete("/{job_id}")
async def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a job
    """
    db_job = job_crud.get_job(db=db, job_id=job_id)
    if db_job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check if user has permission to delete the job
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete jobs"
        )
    
    if current_user.role != UserRole.ADMIN and current_user.company_id != db_job.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this job"
        )
    
    success = job_crud.delete_job(db=db, job_id=job_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    return {"message": "Job deleted successfully"} 