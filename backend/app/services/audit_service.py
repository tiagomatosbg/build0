from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.job_audit import JobAudit
from app.models.job import Job
from app.models.user import User

class AuditService:
    @staticmethod
    async def log_job_action(
        db: Session,
        job: Job,
        user: User,
        action: str,
        details: Optional[Dict[str, Any]] = None
    ) -> JobAudit:
        """
        Registra uma ação de auditoria para uma vaga
        """
        audit_log = JobAudit(
            job_id=job.id,
            user_id=user.id,
            action=action,
            details=details,
            created_at=datetime.utcnow()
        )
        
        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)
        
        return audit_log

    @staticmethod
    async def get_job_audit_logs(
        db: Session,
        job_id: Optional[int] = None,
        user_id: Optional[int] = None,
        action: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 100
    ) -> list[JobAudit]:
        """
        Recupera logs de auditoria com filtros opcionais
        """
        query = db.query(JobAudit)

        if job_id:
            query = query.filter(JobAudit.job_id == job_id)
        if user_id:
            query = query.filter(JobAudit.user_id == user_id)
        if action:
            query = query.filter(JobAudit.action == action)
        if start_date:
            query = query.filter(JobAudit.created_at >= start_date)
        if end_date:
            query = query.filter(JobAudit.created_at <= end_date)

        return query.order_by(JobAudit.created_at.desc()).offset(skip).limit(limit).all()

audit_service = AuditService() 