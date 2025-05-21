from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class PipelineCandidato(Base):
    __tablename__ = "pipeline_candidatos"

    id = Column(Integer, primary_key=True, index=True)
    candidato_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    vaga_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    etapa_id = Column(Integer, ForeignKey("pipeline_etapas.id", ondelete="SET NULL"), nullable=False)
    responsavel_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    data_movimentacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    score_avaliacao = Column(Float, nullable=True)  # Pontuação de 0 a 10
    observacao = Column(Text, nullable=True)
    data_criacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relacionamentos
    candidato = relationship("User", foreign_keys=[candidato_id], back_populates="pipeline_candidaturas")
    vaga = relationship("Job", back_populates="pipeline_candidatos")
    etapa = relationship("PipelineEtapa", back_populates="candidatos")
    responsavel = relationship("User", foreign_keys=[responsavel_id], back_populates="pipeline_responsavel")

    class Config:
        orm_mode = True 