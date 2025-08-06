# app/llm/quiz_engine.py
import ast
import re
import json
import time
import threading
from typing import Any, Dict, Tuple
from fastapi import HTTPException
from groq import GroqError
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from pydantic import ValidationError
from app.models.schema import QuizGenerationResponse
from app.utils.prompt import get_system_prompt, get_dynamic_prompt
import os
from dotenv import load_dotenv
from langchain_core.exceptions import OutputParserException

from app.utils.logger     import log_event, append_to_gsheets
from app.utils.request_context import RequestContext


load_dotenv()

"""
Supported Groq Models
---------------------

Listed here in descending order of maximum recommended questions per request
(aligned with their context-window capacities and observed performance).

1. meta-llama/llama-4-maverick-17b-128e-instruct
   • Context window:           16,384 tokens
   • Daily token limit:        500,000 tokens/day
   • Token rate limit:         15,000 tokens/minute
   • Recommended max questions: 35

2. meta-llama/llama-4-scout-17b-16e-instruct
   • Context window:           16,384 tokens
   • Daily token limit:        500,000 tokens/day
   • Token rate limit:         30,000 tokens/minute
   • Recommended max questions: 35

3. qwen/qwen3-32b
   • Context window:           32,768 tokens
   • Daily token limit:        500,000 tokens/day
   • Token rate limit:         6,000 tokens/minute
   • Recommended max questions: 30

4. llama3-8b-8192
   • Context window:           8,192 tokens
   • Daily token limit:        500,000 tokens/day
   • Token rate limit:         6,000 tokens/minute
   • Recommended max questions: 25

5. llama3-70b-8192
   • Context window:           8,192 tokens
   • Daily token limit:        500,000 tokens/day
   • Token rate limit:         6,000 tokens/minute
   • Recommended max questions: 25

6. llama-3.1-8b-instant
   • Context window:           4,096 tokens
   • Daily token limit:        500,000 tokens/day
   • Token rate limit:         6,000 tokens/minute
   • Recommended max questions: 20

7. meta-llama/llama-guard-4-12b
   • Context window:           4,096 tokens
   • Daily token limit:        500,000 tokens/day
   • Token rate limit:         15,000 tokens/minute
   • Recommended max questions: 20

8. gemma2-9b-it
   • Context window:           4,096 tokens
   • Daily token limit:        500,000 tokens/day
   • Token rate limit:         15,000 tokens/minute
   • Recommended max questions: 15

9. deepseek-r1-distill-llama-70b
   • Context window:           4,096 tokens
   • Daily token limit:        100,000 tokens/day
   • Token rate limit:         6,000 tokens/minute
   • Recommended max questions: 15

10. compound-beta(-mini)
   • Context window:           4,096 tokens
   • Daily token limit:        unlimited
   • Token rate limit:         70,000 tokens/minute
   • Recommended max questions: 25
"""
SUPPORTED_GROQ_MODELS = [
    "meta-llama/llama-4-maverick-17b-128e-instruct",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "qwen/qwen3-32b",
    "llama3-8b-8192",
    "llama3-70b-8192",
    "llama-3.1-8b-instant",
    "meta-llama/llama-guard-4-12b",
    "gemma2-9b-it",
    "deepseek-r1-distill-llama-70b",
    "compound-beta",
    "compound-beta-mini",
]




# Thread-safe globals for model rotation
_groq_lock = threading.Lock()
_current_llm: ChatGroq | None = None
_current_model: str = SUPPORTED_GROQ_MODELS[0]

# Schema retry count
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "1"))

# API key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("Please set GROQ_API_KEY in your environment")

# Build prompt template
prompt_template = ChatPromptTemplate.from_messages([
    ("system", "{system_prompt}"),
    ("human",  "{user_prompt}"),
])

# Utility: strip markdown fences
def _strip_md_fences(text: str) -> str:
    m = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    return m.group(1).strip() if m else text.strip()

# Utility: strip reasoning tags
def _strip_think_tags(text: str) -> str:
    return re.sub(r"<think>[\s\S]*?</think>", "", text)

# Utility: attempt light JSON repair
def _repair_json(broken: str) -> str:
    # remove trailing commas
    repaired = re.sub(r",\s*([}\]])", r"\1", broken)
    # balance braces/brackets
    for open_c, close_c in [('{', '}'), ('[', ']')]:
        diff = repaired.count(open_c) - repaired.count(close_c)
        if diff > 0:
            repaired += close_c * diff
    return repaired

def _normalize_sata_answers(payload: dict) -> dict:
    """
    Turn any stray string `answer` on a SATAQuiz into a one-element list.
    Must be run *after* json.loads() but *before* Pydantic validation.
    """
    for q in payload.get("quizzes", []):
        if q.get("type") == "sata" and isinstance(q.get("answer"), str):
            q["answer"] = [q["answer"]]
    return payload


# Rotate to next model
def _rotate_model_if_needed(err: Dict[str, Any]) -> None:
    global _current_llm, _current_model
    with _groq_lock:
        SUPPORTED_GROQ_MODELS.append(SUPPORTED_GROQ_MODELS.pop(0))
        _current_model = SUPPORTED_GROQ_MODELS[0]
        _current_llm = None  # force re-init on next call




def clean_groq_error(raw_msg: str) -> dict:
    """
    Extracts a structured error object from a Groq error string,
    including 'retry_after_sec' if found.
    """
    try:
        # Remove the "Error code: XXX - " prefix
        if " - " in raw_msg:
            _, raw_json = raw_msg.split(" - ", 1)
        else:
            raw_json = raw_msg

        # Convert Python-style dict string to Python object
        data = ast.literal_eval(raw_json)
        error_obj = data.get("error", data)

        # Try to extract retry time in seconds from the message
        m = re.search(r"Please try again in (\d+)m([\d.]+)s", error_obj.get("message", ""))
        if m:
            minutes = int(m.group(1))
            seconds = float(m.group(2))
            retry_after_sec = int(minutes * 60 + seconds)
            error_obj["retry_after_sec"] = retry_after_sec

        return error_obj
    except Exception:
        return {"message": raw_msg}




# Get or initialize current LLM
def _get_llm() -> Tuple[ChatGroq, str]:
    global _current_llm, _current_model
    with _groq_lock:
        if _current_llm is None:
            _current_llm = ChatGroq(
                api_key=GROQ_API_KEY,
                model=_current_model,
                temperature=0.0,
                max_tokens=None,
                model_kwargs={"top_p": 0.95},
            )
        return _current_llm, _current_model

# Main generate function
def generate_quiz(input_data: Dict[str, Any], ctx: RequestContext) -> QuizGenerationResponse:
    # build prompts
    ctx.set_input(**input_data)
    system_prompt = get_system_prompt(
        num_questions=input_data.get("num_questions"),
        num_choices=input_data.get("options_per_question"),
        quiz_type=input_data.get("quiz_type"),
        file_intent=input_data.get("file_intent"),
        answer_required=input_data.get("answer_required"),
        explanation_required=input_data.get("explanation_required"),
    )
    user_prompt = get_dynamic_prompt(input_data)
    rendered = prompt_template.invoke({
        "system_prompt": system_prompt,
        "user_prompt":   user_prompt,
    })

    last_error = {}
    rotation_count = 0
    ai_msg = None
    used_model = None

    # Outer loop: regeneration attempts
    for regen_attempt in range(MAX_RETRIES + 1):
        # Inner loop: model cycling
        for _ in range(len(SUPPORTED_GROQ_MODELS)):
            llm, used_model = _get_llm()
            try:
                start = time.perf_counter()
                ai_msg = llm.invoke(rendered.messages)
                elapsed = time.perf_counter() - start
                # groq_meta = getattr(ai_msg, "response_metadata", {}) or ai_msg.token_usage or {}
                print(f"[Attempt {regen_attempt}] Model {used_model} responded in {elapsed:.2f}s")
                meta = getattr(ai_msg, "response_metadata", {}) or ai_msg.token_usage or {}
                ctx.set_log(
                    model_used=used_model,
                    inference_time_s=elapsed,
                    rotation_count=rotation_count,
                    regen_attempts=regen_attempt
                )
                break  
            except GroqError as e:
                raw = e.args[0]
                err_obj = clean_groq_error(str(raw))
                code    = err_obj.get("code")
                msg     = err_obj.get("message", "").lower()
                rotation_count += 1
                ctx.set_log(rotation_reason=err_obj.get("message","")) 
                # Rotate if rate limit exceeded
                if code == "rate_limit_exceeded" or "Rate limit reached" in raw:
                    last_error = err_obj or {}
                    _rotate_model_if_needed(err_obj)
                    continue

                # Skip permanently decommissioned models
                if code == "model_decommissioned":
                    print(f"Skipping decommissioned model: {used_model}")
                    last_error = err_obj or {}
                    _rotate_model_if_needed(err_obj)
                    continue

                raise HTTPException(
                    status_code=400,
                    detail={
                        "error":err_obj
                    },
                )
            except OutputParserException as e:
                raise HTTPException(502, f"Groq output parse error: {e}")
            except Exception as e:
                raise HTTPException(502, f"Unexpected Groq failure: {e}")
        else:
            # All models exhausted for this regen attempt
            raise HTTPException(
                status_code=503,
                detail={
                    "message": "All models have exhausted their daily quotas",
                    "last_model": SUPPORTED_GROQ_MODELS[-1],
                    "retry_after": last_error.get("reset_after_sec"),
                },
            )

        # cleanup and parse JSON
        content = ai_msg.content or ""
        cleaned = _strip_think_tags(content)
        cleaned = _strip_md_fences(cleaned)
        try:
            payload = json.loads(cleaned)
            payload = _normalize_sata_answers(payload)
        except json.JSONDecodeError:
            repaired = _repair_json(cleaned)
            try:
                payload = json.loads(repaired)
                payload = _normalize_sata_answers(payload)
            except json.JSONDecodeError as e2:
                print(f"[Attempt {regen_attempt}] JSON parse failed after repair.")
                continue  # try regenerating again

        # validate schema
        try:
            resp = QuizGenerationResponse(
                model_used=used_model,
                inference_time=elapsed,
                question_count=len(payload.get("quizzes", [])),
                attempt_number=regen_attempt+1,
                token_usage=meta.get("token_usage"),
                quizzes=payload["quizzes"]
            )
            ctx.set_log(
                validation_passed=True,
                questions_generated=resp.question_count,
                status="success",
                completion_tokens = resp.token_usage.get("completion_tokens"),
                prompt_tokens = resp.token_usage.get("prompt_tokens"),
                total_tokens = resp.token_usage.get("total_tokens"),
                completion_time = resp.token_usage.get("completion_time"),
                prompt_time = resp.token_usage.get("prompt_time"),
                queue_time = resp.token_usage.get("queue_time"),
                total_time = resp.token_usage.get("total_time")
            )
            entry = {**ctx.inputs, **ctx.logs}
            log_event("generation_success", request_id=ctx.request_id, **entry)
            append_to_gsheets("generation", {"request_id":ctx.request_id, **entry})
            return resp
        except ValidationError as ve:
            print(f"[Attempt {regen_attempt}] Validation failed: {ve}")
            ctx.set_log(validation_passed=False)
            continue  # regenerate on next outer loop

    # If we get here, all retries failed
    ctx.set_log(status="failure", error_message=last_error.get("message","unknown"))
    entry = {**ctx.inputs, **ctx.logs}
    log_event("generation_failure", request_id=ctx.request_id, **entry)
    append_to_gsheets("generation", {"request_id":ctx.request_id, **entry})
    raise HTTPException(
        status_code=500,
        detail={
            "message": f"Response failed schema validation after {MAX_RETRIES} regenerations",
            # "errors": ve.errors(),
            "raw_payload": cleaned,
        },
    )
