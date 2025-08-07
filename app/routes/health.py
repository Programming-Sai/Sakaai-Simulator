# app/routes/health.py
import os
from fastapi import APIRouter
from app.models.schema import HealthResponse

# existing imports
# import time

# new imports for evaluation logic
# from app.utils.evaluation_logic import (
#     score_structure,
#     score_readability,
#     score_similarity,
#     score_keywords,
# )
# import nltk
# from nltk.tokenize import word_tokenize
# from nltk.corpus import stopwords
# from rapidfuzz import fuzz
# import textstat
from langchain_core.prompts import PromptTemplate



# from app.utils.nltk_setup import NLTK_DATA  # triggers the setup once



router = APIRouter()

@router.get("/", response_model_exclude_none=True, response_model=HealthResponse)
async def health_check():
    results = {
        "arithmetic_check": False,
        "langchain_check": False,
        # "nltk_check": False,
        # "rapidfuzz_check": False,
        # "textstat_check": False,
        # "evaluation_logic_check": False,
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

    # # 4) NLTK tokenization & stopwords
    # try:
    #     # ensure punkt & stopwords are present (download if needed)
    #     nltk.data.find("tokenizers/punkt")
    #     nltk.data.find("corpora/stopwords")
    #     word_tokenize("test")
    #     stopwords.words("english")
    #     results["nltk_check"] = True
    # except (LookupError, Exception):
    #     try:
    #         nltk.download("punkt", quiet=True)
    #         nltk.download("stopwords", quiet=True)
    #         # re-try
    #         word_tokenize("test")
    #         stopwords.words("english")
    #         results["nltk_check"] = True
    #     except Exception:
    #         pass

    # # 5) RapidFuzz
    # try:
    #     fuzz.ratio("foo", "bar")
    #     results["rapidfuzz_check"] = True
    # except Exception:
    #     pass

    # # 6) textstat
    # try:
    #     _ = textstat.flesch_reading_ease("This is a simple sentence.")
    #     results["textstat_check"] = True
    # except Exception:
    #     pass

    # # 7) evaluation_logic end-to-end
    # try:
    #     # tiny sample
    #     sample_q = {
    #         "type": "essay",
    #         "question": "Why is water wet?",
    #         "explanation": "Because it is water and wetness is a property of liquids.",
    #         "keywords": ["water", "wetness", "liquid"],
    #     }
    #     sample_ans = "Water is wet because wetness describes a liquid's property."
    #     # run all four scorers
    #     s1 = score_structure(sample_ans)
    #     s2 = score_readability(sample_ans)
    #     s3 = score_similarity(sample_q, sample_ans)
    #     s4 = score_keywords(sample_q, sample_ans)
    #     # if each returns a float between 0 and 10, we’re good
    #     if all(isinstance(x, float) and 0 <= x <= 10 for x in (s1, s2, s3, s4)):
    #         results["evaluation_logic_check"] = True
    # except Exception:
    #     pass

    # decide overall
    healthy = all(results.values())
    status  = "healthy" if healthy else "unhealthy"
    message = "Sakaai Simulator is up and running." if healthy else "One or more components failed health check."
    response = {"status": status, "message": message}
    if not healthy:
        response["failures"] = {k: v for k, v in results.items() if not v}

    return HealthResponse(**response).model_dump(exclude_none=True)
