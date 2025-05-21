from typing import List, Dict, Any, Optional
from datetime import datetime
import pandas as pd
from io import BytesIO
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.job import Job, JobStatus, JobType
from app.crud import job as job_crud

class ExportService:
    @staticmethod
    def _prepare_job_data(jobs: List[Job]) -> List[Dict[str, Any]]:
        """
        Prepara os dados das vagas para exportação
        """
        return [{
            'ID': job.id,
            'Título': job.title,
            'Departamento': job.department,
            'Localização': job.location,
            'Tipo': job.type,
            'Status': job.status,
            'Salário Mínimo': f"R$ {job.salary_min:,.2f}",
            'Salário Máximo': f"R$ {job.salary_max:,.2f}",
            'Requisitos': '\n'.join(job.requirements),
            'Benefícios': '\n'.join(job.benefits),
            'Data de Abertura': job.opening_date.strftime('%d/%m/%Y'),
            'Data de Encerramento': job.closing_date.strftime('%d/%m/%Y') if job.closing_date else 'Sem data',
            'Recrutador': job.recruiter.name if job.recruiter else 'Não definido',
            'Data de Criação': job.created_at.strftime('%d/%m/%Y %H:%M'),
            'Última Atualização': job.updated_at.strftime('%d/%m/%Y %H:%M') if job.updated_at else 'Nunca'
        } for job in jobs]

    @staticmethod
    async def export_jobs(
        db: Session,
        format: str,
        filters: Optional[Dict[str, Any]] = None,
        company_id: int = None
    ) -> BytesIO:
        """
        Exporta vagas no formato especificado (xlsx ou csv)
        """
        # Busca vagas com filtros
        jobs = job_crud.search(
            db=db,
            company_id=company_id,
            search_params=filters or {}
        )

        # Prepara dados
        data = ExportService._prepare_job_data(jobs)
        df = pd.DataFrame(data)

        # Cria buffer para o arquivo
        output = BytesIO()

        # Exporta no formato especificado
        if format.lower() == 'xlsx':
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            return output
        elif format.lower() == 'csv':
            df.to_csv(output, index=False, encoding='utf-8-sig')
            output.seek(0)
            return output
        else:
            raise HTTPException(
                status_code=400,
                detail="Formato de exportação inválido. Use 'xlsx' ou 'csv'"
            )

export_service = ExportService() 