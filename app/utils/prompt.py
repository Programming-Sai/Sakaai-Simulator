import json
from typing import Optional, List, Literal, Dict, Any
from pathlib import Path
from pydantic import BaseModel
from app.models.schema import QuizGenerationResponse

# Define parameter glossary
PARAMETER_GLOSSARY: Dict[str, Dict[str, Any]] = {
    "topic": {
        "type": "string",
        "required": False,
        "description": "High-level subject of the quiz (e.g., 'Photosynthesis')."
    },
    "quiz_type": {
        "type": "string[]",
        "required": False,
        "description": "List of formats to include. Valid values: ['mcq', 'sata', 'tf', 'fitb', 'essay']."
    },
    "num_questions": {
        "type": "integer",
        "required": False,
        "description": "Total number of questions to generate."
    },
    "options_per_question": {
        "type": "integer",
        "required": False,
        "description": "For MCQ/SATA types, how many choices each should have."
    },
    "answer_required": {
        "type": "boolean",
        "required": True,
        "description": "Whether each question must include a correct answer field."
    },
    "explanation_required": {
        "type": "boolean",
        "required": True,
        "description": "Whether each question must include a short explanation field."
    },
    "source_material": {
        "type": "string",
        "required": False,
        "description": "Either the raw notes, study material, source of quiz or an actual quiz that needs cleanup and convertion to json"
    },
    "file_intent": {
        "type": "string",
        "required": False,
        "description": "Either 'study_material' or 'existing_quiz'."
    },
    "user_additional_instructions": {
        "type": "string",
        "required": False,
        "description": "Any extra guidance, e.g., 'Focus on light vs dark reactions.'"
    }
}


def get_system_prompt(num_questions=None, num_choices=None, quiz_type=None) -> str:
    """
    Returns the system prompt embedding the full JSON schema and glossary.
    """
    # Generate JSON schema text
    schema = QuizGenerationResponse.model_json_schema()
    schema_text = json.dumps(schema, indent=2)

    # Build glossary text
    glossary_lines = []
    for name, info in PARAMETER_GLOSSARY.items():
        req = "**[Required]**" if info.get("required") else ""
        glossary_lines.append(f"- **{name}** ({info['type']}) {req}: {info['description']}")
    glossary_text = "\n".join(glossary_lines)

    return f"""
You are an AI Quiz Generator. You MUST output **exactly** valid JSON matching the schema below.

--- begin JSON SCHEMA ---
{schema_text}
--- end JSON SCHEMA ---

**Field Definitions (glossary):**
{glossary_text}

**QUICK REFERENCE:**
- **quiz_type** values map to these item schemas:
  - "mcq" → MCQQuiz  
  - "sata" → SATAQuiz  
  - "tf" → TFQuiz  
  - "fitb" → FITBSimpleQuiz or FITBKeywordQuiz  
  - "essay" → EssayQuiz 

  {"These are the Quiz type(s) you MUST follow to the latter: " + ', '.join(quiz_type) if quiz_type else ''} 

**RULES:**
- **Do not** output any fields or values outside the given schema.
- If "file_intent" is "existing_quiz", parse and convert only; do not generate new questions.
- If "quiz_type" is provided, generate only those types.
- If "quiz_type" is missing, infer from source material.
- Always honor "answer_required" and "explanation_required".
- Do not ask clarifying questions; assume inputs are correct.
{'- Generate AT LEAST ' + str(num_questions) + ' unique questions. NEVER EVER repeat or paraphrase the same question.\n- You must NEVER return fewer than ' + str(num_questions) + 'questions.\n- The output must contain a top-level "questions" list of length >= ' + str(num_questions) + '.' if num_questions else ''}
{'- Each question must have EXACTLY ' + str(num_choices) + ' choices.' if num_choices else ''}
- The correct answer must be one of the listed choices.
- Each question's "question" field MUST be semantically and syntactically unique from all others.
- Before finalizing, scan all questions and ensure no duplicates or paraphrases.
- If any repeats are found, regenerate those specific items.
- For subjective questions such as essays and fill-in-the-blank, ensure the keywords field is comprehensive and representative. Include all acceptable variations, synonyms, key concepts, and important phrases that a correct answer might contain. These keywords will be used to assess responses, so the list must cover as many valid angles as possible.

""".strip()


def get_dynamic_prompt(
    topic: Optional[str] = None,
    quiz_type: Optional[List[Literal["mcq", "sata", "tf", "fitb", "essay"]]] = None,
    num_questions: Optional[int] = None,
    options_per_question: Optional[int] = None,
    answer_required: bool = True,
    explanation_required: bool = True,
    source_material: Optional[str] = None,
    file_intent: Optional[Literal["study_material", "existing_quiz"]] = None,
    user_additional_instructions: Optional[str] = None,
) -> str:
    """
    Returns the human prompt based on user-provided inputs.
    """
    lines = ["Generate a quiz using the details below."]

    if topic:
        lines.append(f"Topic: {topic}")
    if quiz_type:
        lines.append(f"Type of Quiz: {', '.join(quiz_type)}")
    else:
        lines.append("(The quiz type has not been specified. Infer the best type based on the material.)")
    if num_questions is not None:
        lines.append(f"Number of Questions: {num_questions}")
    if options_per_question is not None:
        lines.append(f"Number of options per Question: {options_per_question}")
    if source_material:
        lines.append("Source Material:")
        lines.append(source_material)
        if file_intent == "existing_quiz" and not quiz_type:
            lines.append("(The material appears to be an existing quiz. Determine its type automatically, clean it up accordingly and convert only)")
    if user_additional_instructions:
        lines.append("Additional Instructions:")
        lines.append(user_additional_instructions)
    lines.append(f"\nAnswer Required: {answer_required}\nExplanation Required: {explanation_required}")
    lines.append("\nPlease return only JSON that validates against the schema.")
    return "\n".join(lines)


