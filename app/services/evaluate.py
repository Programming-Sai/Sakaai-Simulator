import time
from app.utils.evaluation_logic import score_keywords, score_readability, score_similarity, score_structure


def evaluate_subjective(question: dict, user_answer: str) -> dict:
    is_essay = question["type"] == "essay"
    is_fitb = question["type"] == "fitb"

    start_time = time.time()

    # Run shared scoring functions
    keyword_score = score_keywords(question, user_answer)
    similarity_score = score_similarity(question, user_answer)
    
    # Optional: FITB may not need structure/readability heavily
    if is_essay:
        structure_score = score_structure(user_answer)
        readability_score = score_readability(user_answer)
    else:
        structure_score = 10.0  # auto full marks for short answers
        readability_score = 10.0  # not critical
    


    # Weight differently if FITB
    if is_fitb:
        final_score = round(
            (keyword_score * 0.7 + similarity_score * 0.3), 2
        )
    else:
        final_score = round(
            (keyword_score + similarity_score + structure_score + readability_score) / 4, 2
        )


    # Meta
    return {
        "keyword": keyword_score,
        "similarity": similarity_score,
        "structure": structure_score,
        "readability": readability_score,
        "final_score": final_score,
        "word_count": len(user_answer.split()),
        "character_count": len(user_answer),
        "time_taken": round(time.time() - start_time, 2)
    }

