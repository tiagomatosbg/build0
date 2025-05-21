from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime
from app import crud, models, schemas
from app.api import deps
from app.core.security import get_current_active_user
from app.models.job import JobStatus, JobType
from app.core.auth import get_current_user
from app.services.notification_service import notification_service
from app.services.audit_service import audit_service
from app.services.export_service import export_service

router = APIRouter()

@router.get("/", response_model=List[schemas.Job])
def read_jobs(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(get_current_active_user),
    skip: int = Query(0, ge=0, description="Skip N records"),
    limit: int = Query(10, ge=1, le=100, description="Limit the number of records"),
    title: Optional[str] = Query(None, description="Filter by job title"),
    location: Optional[str] = Query(None, description="Filter by location"),
    type: Optional[JobType] = Query(None, description="Filter by job type"),
    status: Optional[JobStatus] = Query(None, description="Filter by job status"),
    department_id: Optional[int] = Query(None, description="Filter by department ID"),
    manager_id: Optional[int] = Query(None, description="Filter by manager ID"),
    start_date: Optional[datetime] = Query(None, description="Filter by opening date (start)"),
    end_date: Optional[datetime] = Query(None, description="Filter by opening date (end)"),
) -> Any:
    """
    Retrieve jobs with filters and pagination.
    For candidates, only returns OPEN jobs.
    For recruiters, returns jobs they manage.
    For admins, returns all jobs.
    """
    search_params = {
        "title": title,
        "location": location,
        "type": type,
        "status": status,
        "department_id": department_id,
        "manager_id": manager_id,
    }
    
    # Add date range filters
    if start_date or end_date:
        search_params["date_range"] = {
            "start": start_date,
            "end": end_date
        }
    
    # Filter jobs based on user role
    if current_user.role == "candidate":
        search_params["status"] = JobStatus.OPEN
    elif current_user.role == "recruiter":
        search_params["manager_id"] = current_user.id
    
    jobs = crud.job.search(
        db=db,
        company_id=current_user.company_id,
        search_params=search_params,
        skip=skip,
        limit=limit,
    )
    return jobs

@router.post("/", response_model=schemas.Job, status_code=status.HTTP_201_CREATED)
async def create_job(
    *,
    db: Session = Depends(deps.get_db),
    job_in: schemas.JobCreate,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Create new job.
    Only admins and HR managers can create jobs.
    """
    if current_user.role not in ["admin", "hr_manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to create jobs",
        )
    
    # Validate required fields
    if not job_in.title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job title is required",
        )
    if not job_in.description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description is required",
        )
    if not job_in.requirements:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job requirements are required",
        )
    if not job_in.status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job status is required",
        )
    
    # Verify if department belongs to company
    department = crud.department.get(db=db, id=job_in.department_id)
    if not department or department.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )
    
    # Verify if manager belongs to company
    manager = crud.user.get(db=db, id=job_in.manager_id)
    if not manager or manager.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manager not found",
        )
    
    job = crud.job.create_with_company(
        db=db,
        obj_in=job_in,
        company_id=current_user.company_id,
    )

    # Registra auditoria
    await audit_service.log_job_action(
        db=db,
        job=job,
        user=current_user,
        action="CREATE",
        details={"job_data": job_in.dict()}
    )

    # Envia notificações
    await notification_service.notify_job_creation(job, current_user)

    return job

@router.get("/{job_id}", response_model=schemas.Job)
def read_job(
    *,
    db: Session = Depends(deps.get_db),
    job_id: int,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Get job by ID.
    Candidates can only view OPEN jobs.
    Recruiters can only view jobs they manage.
    Admins can view all jobs.
    """
    job = crud.job.get(db=db, id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
    
    # Check company access
    if job.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this job",
        )
    
    # Check role-based access
    if current_user.role == "candidate" and job.status != JobStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this job",
        )
    elif current_user.role == "recruiter" and job.manager_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this job",
        )
    
    return job

@router.put("/{job_id}", response_model=schemas.Job)
async def update_job(
    *,
    db: Session = Depends(deps.get_db),
    job_id: int,
    job_in: schemas.JobUpdate,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Update a job.
    Only admins and HR managers can update any job.
    Recruiters can only update jobs they manage.
    """
    job = crud.job.get(db=db, id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
    
    # Check company access
    if job.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this job",
        )
    
    # Check role-based access
    if current_user.role == "candidate":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update jobs",
        )
    elif current_user.role == "recruiter" and job.manager_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this job",
        )
    
    # Validate required fields
    if job_in.title is not None and not job_in.title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job title cannot be empty",
        )
    if job_in.description is not None and not job_in.description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description cannot be empty",
        )
    if job_in.requirements is not None and not job_in.requirements:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job requirements cannot be empty",
        )
    if job_in.status is not None and not job_in.status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job status cannot be empty",
        )
    
    # Verify if department belongs to company (if being updated)
    if job_in.department_id:
        department = crud.department.get(db=db, id=job_in.department_id)
        if not department or department.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found",
            )
    
    # Verify if manager belongs to company (if being updated)
    if job_in.manager_id:
        manager = crud.user.get(db=db, id=job_in.manager_id)
        if not manager or manager.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Manager not found",
            )
    
    # Armazena dados antigos para auditoria
    old_data = {
        "title": job.title,
        "description": job.description,
        "department_id": job.department_id,
        "location": job.location,
        "type": job.type,
        "status": job.status,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "requirements": job.requirements,
        "benefits": job.benefits,
    }
    
    job = crud.job.update(db=db, db_obj=job, obj_in=job_in)

    # Registra auditoria
    await audit_service.log_job_action(
        db=db,
        job=job,
        user=current_user,
        action="UPDATE",
        details={
            "old_data": old_data,
            "new_data": job_in.dict(exclude_unset=True)
        }
    )

    # Envia notificações
    await notification_service.notify_job_update(job, current_user)

    return job

@router.delete("/{job_id}", response_model=schemas.Job)
async def delete_job(
    *,
    db: Session = Depends(deps.get_db),
    job_id: int,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Delete a job.
    Only admins and HR managers can delete jobs.
    """
    job = crud.job.get(db=db, id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
    
    # Check company access
    if job.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this job",
        )
    
    # Check role-based access
    if current_user.role not in ["admin", "hr_manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete jobs",
        )
    
    # Registra auditoria antes de deletar
    await audit_service.log_job_action(
        db=db,
        job=job,
        user=current_user,
        action="DELETE",
        details={"job_data": job.__dict__}
    )
    
    job = crud.job.remove(db=db, id=job_id)
    return job

@router.patch("/{job_id}/status", response_model=schemas.Job)
def update_job_status(
    *,
    db: Session = Depends(deps.get_db),
    job_id: int,
    status: JobStatus = Query(..., description="New job status"),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Update job status.
    Only admins, HR managers, and job managers can update job status.
    """
    job = crud.job.get(db=db, id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
    
    # Check company access
    if job.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this job",
        )
    
    # Check role-based access
    if current_user.role == "candidate":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update job status",
        )
    elif current_user.role == "recruiter" and job.manager_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this job status",
        )
    
    old_status = job.status
    job = crud.job.update_status(db=db, db_obj=job, status=status)

    # Registra auditoria
    await audit_service.log_job_action(
        db=db,
        job=job,
        user=current_user,
        action="STATUS_CHANGE",
        details={
            "old_status": old_status,
            "new_status": status
        }
    )

    return job

# Novo endpoint para visualizar logs de auditoria
@router.get("/audit-logs", response_model=List[schemas.JobAudit])
async def get_job_audit_logs(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(get_current_active_user),
    job_id: Optional[int] = None,
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> Any:
    """
    Get job audit logs.
    Only admins can view audit logs.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view audit logs",
        )
    
    logs = await audit_service.get_job_audit_logs(
        db=db,
        job_id=job_id,
        user_id=user_id,
        action=action,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit
    )
    
    return logs

@router.get("/export")
async def export_jobs(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(get_current_active_user),
    format: str = Query(..., description="Formato de exportação (xlsx ou csv)"),
    title: Optional[str] = None,
    location: Optional[str] = None,
    type: Optional[JobType] = None,
    status: Optional[JobStatus] = None,
    department_id: Optional[int] = None,
    manager_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> Any:
    """
    Exporta vagas no formato especificado (xlsx ou csv)
    """
    # Verifica permissões
    if current_user.role not in ["admin", "hr_manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para exportar vagas"
        )

    # Prepara filtros
    filters = {
        "title": title,
        "location": location,
        "type": type,
        "status": status,
        "department_id": department_id,
        "manager_id": manager_id,
    }
    
    if start_date or end_date:
        filters["date_range"] = {
            "start": start_date,
            "end": end_date
        }

    # Exporta dados
    output = await export_service.export_jobs(
        db=db,
        format=format,
        filters=filters,
        company_id=current_user.company_id
    )

    # Define nome do arquivo
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"vagas_{timestamp}.{format.lower()}"

    # Define headers da resposta
    headers = {
        'Content-Disposition': f'attachment; filename="{filename}"'
    }

    # Define content type
    content_type = (
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        if format.lower() == 'xlsx'
        else 'text/csv'
    )

    # Registra auditoria
    await audit_service.log_job_action(
        db=db,
        job=None,  # Não há vaga específica
        user=current_user,
        action="EXPORT",
        details={
            "format": format,
            "filters": filters
        }
    )

    return StreamingResponse(
        output,
        headers=headers,
        media_type=content_type
    ) 