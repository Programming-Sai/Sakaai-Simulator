from fastapi import APIRouter, Request, UploadFile, File, Form, HTTPException
from typing import List, Optional
import os
from app.utils.rate_limiter import limiter



from app.models.schema import QuizGenerationResponse
from app.services.generate import generate_quizzes_from_text_or_file

router = APIRouter()


MAX_REQUEST_PER_DAILY = os.getenv("MAX_REQUEST_PER_DAILY") or "5/day"
@router.post("/generate", response_model=QuizGenerationResponse)
@limiter.limit(MAX_REQUEST_PER_DAILY)
async def generate_quiz(
    request: Request,
    user_additional_instructions: str = Form(..., description="Required prompt or extra guidance"),
    topic: Optional[str] = Form(None),
    quiz_type: Optional[List[str]] = Form(None),
    num_questions: Optional[int] = Form(None),
    options_per_question: Optional[int] = Form(None),
    answer_required: bool = Form(True),
    explanation_required: bool = Form(True),
    file_intent: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None, description="Optional uploaded file"),
):
    if not user_additional_instructions:
        raise HTTPException(status_code=400, detail="user_additional_instructions (Prompt) Is required")
    
    request_data = {
        "topic": topic,
        "quiz_type": quiz_type,
        "num_questions": num_questions,
        "options_per_question": options_per_question,
        "answer_required": answer_required or True,
        "explanation_required": explanation_required or True,
        "file_intent": file_intent
    }

    quizzes = await generate_quizzes_from_text_or_file(prompt=user_additional_instructions, file=file, extra_data=request_data)
    return quizzes
