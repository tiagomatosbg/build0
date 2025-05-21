from typing import Dict, Any, Optional
import requests
from app.core.settings import settings

class LinkedInService:
    def __init__(self):
        self.api_url = "https://api.linkedin.com/v2"
        self.client_id = settings.LINKEDIN_CLIENT_ID
        self.client_secret = settings.LINKEDIN_CLIENT_SECRET
        self.redirect_uri = settings.LINKEDIN_REDIRECT_URI
        self.access_token = None

    def get_auth_url(self) -> str:
        """Generate LinkedIn OAuth URL"""
        return (
            "https://www.linkedin.com/oauth/v2/authorization"
            f"?response_type=code"
            f"&client_id={self.client_id}"
            f"&redirect_uri={self.redirect_uri}"
            f"&scope=r_liteprofile%20r_emailaddress"
        )

    def get_access_token(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": self.redirect_uri,
            "client_id": self.client_id,
            "client_secret": self.client_secret
        }

        response = requests.post(
            "https://www.linkedin.com/oauth/v2/accessToken",
            data=data
        )
        response.raise_for_status()
        token_data = response.json()
        self.access_token = token_data["access_token"]
        return token_data

    def get_profile_data(self) -> Dict[str, Any]:
        """Fetch basic profile data"""
        if not self.access_token:
            raise ValueError("Access token not set")

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "cache-control": "no-cache",
            "X-Restli-Protocol-Version": "2.0.0"
        }

        # Get basic profile
        profile_response = requests.get(
            f"{self.api_url}/me",
            headers=headers
        )
        profile_response.raise_for_status()
        profile_data = profile_response.json()

        # Get email address
        email_response = requests.get(
            f"{self.api_url}/emailAddress?q=members&projection=(elements*(handle~))",
            headers=headers
        )
        email_response.raise_for_status()
        email_data = email_response.json()

        # Get positions (work experience)
        positions_response = requests.get(
            f"{self.api_url}/me/positions",
            headers=headers
        )
        positions_response.raise_for_status()
        positions_data = positions_response.json()

        # Get education
        education_response = requests.get(
            f"{self.api_url}/me/educations",
            headers=headers
        )
        education_response.raise_for_status()
        education_data = education_response.json()

        return {
            "profile": profile_data,
            "email": email_data,
            "positions": positions_data,
            "education": education_data
        }

    def format_candidate_data(self, linkedin_data: Dict[str, Any]) -> Dict[str, Any]:
        """Format LinkedIn data to match our candidate schema"""
        profile = linkedin_data["profile"]
        email = linkedin_data["email"]["elements"][0]["handle~"]["emailAddress"]
        positions = linkedin_data["positions"]["elements"]
        education = linkedin_data["education"]["elements"]

        # Format experiences
        experiences = []
        for position in positions:
            experience = {
                "empresa": position["company"]["name"],
                "cargo": position["title"],
                "data_inicio": position["startDate"]["year"],
                "data_fim": position.get("endDate", {}).get("year"),
                "descricao": position.get("summary", "")
            }
            experiences.append(experience)

        # Format education
        education_list = []
        for edu in education:
            education_entry = {
                "instituicao": edu["schoolName"],
                "curso": edu.get("fieldOfStudy", ""),
                "nivel": edu.get("degree", ""),
                "data_inicio": edu["startDate"]["year"],
                "data_fim": edu.get("endDate", {}).get("year")
            }
            education_list.append(education_entry)

        return {
            "nome": f"{profile['localizedFirstName']} {profile['localizedLastName']}",
            "email": email,
            "linkedin": f"https://www.linkedin.com/in/{profile['id']}",
            "experiencias": experiences,
            "educacao": education_list
        } 