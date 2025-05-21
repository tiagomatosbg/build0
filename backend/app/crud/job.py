from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime
from app.crud.base import CRUDBase
from app.models.job import Job
from app.schemas.job import JobCreate, JobUpdate

class CRUDJob(CRUDBase[Job, JobCreate, JobUpdate]):
    def create_with_company(
        self, db: Session, *, obj_in: JobCreate, company_id: int
    ) -> Job:
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data, company_id=company_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_company(
        self, db: Session, *, company_id: int, skip: int = 0, limit: int = 100
    ) -> List[Job]:
        return (
            db.query(self.model)
            .filter(self.model.company_id == company_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_multi_by_department(
        self, db: Session, *, department_id: int, skip: int = 0, limit: int = 100
    ) -> List[Job]:
        return (
            db.query(self.model)
            .filter(self.model.department_id == department_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_multi_by_manager(
        self, db: Session, *, manager_id: int, skip: int = 0, limit: int = 100
    ) -> List[Job]:
        return (
            db.query(self.model)
            .filter(self.model.manager_id == manager_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def search(
        self,
        db: Session,
        *,
        search_params: Dict[str, Any],
        skip: int = 0,
        limit: int = 100
    ) -> List[Job]:
        query = db.query(self.model)

        # Apply filters
        if search_params.get("title"):
            query = query.filter(self.model.title.ilike(f"%{search_params['title']}%"))
        
        if search_params.get("department_id"):
            query = query.filter(self.model.department_id == search_params["department_id"])
        
        if search_params.get("location"):
            query = query.filter(self.model.location.ilike(f"%{search_params['location']}%"))
        
        if search_params.get("type"):
            query = query.filter(self.model.type == search_params["type"])
        
        if search_params.get("status"):
            query = query.filter(self.model.status == search_params["status"])

        # Apply date range filter
        if search_params.get("date_range"):
            date_range = search_params["date_range"]
            if date_range.get("start"):
                query = query.filter(self.model.opening_date >= date_range["start"])
            if date_range.get("end"):
                query = query.filter(self.model.opening_date <= date_range["end"])

        return query.offset(skip).limit(limit).all()

    def update_status(
        self, db: Session, *, db_obj: Job, status: str
    ) -> Job:
        db_obj.status = status
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

job = CRUDJob(Job) 