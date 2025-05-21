from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    # Relacionamentos do Pipeline
    pipeline_candidaturas = relationship("PipelineCandidato", foreign_keys="[PipelineCandidato.candidato_id]", back_populates="candidato")
    pipeline_responsavel = relationship("PipelineCandidato", foreign_keys="[PipelineCandidato.responsavel_id]", back_populates="responsavel")

    # ... existing methods ... 