from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.base import Company
from schemas.base import CompanyCreate, Company as CompanySchema
from typing import List, Optional

def get_company(db: Session, company_id: int) -> Optional[Company]:
    """
    Get a company by ID
    """
    return db.query(Company).filter(Company.id == company_id).first()

def get_company_by_cnpj(db: Session, cnpj: str) -> Optional[Company]:
    """
    Get a company by CNPJ
    """
    return db.query(Company).filter(Company.cnpj == cnpj).first()

def get_companies(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> List[Company]:
    """
    Get all companies with pagination
    """
    return db.query(Company).offset(skip).limit(limit).all()

def create_company(
    db: Session,
    company: CompanyCreate
) -> Company:
    """
    Create a new company
    """
    # Check if company with same CNPJ exists
    db_company = get_company_by_cnpj(db, company.cnpj)
    if db_company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company with this CNPJ already exists"
        )
    
    # Create new company
    db_company = Company(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def update_company(
    db: Session,
    company_id: int,
    company: CompanyCreate
) -> Optional[Company]:
    """
    Update a company
    """
    db_company = get_company(db, company_id)
    if not db_company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Check if new CNPJ conflicts with existing company
    if company.cnpj != db_company.cnpj:
        existing_company = get_company_by_cnpj(db, company.cnpj)
        if existing_company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company with this CNPJ already exists"
            )
    
    # Update company
    for key, value in company.model_dump().items():
        setattr(db_company, key, value)
    
    db.commit()
    db.refresh(db_company)
    return db_company

def delete_company(
    db: Session,
    company_id: int
) -> bool:
    """
    Delete a company
    """
    db_company = get_company(db, company_id)
    if not db_company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    db.delete(db_company)
    db.commit()
    return True 