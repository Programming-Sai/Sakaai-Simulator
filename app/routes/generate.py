from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.models.schema import QuizGenerationResponse
from app.services.generate import generate_quizzes_from_text_or_file


router = APIRouter()

@router.post("/generate", response_model=QuizGenerationResponse)
async def generate_quiz(
    prompt: str = Form("---", description="Optional raw text"),
    file: Optional[UploadFile] = File(None, description="Optional uploaded file"),
):
    if not prompt and not file:
        raise HTTPException(status_code=400, detail="Either prompt or file must be provided.")

    quizzes = await generate_quizzes_from_text_or_file(prompt=prompt, file=file)
    return {"quizzes": quizzes}
