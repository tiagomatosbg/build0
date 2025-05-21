from typing import Dict, Any
import requests
from app.core.settings import settings

class WhatsAppService:
    def __init__(self):
        self.api_url = settings.WHATSAPP_API_URL
        self.api_token = settings.WHATSAPP_API_TOKEN
        self.phone_number_id = settings.WHATSAPP_PHONE_NUMBER_ID

    def _send_message(self, to_number: str, message: str):
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
        
        data = {
            "messaging_product": "whatsapp",
            "to": to_number,
            "type": "text",
            "text": {"body": message}
        }

        try:
            response = requests.post(
                f"{self.api_url}/{self.phone_number_id}/messages",
                headers=headers,
                json=data
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Erro ao enviar mensagem WhatsApp: {str(e)}")
            raise

    def send_registration_confirmation(self, candidate_data: Dict[str, Any]):
        message = (
            f"Olá {candidate_data['nome']}! 👋\n\n"
            "Recebemos seu cadastro em nossa plataforma. "
            "Por favor, verifique seu email para confirmar seu cadastro.\n\n"
            "Estamos ansiosos para conhecer mais sobre você! 😊"
        )
        
        self._send_message(candidate_data["telefone"], message)

    def send_pipeline_update(self, candidate_data: Dict[str, Any], stage_data: Dict[str, Any]):
        message = (
            f"Olá {candidate_data['nome']}! 📢\n\n"
            f"Seu processo seletivo para {stage_data['vaga_titulo']} "
            f"avançou para a etapa: {stage_data['nome']}\n\n"
            "Continue acompanhando seu email para mais atualizações. "
            "Boa sorte! 🍀"
        )
        
        self._send_message(candidate_data["telefone"], message)

    def send_interview_invitation(self, candidate_data: Dict[str, Any], interview_data: Dict[str, Any]):
        message = (
            f"Olá {candidate_data['nome']}! 📅\n\n"
            f"Você foi convidado para uma entrevista para a vaga de {interview_data['vaga_titulo']}.\n\n"
            f"Data: {interview_data['data']}\n"
            f"Tipo: {interview_data['tipo']}\n"
            f"Local: {interview_data.get('local', 'Online')}\n\n"
            "Por favor, confirme sua presença respondendo ao email que enviamos.\n"
            "Boa sorte! 🍀"
        )
        
        self._send_message(candidate_data["telefone"], message) 