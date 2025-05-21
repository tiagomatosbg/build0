from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from crud import interview as interview_crud
from schemas.recruitment import Interview, InterviewCreate
from auth.security import get_current_active_user
from models.base import User, UserRole
from datetime import datetime

router = APIRouter(
    prefix="/interviews",
    tags=["interviews"]
)

@router.post("/", response_model=Interview)
async def create_interview(
    interview: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new interview
    """
    # Check if user has permission to create interviews
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create interviews"
        )
    
    return interview_crud.create_interview(db=db, interview=interview)

@router.get("/", response_model=List[Interview])
async def read_interviews(
    job_id: int = None,
    candidate_id: int = None,
    interviewer_id: int = None,
    status: str = None,
    start_date: datetime = None,
    end_date: datetime = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all interviews with filters
    """
    # Check if user has permission to view interviews
    if current_user.role == UserRole.CANDIDATE:
        # Candidates can only view their own interviews
        candidate_id = current_user.id
    elif current_user.role == UserRole.RECRUITER:
        # Recruiters can only view interviews they're conducting
        interviewer_id = current_user.id
    
    return interview_crud.get_interviews(
        db=db,
        job_id=job_id,
        candidate_id=candidate_id,
        interviewer_id=interviewer_id,
        status=status,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit
    )

@router.get("/{interview_id}", response_model=Interview)
async def read_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific interview
    """
    db_interview = interview_crud.get_interview(db=db, interview_id=interview_id)
    if db_interview is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    # Check if user has permission to view the interview
    if current_user.role == UserRole.CANDIDATE and current_user.id != db_interview.candidate_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this interview"
        )
    
    if current_user.role == UserRole.RECRUITER and current_user.id != db_interview.interviewer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this interview"
        )
    
    return db_interview

@router.put("/{interview_id}", response_model=Interview)
async def update_interview(
    interview_id: int,
    interview: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an interview
    """
    db_interview = interview_crud.get_interview(db=db, interview_id=interview_id)
    if db_interview is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    # Check if user has permission to update the interview
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update interviews"
        )
    
    if current_user.role == UserRole.RECRUITER and current_user.id != db_interview.interviewer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this interview"
        )
    
    return interview_crud.update_interview(db=db, interview_id=interview_id, interview=interview)

@router.patch("/{interview_id}/status")
async def update_interview_status(
    interview_id: int,
    status: str,
    notes: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update interview status and notes
    """
    db_interview = interview_crud.get_interview(db=db, interview_id=interview_id)
    if db_interview is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    # Check if user has permission to update the interview status
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update interview status"
        )
    
    if current_user.role == UserRole.RECRUITER and current_user.id != db_interview.interviewer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this interview's status"
        )
    
    return interview_crud.update_interview_status(
        db=db,
        interview_id=interview_id,
        status=status,
        notes=notes
    )

@router.delete("/{interview_id}")
async def delete_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete an interview
    """
    db_interview = interview_crud.get_interview(db=db, interview_id=interview_id)
    if db_interview is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    # Check if user has permission to delete the interview
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete interviews"
        )
    
    success = interview_crud.delete_interview(db=db, interview_id=interview_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    return {"message": "Interview deleted successfully"} 