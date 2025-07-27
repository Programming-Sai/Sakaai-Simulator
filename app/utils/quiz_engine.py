# app/llm/quiz_engine.py
import json
from typing import Any, Dict, List
from fastapi import HTTPException
from groq import GroqError
from langchain_groq import ChatGroq
# from groq.exceptions import GroqError  # or whatever your wrapper throws
from langchain_core.prompts import ChatPromptTemplate
from pydantic import ValidationError
from app.models.schema import QuizGenerationResponse
from app.utils.prompt import get_system_prompt, get_dynamic_prompt
import os
import re
import threading
from dotenv import load_dotenv
from langchain_core.exceptions import OutputParserException
from requests.exceptions import RequestException
load_dotenv()



# Rotate through these when one model’s daily quota is exhausted:
SUPPORTED_GROQ_MODELS = [
    "deepseek-r1-distill-llama-70b",                    # 100 000 TPD, 6 000 TPM, 4 k+ ctx
    "compound-beta",                                    # ∞ TPD, 70 000 TPM
    "compound-beta-mini",                               # ∞ TPD, 70 000 TPM
    "gemma2-9b-it",                                     # 500 000 TPD, 15 000 TPM
    "mistral-saba-24b",                                 # 500 000 TPD, 6 000 TPM
    "llama3-70b-8192",                                  # 500 000 TPD, 6 000 TPM, 8 k ctx
    "llama3-8b-8192",                                   # 500 000 TPD, 6 000 TPM, 8 k ctx
    "llama-3.1-8b-instant",                             # 500 000 TPD, 6 000 TPM, 4 k ctx
    "meta-llama/llama-4-scout-17b-16e-instruct",        # 500 000 TPD, 30 000 TPM
    "meta-llama/llama-guard-4-12b",                     # 500 000 TPD, 15 000 TPM
]





MAX_RETRIES = int(os.getenv("MAX_RETRIES", "1"))

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("Please set GROQ_API_KEY in your environment")


# Instantiate the LangChain Groq wrapper
# llm = ChatGroq(
#     api_key=GROQ_API_KEY,
#     model=SUPPORTED_GROQ_MODELS[2],
#     temperature=0.0,         # deterministic
#     max_tokens=None,         # use model’s full context window
#     model_kwargs={"top_p": 0.95},
# )

# Build a reusable ChatPromptTemplate
prompt_template = ChatPromptTemplate.from_messages(
    [
        ("system", "{system_prompt}"),
        ("human",  "{user_prompt}")
    ]
)





_groq_lock = threading.Lock()
_current_llm: ChatGroq = None

def _rotate_model_if_needed(err: Dict[str, Any]):
    """
    Move the exhausted model to back of pool and re-create ChatGroq with next.
    """
    global _current_llm
    with _groq_lock:
        exhausted = SUPPORTED_GROQ_MODELS.pop(0)
        SUPPORTED_GROQ_MODELS.append(exhausted)

        # rebuild llm on next model
        _current_llm = ChatGroq(
            api_key=GROQ_API_KEY,
            model=SUPPORTED_GROQ_MODELS[0],
            temperature=0.0,         # deterministic
            max_tokens=None,         # use model’s full context window
            model_kwargs={"top_p": 0.95},
        )

def _get_llm() -> ChatGroq:
    """
    Return the singleton ChatGroq, instantiating on first call.
    """
    global _current_llm
    with _groq_lock:
        if _current_llm is None:
            _current_llm = ChatGroq(
                api_key=GROQ_API_KEY,
                model=SUPPORTED_GROQ_MODELS[2],
                temperature=0.0,         # deterministic
                max_tokens=None,         # use model’s full context window
                model_kwargs={"top_p": 0.95},
            )
        return _current_llm












def _strip_md_fences(text: str) -> str:
    """
    Remove Markdown code fences (```json ...```) so we can parse clean JSON.
    """
    # look for ```json …```
    m = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if m:
        return m.group(1).strip()
    return text.strip()







def generate_quiz(input_data: Dict[str, Any]) -> QuizGenerationResponse:
    """
    1. Renders system + dynamic prompts via LangChain
    2. Invokes ChatGroq
    3. Validates the returned JSON against QuizGenerationResponse
    """
    # 1) Gather prompts
    system_prompt = get_system_prompt(num_questions=input_data.get("num_questions"), num_choices=input_data.get("options_per_question"))
    user_prompt   = get_dynamic_prompt(input_data)

    # 2) Fill template
    rendered = prompt_template.invoke({
        "system_prompt": system_prompt,
        "user_prompt":   user_prompt,
    })

    # 3) Invoke the model
    for attempt in range(len(SUPPORTED_GROQ_MODELS)):
        llm = _get_llm()
        try:
            ai_msg = llm.invoke(rendered.messages)
            break
        except OutputParserException as e:
            raise HTTPException(502, f"Groq output parse error: {e}")
        except GroqError as e:
            raw = e.args[0]
            if isinstance(raw, str):
                try: raw = json.loads(raw)
                except: raw = {"raw_message": raw}
            err = raw.get("error", raw)
            if err.get("code") == "rate_limit_exceeded":
                last_error = err
                _rotate_model_if_needed(err)
                continue   # retry on next model
            # any other GroqError: bubble up immediately
            raise HTTPException(400, {
                "message": err.get("message","GroqError"),
                "code":    err.get("code"),
                **{k:v for k,v in err.items() if k not in ("message","code")}
            })
        except Exception as e:
            raise HTTPException(502, f"Unexpected Groq failure: {e}")
    else:
        # exhausted all models in one day
        raise HTTPException(503, {
            "message":      "All Groq models have exhausted their daily quotas",
            "last_model":   SUPPORTED_GROQ_MODELS[-1],
            "retry_after":  last_error.get("reset_after_sec")
        })
    

    # 4) Extract payload
    payload = _strip_md_fences(ai_msg.content or "")
    if isinstance(payload, str):
        
        try:
            payload = json.loads(payload)
        except Exception as e:
            raise HTTPException(
                status_code=502,
                detail={
                    "message":    "Upstream LLM did not return valid JSON",
                    "error":      str(e),
                    "raw_output": payload[:500],
                },
            )

    # 5) Validate via Pydantic
    fail = False
    err=''
    for _ in range(MAX_RETRIES):
        try:
            quiz_resp = QuizGenerationResponse.model_validate(payload)
            # print("\n\n", json.dumps(payload, indent=2), "\n\n", len(payload.get('quizzes', [])))
            fail = False
        except ValidationError as e:
            fail = True
            err = e
            pass

    if fail:
        # include the raw payload for debugging
        error_payload = {
            "message": f"Response failed schema validation after {MAX_RETRIES} tries",
            # "details": json.loads(err.json()) if err else None,
            "raw_payload": payload
        }
        raise HTTPException(status_code=500, detail=error_payload)

    return quiz_resp
