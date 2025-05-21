from typing import List, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
from fastapi import HTTPException
from app.core.config import settings
from app.models.job import Job
from app.models.user import User

class NotificationService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.whatsapp_api_key = settings.WHATSAPP_API_KEY
        self.whatsapp_api_url = settings.WHATSAPP_API_URL

    async def send_email(self, to_email: str, subject: str, body: str) -> bool:
        """
        Envia e-mail usando SMTP
        """
        try:
            msg = MIMEMultipart()
            msg['From'] = self.smtp_user
            msg['To'] = to_email
            msg['Subject'] = subject

            msg.attach(MIMEText(body, 'html'))

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            return True
        except Exception as e:
            print(f"Erro ao enviar e-mail: {str(e)}")
            return False

    async def send_whatsapp(self, to_number: str, message: str) -> bool:
        """
        Envia mensagem via WhatsApp usando API externa
        """
        try:
            headers = {
                'Authorization': f'Bearer {self.whatsapp_api_key}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'to': to_number,
                'message': message
            }

            response = requests.post(
                self.whatsapp_api_url,
                headers=headers,
                json=payload
            )
            
            return response.status_code == 200
        except Exception as e:
            print(f"Erro ao enviar WhatsApp: {str(e)}")
            return False

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