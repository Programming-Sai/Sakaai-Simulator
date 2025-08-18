# app/routes/health.py
import os
from fastapi import APIRouter
from app.models.schema import HealthResponse
from langchain_core.prompts import PromptTemplate
import json
from dotenv import load_dotenv

load_dotenv()


max_file_size = int(os.getenv("MAX_FILE_SIZE_MB", "3"))
max_requests_per_day = int(os.getenv("MAX_REQUEST_PER_DAILY", "5/day").split("/")[0])
max_number_of_questions_per_generation = int(os.getenv("MAX_NUM_QUESTIONS", "30"))

feedback_questions_raw = os.getenv("FEEDBACK_QUESTIONS", "[]")
try:
    feedback_questions = json.loads(feedback_questions_raw)
except Exception as e:
    print(str(e))
    feedback_questions = []




config = {
    "max_file_size":max_file_size,
    "max_number_of_questions_per_generation":max_number_of_questions_per_generation,
    "max_requests_per_day":max_requests_per_day, 
    "feedback_questions":feedback_questions
}


router = APIRouter()

@router.get("/", response_model_exclude_none=True, response_model=HealthResponse)
async def health_check():
    results = {
        "arithmetic_check": False,
        "langchain_check": False,
    }

    # 1) Arithmetic
    try:
        results["arithmetic_check"] = (2 + 2 == 4)
    except Exception:
        pass


    # 2) LangChain PromptTemplate
    try:
        PromptTemplate.from_template("Q: {question}\nA:")
        results["langchain_check"] = True
    except Exception:
        pass

    
    # decide overall
    healthy = all(results.values())
    status  = "healthy" if healthy else "unhealthy"
    message = "Sakaai Simulator is up and running." if healthy else "One or more components failed health check."
    response = {"status": status, "message": message, "config":config}
    if not healthy:
        response["failures"] = {k: v for k, v in results.items() if not v}
    # print("Config: ", response)

    return HealthResponse(**response).model_dump(exclude_none=True)
