import os
import uuid
from fastapi import UploadFile
from typing import Optional
import aiofiles
import aiofiles.os
from app.core.config import settings

async def upload_file(file: UploadFile, directory: str) -> str:
    """
    Faz upload de um arquivo para o storage.
    
    Args:
        file: Arquivo a ser enviado
        directory: Diretório de destino
        
    Returns:
        URL do arquivo
        
    Raises:
        HTTPException: Se houver erro no upload
    """
    try:
        # Cria diretório se não existir
        upload_dir = os.path.join(settings.UPLOAD_DIR, directory)
        await aiofiles.os.makedirs(upload_dir, exist_ok=True)
        
        # Gera nome único para o arquivo
        ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(upload_dir, filename)
        
        # Salva arquivo
        async with aiofiles.open(filepath, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
        
        # Retorna URL do arquivo
        return f"{settings.STORAGE_URL}/{directory}/{filename}"
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao fazer upload do arquivo: {str(e)}"
        )

async def delete_file(file_url: str) -> None:
    """
    Remove um arquivo do storage.
    
    Args:
        file_url: URL do arquivo
        
    Raises:
        HTTPException: Se houver erro ao remover
    """
    try:
        # Extrai caminho do arquivo da URL
        filepath = file_url.replace(settings.STORAGE_URL, settings.UPLOAD_DIR)
        
        # Remove arquivo se existir
        if await aiofiles.os.path.exists(filepath):
            await aiofiles.os.remove(filepath)
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao remover arquivo: {str(e)}"
        ) 