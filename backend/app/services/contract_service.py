import os
import zipfile
import io
from datetime import datetime
from pathlib import Path
from fastapi import HTTPException, UploadFile
from app.config.settings import CONTRACTS_DIR, ALLOWED_CONTRACT_TYPES, ALLOWED_CONTRACT_EXT

def _contract_filename(contract_type: str) -> str:
    # Храним под фиксированным именем <type>.docx, даже если загрузили .doc
    return f"{contract_type}.docx"

def _contract_path(contract_type: str) -> Path:
    return CONTRACTS_DIR / _contract_filename(contract_type)

def _contract_meta(contract_type: str):
    try:
        file_path = _contract_path(contract_type)
        if not file_path.exists():
            return None
        
        stat = file_path.stat()
        return {
            "type": contract_type,
            "file_name": file_path.name,
            "size": stat.st_size,
            "updated_at": datetime.utcfromtimestamp(stat.st_mtime).isoformat(),
            "url": f"/static/contracts/{file_path.name}",
        }
    except Exception as e:
        print(f"Error in _contract_meta for {contract_type}: {e}")
        return None

def list_contracts():
    """Возвращает список доступных договоров"""
    try:
        # Проверяем существование папки
        if not CONTRACTS_DIR.exists():
            print(f"Contracts directory does not exist: {CONTRACTS_DIR}")
            return {"data": []}
        
        result = []
        for t in sorted(list(ALLOWED_CONTRACT_TYPES)):
            try:
                meta = _contract_meta(t)
                if meta:
                    result.append(meta)
            except Exception as e:
                print(f"Error getting meta for contract type {t}: {e}")
                continue
        
        return {"data": result}
    except Exception as e:
        print(f"Error in list_contracts: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list contracts: {str(e)}")

def get_contract(contract_type: str):
    """Возвращает метаданные договора по типу"""
    if contract_type not in ALLOWED_CONTRACT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid contract type")
    meta = _contract_meta(contract_type)
    if not meta:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"data": meta}

async def upload_contract(contract_type: str, file: UploadFile):
    """Загружает договор указанного типа"""
    if contract_type not in ALLOWED_CONTRACT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid contract type")

    original_name = file.filename or ""
    ext = os.path.splitext(original_name)[1].lower()
    if ext not in ALLOWED_CONTRACT_EXT:
        raise HTTPException(status_code=400, detail="Only .docx or .doc files are allowed")

    try:
        # Читаем содержимое файла
        content = await file.read()
        
        # Проверяем размер файла
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="File is empty")
        
        # Проверяем, что это действительно .docx/.doc файл
        # .docx файлы начинаются с PK (ZIP формат)
        # .doc файлы имеют специфическую структуру
        if ext == '.docx':
            if not content.startswith(b'PK'):
                raise HTTPException(status_code=400, detail="Invalid .docx file format")
            
            # Дополнительная проверка структуры .docx файла
            try:
                with zipfile.ZipFile(io.BytesIO(content)) as zip_file:
                    # Проверяем наличие обязательных файлов .docx
                    required_files = ['word/document.xml', '[Content_Types].xml']
                    if not all(f in zip_file.namelist() for f in required_files):
                        raise HTTPException(status_code=400, detail="Invalid .docx file structure")
            except zipfile.BadZipFile:
                raise HTTPException(status_code=400, detail="Invalid .docx file format")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error validating .docx file: {str(e)}")
        
        target_path = _contract_path(contract_type)
        
        # Создаем папку если её нет
        target_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Сохраняем как <type>.docx
        with open(target_path, "wb") as f:
            f.write(content)

        meta = _contract_meta(contract_type)
        return {"success": True, "data": meta}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload: {str(e)}")

def delete_contract(contract_type: str):
    """Удаляет файл договора указанного типа"""
    if contract_type not in ALLOWED_CONTRACT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid contract type")

    try:
        target_path = _contract_path(contract_type)
        if not target_path.exists():
            raise HTTPException(status_code=404, detail="Contract not found")

        target_path.unlink(missing_ok=False)
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete: {str(e)}")
