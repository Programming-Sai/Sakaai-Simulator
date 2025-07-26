from fastapi import APIRouter
from app.models.schema import HealthResponse

router = APIRouter()

@router.get("/", response_model_exclude_none=True, response_model=HealthResponse)
async def health_check():
    results = {
        "arithmetic_check": False,
        "nlp_check": False,
        "langchain_check": False,
    }

    try:
        results["arithmetic_check"] = (2 + 2 == 4)

        # spaCy test
        import spacy
        nlp = spacy.load("en_core_web_sm")
        doc = nlp("Health check.")
        results["nlp_check"] = len(doc) > 0
    except Exception:
        pass

    try:
        from langchain_core.prompts import PromptTemplate
        prompt = PromptTemplate.from_template("Q: {question}\nA: ")
        results["langchain_check"] = True
    except Exception:
        pass

    status = "healthy" if all(results.values()) else "unhealthy"
    message = "Sakaai Simulator is up and running." if all(results.values()) else "One or more components failed health check."

    all_ok = all(results.values())
    response = {
        "status": status,
        "message": message
    }

    if not all_ok:
        response["failures"] = {k: v for k, v in results.items() if not v}

    return HealthResponse(**response).model_dump(exclude_none=True)


