from typing import List, Optional, Dict
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.job import Job
from app.models.user import User
from app.models.pipeline import PipelineEtapa, PipelineCandidato

class NotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.whatsapp_api_url = settings.WHATSAPP_API_URL
        self.whatsapp_api_key = settings.WHATSAPP_API_KEY
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.smtp_from = settings.SMTP_FROM

    async def send_notifications(
        self,
        candidato: PipelineCandidato,
        etapa: PipelineEtapa,
        responsavel: User
    ) -> None:
        """
        Envia notificações por email e WhatsApp para o candidato e recrutador
        quando um candidato é movido para uma nova etapa.
        """
        # Obtém os templates de mensagem da etapa
        email_template = etapa.template_email or self._get_default_email_template(etapa)
        whatsapp_template = etapa.template_whatsapp or self._get_default_whatsapp_template(etapa)

        # Prepara os dados para substituição no template
        template_data = {
            "candidato_nome": candidato.candidato.nome,
            "vaga_titulo": candidato.vaga.title,
            "etapa_nome": etapa.nome,
            "responsavel_nome": responsavel.nome,
            "responsavel_email": responsavel.email,
            "responsavel_telefone": responsavel.telefone
        }

        # Envia notificações para o candidato
        if candidato.candidato.email:
            await self.send_email(
                to_email=candidato.candidato.email,
                subject=f"Atualização no processo seletivo - {candidato.vaga.title}",
                template=email_template,
                template_data=template_data
            )

        if candidato.candidato.telefone:
            await self.send_whatsapp(
                to_phone=candidato.candidato.telefone,
                template=whatsapp_template,
                template_data=template_data
            )

        # Envia notificações para o recrutador
        if responsavel.email:
            await self.send_email(
                to_email=responsavel.email,
                subject=f"Novo candidato em {etapa.nome} - {candidato.vaga.title}",
                template=email_template,
                template_data=template_data
            )

        if responsavel.telefone:
            await self.send_whatsapp(
                to_phone=responsavel.telefone,
                template=whatsapp_template,
                template_data=template_data
            )

    async def send_email(
        self,
        to_email: str,
        subject: str,
        template: str,
        template_data: Dict[str, str]
    ) -> None:
        """
        Envia email usando SMTP.
        
        Args:
            to_email: Email do destinatário
            subject: Assunto do email
            template: Template da mensagem com placeholders
            template_data: Dicionário com dados para substituir no template
        """
        try:
            # Substitui placeholders no template
            message = template
            for key, value in template_data.items():
                message = message.replace(f"{{{{{key}}}}}", str(value))

            # Cria mensagem
            msg = MIMEMultipart()
            msg['From'] = self.smtp_from
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(message, 'html'))

            # Conecta ao servidor SMTP e envia
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

        except Exception as e:
            # Log do erro mas não interrompe o fluxo
            print(f"Erro ao enviar email: {str(e)}")

    async def send_whatsapp(
        self,
        to_phone: str,
        template: str,
        template_data: Dict[str, str]
    ) -> None:
        """
        Envia mensagem via WhatsApp usando API externa.
        
        Args:
            to_phone: Número do telefone do destinatário
            template: Template da mensagem com placeholders
            template_data: Dicionário com dados para substituir no template
        """
        try:
            # Substitui placeholders no template
            message = template
            for key, value in template_data.items():
                message = message.replace(f"{{{{{key}}}}}", str(value))

            # Prepara payload para API do WhatsApp
            payload = {
                "to": to_phone,
                "message": message
            }

            # Envia requisição para API do WhatsApp
            response = requests.post(
                self.whatsapp_api_url,
                json=payload,
                headers={"Authorization": f"Bearer {self.whatsapp_api_key}"}
            )
            response.raise_for_status()

        except Exception as e:
            # Log do erro mas não interrompe o fluxo
            print(f"Erro ao enviar WhatsApp: {str(e)}")

    def _get_default_email_template(self, etapa: PipelineEtapa) -> str:
        """Retorna template padrão de email baseado na etapa."""
        templates = {
            "Entrevistas": """
                <h2>Olá {candidato_nome}!</h2>
                <p>Você foi selecionado para a etapa de entrevistas do processo seletivo para a vaga de {vaga_titulo}.</p>
                <p>Em breve, {responsavel_nome} entrará em contato para agendar a entrevista.</p>
                <p>Em caso de dúvidas, você pode entrar em contato pelo email {responsavel_email} ou telefone {responsavel_telefone}.</p>
                <p>Atenciosamente,<br>Equipe de Recrutamento</p>
            """,
            "Proposta": """
                <h2>Parabéns {candidato_nome}!</h2>
                <p>Temos uma proposta para você para a vaga de {vaga_titulo}!</p>
                <p>{responsavel_nome} entrará em contato em breve para discutir os detalhes.</p>
                <p>Em caso de dúvidas, você pode entrar em contato pelo email {responsavel_email} ou telefone {responsavel_telefone}.</p>
                <p>Atenciosamente,<br>Equipe de Recrutamento</p>
            """
        }
        return templates.get(etapa.nome, """
            <h2>Olá {candidato_nome}!</h2>
            <p>Seu processo seletivo para a vaga de {vaga_titulo} foi atualizado para a etapa: {etapa_nome}</p>
            <p>Em caso de dúvidas, você pode entrar em contato pelo email {responsavel_email} ou telefone {responsavel_telefone}.</p>
            <p>Atenciosamente,<br>Equipe de Recrutamento</p>
        """)

    def _get_default_whatsapp_template(self, etapa: PipelineEtapa) -> str:
        """Retorna template padrão de WhatsApp baseado na etapa."""
        templates = {
            "Entrevistas": """
                Olá {candidato_nome}! 
                Você foi selecionado para a etapa de entrevistas do processo seletivo para a vaga de {vaga_titulo}.
                Em breve, {responsavel_nome} entrará em contato para agendar a entrevista.
                Em caso de dúvidas, você pode entrar em contato pelo telefone {responsavel_telefone}.
            """,
            "Proposta": """
                Parabéns {candidato_nome}! 
                Temos uma proposta para você para a vaga de {vaga_titulo}!
                {responsavel_nome} entrará em contato em breve para discutir os detalhes.
                Em caso de dúvidas, você pode entrar em contato pelo telefone {responsavel_telefone}.
            """
        }
        return templates.get(etapa.nome, """
            Olá {candidato_nome}! 
            Seu processo seletivo para a vaga de {vaga_titulo} foi atualizado para a etapa: {etapa_nome}
            Em caso de dúvidas, você pode entrar em contato pelo telefone {responsavel_telefone}.
        """)

    async def notify_job_creation(self, job: Job, creator: User) -> None:
        """
        Notifica gestores e recrutadores sobre nova vaga
        """
        # Busca gestores e recrutadores
        managers = await User.filter(role__in=['admin', 'hr_manager'])
        recruiters = await User.filter(role='recruiter')

        # Prepara mensagens
        email_subject = f"Nova Vaga Criada: {job.title}"
        email_body = f"""
        <h2>Nova Vaga Criada</h2>
        <p><strong>Título:</strong> {job.title}</p>
        <p><strong>Departamento:</strong> {job.department}</p>
        <p><strong>Localização:</strong> {job.location}</p>
        <p><strong>Criado por:</strong> {creator.name}</p>
        <p><a href="{settings.FRONTEND_URL}/jobs/{job.id}">Ver detalhes da vaga</a></p>
        """

        whatsapp_message = f"""
        🆕 Nova Vaga Criada!
        
        Título: {job.title}
        Departamento: {job.department}
        Localização: {job.location}
        Criado por: {creator.name}
        
        Acesse: {settings.FRONTEND_URL}/jobs/{job.id}
        """

        # Envia notificações
        for user in managers + recruiters:
            if user.email:
                await self.send_email(user.email, email_subject, email_body)
            if user.phone:
                await self.send_whatsapp(user.phone, whatsapp_message)

    async def notify_job_update(self, job: Job, updater: User) -> None:
        """
        Notifica gestores e recrutadores sobre atualização de vaga
        """
        # Busca gestores e recrutadores
        managers = await User.filter(role__in=['admin', 'hr_manager'])
        recruiters = await User.filter(role='recruiter')

        # Prepara mensagens
        email_subject = f"Vaga Atualizada: {job.title}"
        email_body = f"""
        <h2>Vaga Atualizada</h2>
        <p><strong>Título:</strong> {job.title}</p>
        <p><strong>Departamento:</strong> {job.department}</p>
        <p><strong>Localização:</strong> {job.location}</p>
        <p><strong>Atualizado por:</strong> {updater.name}</p>
        <p><a href="{settings.FRONTEND_URL}/jobs/{job.id}">Ver detalhes da vaga</a></p>
        """

        whatsapp_message = f"""
        🔄 Vaga Atualizada!
        
        Título: {job.title}
        Departamento: {job.department}
        Localização: {job.location}
        Atualizado por: {updater.name}
        
        Acesse: {settings.FRONTEND_URL}/jobs/{job.id}
        """

        # Envia notificações
        for user in managers + recruiters:
            if user.email:
                await self.send_email(user.email, email_subject, email_body)
            if user.phone:
                await self.send_whatsapp(user.phone, whatsapp_message)

notification_service = NotificationService() 