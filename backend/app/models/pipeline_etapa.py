from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class PipelineEtapa(Base):
    __tablename__ = "pipeline_etapas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    ordem = Column(Integer, nullable=False)
    cor = Column(String, nullable=False)  # Código hexadecimal da cor
    empresa_id = Column(Integer, ForeignKey("empresas.id", ondelete="CASCADE"), nullable=False)
    vaga_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=True)  # Null para etapas padrão
    is_padrao = Column(Boolean, default=False)  # Indica se é uma etapa padrão do sistema

    # Relacionamentos
    empresa = relationship("Empresa", back_populates="pipeline_etapas")
    vaga = relationship("Job", back_populates="pipeline_etapas")
    candidatos = relationship("PipelineCandidato", back_populates="etapa")

    class Config:
        orm_mode = True 