from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base_class import Base
from datetime import datetime

class JobStatus(str, enum.Enum):
    OPEN = "open"
    SCREENING = "screening"
    INTERVIEWING = "interviewing"
    CLOSED = "closed"
    CANCELLED = "cancelled"
    DRAFT = "draft"

class JobType(str, enum.Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    TEMPORARY = "temporary"
    INTERNSHIP = "internship"

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=False)
    location = Column(String(255), nullable=False)
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    benefits = Column(Text, nullable=True)
    type = Column(Enum(JobType), nullable=False)
    status = Column(Enum(JobStatus), nullable=False, default=JobStatus.OPEN)
    
    opening_date = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    closing_date = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    company = relationship("Company", back_populates="jobs")
    department = relationship("Department", back_populates="jobs")
    manager = relationship("User", back_populates="managed_jobs")
    candidates = relationship("Candidate", secondary="job_applications", back_populates="jobs")
    interviews = relationship("Interview", back_populates="job")

    # Relacionamentos do Pipeline
    pipeline_etapas = relationship("PipelineEtapa", back_populates="vaga", cascade="all, delete-orphan")
    pipeline_candidatos = relationship("PipelineCandidato", back_populates="vaga", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Job {self.title}>" 