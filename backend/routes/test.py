from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database import get_db
from crud import test as test_crud
from schemas.recruitment import Test, TestCreate, TestType
from auth.security import get_current_active_user
from models.base import User, UserRole

router = APIRouter(
    prefix="/tests",
    tags=["tests"]
)

@router.post("/", response_model=Test)
async def create_test(
    test: TestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new test
    """
    # Check if user has permission to create tests
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create tests"
        )
    
    return test_crud.create_test(db=db, test=test)

@router.get("/", response_model=List[Test])
async def read_tests(
    job_id: int = None,
    candidate_id: int = None,
    test_type: TestType = None,
    status: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all tests with filters
    """
    # Check if user has permission to view tests
    if current_user.role == UserRole.CANDIDATE:
        # Candidates can only view their own tests
        candidate_id = current_user.id
    
    return test_crud.get_tests(
        db=db,
        job_id=job_id,
        candidate_id=candidate_id,
        test_type=test_type,
        status=status,
        skip=skip,
        limit=limit
    )

@router.get("/{test_id}", response_model=Test)
async def read_test(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific test
    """
    db_test = test_crud.get_test(db=db, test_id=test_id)
    if db_test is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    # Check if user has permission to view the test
    if current_user.role == UserRole.CANDIDATE and current_user.id != db_test.candidate_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this test"
        )
    
    return db_test

@router.put("/{test_id}", response_model=Test)
async def update_test(
    test_id: int,
    test: TestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a test
    """
    db_test = test_crud.get_test(db=db, test_id=test_id)
    if db_test is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    # Check if user has permission to update the test
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update tests"
        )
    
    return test_crud.update_test(db=db, test_id=test_id, test=test)

@router.patch("/{test_id}/results")
async def update_test_results(
    test_id: int,
    results: Dict[str, Any],
    score: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update test results and score
    """
    db_test = test_crud.get_test(db=db, test_id=test_id)
    if db_test is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    # Check if user has permission to update test results
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update test results"
        )
    
    return test_crud.update_test_results(
        db=db,
        test_id=test_id,
        results=results,
        score=score
    )

@router.patch("/{test_id}/status")
async def update_test_status(
    test_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update test status
    """
    db_test = test_crud.get_test(db=db, test_id=test_id)
    if db_test is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    # Check if user has permission to update test status
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update test status"
        )
    
    return test_crud.update_test_status(
        db=db,
        test_id=test_id,
        status=status
    )

@router.delete("/{test_id}")
async def delete_test(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a test
    """
    db_test = test_crud.get_test(db=db, test_id=test_id)
    if db_test is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    # Check if user has permission to delete the test
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete tests"
        )
    
    success = test_crud.delete_test(db=db, test_id=test_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    return {"message": "Test deleted successfully"} 