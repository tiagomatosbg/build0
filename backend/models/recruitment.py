from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Enum, Table, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime
from database import Base

# Association table for job applications
job_applications = Table(
    "job_applications",
    Base.metadata,
    Column("job_id", Integer, ForeignKey("jobs.id"), primary_key=True),
    Column("candidate_id", Integer, ForeignKey("candidates.id"), primary_key=True),
    Column("status", String, default="applied"),  # applied, screening, interview, offer, hired, rejected
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
    Column("updated_at", DateTime(timezone=True), onupdate=func.now())
)

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    cpf = Column(String, unique=True)
    address = Column(String)
    resume_url = Column(String)
    portfolio_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    jobs = relationship("Job", secondary="job_applications", back_populates="candidates")
    interviews = relationship("Interview", back_populates="candidate")
    tests = relationship("Test", back_populates="candidate")

class InterviewType(str, enum.Enum):
    PHONE = "phone"
    VIDEO = "video"
    IN_PERSON = "in_person"

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    interviewer_id = Column(Integer, ForeignKey("users.id"))
    type = Column(Enum(InterviewType))
    scheduled_at = Column(DateTime(timezone=True))
    duration_minutes = Column(Integer, default=60)
    meeting_link = Column(String)
    status = Column(String, default="scheduled")  # scheduled, completed, cancelled, no_show
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    candidate = relationship("Candidate", back_populates="interviews")
    interviewer = relationship("User", back_populates="interviews")

class TestType(str, enum.Enum):
    DISC = "disc"
    TECHNICAL = "technical"
    PERSONALITY = "personality"
    CUSTOM = "custom"

class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    type = Column(Enum(TestType))
    title = Column(String)
    description = Column(Text)
    questions = Column(JSON)  # Store test questions and options
    results = Column(JSON)  # Store test results
    status = Column(String, default="pending")  # pending, in_progress, completed
    score = Column(Integer)
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    candidate = relationship("Candidate", back_populates="tests") 