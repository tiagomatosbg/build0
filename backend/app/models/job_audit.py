from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class JobAudit(Base):
    __tablename__ = "job_audit"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)  # CREATE, UPDATE, DELETE, STATUS_CHANGE
    details = Column(JSON, nullable=True)  # Armazena detalhes da alteração
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relacionamentos
    job = relationship("Job", back_populates="audit_logs")
    user = relationship("User", back_populates="job_audit_logs")

    class Config:
        orm_mode = True 