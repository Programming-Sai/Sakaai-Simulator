# services/evaluator.py

import time
import re
from typing import Dict, Any
from app.utils.evaluation_logic import (
    score_keywords,
    score_similarity,
    score_readability,
    score_structure,
)
from app.utils.logger import log_event
from app.utils.request_context import RequestContext

_ALLOWED_TYPES = {"essay", "fitb"}

def _clean_text_field(s: Any) -> str:
    """Ensure it’s a string, strip whitespace, collapse internal spaces."""
    if not isinstance(s, str):
        raise ValueError(f"Expected a string, got {type(s).__name__}")
    return re.sub(r"\s+", " ", s.strip())

def _validate_and_prepare(question: Dict[str, Any], user_answer: Any) -> (Dict[str, Any], str): # type: ignore
    """Clean and validate the inputs before scoring."""
    # 1) Clean question fields
    q = {}
    q_type = _clean_text_field(question.get("type", "")).lower()
    if q_type not in _ALLOWED_TYPES:
        raise ValueError(f"Unsupported question type: '{q_type}'")
    q["type"] = q_type

    q["question"] = _clean_text_field(question.get("question", "")) or \
        (_clean_text_field(question.get("prompt", "")) if "prompt" in question else "")
    if not q["question"]:
        raise ValueError("Question text is required.")

    # Explanation is optional but must be string if present
    expl = question.get("explanation", None)
    q["explanation"] = _clean_text_field(expl) if expl is not None else ""

    # Keywords list required for FITB, optional for essay
    raw_keywords = question.get("keywords", [])
    if not isinstance(raw_keywords, list) or any(not isinstance(k, str) for k in raw_keywords):
        raise ValueError("`keywords` must be a list of strings.")
    # Clean and dedupe
    keywords = []
    for kw in raw_keywords:
        kwc = _clean_text_field(kw).lower()
        if kwc and kwc not in keywords:
            keywords.append(kwc)
    if q_type == "fitb" and not keywords:
        raise ValueError("FITB questions require a non-empty `keywords` list.")
    q["keywords"] = keywords

    # 2) Clean user answer
    answer = _clean_text_field(user_answer)

    return q, answer

def evaluate_subjective(requestId:str, question: Dict[str, Any], user_answer: str) -> Dict[str, Any]:
    """
    Evaluate an essay or fill-in-the-blank response.

    Returns a dict with:
      - keyword, similarity, structure, readability (all 0–10)
      - final_score (0–10)
      - word_count, character_count, time_taken
    """
    # Clean & validate inputs
    q, ans = _validate_and_prepare(question, user_answer)
    q_type = q["type"]
    is_essay = q_type == "essay"
    is_fitb = q_type == "fitb"

    start = time.time()

    ctx = RequestContext(request_id=requestId)
    ctx.set_input(**question, **{"user_answer": user_answer})
    log_event(event_type="evaluation_request", request_id=requestId, **question, **{"user_answer": user_answer})


    # Shared metrics
    keyword_score    = score_keywords(q, ans)
    similarity_score = score_similarity(q, ans)

    # Essay-only metrics
    if is_essay:
        structure_score   = score_structure(ans)
        readability_score = score_readability(ans)
    else:
        structure_score   = 10.0
        readability_score = 10.0

    # Compose final
    if is_fitb:
        final = round(keyword_score * 0.7 + similarity_score * 0.3, 2)
    else:
        final = round(
            (keyword_score + similarity_score + structure_score + readability_score) / 4, 2
        )

    # Clamp to [0,10]
    final = max(0.0, min(final, 10.0))

    score = {
        "keyword":       max(0.0, min(keyword_score,       10.0)),
        "similarity":    max(0.0, min(similarity_score,    10.0)),
        "structure":     max(0.0, min(structure_score,     10.0)),
        "readability":   max(0.0, min(readability_score,   10.0)),
        "final_score":   final,
        "word_count":    len(ans.split()),
        "character_count": len(ans),
        "time_taken":    round(time.time() - start, 2),
    }
    ctx.set_log(**score)
    log_event(event_type="evaluation_success", request_id=requestId, **score)
    return score
