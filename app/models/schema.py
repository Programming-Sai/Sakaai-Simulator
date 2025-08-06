from typing import Any, Dict, List, Literal, Union, Optional
from pydantic import BaseModel, model_validator
from enum import Enum

class SupportedFileType(str, Enum):
    pdf = "pdf"
    docx = "docx"
    txt = "txt"
    md = "md"
    # png = "png"
    # jpg = "jpg"
    # jpeg = "jpeg"

class HealthResponse(BaseModel):
    status: Literal["healthy", "unhealthy"]
    message: str
    failures: Optional[dict[str, bool]] = None



class QuizBase(BaseModel):
    type: Literal["mcq", "sata", "tf", "fitb", "essay"]
    question: str
    explanation: Optional[str] = None


class MCQQuiz(QuizBase):
    type: Literal["mcq"]
    choices: List[str]
    answer: Optional[str]  
    
    @model_validator(mode="after")
    def answer_must_be_in_choices(cls, values):
        if values.answer is not None and values.answer not in values.choices:
            raise ValueError(f"Answer '{values.answer}' is not in choices {values.choices}")
        return values


class SATAQuiz(QuizBase):
    type: Literal["sata"]
    choices: List[str]
    answer: Optional[List[str]]  
    
    @model_validator(mode="after")
    def all_answers_must_be_in_choices(cls, values):
        if values.answer:
            answers = values.answer
            choices = values.choices
            invalid = [a for a in answers if a not in choices]
            if invalid:
                raise ValueError(f"The following answers are not in choices: {invalid}")
            return values


class TFQuiz(QuizBase):
    type: Literal["tf"]
    answer: Optional[bool]


class FITBSimpleQuiz(QuizBase):
    type: Literal["fitb"]
    answer: Optional[str]

class FITBKeywordQuiz(QuizBase):
    type: Literal["fitb"]
    keywords: Optional[List[str]]


class EssayQuiz(QuizBase):
    type: Literal["essay"]
    keywords: Optional[List[str]]

Quiz = Union[
    MCQQuiz,
    SATAQuiz,
    TFQuiz,
    FITBSimpleQuiz,
    FITBKeywordQuiz,
    EssayQuiz
]


class QuizGenerationResponse(BaseModel):
    model_used: str
    inference_time: float
    question_count: int
    attempt_number: int
    token_usage: Optional[Dict[str, Any]] = None
    quizzes: List[Quiz]
    model_config = {
      "extra": "forbid",  # you can also set "ignore" if you want to drop unknowns
    }


class SubjectiveEvaluationRequest(BaseModel):
    question: Union[EssayQuiz, FITBKeywordQuiz]
    user_answer: str


class SubjectiveEvaluationResponse(BaseModel):
    keyword: float
    similarity: float
    readability: float
    structure: float
    final_score: float

    # Metadata
    time_taken: Optional[float] = None  # in seconds
    word_count: Optional[int] = None
    character_count: Optional[int] = None



