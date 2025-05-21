from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class PipelineEtapaBase(BaseModel):
    nome: str
    ordem: int
    cor: str = Field(..., pattern="^#[0-9A-Fa-f]{6}$")  # Validação de cor hexadecimal
    empresa_id: int
    vaga_id: Optional[int] = None
    is_padrao: bool = False

class PipelineEtapaCreate(PipelineEtapaBase):
    pass

class PipelineEtapaUpdate(BaseModel):
    nome: Optional[str] = None
    ordem: Optional[int] = None
    cor: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    is_padrao: Optional[bool] = None

class PipelineEtapa(PipelineEtapaBase):
    id: int

    class Config:
        orm_mode = True

class PipelineCandidatoBase(BaseModel):
    candidato_id: int
    vaga_id: int
    etapa_id: int
    responsavel_id: Optional[int] = None
    score_avaliacao: Optional[float] = Field(None, ge=0, le=10)
    observacao: Optional[str] = None

class PipelineCandidatoCreate(PipelineCandidatoBase):
    pass

class PipelineCandidatoUpdate(BaseModel):
    etapa_id: Optional[int] = None
    responsavel_id: Optional[int] = None
    score_avaliacao: Optional[float] = Field(None, ge=0, le=10)
    observacao: Optional[str] = None

class PipelineCandidato(PipelineCandidatoBase):
    id: int
    data_movimentacao: datetime
    data_criacao: datetime
    data_atualizacao: datetime

    class Config:
        orm_mode = True

# Schemas para respostas detalhadas
class PipelineCandidatoDetalhado(PipelineCandidato):
    candidato: "User"
    vaga: "Job"
    etapa: PipelineEtapa
    responsavel: Optional["User"] = None

    class Config:
        orm_mode = True

class PipelineEtapaDetalhada(PipelineEtapa):
    candidatos: List[PipelineCandidatoDetalhado]

    class Config:
        orm_mode = True

class PipelineMovimentacaoBase(BaseModel):
    candidato_id: int
    etapa_origem_id: Optional[int] = None
    etapa_destino_id: int
    responsavel_id: int
    score_avaliacao: Optional[float] = Field(None, ge=0, le=10)
    observacao: Optional[str] = None

class PipelineMovimentacaoCreate(PipelineMovimentacaoBase):
    pass

class PipelineMovimentacao(PipelineMovimentacaoBase):
    id: int
    data_movimentacao: datetime

    class Config:
        from_attributes = True

class PipelineMovimentacaoDetalhada(PipelineMovimentacao):
    candidato: User
    etapa_origem: Optional[PipelineEtapa]
    etapa_destino: PipelineEtapa
    responsavel: User

    class Config:
        from_attributes = True

class PipelineHistoricoFiltro(BaseModel):
    candidato_id: Optional[int] = None
    vaga_id: Optional[int] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    etapa_id: Optional[int] = None
    responsavel_id: Optional[int] = None

class PipelineHistoricoExportacao(BaseModel):
    formato: str = Field(..., regex="^(xlsx|csv)$")
    filtro: PipelineHistoricoFiltro 