from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base

class PipelineEtapa(Base):
    __tablename__ = "pipeline_etapas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    ordem = Column(Integer, nullable=False)
    cor = Column(String(7), nullable=False)  # Formato: #RRGGBB
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    vaga_id = Column(Integer, ForeignKey("vagas.id"), nullable=False)
    is_padrao = Column(Boolean, default=False)
    
    # Campos para templates de notificação
    template_email = Column(Text, nullable=True)
    template_whatsapp = Column(Text, nullable=True)
    
    # Relacionamentos
    empresa = relationship("Empresa", back_populates="pipeline_etapas")
    vaga = relationship("Job", back_populates="pipeline_etapas")
    candidatos = relationship("PipelineCandidato", back_populates="etapa")
    movimentacoes_origem = relationship("PipelineMovimentacao", foreign_keys="PipelineMovimentacao.etapa_origem_id", back_populates="etapa_origem")
    movimentacoes_destino = relationship("PipelineMovimentacao", foreign_keys="PipelineMovimentacao.etapa_destino_id", back_populates="etapa_destino")

class PipelineCandidato(Base):
    __tablename__ = "pipeline_candidatos"

    id = Column(Integer, primary_key=True, index=True)
    candidato_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vaga_id = Column(Integer, ForeignKey("vagas.id"), nullable=False)
    etapa_id = Column(Integer, ForeignKey("pipeline_etapas.id"), nullable=False)
    responsavel_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score_avaliacao = Column(Float, nullable=True)
    observacao = Column(Text, nullable=True)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    candidato = relationship("User", foreign_keys=[candidato_id], back_populates="pipeline_candidaturas")
    vaga = relationship("Job", back_populates="pipeline_candidatos")
    etapa = relationship("PipelineEtapa", back_populates="candidatos")
    responsavel = relationship("User", foreign_keys=[responsavel_id], back_populates="pipeline_responsavel")
    movimentacoes = relationship("PipelineMovimentacao", back_populates="candidato")

class PipelineMovimentacao(Base):
    __tablename__ = "pipeline_movimentacoes"

    id = Column(Integer, primary_key=True, index=True)
    candidato_id = Column(Integer, ForeignKey("pipeline_candidatos.id"), nullable=False)
    etapa_origem_id = Column(Integer, ForeignKey("pipeline_etapas.id"), nullable=True)
    etapa_destino_id = Column(Integer, ForeignKey("pipeline_etapas.id"), nullable=False)
    responsavel_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score_avaliacao = Column(Float, nullable=True)
    observacao = Column(Text, nullable=True)
    data_movimentacao = Column(DateTime, default=datetime.utcnow)

    # Relacionamentos
    candidato = relationship("PipelineCandidato", back_populates="movimentacoes")
    etapa_origem = relationship("PipelineEtapa", foreign_keys=[etapa_origem_id], back_populates="movimentacoes_origem")
    etapa_destino = relationship("PipelineEtapa", foreign_keys=[etapa_destino_id], back_populates="movimentacoes_destino")
    responsavel = relationship("User", foreign_keys=[responsavel_id]) 