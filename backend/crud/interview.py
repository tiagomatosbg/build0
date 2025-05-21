from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.recruitment import Interview, InterviewType
from schemas.recruitment import InterviewCreate, Interview as InterviewSchema
from typing import List, Optional
from datetime import datetime, timedelta

def get_interview(db: Session, interview_id: int) -> Optional[Interview]:
    """
    Get an interview by ID
    """
    return db.query(Interview).filter(Interview.id == interview_id).first()

def get_interviews(
    db: Session,
    job_id: Optional[int] = None,
    candidate_id: Optional[int] = None,
    interviewer_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Interview]:
    """
    Get all interviews with filters and pagination
    """
    query = db.query(Interview)
    
    if job_id:
        query = query.filter(Interview.job_id == job_id)
    if candidate_id:
        query = query.filter(Interview.candidate_id == candidate_id)
    if interviewer_id:
        query = query.filter(Interview.interviewer_id == interviewer_id)
    if status:
        query = query.filter(Interview.status == status)
    if start_date:
        query = query.filter(Interview.scheduled_at >= start_date)
    if end_date:
        query = query.filter(Interview.scheduled_at <= end_date)
    
    return query.offset(skip).limit(limit).all()

def create_interview(
    db: Session,
    interview: InterviewCreate
) -> Interview:
    """
    Create a new interview
    """
    # Check for scheduling conflicts
    start_time = interview.scheduled_at
    end_time = start_time + timedelta(minutes=interview.duration_minutes)
    
    conflicting_interviews = db.query(Interview).filter(
        Interview.interviewer_id == interview.interviewer_id,
        Interview.status != "cancelled",
        (
            (Interview.scheduled_at <= start_time) &
            (Interview.scheduled_at + timedelta(minutes=Interview.duration_minutes) > start_time)
        ) | (
            (Interview.scheduled_at < end_time) &
            (Interview.scheduled_at + timedelta(minutes=Interview.duration_minutes) >= end_time)
        )
    ).all()
    
    if conflicting_interviews:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interviewer has a scheduling conflict"
        )
    
    db_interview = Interview(**interview.model_dump())
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview

def update_interview(
    db: Session,
    interview_id: int,
    interview: InterviewCreate
) -> Optional[Interview]:
    """
    Update an interview
    """
    db_interview = get_interview(db, interview_id)
    if not db_interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    # Check for scheduling conflicts if time changed
    if (interview.scheduled_at != db_interview.scheduled_at or
        interview.duration_minutes != db_interview.duration_minutes):
        start_time = interview.scheduled_at
        end_time = start_time + timedelta(minutes=interview.duration_minutes)
        
        conflicting_interviews = db.query(Interview).filter(
            Interview.interviewer_id == interview.interviewer_id,
            Interview.id != interview_id,
            Interview.status != "cancelled",
            (
                (Interview.scheduled_at <= start_time) &
                (Interview.scheduled_at + timedelta(minutes=Interview.duration_minutes) > start_time)
            ) | (
                (Interview.scheduled_at < end_time) &
                (Interview.scheduled_at + timedelta(minutes=Interview.duration_minutes) >= end_time)
            )
        ).all()
        
        if conflicting_interviews:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Interviewer has a scheduling conflict"
            )
    
    # Update interview
    for key, value in interview.model_dump().items():
        setattr(db_interview, key, value)
    
    db.commit()
    db.refresh(db_interview)
    return db_interview

def update_interview_status(
    db: Session,
    interview_id: int,
    status: str,
    notes: Optional[str] = None
) -> Optional[Interview]:
    """
    Update interview status and notes
    """
    db_interview = get_interview(db, interview_id)
    if not db_interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    valid_statuses = ["scheduled", "completed", "cancelled", "no_show"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    db_interview.status = status
    if notes:
        db_interview.notes = notes
    
    db.commit()
    db.refresh(db_interview)
    return db_interview

def delete_interview(
    db: Session,
    interview_id: int
) -> bool:
    """
    Delete an interview
    """
    db_interview = get_interview(db, interview_id)
    if not db_interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    db.delete(db_interview)
    db.commit()
    return True 