# app/routes/health.py
import os
from fastapi import APIRouter
from app.models.schema import HealthResponse
from langchain_core.prompts import PromptTemplate
from app.utils.config import get_config

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
    response = {"status": status, "message": message, "config":get_config()}
    if not healthy:
        response["failures"] = {k: v for k, v in results.items() if not v}
    # print("Config: ", response)

    return HealthResponse(**response).model_dump(exclude_none=True)
