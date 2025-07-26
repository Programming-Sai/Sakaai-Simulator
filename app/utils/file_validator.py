ALLOWED_FILE_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "text/plain": ".txt",
}

# app/utils/file_validator.py

import os
from fastapi import UploadFile, HTTPException
from app.models.schema import SupportedFileType

def validate_file(file: UploadFile):
    filename = file.filename
    ext = os.path.splitext(filename)[1][1:].lower()  # e.g. 'pdf'
    
    if ext not in SupportedFileType.__members__:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Supported types: {list(SupportedFileType.__members__.keys())}"
        )
