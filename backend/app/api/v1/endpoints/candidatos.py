from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime
import re
import requests

from app.api import deps
from app.crud import crud_candidato
from app.schemas.candidato import (
    Candidato,
    CandidatoCreate,
    CandidatoUpdate,
    CandidatoList,
    CandidatoSensitiveData,
    CandidatoHistorico,
    CandidatoDocumentos
)
from app.core.security import get_current_user, get_current_candidato
from app.models.empresa import Empresa
from app.models.candidato import Candidato as CandidatoModel
from app.core.recaptcha import verify_recaptcha
from app.core.anti_fraud import check_anti_fraud
from app.core.storage import upload_file, delete_file
from app.core.email import send_email
from app.core.settings import settings
from app.core.database import get_db
from app.core.schemas import CandidateCreate, CandidateResponse
from app.core.models import Candidate
from app.core.email_service import EmailService
from app.core.whatsapp_service import WhatsAppService
from app.core.linkedin_service import LinkedInService
from app.core.export_service import ExportService

router = APIRouter()
email_service = EmailService()
whatsapp_service = WhatsAppService()
linkedin_service = LinkedInService()
export_service = ExportService()

@router.post("/", response_model=Candidato)
def create_candidato(
    *,
    db: Session = Depends(deps.get_db),
    candidato_in: CandidatoCreate,
    current_user: Empresa = Depends(get_current_user)
) -> Candidato:
    """
    Cria um novo candidato.
    
    Permissões:
    - Usuário autenticado da empresa (admin/recrutador)
    
    Validações:
    - Email único por empresa
    - CPF único por empresa
    - Formato de CPF válido
    - Formato de email válido
    - Formato de telefone válido
    """
    # Verifica se o usuário tem permissão na empresa
    if current_user.id != candidato_in.empresa_id:
        raise HTTPException(
            status_code=403,
            detail="Sem permissão para criar candidato nesta empresa"
        )
    
    candidato = crud_candidato.candidato.create(db, obj_in=candidato_in)
    return candidato

@router.get("/", response_model=CandidatoList)
def list_candidatos(
    db: Session = Depends(deps.get_db),
    current_user: Empresa = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[bool] = None,
    skills: Optional[List[str]] = Query(None),
    experiencia_min: Optional[int] = Query(None, ge=0),
    formacao: Optional[str] = None,
    etapa_id: Optional[int] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    vaga_id: Optional[int] = None,
    order_by: Optional[str] = Query(None, regex="^(nome|data_criacao|score_avaliacao)$"),
    order_direction: Optional[str] = Query(None, regex="^(asc|desc)$")
) -> CandidatoList:
    """
    Lista candidatos com filtros e paginação.
    
    Permissões:
    - Usuário autenticado da empresa (admin/recrutador)
    
    Filtros:
    - Busca por texto (nome, email, CPF)
    - Status (ativo/inativo)
    - Skills específicas
    - Experiência mínima
    - Formação acadêmica
    - Etapa do pipeline
    - Período de candidatura
    - Vaga específica
    
    Ordenação:
    - Por nome
    - Por data de criação
    - Por score de avaliação
    - Direção (asc/desc)
    """
    candidatos = crud_candidato.candidato.get_multi(
        db=db,
        empresa_id=current_user.id,
        skip=skip,
        limit=limit,
        search=search,
        status=status,
        skills=skills,
        experiencia_min=experiencia_min,
        formacao=formacao,
        etapa_id=etapa_id,
        data_inicio=data_inicio,
        data_fim=data_fim,
        vaga_id=vaga_id,
        order_by=order_by,
        order_direction=order_direction
    )
    
    total = crud_candidato.candidato.count(
        db=db,
        empresa_id=current_user.id,
        search=search,
        status=status,
        skills=skills,
        experiencia_min=experiencia_min,
        formacao=formacao,
        etapa_id=etapa_id,
        data_inicio=data_inicio,
        data_fim=data_fim,
        vaga_id=vaga_id
    )
    
    return CandidatoList(
        items=candidatos,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )

@router.get("/{candidato_id}", response_model=Candidato)
def get_candidato(
    candidato_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Optional[Empresa] = Depends(get_current_user),
    current_candidato: Optional[CandidatoModel] = Depends(get_current_candidato)
) -> Candidato:
    """
    Obtém detalhes de um candidato.
    
    Permissões:
    - Usuário autenticado da empresa (admin/recrutador)
    - Candidato autenticado (apenas próprio perfil)
    """
    candidato = crud_candidato.candidato.get(db, id=candidato_id)
    if not candidato:
        raise HTTPException(
            status_code=404,
            detail="Candidato não encontrado"
        )
    
    # Verifica permissão
    if current_user:
        if current_user.id != candidato.empresa_id:
            raise HTTPException(
                status_code=403,
                detail="Sem permissão para acessar este candidato"
            )
    elif current_candidato:
        if current_candidato.id != candidato_id:
            raise HTTPException(
                status_code=403,
                detail="Sem permissão para acessar este candidato"
            )
    else:
        raise HTTPException(
            status_code=401,
            detail="Não autenticado"
        )
    
    return candidato

@router.get("/{candidato_id}/sensitive", response_model=CandidatoSensitiveData)
def get_candidato_sensitive_data(
    candidato_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Empresa = Depends(get_current_user)
) -> CandidatoSensitiveData:
    """
    Obtém dados sensíveis do candidato.
    
    Permissões:
    - Usuário autenticado da empresa (admin/recrutador)
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Apenas administradores podem acessar dados sensíveis"
        )
    
    data = crud_candidato.candidato.get_sensitive_data(
        db=db,
        candidato_id=candidato_id,
        empresa_id=current_user.id,
        is_admin=current_user.is_admin
    )
    
    if not data:
        raise HTTPException(
            status_code=404,
            detail="Candidato não encontrado ou sem permissão"
        )
    
    return data

@router.get("/{candidato_id}/historico", response_model=CandidatoHistorico)
def get_candidato_historico(
    candidato_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Optional[Empresa] = Depends(get_current_user),
    current_candidato: Optional[CandidatoModel] = Depends(get_current_candidato)
) -> CandidatoHistorico:
    """
    Obtém histórico do candidato.
    
    Permissões:
    - Usuário autenticado da empresa (admin/recrutador)
    - Candidato autenticado (apenas próprio histórico)
    """
    historico = crud_candidato.candidato.get_historico(
        db=db,
        candidato_id=candidato_id,
        empresa_id=current_user.id if current_user else current_candidato.empresa_id,
        is_admin=current_user.is_admin if current_user else False,
        candidato_user_id=current_candidato.id if current_candidato else None
    )
    
    if not historico:
        raise HTTPException(
            status_code=404,
            detail="Candidato não encontrado ou sem permissão"
        )
    
    return {"historico": historico}

@router.get("/{candidato_id}/documentos", response_model=CandidatoDocumentos)
def get_candidato_documentos(
    candidato_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Optional[Empresa] = Depends(get_current_user),
    current_candidato: Optional[CandidatoModel] = Depends(get_current_candidato)
) -> CandidatoDocumentos:
    """
    Obtém documentos do candidato.
    
    Permissões:
    - Usuário autenticado da empresa (admin/recrutador)
    - Candidato autenticado (apenas próprios documentos)
    """
    documentos = crud_candidato.candidato.get_documentos(
        db=db,
        candidato_id=candidato_id,
        empresa_id=current_user.id if current_user else current_candidato.empresa_id,
        is_admin=current_user.is_admin if current_user else False,
        candidato_user_id=current_candidato.id if current_candidato else None
    )
    
    if not documentos:
        raise HTTPException(
            status_code=404,
            detail="Candidato não encontrado ou sem permissão"
        )
    
    return {"documentos": documentos}

@router.put("/{candidato_id}", response_model=Candidato)
def update_candidato(
    *,
    db: Session = Depends(deps.get_db),
    candidato_id: int,
    candidato_in: CandidatoUpdate,
    current_user: Optional[Empresa] = Depends(get_current_user),
    current_candidato: Optional[CandidatoModel] = Depends(get_current_candidato)
) -> Candidato:
    """
    Atualiza um candidato.
    
    Permissões:
    - Usuário autenticado da empresa (admin/recrutador) - edição completa
    - Candidato autenticado - apenas dados básicos do próprio perfil
    
    Validações:
    - Email único por empresa (se alterado)
    - Formato de email válido
    - Formato de telefone válido
    """
    candidato = crud_candidato.candidato.get(db, id=candidato_id)
    if not candidato:
        raise HTTPException(
            status_code=404,
            detail="Candidato não encontrado"
        )
    
    # Verifica permissão
    if current_user:
        if current_user.id != candidato.empresa_id:
            raise HTTPException(
                status_code=403,
                detail="Sem permissão para editar este candidato"
            )
        is_admin = current_user.is_admin
    elif current_candidato:
        if current_candidato.id != candidato_id:
            raise HTTPException(
                status_code=403,
                detail="Sem permissão para editar este candidato"
            )
        is_admin = False
    else:
        raise HTTPException(
            status_code=401,
            detail="Não autenticado"
        )
    
    candidato = crud_candidato.candidato.update(
        db, db_obj=candidato, obj_in=candidato_in, is_admin=is_admin
    )
    return candidato

@router.delete("/{candidato_id}")
def delete_candidato(
    candidato_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Empresa = Depends(get_current_user)
):
    """
    Remove um candidato (soft delete).
    
    Permissões:
    - Usuário autenticado da empresa (admin/recrutador)
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Apenas administradores podem remover candidatos"
        )
    
    candidato = crud_candidato.candidato.get(db, id=candidato_id)
    if not candidato or candidato.empresa_id != current_user.id:
        raise HTTPException(
            status_code=404,
            detail="Candidato não encontrado"
        )
    
    crud_candidato.candidato.remove(db, id=candidato_id)
    return {"message": "Candidato removido com sucesso"}

@router.post("/public/apply", response_model=Candidato)
async def public_apply(
    *,
    db: Session = Depends(deps.get_db),
    empresa_id: int = Form(...),
    nome: str = Form(...),
    sobrenome: str = Form(...),
    email: str = Form(...),
    cpf: str = Form(...),
    data_nascimento: str = Form(...),
    telefone: str = Form(...),
    senha: str = Form(...),
    recaptcha_token: str = Form(...),
    curriculo: UploadFile = File(...),
    portfolio: Optional[UploadFile] = File(None)
) -> Candidato:
    """
    Endpoint público para candidatura.
    
    Validações:
    - reCAPTCHA
    - Anti-fraude
    - Formato de arquivos
    - Dados do candidato
    - Email e CPF únicos
    """
    # Verifica reCAPTCHA
    if not await verify_recaptcha(recaptcha_token):
        raise HTTPException(
            status_code=400,
            detail="Verificação reCAPTCHA falhou"
        )
    
    # Verifica anti-fraude
    if not await check_anti_fraud(email, cpf):
        raise HTTPException(
            status_code=400,
            detail="Verificação anti-fraude falhou"
        )
    
    # Verifica email duplicado
    if crud_candidato.candidato.get_by_email(db, email=email, empresa_id=empresa_id):
        raise HTTPException(
            status_code=400,
            detail="Email já cadastrado para esta empresa"
        )
    
    # Verifica CPF duplicado
    if crud_candidato.candidato.get_by_cpf(db, cpf=cpf, empresa_id=empresa_id):
        raise HTTPException(
            status_code=400,
            detail="CPF já cadastrado para esta empresa"
        )
    
    # Valida formato do currículo
    if not curriculo.content_type in ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(
            status_code=400,
            detail="Formato de currículo inválido. Use PDF ou DOC/DOCX"
        )
    
    # Upload do currículo
    curriculo_url = await upload_file(curriculo, "curriculos")
    
    # Upload do portfólio se fornecido
    portfolio_url = None
    if portfolio:
        if not portfolio.content_type in ["application/pdf", "application/zip"]:
            raise HTTPException(
                status_code=400,
                detail="Formato de portfólio inválido. Use PDF ou ZIP"
            )
        portfolio_url = await upload_file(portfolio, "portfolio")
    
    # Cria candidato
    candidato_in = CandidatoCreate(
        empresa_id=empresa_id,
        nome=nome,
        sobrenome=sobrenome,
        email=email,
        cpf=cpf,
        data_nascimento=datetime.strptime(data_nascimento, "%Y-%m-%d").date(),
        telefone=telefone,
        senha=senha,
        portfolio=portfolio_url
    )
    
    candidato = crud_candidato.candidato.create(db, obj_in=candidato_in)
    return candidato

@router.post("/{candidato_id}/upload", response_model=Candidato)
async def upload_documento(
    candidato_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Optional[Empresa] = Depends(get_current_user),
    current_candidato: Optional[CandidatoModel] = Depends(get_current_candidato),
    tipo: str = Form(...),
    arquivo: UploadFile = File(...)
) -> Candidato:
    """
    Upload de documento para candidato.
    
    Permissões:
    - Usuário autenticado da empresa (admin/recrutador)
    - Candidato autenticado (apenas próprios documentos)
    
    Tipos de documento:
    - curriculo
    - portfolio
    - certificado
    - outro
    
    Validações:
    - Formato de arquivo
    - Tamanho máximo
    - Tipo de documento válido
    """
    candidato = crud_candidato.candidato.get(db, id=candidato_id)
    if not candidato:
        raise HTTPException(
            status_code=404,
            detail="Candidato não encontrado"
        )
    
    # Verifica permissão
    if current_user:
        if current_user.id != candidato.empresa_id:
            raise HTTPException(
                status_code=403,
                detail="Sem permissão para fazer upload para este candidato"
            )
    elif current_candidato:
        if current_candidato.id != candidato_id:
            raise HTTPException(
                status_code=403,
                detail="Sem permissão para fazer upload para este candidato"
            )
    else:
        raise HTTPException(
            status_code=401,
            detail="Não autenticado"
        )
    
    # Valida tipo de documento
    if tipo not in ["curriculo", "portfolio", "certificado", "outro"]:
        raise HTTPException(
            status_code=400,
            detail="Tipo de documento inválido"
        )
    
    # Valida formato do arquivo
    if not arquivo.content_type in ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/zip", "image/jpeg", "image/png"]:
        raise HTTPException(
            status_code=400,
            detail="Formato de arquivo inválido"
        )
    
    # Upload do arquivo
    arquivo_url = await upload_file(arquivo, f"documentos/{tipo}")
    
    # Atualiza candidato
    candidato_in = CandidatoUpdate()
    if tipo == "curriculo":
        candidato_in.curriculo = arquivo_url
    elif tipo == "portfolio":
        candidato_in.portfolio = arquivo_url
    
    candidato = crud_candidato.candidato.update(
        db, db_obj=candidato, obj_in=candidato_in
    )
    return candidato

@router.post("/register", response_model=CandidateResponse)
async def register_candidate(
    candidate: CandidateCreate,
    recaptcha_token: str,
    db: Session = Depends(get_db)
):
    # Verify reCAPTCHA
    recaptcha_response = requests.post(
        "https://www.google.com/recaptcha/api/siteverify",
        data={
            "secret": settings.RECAPTCHA_SECRET_KEY,
            "response": recaptcha_token
        }
    )
    recaptcha_data = recaptcha_response.json()
    
    if not recaptcha_data["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reCAPTCHA"
        )

    # Check for duplicate email
    if db.query(Candidate).filter(Candidate.email == candidate.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check for duplicate CPF
    if db.query(Candidate).filter(Candidate.cpf == candidate.cpf).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF already registered"
        )

    # Create new candidate
    db_candidate = Candidate(**candidate.dict())
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)

    # Send confirmation email
    email_service.send_registration_confirmation(db_candidate)

    # Send WhatsApp confirmation
    whatsapp_service.send_registration_confirmation(db_candidate)

    return db_candidate

@router.get("/linkedin-auth")
async def linkedin_auth():
    """Get LinkedIn OAuth URL"""
    return {"auth_url": linkedin_service.get_auth_url()}

@router.post("/linkedin-import")
async def linkedin_import(code: str, db: Session = Depends(get_db)):
    """Import candidate data from LinkedIn"""
    try:
        # Get access token
        linkedin_service.get_access_token(code)
        
        # Get profile data
        linkedin_data = linkedin_service.get_profile_data()
        
        # Format data to match our schema
        candidate_data = linkedin_service.format_candidate_data(linkedin_data)
        
        # Check for existing candidate
        existing_candidate = db.query(Candidate).filter(
            Candidate.email == candidate_data["email"]
        ).first()
        
        if existing_candidate:
            # Update existing candidate
            for key, value in candidate_data.items():
                setattr(existing_candidate, key, value)
            db.commit()
            db.refresh(existing_candidate)
            return existing_candidate
        
        # Create new candidate
        new_candidate = Candidate(**candidate_data)
        db.add(new_candidate)
        db.commit()
        db.refresh(new_candidate)
        
        # Send confirmation messages
        email_service.send_registration_confirmation(new_candidate)
        whatsapp_service.send_registration_confirmation(new_candidate)
        
        return new_candidate
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/verify-email/{token}")
async def verify_email(token: str, db: Session = Depends(get_db)):
    """Verify candidate email"""
    candidate = db.query(Candidate).filter(
        Candidate.verification_token == token
    ).first()
    
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid verification token"
        )
    
    candidate.email_verified = True
    candidate.verification_token = None
    db.commit()
    
    return {"message": "Email verified successfully"}

@router.get("/export/xlsx")
async def export_candidates_xlsx(
    db: Session = Depends(deps.get_db),
    current_user: Empresa = Depends(get_current_user),
    search: Optional[str] = None,
    status: Optional[bool] = None,
    skills: Optional[List[str]] = Query(None),
    experiencia_min: Optional[int] = Query(None, ge=0),
    formacao: Optional[str] = None,
    etapa_id: Optional[int] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    vaga_id: Optional[int] = None,
    include_documents: bool = False,
    include_history: bool = False
):
    """
    Exporta lista de candidatos para XLSX com filtros aplicados.
    
    Permissões:
    - Usuário autenticado da empresa (admin/recrutador)
    
    Opções:
    - Incluir documentos (links seguros)
    - Incluir histórico de candidaturas
    """
    # Get candidates with filters
    candidates = crud_candidato.candidato.get_multi(
        db=db,
        empresa_id=current_user.id,
        search=search,
        status=status,
        skills=skills,
        experiencia_min=experiencia_min,
        formacao=formacao,
        etapa_id=etapa_id,
        data_inicio=data_inicio,
        data_fim=data_fim,
        vaga_id=vaga_id,
        include_documents=include_documents,
        include_history=include_history
    )

    # Export to XLSX
    output = export_service.export_to_xlsx(candidates)

    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"candidatos_{timestamp}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/export/csv")
async def export_candidates_csv(
    db: Session = Depends(deps.get_db),
    current_user: Empresa = Depends(get_current_user),
    search: Optional[str] = None,
    status: Optional[bool] = None,
    skills: Optional[List[str]] = Query(None),
    experiencia_min: Optional[int] = Query(None, ge=0),
    formacao: Optional[str] = None,
    etapa_id: Optional[int] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    vaga_id: Optional[int] = None,
    include_documents: bool = False,
    include_history: bool = False
):
    """
    Exporta lista de candidatos para CSV com filtros aplicados.
    
    Permissões:
    - Usuário autenticado da empresa (admin/recrutador)
    
    Opções:
    - Incluir documentos (links seguros)
    - Incluir histórico de candidaturas
    """
    # Get candidates with filters
    candidates = crud_candidato.candidato.get_multi(
        db=db,
        empresa_id=current_user.id,
        search=search,
        status=status,
        skills=skills,
        experiencia_min=experiencia_min,
        formacao=formacao,
        etapa_id=etapa_id,
        data_inicio=data_inicio,
        data_fim=data_fim,
        vaga_id=vaga_id,
        include_documents=include_documents,
        include_history=include_history
    )

    # Export to CSV
    output = export_service.export_to_csv(candidates)

    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"candidatos_{timestamp}.csv"

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    ) 