import os
import json
from dotenv import load_dotenv

load_dotenv()


def get_config():

    max_file_size = int(os.getenv("MAX_FILE_SIZE_MB"))
    max_requests_per_day = int(os.getenv("MAX_REQUEST_PER_DAILY", "5/day").split("/")[0])
    max_number_of_questions_per_generation = int(os.getenv("MAX_NUM_QUESTIONS"))

    feedback_questions_raw = os.getenv("FEEDBACK_QUESTIONS", "[]")
    try:
        feedback_questions = json.loads(feedback_questions_raw)
    except Exception as e:
        print(str(e))
        feedback_questions = []




    return {
        "max_file_size":max_file_size,
        "max_number_of_questions_per_generation":max_number_of_questions_per_generation,
        "max_requests_per_day":max_requests_per_day, 
        "feedback_questions":feedback_questions
    }