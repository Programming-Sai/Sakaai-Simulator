from fastapi import APIRouter, HTTPException

from app.models.schema import SubjectiveEvaluationRequest, SubjectiveEvaluationResponse
from app.services.evaluate import evaluate_subjective
 
router = APIRouter()


@router.post("/evaluate", response_model=SubjectiveEvaluationResponse)
async def evaluate_subjective_answer(payload: SubjectiveEvaluationRequest):
    try:
        result = evaluate_subjective(
            requestId=payload.requestId,
            question=payload.question.model_dump(),
            user_answer=payload.user_answer
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")
