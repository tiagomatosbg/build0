from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.recruitment import Candidate
from schemas.recruitment import CandidateCreate, Candidate as CandidateSchema
from typing import List, Optional
from datetime import datetime

def get_candidate(db: Session, candidate_id: int) -> Optional[Candidate]:
    """
    Get a candidate by ID
    """
    return db.query(Candidate).filter(Candidate.id == candidate_id).first()

def get_candidate_by_email(db: Session, email: str) -> Optional[Candidate]:
    """
    Get a candidate by email
    """
    return db.query(Candidate).filter(Candidate.email == email).first()

def get_candidate_by_cpf(db: Session, cpf: str) -> Optional[Candidate]:
    """
    Get a candidate by CPF
    """
    return db.query(Candidate).filter(Candidate.cpf == cpf).first()

def get_candidates(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    job_id: Optional[int] = None
) -> List[Candidate]:
    """
    Get all candidates with filters and pagination
    """
    query = db.query(Candidate)
    
    if job_id:
        query = query.join(Candidate.jobs).filter(Job.id == job_id)
    
    return query.offset(skip).limit(limit).all()

def create_candidate(
    db: Session,
    candidate: CandidateCreate
) -> Candidate:
    """
    Create a new candidate
    """
    # Check for duplicate email
    if get_candidate_by_email(db, candidate.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check for duplicate CPF if provided
    if candidate.cpf and get_candidate_by_cpf(db, candidate.cpf):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF already registered"
        )
    
    db_candidate = Candidate(**candidate.model_dump())
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

def update_candidate(
    db: Session,
    candidate_id: int,
    candidate: CandidateCreate
) -> Optional[Candidate]:
    """
    Update a candidate
    """
    db_candidate = get_candidate(db, candidate_id)
    if not db_candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Check for duplicate email
    if candidate.email != db_candidate.email:
        if get_candidate_by_email(db, candidate.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Check for duplicate CPF
    if candidate.cpf and candidate.cpf != db_candidate.cpf:
        if get_candidate_by_cpf(db, candidate.cpf):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CPF already registered"
            )
    
    # Update candidate
    for key, value in candidate.model_dump().items():
        setattr(db_candidate, key, value)
    
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

def delete_candidate(
    db: Session,
    candidate_id: int
) -> bool:
    """
    Delete a candidate
    """
    db_candidate = get_candidate(db, candidate_id)
    if not db_candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    db.delete(db_candidate)
    db.commit()
    return True

def update_candidate_resume(
    db: Session,
    candidate_id: int,
    resume_url: str
) -> Optional[Candidate]:
    """
    Update candidate's resume URL
    """
    db_candidate = get_candidate(db, candidate_id)
    if not db_candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    db_candidate.resume_url = resume_url
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

def update_candidate_portfolio(
    db: Session,
    candidate_id: int,
    portfolio_url: str
) -> Optional[Candidate]:
    """
    Update candidate's portfolio URL
    """
    db_candidate = get_candidate(db, candidate_id)
    if not db_candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    db_candidate.portfolio_url = portfolio_url
    db.commit()
    db.refresh(db_candidate)
    return db_candidate 