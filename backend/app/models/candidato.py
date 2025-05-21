from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declared_attr
from app.db.base_class import Base
from app.models.empresa import Empresa

class Candidato(Base):
    """
    Modelo de Candidato
    
    Campos:
    - id: Identificador único
    - empresa_id: ID da empresa (multiempresa)
    - nome: Nome do candidato
    - sobrenome: Sobrenome do candidato
    - email: Email do candidato (único por empresa)
    - cpf: CPF do candidato (único por empresa)
    - data_nascimento: Data de nascimento
    - telefone: Telefone de contato
    - foto: URL da foto do candidato
    - endereco: Endereço completo
    - linkedin: URL do perfil LinkedIn
    - portfolio: URL do portfólio
    - resumo: Resumo profissional
    - senha: Hash da senha
    - status: Status do candidato (ativo/inativo)
    - data_criacao: Data de criação do registro
    - data_atualizacao: Data da última atualização
    
    Relacionamentos:
    - experiencia_profissional: Lista de experiências profissionais
    - formacao_academica: Lista de formações acadêmicas
    - vagas_aplicadas: Lista de vagas que o candidato se inscreveu
    - documentos: Lista de documentos do candidato
    - historico_etapas: Histórico de movimentações no pipeline
    - testes_realizados: Lista de testes realizados
    """
    
    __tablename__ = "candidatos"
    
    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    nome = Column(String(100), nullable=False)
    sobrenome = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    cpf = Column(String(14), nullable=False)
    data_nascimento = Column(Date, nullable=False)
    telefone = Column(String(20), nullable=False)
    foto = Column(String(255))
    endereco = Column(Text)
    linkedin = Column(String(255))
    portfolio = Column(String(255))
    resumo = Column(Text)
    senha = Column(String(255), nullable=False)
    status = Column(Boolean, default=True)
    data_criacao = Column(DateTime(timezone=True), server_default=func.now())
    data_atualizacao = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    empresa = relationship("Empresa", back_populates="candidatos")
    experiencia_profissional = relationship("ExperienciaProfissional", back_populates="candidato", cascade="all, delete-orphan")
    formacao_academica = relationship("FormacaoAcademica", back_populates="candidato", cascade="all, delete-orphan")
    vagas_aplicadas = relationship("VagaCandidato", back_populates="candidato", cascade="all, delete-orphan")
    documentos = relationship("DocumentoCandidato", back_populates="candidato", cascade="all, delete-orphan")
    historico_etapas = relationship("PipelineMovimentacao", back_populates="candidato", cascade="all, delete-orphan")
    testes_realizados = relationship("TesteRealizado", back_populates="candidato", cascade="all, delete-orphan")
    
    # Índices para otimização de consultas
    __table_args__ = (
        # Índice composto para garantir unicidade de email por empresa
        {'postgresql_partition_by': 'LIST (empresa_id)'},
    )
    
    @declared_attr
    def __table_args__(cls):
        return (
            # Índice composto para garantir unicidade de email por empresa
            {'postgresql_partition_by': 'LIST (empresa_id)'},
        ) 