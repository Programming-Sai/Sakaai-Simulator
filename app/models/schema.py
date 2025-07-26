from typing import List, Literal, Union, Optional
from pydantic import BaseModel, model_validator
from enum import Enum

class SupportedFileType(str, Enum):
    pdf = "pdf"
    docx = "docx"
    txt = "txt"
    md = "md"
    png = "png"
    jpg = "jpg"
    jpeg = "jpeg"

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
    answer: str  
    
    @model_validator(mode="after")
    def answer_must_be_in_choices(cls, values):
        answer = values.get('answer')
        choices = values.get('choices')
        if answer not in choices:
            raise ValueError(f"Answer '{answer}' is not in choices {choices}")
        return values


class SATAQuiz(QuizBase):
    type: Literal["sata"]
    choices: List[str]
    answer: List[str]  
    
    @model_validator(mode="after")
    def all_answers_must_be_in_choices(cls, values):
        answers = values.get('answer', [])
        choices = values.get('choices', [])
        invalid = [a for a in answers if a not in choices]
        if invalid:
            raise ValueError(f"The following answers are not in choices: {invalid}")
        return values


class TFQuiz(QuizBase):
    type: Literal["tf"]
    answer: bool


class FITBSimpleQuiz(QuizBase):
    type: Literal["fitb"]
    answer: str

class FITBKeywordQuiz(QuizBase):
    type: Literal["fitb"]
    keywords: List[str]


class EssayQuiz(QuizBase):
    type: Literal["essay"]
    keywords: List[str]

Quiz = Union[
    MCQQuiz,
    SATAQuiz,
    TFQuiz,
    FITBSimpleQuiz,
    FITBKeywordQuiz,
    EssayQuiz
]


class QuizGenerationResponse(BaseModel):
    quizzes: List[Quiz]

class SubjectiveEvaluationRequest(BaseModel):
    question: str
    keywords: List[str]
    user_answer: str
