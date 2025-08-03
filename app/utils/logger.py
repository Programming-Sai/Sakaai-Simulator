import json
from datetime import datetime
from typing import Optional, Dict, Any

def log_event(
    event_type: str,
    *,
    topic: Optional[str] = None,
    quiz_type: Optional[list] = None,
    num_questions: Optional[int] = None,
    file_size_mb: Optional[float] = None,
    file_intent: Optional[str] = None,
    model_used: Optional[str] = None,
    reason_for_rotation: Optional[str] = None,
    rotation_count: Optional[int] = None,
    token_usage: Optional[Dict[str, Any]] = None,
    error_message: Optional[str] = None,
    inference_time: Optional[float] = None,
    total_time: Optional[float] = None,
    success: Optional[bool] = None,
    question_count: Optional[int] = None,
    regen_attempts: Optional[int] = None
):
    """
    Logs structured analytics + debug info.
    Prints JSON so Render's logging picks it up neatly.
    """
    log_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,  # e.g., request_start, request_success, request_fail, rotation
        "topic": topic,
        "quiz_type": quiz_type,
        "num_questions_requested": num_questions,
        "file_size_mb": file_size_mb,
        "file_intent": file_intent,
        "model_used": model_used,
        "reason_for_rotation": reason_for_rotation,
        "rotation_count": rotation_count,
        "token_usage": token_usage,
        "error_message": error_message,
        "inference_time_sec": inference_time,
        "total_time_sec": total_time,
        "success": success,
        "question_count_generated": question_count,
        "regen_attempts": regen_attempts
    }
    print(json.dumps({k: v for k, v in log_data.items() if v is not None}, ensure_ascii=False))
