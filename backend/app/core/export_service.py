from typing import List, Dict, Any, Optional
import pandas as pd
from datetime import datetime
from io import BytesIO
from app.core.storage import get_secure_url

class ExportService:
    def __init__(self):
        self.date_format = "%d/%m/%Y"
        self.datetime_format = "%d/%m/%Y %H:%M"

    def _format_date(self, date: Optional[datetime]) -> str:
        if not date:
            return ""
        return date.strftime(self.date_format)

    def _format_datetime(self, date: Optional[datetime]) -> str:
        if not date:
            return ""
        return date.strftime(self.datetime_format)

    def _get_secure_document_url(self, url: Optional[str]) -> str:
        if not url:
            return ""
        return get_secure_url(url)

    def _prepare_candidate_data(self, candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        formatted_data = []
        
        for candidate in candidates:
            # Basic info
            candidate_data = {
                "ID": candidate["id"],
                "Nome": candidate["nome"],
                "Email": candidate["email"],
                "CPF": candidate["cpf"],
                "Telefone": candidate["telefone"],
                "Data de Nascimento": self._format_date(candidate.get("data_nascimento")),
                "LinkedIn": candidate.get("linkedin", ""),
                "Portfolio": candidate.get("portfolio", ""),
                "Data de Cadastro": self._format_datetime(candidate.get("data_criacao")),
                "Última Atualização": self._format_datetime(candidate.get("data_atualizacao")),
                "Status": "Ativo" if candidate.get("ativo", True) else "Inativo",
                "Email Verificado": "Sim" if candidate.get("email_verificado", False) else "Não"
            }

            # Documents
            if "documentos" in candidate:
                candidate_data.update({
                    "Currículo": self._get_secure_document_url(candidate["documentos"].get("curriculo")),
                    "Portfólio": self._get_secure_document_url(candidate["documentos"].get("portfolio")),
                    "Certificados": self._get_secure_document_url(candidate["documentos"].get("certificados"))
                })

            # Experience
            if "experiencias" in candidate:
                experiences = []
                for exp in candidate["experiencias"]:
                    exp_str = (
                        f"{exp['cargo']} em {exp['empresa']} "
                        f"({self._format_date(exp['data_inicio'])} - "
                        f"{self._format_date(exp.get('data_fim')) or 'Atual'})"
                    )
                    experiences.append(exp_str)
                candidate_data["Experiências"] = "\n".join(experiences)

            # Education
            if "educacao" in candidate:
                education = []
                for edu in candidate["educacao"]:
                    edu_str = (
                        f"{edu['curso']} ({edu['nivel']}) em {edu['instituicao']} "
                        f"({self._format_date(edu['data_inicio'])} - "
                        f"{self._format_date(edu.get('data_fim')) or 'Atual'})"
                    )
                    education.append(edu_str)
                candidate_data["Formação"] = "\n".join(education)

            # Application history
            if "historico" in candidate:
                history = []
                for hist in candidate["historico"]:
                    hist_str = (
                        f"{self._format_datetime(hist['data'])} - "
                        f"{hist['vaga_titulo']} - {hist['etapa_nome']}"
                    )
                    if hist.get("observacao"):
                        hist_str += f" - {hist['observacao']}"
                    history.append(hist_str)
                candidate_data["Histórico de Candidaturas"] = "\n".join(history)

            formatted_data.append(candidate_data)

        return formatted_data

    def export_to_xlsx(self, candidates: List[Dict[str, Any]]) -> BytesIO:
        """Export candidates data to XLSX format"""
        df = pd.DataFrame(self._prepare_candidate_data(candidates))
        
        # Create Excel writer
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Candidatos')
            
            # Auto-adjust columns width
            worksheet = writer.sheets['Candidatos']
            for idx, col in enumerate(df.columns):
                max_length = max(
                    df[col].astype(str).apply(len).max(),
                    len(col)
                )
                worksheet.column_dimensions[chr(65 + idx)].width = min(max_length + 2, 50)

        output.seek(0)
        return output

    def export_to_csv(self, candidates: List[Dict[str, Any]]) -> BytesIO:
        """Export candidates data to CSV format"""
        df = pd.DataFrame(self._prepare_candidate_data(candidates))
        
        output = BytesIO()
        df.to_csv(output, index=False, encoding='utf-8-sig')
        output.seek(0)
        return output 