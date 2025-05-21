from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from crud import candidate as candidate_crud
from schemas.recruitment import Candidate, CandidateCreate
from auth.security import get_current_active_user
from models.base import User, UserRole
import aiofiles
import os
from datetime import datetime

router = APIRouter(
    prefix="/candidates",
    tags=["candidates"]
)

@router.post("/", response_model=Candidate)
async def create_candidate(
    candidate: CandidateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new candidate
    """
    # Check if user has permission to create candidates
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create candidates"
        )
    
    return candidate_crud.create_candidate(db=db, candidate=candidate)

@router.get("/", response_model=List[Candidate])
async def read_candidates(
    job_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all candidates with filters
    """
    # Check if user has permission to view candidates
    if current_user.role == UserRole.CANDIDATE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view candidates"
        )
    
    return candidate_crud.get_candidates(
        db=db,
        job_id=job_id,
        skip=skip,
        limit=limit
    )

@router.get("/{candidate_id}", response_model=Candidate)
async def read_candidate(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific candidate
    """
    db_candidate = candidate_crud.get_candidate(db=db, candidate_id=candidate_id)
    if db_candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Check if user has permission to view the candidate
    if current_user.role == UserRole.CANDIDATE and current_user.id != candidate_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this candidate"
        )
    
    return db_candidate

@router.put("/{candidate_id}", response_model=Candidate)
async def update_candidate(
    candidate_id: int,
    candidate: CandidateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a candidate
    """
    db_candidate = candidate_crud.get_candidate(db=db, candidate_id=candidate_id)
    if db_candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Check if user has permission to update the candidate
    if current_user.role == UserRole.CANDIDATE and current_user.id != candidate_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this candidate"
        )
    
    return candidate_crud.update_candidate(db=db, candidate_id=candidate_id, candidate=candidate)

@router.post("/{candidate_id}/resume")
async def upload_resume(
    candidate_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload candidate's resume
    """
    db_candidate = candidate_crud.get_candidate(db=db, candidate_id=candidate_id)
    if db_candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Check if user has permission to upload resume
    if current_user.role == UserRole.CANDIDATE and current_user.id != candidate_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to upload resume for this candidate"
        )
    
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads/resumes"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{candidate_id}_{timestamp}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    # Update candidate's resume URL
    resume_url = f"/uploads/resumes/{filename}"
    return candidate_crud.update_candidate_resume(
        db=db,
        candidate_id=candidate_id,
        resume_url=resume_url
    )

@router.post("/{candidate_id}/portfolio")
async def upload_portfolio(
    candidate_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload candidate's portfolio
    """
    db_candidate = candidate_crud.get_candidate(db=db, candidate_id=candidate_id)
    if db_candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Check if user has permission to upload portfolio
    if current_user.role == UserRole.CANDIDATE and current_user.id != candidate_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to upload portfolio for this candidate"
        )
    
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads/portfolios"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{candidate_id}_{timestamp}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    # Update candidate's portfolio URL
    portfolio_url = f"/uploads/portfolios/{filename}"
    return candidate_crud.update_candidate_portfolio(
        db=db,
        candidate_id=candidate_id,
        portfolio_url=portfolio_url
    )

@router.delete("/{candidate_id}")
async def delete_candidate(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a candidate
    """
    db_candidate = candidate_crud.get_candidate(db=db, candidate_id=candidate_id)
    if db_candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Check if user has permission to delete the candidate
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete candidates"
        )
    
    success = candidate_crud.delete_candidate(db=db, candidate_id=candidate_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    return {"message": "Candidate deleted successfully"} 