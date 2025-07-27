# app/llm/quiz_engine.py
import json
from typing import Any, Dict, List
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from pydantic import ValidationError
from app.models.schema import QuizGenerationResponse
from app.utils.prompt import get_system_prompt, get_dynamic_prompt
import os
import re
from dotenv import load_dotenv
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("Please set GROQ_API_KEY in your environment")


# Instantiate the LangChain Groq wrapper
llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model="deepseek-r1-distill-llama-70b",
    temperature=0.0,         # deterministic
    max_tokens=None,         # use model’s full context window
    # top_p=0.95,
    reasoning_format="hidden" # parse JSON for us
)

# Build a reusable ChatPromptTemplate
prompt_template = ChatPromptTemplate.from_messages(
    [
        ("system", "{system_prompt}"),
        ("human",  "{user_prompt}")
    ]
)


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
    system_prompt = get_system_prompt()
    user_prompt   = get_dynamic_prompt(input_data)

    # 2) Fill template
    rendered = prompt_template.invoke({
        "system_prompt": system_prompt,
        "user_prompt":   user_prompt,
    })

    # 3) Invoke the model
    ai_msg = llm.invoke(rendered.messages)  # returns an AIMessage with .content as parsed JSON

    # 4) Extract payload
    payload = _strip_md_fences(ai_msg.content)
    if isinstance(payload, str):
        try:
            payload = json.loads(payload)
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse LLM JSON: {e}\nRaw: {payload}")

    # 5) Validate via Pydantic
    try:
        quiz_resp = QuizGenerationResponse.model_validate(payload)
        print("\n\n", json.dumps(payload, indent=2), "\n\n")
    except ValidationError as e:
        # include the raw payload for debugging
        raise ValueError(
            f"Response failed schema validation:\n{e.json()}\n\nRaw:\n{json.dumps(payload, indent=2)}"
        )

    return quiz_resp
