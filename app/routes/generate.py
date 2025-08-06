from fastapi import APIRouter, Request, UploadFile, File, Form, HTTPException
from typing import List, Optional
import os
from app.utils.rate_limiter import limiter

from app.utils.request_context import RequestContext
from app.utils.logger import log_event



from app.models.schema import QuizGenerationResponse
from app.services.generate import generate_quizzes_from_text_or_file

router = APIRouter()


MAX_REQUEST_PER_DAILY = os.getenv("MAX_REQUEST_PER_DAILY") or "5/day"
@router.post("/generate", response_model=QuizGenerationResponse)
@limiter.limit(MAX_REQUEST_PER_DAILY)
async def generate_quiz(
    request: Request,
    request_id: str = Form(..., description="Clients' unique request ID"),
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
    request.state.request_id = request_id
    ctx = RequestContext(request_id=request_id)
    ctx.set_input(
        user_additional_instructions=user_additional_instructions,
        topic=topic,
        quiz_type=quiz_type,
        num_questions=num_questions,
        options_per_question=options_per_question,
        answer_required=answer_required,
        explanation_required=explanation_required,
        file_intent=file_intent,
    )

    log_event(event_type="request_start", request_id=request_id, **ctx.inputs)

    try:
        response = await generate_quizzes_from_text_or_file(
            request_id=request_id,
            prompt=user_additional_instructions,
            file=file,
            extra_data=ctx.inputs,
            ctx=ctx,
        )
        log_event(event_type="request_success", request_id=request_id, **ctx.logs)
        return response

    except HTTPException as he:
        log_event(
            event_type="request_error",
            request_id=request_id,
            error_message=str(he.detail),
            **ctx.logs,
        )
        raise

    except Exception as e:
        log_event(
            event_type="request_error",
            request_id=request_id,
            error_message=str(e),
            **ctx.logs,
        )
        raise HTTPException(status_code=500, detail="Internal server error")
