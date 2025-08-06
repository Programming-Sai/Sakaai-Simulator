from fastapi import APIRouter

from app.models.schema import FeedbackRequest
from app.services.feedback import process_feedback

router = APIRouter()

@router.post("/feedback")
def submit_feedback(feedback: FeedbackRequest):
    result = process_feedback(feedback)
    return result
