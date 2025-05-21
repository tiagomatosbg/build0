from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException
import pandas as pd
from datetime import datetime
import io

from app.crud.base import CRUDBase
from app.models.pipeline import PipelineEtapa, PipelineCandidato, PipelineMovimentacao
from app.models.job import Job
from app.models.user import User
from app.schemas.pipeline import (
    PipelineEtapaCreate, PipelineEtapaUpdate,
    PipelineCandidatoCreate, PipelineCandidatoUpdate,
    PipelineHistoricoFiltro
)
from app.services.notification_service import NotificationService

class CRUDPipelineEtapa(CRUDBase[PipelineEtapa, PipelineEtapaCreate, PipelineEtapaUpdate]):
    def get_etapas_by_vaga(self, db: Session, vaga_id: int) -> List[PipelineEtapa]:
        return db.query(self.model).filter(
            self.model.vaga_id == vaga_id
        ).order_by(self.model.ordem).all()
    
    def verificar_acesso_vaga(self, db: Session, vaga_id: int, user: User) -> bool:
        """
        Verifica se o usuário tem acesso à vaga baseado em sua empresa e permissões.
        """
        vaga = db.query(Job).filter(Job.id == vaga_id).first()
        if not vaga:
            return False
        
        # Verifica se o usuário pertence à mesma empresa da vaga
        if user.empresa_id != vaga.company_id:
            return False
        
        # Verifica se o usuário tem permissão para gerenciar o pipeline
        return user.role in ["admin", "hr_manager", "recruiter"]
    
    def verificar_etapa_anterior(self, db: Session, vaga_id: int, ordem_atual: int) -> bool:
        """
        Verifica se todas as etapas anteriores foram completadas.
        """
        etapas_anteriores = db.query(self.model).filter(
            and_(
                self.model.vaga_id == vaga_id,
                self.model.ordem < ordem_atual
            )
        ).all()
        
        for etapa in etapas_anteriores:
            candidatos = db.query(PipelineCandidato).filter(
                and_(
                    PipelineCandidato.vaga_id == vaga_id,
                    PipelineCandidato.etapa_id == etapa.id
                )
            ).all()
            
            for candidato in candidatos:
                if not candidato.score_avaliacao or not candidato.observacao:
                    return False
        
        return True

class CRUDPipelineCandidato(CRUDBase[PipelineCandidato, PipelineCandidatoCreate, PipelineCandidatoUpdate]):
    def get_candidatos_by_etapa(
        self, db: Session, vaga_id: int, etapa_id: int
    ) -> List[PipelineCandidato]:
        return db.query(self.model).filter(
            and_(
                self.model.vaga_id == vaga_id,
                self.model.etapa_id == etapa_id
            )
        ).all()
    
    def get_candidato(self, db: Session, candidato_id: int) -> Optional[PipelineCandidato]:
        return db.query(self.model).filter(self.model.id == candidato_id).first()
    
    def get_historico_candidato(
        self, db: Session, candidato_id: int
    ) -> List[PipelineCandidato]:
        return db.query(self.model).filter(
            self.model.candidato_id == candidato_id
        ).order_by(self.model.data_movimentacao.desc()).all()
    
    def verificar_candidato_etapa(
        self, db: Session, candidato_id: int, vaga_id: int
    ) -> Optional[PipelineCandidato]:
        """
        Verifica se o candidato já está em alguma etapa do pipeline para a vaga.
        """
        return db.query(self.model).filter(
            and_(
                self.model.candidato_id == candidato_id,
                self.model.vaga_id == vaga_id
            )
        ).first()
    
    def verificar_permissao_movimentacao(
        self, db: Session, vaga_id: int, user: User
    ) -> bool:
        """
        Verifica se o usuário tem permissão para movimentar candidatos.
        """
        vaga = db.query(Job).filter(Job.id == vaga_id).first()
        if not vaga:
            return False
        
        # Admin pode movimentar qualquer candidato
        if user.role == "admin":
            return True
        
        # Recrutador responsável pela vaga pode movimentar
        if user.role == "recruiter" and vaga.manager_id == user.id:
            return True
        
        return False
    
    def verificar_acesso_candidato(
        self, db: Session, candidato_id: int, user: User
    ) -> bool:
        """
        Verifica se o usuário tem acesso para visualizar o candidato.
        """
        candidato = self.get_candidato(db, candidato_id)
        if not candidato:
            return False
        
        # Candidato pode ver apenas seu próprio pipeline
        if user.id == candidato.candidato_id:
            return True
        
        # Admin e recrutadores responsáveis podem ver
        return self.verificar_permissao_movimentacao(db, candidato.vaga_id, user)

def get_etapa(db: Session, etapa_id: int) -> Optional[PipelineEtapa]:
    return db.query(PipelineEtapa).filter(PipelineEtapa.id == etapa_id).first()

def get_etapas_by_vaga(db: Session, vaga_id: int) -> List[PipelineEtapa]:
    return db.query(PipelineEtapa).filter(PipelineEtapa.vaga_id == vaga_id).order_by(PipelineEtapa.ordem).all()

def get_candidato(db: Session, candidato_id: int) -> Optional[PipelineCandidato]:
    return db.query(PipelineCandidato).filter(PipelineCandidato.id == candidato_id).first()

def get_candidatos_by_vaga(db: Session, vaga_id: int) -> List[PipelineCandidato]:
    return db.query(PipelineCandidato).filter(PipelineCandidato.vaga_id == vaga_id).all()

def create_candidato(db: Session, candidato: PipelineCandidatoCreate) -> PipelineCandidato:
    db_candidato = PipelineCandidato(**candidato.dict())
    db.add(db_candidato)
    db.commit()
    db.refresh(db_candidato)
    return db_candidato

def update_candidato(
    db: Session,
    candidato_id: int,
    candidato: PipelineCandidatoUpdate
) -> Optional[PipelineCandidato]:
    db_candidato = get_candidato(db, candidato_id)
    if not db_candidato:
        return None
    
    for field, value in candidato.dict(exclude_unset=True).items():
        setattr(db_candidato, field, value)
    
    db.commit()
    db.refresh(db_candidato)
    return db_candidato

def move_candidato(
    db: Session,
    candidato_id: int,
    nova_etapa_id: int,
    vaga_id: int,
    responsavel_id: int,
    score_avaliacao: Optional[float] = None,
    observacao: Optional[str] = None
) -> Optional[PipelineCandidato]:
    """
    Move um candidato para uma nova etapa do pipeline.
    
    Fluxo de execução:
    1. Validações iniciais (candidato, etapa, vaga)
    2. Verifica se candidato já está na etapa
    3. Verifica se etapas anteriores foram completadas
    4. Registra movimentação no histórico
    5. Atualiza dados do candidato
    6. Envia notificações
    7. Commit das alterações
    
    Args:
        db: Sessão do banco de dados
        candidato_id: ID do candidato
        nova_etapa_id: ID da nova etapa
        vaga_id: ID da vaga
        responsavel_id: ID do responsável pela movimentação
        score_avaliacao: Score opcional (0-10)
        observacao: Observação opcional
    
    Returns:
        Candidato atualizado ou None se não encontrado
        
    Raises:
        HTTPException(404): Se candidato ou etapa não existirem
        HTTPException(400): Se validações falharem
    """
    # Verifica se o candidato existe
    candidato = get_candidato(db, candidato_id)
    if not candidato:
        raise HTTPException(status_code=404, detail="Candidato não encontrado")
    
    # Verifica se a nova etapa existe
    nova_etapa = get_etapa(db, nova_etapa_id)
    if not nova_etapa:
        raise HTTPException(status_code=404, detail="Etapa não encontrada")
    
    # Verifica se a etapa pertence à vaga
    if nova_etapa.vaga_id != vaga_id:
        raise HTTPException(status_code=400, detail="Etapa não pertence à vaga")
    
    # Verifica se o candidato já está na etapa
    if candidato.etapa_id == nova_etapa_id:
        return candidato
    
    # Verifica se todas as etapas anteriores foram completadas
    etapas_anteriores = db.query(PipelineEtapa).filter(
        PipelineEtapa.vaga_id == vaga_id,
        PipelineEtapa.ordem < nova_etapa.ordem
    ).all()
    
    for etapa in etapas_anteriores:
        candidato_na_etapa = db.query(PipelineCandidato).filter(
            PipelineCandidato.candidato_id == candidato.candidato_id,
            PipelineCandidato.etapa_id == etapa.id
        ).first()
        
        if not candidato_na_etapa:
            raise HTTPException(
                status_code=400,
                detail=f"É necessário completar a etapa '{etapa.nome}' antes"
            )
    
    # Registra a movimentação no histórico
    movimentacao = PipelineMovimentacao(
        candidato_id=candidato.id,
        etapa_origem_id=candidato.etapa_id,
        etapa_destino_id=nova_etapa_id,
        responsavel_id=responsavel_id,
        score_avaliacao=score_avaliacao,
        observacao=observacao
    )
    db.add(movimentacao)
    
    # Atualiza a etapa do candidato
    candidato.etapa_id = nova_etapa_id
    if score_avaliacao is not None:
        candidato.score_avaliacao = score_avaliacao
    if observacao is not None:
        candidato.observacao = observacao
    
    # Envia notificações
    notification_service = NotificationService(db)
    notification_service.send_notifications(
        candidato=candidato,
        etapa=nova_etapa,
        responsavel=candidato.responsavel
    )
    
    db.commit()
    db.refresh(candidato)
    return candidato

def delete_candidato(db: Session, candidato_id: int) -> bool:
    candidato = get_candidato(db, candidato_id)
    if not candidato:
        return False
    
    db.delete(candidato)
    db.commit()
    return True

def get_historico_movimentacoes(
    db: Session,
    filtro: PipelineHistoricoFiltro
) -> List[PipelineMovimentacao]:
    """
    Retorna o histórico de movimentações com base nos filtros fornecidos.
    
    Lógica de filtros:
    - candidato_id: Filtra por candidato específico
    - vaga_id: Filtra por vaga específica
    - data_inicio/fim: Filtra por período
    - etapa_id: Filtra por etapa (origem ou destino)
    - responsavel_id: Filtra por responsável
    
    Ordenação:
    - Movimentações mais recentes primeiro
    
    Args:
        db: Sessão do banco de dados
        filtro: Filtros a serem aplicados
    
    Returns:
        Lista de movimentações ordenadas por data
    """
    query = db.query(PipelineMovimentacao).join(
        PipelineCandidato,
        PipelineMovimentacao.candidato_id == PipelineCandidato.id
    )
    
    # Aplica filtros
    if filtro.candidato_id:
        query = query.filter(PipelineCandidato.candidato_id == filtro.candidato_id)
    
    if filtro.vaga_id:
        query = query.filter(PipelineCandidato.vaga_id == filtro.vaga_id)
    
    if filtro.data_inicio:
        query = query.filter(PipelineMovimentacao.data_movimentacao >= filtro.data_inicio)
    
    if filtro.data_fim:
        query = query.filter(PipelineMovimentacao.data_movimentacao <= filtro.data_fim)
    
    if filtro.etapa_id:
        query = query.filter(
            or_(
                PipelineMovimentacao.etapa_origem_id == filtro.etapa_id,
                PipelineMovimentacao.etapa_destino_id == filtro.etapa_id
            )
        )
    
    if filtro.responsavel_id:
        query = query.filter(PipelineMovimentacao.responsavel_id == filtro.responsavel_id)
    
    return query.order_by(PipelineMovimentacao.data_movimentacao.desc()).all()

def exportar_historico(
    db: Session,
    filtro: PipelineHistoricoFiltro,
    formato: str
) -> bytes:
    """
    Exporta o histórico de movimentações para XLSX ou CSV.
    
    Processo de exportação:
    1. Obtém movimentações com filtros
    2. Formata dados para exportação
    3. Cria DataFrame com pandas
    4. Exporta para formato solicitado
    
    Campos exportados:
    - ID: Identificador da movimentação
    - Candidato: Nome do candidato
    - Vaga: Título da vaga
    - Etapa Origem: Nome da etapa de origem
    - Etapa Destino: Nome da etapa de destino
    - Responsável: Nome do responsável
    - Score: Score de avaliação
    - Observação: Observação da movimentação
    - Data Movimentação: Data e hora formatadas
    
    Args:
        db: Sessão do banco de dados
        filtro: Filtros a serem aplicados
        formato: Formato de exportação (xlsx/csv)
    
    Returns:
        Bytes do arquivo exportado
    """
    # Obtém movimentações
    movimentacoes = get_historico_movimentacoes(db, filtro)
    
    # Prepara dados para exportação
    dados = []
    for mov in movimentacoes:
        dados.append({
            "ID": mov.id,
            "Candidato": mov.candidato.candidato.nome,
            "Vaga": mov.candidato.vaga.title,
            "Etapa Origem": mov.etapa_origem.nome if mov.etapa_origem else "N/A",
            "Etapa Destino": mov.etapa_destino.nome,
            "Responsável": mov.responsavel.nome,
            "Score": mov.score_avaliacao or "N/A",
            "Observação": mov.observacao or "N/A",
            "Data Movimentação": mov.data_movimentacao.strftime("%d/%m/%Y %H:%M:%S")
        })
    
    # Cria DataFrame
    df = pd.DataFrame(dados)
    
    # Exporta para o formato solicitado
    output = io.BytesIO()
    if formato == "xlsx":
        df.to_excel(output, index=False, engine="openpyxl")
    else:  # csv
        df.to_csv(output, index=False, encoding="utf-8-sig")
    
    return output.getvalue()

def exportar_pipeline_vaga(
    db: Session,
    vaga_id: int,
    formato: str,
    filtro: Optional[PipelineHistoricoFiltro] = None
) -> bytes:
    """
    Exporta os dados do pipeline de uma vaga específica para XLSX ou CSV.
    Inclui etapas, candidatos e histórico de movimentações.
    """
    # Obtém as etapas da vaga
    etapas = get_etapas_by_vaga(db, vaga_id)
    
    # Prepara os dados para exportação
    dados = []
    
    # Adiciona informações das etapas e candidatos
    for etapa in etapas:
        candidatos = get_candidatos_by_vaga(db, vaga_id)
        candidatos_etapa = [c for c in candidatos if c.etapa_id == etapa.id]
        
        for candidato in candidatos_etapa:
            dados.append({
                "Etapa": etapa.nome,
                "Ordem Etapa": etapa.ordem,
                "Candidato": candidato.candidato.nome,
                "Email": candidato.candidato.email,
                "Status": "Ativo" if candidato.etapa_id == etapa.id else "Inativo",
                "Score": candidato.score_avaliacao or "N/A",
                "Observação": candidato.observacao or "N/A",
                "Responsável": candidato.responsavel.nome,
                "Data Última Atualização": candidato.data_atualizacao.strftime("%d/%m/%Y %H:%M:%S")
            })
    
    # Adiciona histórico de movimentações se filtro for fornecido
    if filtro:
        filtro.vaga_id = vaga_id  # Garante que o filtro seja aplicado apenas à vaga atual
        movimentacoes = get_historico_movimentacoes(db, filtro)
        
        for mov in movimentacoes:
            dados.append({
                "Etapa": f"Movimentação: {mov.etapa_destino.nome}",
                "Ordem Etapa": "N/A",
                "Candidato": mov.candidato.candidato.nome,
                "Email": mov.candidato.candidato.email,
                "Status": "Movimentação",
                "Score": mov.score_avaliacao or "N/A",
                "Observação": mov.observacao or "N/A",
                "Responsável": mov.responsavel.nome,
                "Data Última Atualização": mov.data_movimentacao.strftime("%d/%m/%Y %H:%M:%S")
            })
    
    # Cria DataFrame
    df = pd.DataFrame(dados)
    
    # Ordena por ordem da etapa e data de atualização
    df = df.sort_values(by=["Ordem Etapa", "Data Última Atualização"], ascending=[True, False])
    
    # Exporta para o formato solicitado
    output = io.BytesIO()
    if formato == "xlsx":
        df.to_excel(output, index=False, engine="openpyxl")
    else:  # csv
        df.to_csv(output, index=False, encoding="utf-8-sig")
    
    return output.getvalue()

pipeline_etapa = CRUDPipelineEtapa(PipelineEtapa)
pipeline_candidato = CRUDPipelineCandidato(PipelineCandidato) 