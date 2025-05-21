from typing import Dict, Any
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader
from pathlib import Path
from app.core.settings import settings

class EmailService:
    def __init__(self):
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        self.sender_email = settings.SENDER_EMAIL
        
        # Setup Jinja2 environment
        template_dir = Path(__file__).parent / "templates"
        self.env = Environment(loader=FileSystemLoader(template_dir))

    def _send_email(self, to_email: str, subject: str, html_content: str):
        msg = MIMEMultipart()
        msg['From'] = self.sender_email
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(html_content, 'html'))

        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
        except Exception as e:
            print(f"Erro ao enviar email: {str(e)}")
            raise

    def send_registration_confirmation(self, candidate_data: Dict[str, Any]):
        template = self.env.get_template("registration_confirmation.html")
        html_content = template.render(
            name=candidate_data["nome"],
            verification_url=f"{settings.FRONTEND_URL}/verify-email?token={candidate_data['verification_token']}"
        )
        
        self._send_email(
            to_email=candidate_data["email"],
            subject="Bem-vindo! Confirme seu cadastro",
            html_content=html_content
        )

    def send_pipeline_update(self, candidate_data: Dict[str, Any], stage_data: Dict[str, Any]):
        template = self.env.get_template("pipeline_update.html")
        html_content = template.render(
            name=candidate_data["nome"],
            stage_name=stage_data["nome"],
            job_title=stage_data["vaga_titulo"],
            company_name=stage_data["empresa_nome"]
        )
        
        self._send_email(
            to_email=candidate_data["email"],
            subject=f"Atualização no processo seletivo - {stage_data['nome']}",
            html_content=html_content
        )

    def send_interview_invitation(self, candidate_data: Dict[str, Any], interview_data: Dict[str, Any]):
        template = self.env.get_template("interview_invitation.html")
        html_content = template.render(
            name=candidate_data["nome"],
            job_title=interview_data["vaga_titulo"],
            company_name=interview_data["empresa_nome"],
            interview_date=interview_data["data"],
            interview_type=interview_data["tipo"],
            interviewers=interview_data["entrevistadores"],
            location=interview_data.get("local", "Online"),
            notes=interview_data.get("observacoes", "")
        )
        
        self._send_email(
            to_email=candidate_data["email"],
            subject=f"Convite para entrevista - {interview_data['vaga_titulo']}",
            html_content=html_content
        ) 