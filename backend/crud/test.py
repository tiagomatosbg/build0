from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.recruitment import Test, TestType
from schemas.recruitment import TestCreate, Test as TestSchema
from typing import List, Optional, Dict, Any
from datetime import datetime

def get_test(db: Session, test_id: int) -> Optional[Test]:
    """
    Get a test by ID
    """
    return db.query(Test).filter(Test.id == test_id).first()

def get_tests(
    db: Session,
    job_id: Optional[int] = None,
    candidate_id: Optional[int] = None,
    test_type: Optional[TestType] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Test]:
    """
    Get all tests with filters and pagination
    """
    query = db.query(Test)
    
    if job_id:
        query = query.filter(Test.job_id == job_id)
    if candidate_id:
        query = query.filter(Test.candidate_id == candidate_id)
    if test_type:
        query = query.filter(Test.type == test_type)
    if status:
        query = query.filter(Test.status == status)
    
    return query.offset(skip).limit(limit).all()

def create_test(
    db: Session,
    test: TestCreate
) -> Test:
    """
    Create a new test
    """
    db_test = Test(**test.model_dump())
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return db_test

def update_test(
    db: Session,
    test_id: int,
    test: TestCreate
) -> Optional[Test]:
    """
    Update a test
    """
    db_test = get_test(db, test_id)
    if not db_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    # Update test
    for key, value in test.model_dump().items():
        setattr(db_test, key, value)
    
    db.commit()
    db.refresh(db_test)
    return db_test

def update_test_results(
    db: Session,
    test_id: int,
    results: Dict[str, Any],
    score: Optional[int] = None
) -> Optional[Test]:
    """
    Update test results and score
    """
    db_test = get_test(db, test_id)
    if not db_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    db_test.results = results
    if score is not None:
        db_test.score = score
    db_test.status = "completed"
    db_test.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_test)
    return db_test

def update_test_status(
    db: Session,
    test_id: int,
    status: str
) -> Optional[Test]:
    """
    Update test status
    """
    db_test = get_test(db, test_id)
    if not db_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    valid_statuses = ["pending", "in_progress", "completed"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    db_test.status = status
    if status == "completed":
        db_test.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_test)
    return db_test

def delete_test(
    db: Session,
    test_id: int
) -> bool:
    """
    Delete a test
    """
    db_test = get_test(db, test_id)
    if not db_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    db.delete(db_test)
    db.commit()
    return True 