from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from datetime import datetime

from app.api import deps
from app.models.user import User
from app.models.pipeline_etapa import PipelineEtapa
from app.models.pipeline_candidato import PipelineCandidato
from app.schemas.pipeline import (
    PipelineEtapa as PipelineEtapaSchema,
    PipelineEtapaCreate,
    PipelineEtapaUpdate,
    PipelineCandidato as PipelineCandidatoSchema,
    PipelineCandidatoCreate,
    PipelineCandidatoUpdate,
    PipelineCandidatoDetalhado,
    PipelineEtapaDetalhada,
    PipelineMovimentacaoDetalhada,
    PipelineHistoricoFiltro,
    PipelineHistoricoExportacao
)
from app.crud.crud_pipeline import (
    pipeline_etapa as crud_pipeline_etapa,
    pipeline_candidato as crud_pipeline_candidato
)
from app.crud import crud_pipeline

router = APIRouter()

# Endpoints para Etapas do Pipeline
@router.get("/etapas/{vaga_id}", response_model=List[PipelineEtapaSchema])
def listar_etapas(
    vaga_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Lista todas as etapas do pipeline de uma vaga específica.
    
    Permissões:
    - Usuário deve pertencer à mesma empresa da vaga
    - Usuário deve ter role admin, hr_manager ou recruiter
    
    Args:
        vaga_id: ID da vaga
        db: Sessão do banco de dados
        current_user: Usuário autenticado
    
    Returns:
        Lista de etapas do pipeline ordenadas por ordem
        
    Raises:
        HTTPException(403): Se o usuário não tiver permissão
    """
    if not crud_pipeline_etapa.verificar_acesso_vaga(db, vaga_id, current_user):
        raise HTTPException(status_code=403, detail="Acesso negado a esta vaga")
    
    return crud_pipeline_etapa.get_etapas_by_vaga(db, vaga_id)

@router.post("/etapas/{vaga_id}", response_model=PipelineEtapaSchema)
def criar_etapa(
    vaga_id: int,
    etapa: PipelineEtapaCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Cria uma nova etapa no pipeline de uma vaga.
    
    Permissões:
    - Usuário deve pertencer à mesma empresa da vaga
    - Usuário deve ter role admin ou hr_manager
    
    Validações:
    - Cor deve estar no formato hexadecimal (#RRGGBB)
    - Ordem deve ser única para a vaga
    - Nome não pode estar vazio
    
    Args:
        vaga_id: ID da vaga
        etapa: Dados da nova etapa
        db: Sessão do banco de dados
        current_user: Usuário autenticado
    
    Returns:
        Etapa criada
        
    Raises:
        HTTPException(403): Se o usuário não tiver permissão
        HTTPException(400): Se os dados forem inválidos
    """
    if not crud_pipeline_etapa.verificar_acesso_vaga(db, vaga_id, current_user):
        raise HTTPException(status_code=403, detail="Acesso negado a esta vaga")
    
    etapa.vaga_id = vaga_id
    return crud_pipeline_etapa.create(db, obj_in=etapa)

@router.put("/etapas/{etapa_id}", response_model=PipelineEtapaSchema)
def atualizar_etapa(
    etapa_id: int,
    etapa: PipelineEtapaUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Atualiza uma etapa do pipeline.
    """
    etapa_db = crud_pipeline_etapa.get(db, id=etapa_id)
    if not etapa_db:
        raise HTTPException(status_code=404, detail="Etapa não encontrada")
    
    if not crud_pipeline_etapa.verificar_acesso_vaga(db, etapa_db.vaga_id, current_user):
        raise HTTPException(status_code=403, detail="Acesso negado a esta vaga")
    
    return crud_pipeline_etapa.update(db, db_obj=etapa_db, obj_in=etapa)

@router.delete("/etapas/{etapa_id}")
def remover_etapa(
    etapa_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Remove uma etapa do pipeline.
    """
    etapa_db = crud_pipeline_etapa.get(db, id=etapa_id)
    if not etapa_db:
        raise HTTPException(status_code=404, detail="Etapa não encontrada")
    
    if not crud_pipeline_etapa.verificar_acesso_vaga(db, etapa_db.vaga_id, current_user):
        raise HTTPException(status_code=403, detail="Acesso negado a esta vaga")
    
    crud_pipeline_etapa.remove(db, id=etapa_id)
    return {"message": "Etapa removida com sucesso"}

# Endpoints para Candidatos no Pipeline
@router.get("/candidatos/{vaga_id}/{etapa_id}", response_model=List[PipelineCandidatoDetalhado])
def listar_candidatos_etapa(
    vaga_id: int,
    etapa_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Lista todos os candidatos em uma etapa específica do pipeline.
    """
    if not crud_pipeline_etapa.verificar_acesso_vaga(db, vaga_id, current_user):
        raise HTTPException(status_code=403, detail="Acesso negado a esta vaga")
    
    return crud_pipeline_candidato.get_candidatos_by_etapa(db, vaga_id, etapa_id)

@router.post("/candidatos/mover", response_model=PipelineCandidatoDetalhado)
def mover_candidato(
    candidato: PipelineCandidatoCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Move um candidato para uma nova etapa do pipeline.
    """
    # Verifica permissão para movimentar
    if not crud_pipeline_candidato.verificar_permissao_movimentacao(db, candidato.vaga_id, current_user):
        raise HTTPException(status_code=403, detail="Sem permissão para movimentar candidatos")
    
    # Verifica se o candidato já está em alguma etapa
    candidato_existente = crud_pipeline_candidato.verificar_candidato_etapa(
        db, candidato.candidato_id, candidato.vaga_id
    )
    if candidato_existente:
        raise HTTPException(
            status_code=400,
            detail="Candidato já está em uma etapa do pipeline para esta vaga"
        )
    
    # Obtém a etapa atual
    etapa_atual = crud_pipeline_etapa.get(db, id=candidato.etapa_id)
    if not etapa_atual:
        raise HTTPException(status_code=404, detail="Etapa não encontrada")
    
    # Verifica se todas as etapas anteriores foram completadas
    if not crud_pipeline_etapa.verificar_etapa_anterior(db, candidato.vaga_id, etapa_atual.ordem):
        raise HTTPException(
            status_code=400,
            detail="É necessário completar as etapas anteriores antes de prosseguir"
        )
    
    # Define o responsável como o usuário atual
    candidato.responsavel_id = current_user.id
    
    return crud_pipeline_candidato.create(db, obj_in=candidato)

@router.get("/candidatos/{candidato_id}/historico", response_model=List[PipelineCandidatoDetalhado])
def historico_candidato(
    candidato_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Retorna o histórico completo de movimentações de um candidato no pipeline.
    """
    # Verifica se o usuário tem acesso ao histórico do candidato
    if not crud_pipeline_candidato.verificar_acesso_candidato(db, candidato_id, current_user):
        raise HTTPException(status_code=403, detail="Acesso negado ao histórico do candidato")
    
    return crud_pipeline_candidato.get_historico_candidato(db, candidato_id)

@router.post("/candidatos/{candidato_id}/mover", response_model=PipelineCandidato)
def move_candidate(
    candidato_id: int,
    nova_etapa_id: int,
    vaga_id: int,
    score_avaliacao: float = None,
    observacao: str = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Move um candidato para uma nova etapa do pipeline.
    
    Permissões:
    - Usuário deve pertencer à mesma empresa da vaga
    - Usuário deve ter role admin, hr_manager ou ser recrutador responsável
    
    Validações:
    - Candidato deve existir
    - Nova etapa deve existir e pertencer à vaga
    - Todas as etapas anteriores devem estar completas
    - Score deve estar entre 0 e 10
    
    Integrações:
    - Registra movimentação no histórico
    - Envia notificações por email e WhatsApp
    - Atualiza score e observações se fornecidos
    
    Args:
        candidato_id: ID do candidato
        nova_etapa_id: ID da nova etapa
        vaga_id: ID da vaga
        score_avaliacao: Score opcional (0-10)
        observacao: Observação opcional
        db: Sessão do banco de dados
        current_user: Usuário autenticado
    
    Returns:
        Candidato atualizado
        
    Raises:
        HTTPException(403): Se o usuário não tiver permissão
        HTTPException(404): Se candidato ou etapa não existirem
        HTTPException(400): Se validações falharem
    """
    return crud_pipeline.move_candidato(
        db=db,
        candidato_id=candidato_id,
        nova_etapa_id=nova_etapa_id,
        vaga_id=vaga_id,
        responsavel_id=current_user.id,
        score_avaliacao=score_avaliacao,
        observacao=observacao
    )

@router.get("/historico", response_model=List[PipelineMovimentacaoDetalhada])
def get_pipeline_history(
    candidato_id: int = None,
    vaga_id: int = None,
    data_inicio: datetime = None,
    data_fim: datetime = None,
    etapa_id: int = None,
    responsavel_id: int = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Retorna o histórico de movimentações do pipeline com base nos filtros fornecidos.
    
    Permissões:
    - Apenas admin e hr_manager podem acessar o histórico
    
    Filtros:
    - candidato_id: Filtrar por candidato específico
    - vaga_id: Filtrar por vaga específica
    - data_inicio: Filtrar por data inicial
    - data_fim: Filtrar por data final
    - etapa_id: Filtrar por etapa específica
    - responsavel_id: Filtrar por responsável específico
    
    Args:
        candidato_id: ID do candidato (opcional)
        vaga_id: ID da vaga (opcional)
        data_inicio: Data inicial (opcional)
        data_fim: Data final (opcional)
        etapa_id: ID da etapa (opcional)
        responsavel_id: ID do responsável (opcional)
        db: Sessão do banco de dados
        current_user: Usuário autenticado
    
    Returns:
        Lista de movimentações detalhadas
        
    Raises:
        HTTPException(403): Se o usuário não tiver permissão
    """
    if current_user.role not in ["admin", "hr_manager"]:
        raise HTTPException(
            status_code=403,
            detail="Apenas administradores e gestores podem acessar o histórico"
        )
    
    filtro = PipelineHistoricoFiltro(
        candidato_id=candidato_id,
        vaga_id=vaga_id,
        data_inicio=data_inicio,
        data_fim=data_fim,
        etapa_id=etapa_id,
        responsavel_id=responsavel_id
    )
    
    return crud_pipeline.get_historico_movimentacoes(db, filtro)

@router.post("/historico/exportar")
def export_pipeline_history(
    exportacao: PipelineHistoricoExportacao,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Response:
    """
    Exporta o histórico de movimentações do pipeline para XLSX ou CSV.
    
    Permissões:
    - Apenas admin pode exportar o histórico
    
    Formatos:
    - xlsx: Excel com formatação
    - csv: CSV com encoding UTF-8
    
    Campos exportados:
    - ID da movimentação
    - Nome do candidato
    - Título da vaga
    - Etapa origem
    - Etapa destino
    - Responsável
    - Score
    - Observação
    - Data da movimentação
    
    Args:
        exportacao: Configurações de exportação
        db: Sessão do banco de dados
        current_user: Usuário autenticado
    
    Returns:
        Arquivo XLSX ou CSV
        
    Raises:
        HTTPException(403): Se o usuário não tiver permissão
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Apenas administradores podem exportar o histórico"
        )
    
    dados = crud_pipeline.exportar_historico(
        db=db,
        filtro=exportacao.filtro,
        formato=exportacao.formato
    )
    
    content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" if exportacao.formato == "xlsx" else "text/csv"
    filename = f"historico_pipeline_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{exportacao.formato}"
    
    return Response(
        content=dados,
        media_type=content_type,
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

@router.post("/vaga/{vaga_id}/exportar")
def export_pipeline_vaga(
    vaga_id: int,
    exportacao: PipelineHistoricoExportacao,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Response:
    """
    Exporta os dados do pipeline de uma vaga específica para XLSX ou CSV.
    Inclui etapas, candidatos e histórico de movimentações.
    """
    # Verifica permissão
    if not crud_pipeline_etapa.verificar_acesso_vaga(db, vaga_id, current_user):
        raise HTTPException(status_code=403, detail="Acesso negado a esta vaga")
    
    # Exporta os dados
    dados = crud_pipeline.exportar_pipeline_vaga(
        db=db,
        vaga_id=vaga_id,
        formato=exportacao.formato,
        filtro=exportacao.filtro
    )
    
    # Define o tipo de conteúdo e nome do arquivo
    content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" if exportacao.formato == "xlsx" else "text/csv"
    filename = f"pipeline_vaga_{vaga_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{exportacao.formato}"
    
    return Response(
        content=dados,
        media_type=content_type,
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    ) 