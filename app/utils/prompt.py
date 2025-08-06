import json
import math
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


def get_system_prompt(
    num_questions=None,
    num_choices=None,
    quiz_type=None,
    file_intent=None,
    answer_required=True,
    explanation_required=True
) -> str:
    """
    Returns the unified system prompt for quiz generation/conversion with
    production-grade clarity and mode-specific behavior.
    """

    schema = QuizGenerationResponse.model_json_schema()
    schema_text = json.dumps(schema, indent=2)

    glossary_lines = []
    for name, info in PARAMETER_GLOSSARY.items():
        req = "**[Required]**" if info.get("required") else ""
        glossary_lines.append(f"- **{name}** ({info['type']}) {req}: {info['description']}")
    glossary_text = "\n".join(glossary_lines)

    # Mode-specific core instructions
    if file_intent == "existing_quiz":
        mode_instructions = f"""
MODE: CONVERSION (file_intent = "existing_quiz")
You are given a quiz in unstructured or semi-structured format.
Your task is to:
1. Parse EVERY question exactly as it appears in the source material — keep the meaning, correct answers, and choices intact.
2. Correct typos, grammar, and inconsistent formatting — without changing meaning or answer correctness.
3. Standardize structure to match the schema exactly.
4. Preserve all original questions — do not add, remove, merge, or split questions.
5. If quiz type is not provided, deduce it from context. If it is provided, enforce it strictly.
6. Do not introduce new content, extra commentary, or questions not present in the input.
7. Maintain the original logical ordering of questions unless the schema forces a reordering.
"""
    else:
        mode_instructions = f"""
MODE: GENERATION (file_intent = "study_material" or missing)
You are given study notes, text, or a topic.
Your task is to:
1. Generate a quiz fully aligned with the provided material/topic.
2. Cover the scope of the material evenly — avoid clustering questions around only one subtopic.
3. If quiz_type is provided, generate ONLY those types.
4. If quiz_type is missing, intelligently mix question types to test comprehension thoroughly.
5. Generate AT LEAST {math.ceil(1.5 * (num_questions)) if num_questions else '10'} unique questions — never fewer.  
   - Questions must be semantically and syntactically unique.
   - Avoid paraphrasing the same question.
6. For MCQ and SATA types, each question must have EXACTLY {num_choices if num_choices else '4'} choices.
7. The correct answer must ALWAYS appear in the choices.
8. Choices must be plausible and of similar length/style.
9. For essay and fill-in-the-blank questions, provide a comprehensive keywords list with synonyms, alternative phrasing, and all key concepts needed for correct grading.
"""

    return f"""
You are an AI Quiz Processor. Your output must be **exactly valid JSON** matching the schema below.

--- JSON SCHEMA ---
{schema_text}
--- END JSON SCHEMA ---

**FIELD DEFINITIONS (glossary):**
{glossary_text}


**QUICK REFERENCE:**
- **quiz_type** values map to these item schemas:
  - "mcq" → MCQQuiz  
  - "sata" → SATAQuiz  
  - "tf" → TFQuiz  
  - "fitb" → FITBSimpleQuiz or FITBKeywordQuiz  
  - "essay" → EssayQuiz 

  

{"These are the quiz type(s) you MUST use: " + ', '.join(quiz_type) if quiz_type else ''}

**PARAMETER INTERPRETATION & RELATIONSHIPS:**

These parameters control how the quiz is generated or converted.  
All must be followed exactly — no assumptions, no omissions.

- **`user_additional_instructions`** *(string, required)* → The main user-provided guidance or request. Always incorporate this into the quiz generation or conversion process.

- **`topic`** *(string, optional)* → High-level subject of the quiz (e.g., "Photosynthesis"). If present, all questions must directly relate to this topic.

- **`quiz_type`** *(array of strings, optional)* → Restricts output to **only** these formats. Valid values: `mcq`, `sata`, `tf`, `fitb`, `essay`. No other formats are allowed.

- **`num_questions`** *(integer, optional)* → Exact number of questions required in the **final output**.  
  - If present, this is a **hard requirement** — the output must match exactly.  
  - If missing, you must infer an appropriate count based on `source_material` length.

- **`options_per_question`** *(integer, optional)* → Applies **only** to `mcq` and `sata` questions. Each of those must have exactly this many answer choices. Ignore for other types.

- **`answer_required`** *(boolean, required)* → If `true`, every question must include a correct `answer` field. Never omit it.

- **`explanation_required`** *(boolean, required)* → If `true`, every question must include a short `explanation` field that justifies the answer.

- **`file_intent`** *(string, optional)* → Defines the mode of operation:
  - `"study_material"` → Generate **new** questions strictly from the provided `source_material` and/or `user_additional_instructions`.
  - `"existing_quiz"` → **Do not** invent new questions. Instead, parse, clean, and standardize only what is already in `source_material`.

- **`source_material`** *(string, optional)* → The text content to be used as the **sole source** for generation or conversion.  
  - This may be extracted from an uploaded file before being passed here.  
  - Raw file data is never sent to the model — only this processed text.

**RELATIONSHIP RULES:**
1. If both `source_material` and `user_additional_instructions` are provided, use both — but **never introduce knowledge outside these inputs**.
2. If `quiz_type` is given, generate only those types. Never mix in others.
3. `num_questions` + `quiz_type` together define the **question mix** — follow both exactly.
4. `options_per_question` only applies to `mcq` and `sata` types.
5. In `"existing_quiz"` mode, preserve all original answers and question intent — only clean formatting and structure.
6. Never exceed `num_questions`, and never produce fewer unless explicitly allowed by the schema.


BASE RULES (apply in all modes):
- Do NOT output any fields or values not present in the schema.
- Always honor "answer_required" ({answer_required}) and "explanation_required" ({explanation_required}).
- Do not ask clarifying questions — assume inputs are correct.
- The top-level output must be a JSON object with a "quizzes" array.
- For SATA type, the `answer` field MUST be an array, even if it has one element.
- All "question" fields must be completely unique — no duplicates or near-duplicates.
- Perform a final self-check: if duplicates exist, regenerate only those questions before final output.
- NEVER include any text outside of the JSON (no explanations, no code fences, no commentary).

{mode_instructions}

REMINDERS:
- Always respect provided parameters — they override inference.
- Ensure factual correctness and internal consistency between question, choices, answer, and explanation.
- If input material is too short to meet requirements, extrapolate logically but remain faithful to topic/context.
- Any keywords list must be thorough enough to cover most valid correct responses.

---
**SUBJECTIVE QUESTION HANDLING & KEYWORD GUIDELINES**

For any question of type `essay` or `fitb` that requires subjective evaluation:

1. **Keyword Lists as Scoring Rubric**  
   - Provide a `keywords` array containing **all** valid answer terms or concepts, including:  
     - Exact phrases (single words or multi-word phrases).  
     - Synonyms and alternative phrasings.  
     - Any technical terms or key ideas necessary to demonstrate a correct response.  
   - These `keywords` will be used later for fuzzy-match scoring and coverage checks.

2. **Fit-in-the-Blank (FITB) Dual Mode**  
   - **Objective FITB** (single correct fill):  
     - Populate the `answer` field exactly (no `keywords` array).  
     - Do **not** include a `keywords` key.  
   - **Subjective FITB** (multiple acceptable fills):  
     - Omit the `answer` field or set it to `null`.  
     - Populate `keywords` with every valid fill (no `answer`).

3. **How to Generate Keywords**  
   - For each subjective item (`essay` or `fitb`):  
     1. Extract every concept and term from your `explanation`.  
     2. Expand with synonyms or rephrasings.  
     3. Include multi-word phrases where appropriate.  
     4. Exclude any distractors or incorrect terms.  
   - Aim for comprehensive coverage—typically 5–10 keywords for essays; 3–5 for short subjective blanks.

4. **Consistency & Coverage**  
   - Keywords must directly reflect content in the `explanation`.  
   - Ensure no core point in the explanation is missing from `keywords`.  
   - Do **not** supply keywords for objective FITB, and do **not** supply an `answer` for subjective FITB.

**ENFORCE STRICTLY:**  
- `essay` and **subjective** `fitb` → require a non-empty `keywords` array, no `answer`.  
- **Objective** `fitb` → require a single `answer` string, no `keywords`.  
- No free-form text outside the schema.  
- Output only the JSON object.  
---


FINAL INSTRUCTION:
Output ONLY the JSON object — do not include markdown, prose, or any other wrapper.
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
    Builds the dynamic portion of the prompt, supplying concrete task instructions
    based on user input while enforcing schema compliance and operational mode.
    """

    # Mode-specific intro
    if file_intent == "existing_quiz":
        mode_intro = (
            "MODE: Conversion from existing quiz.\n"
            "You are given text representing an existing quiz. Your task is to:\n"
            "1. Parse every question exactly as given.\n"
            "2. Preserve all question text, answer choices, and correct answers exactly — do not alter meaning.\n"
            "3. Fix only typos, inconsistent formatting, and structural irregularities.\n"
            "4. Standardize the output strictly to match the JSON schema.\n"
            "5. Do not create new questions, remove any, or modify correct answers.\n"
            "6. Maintain the original question type where identifiable; infer type only if absolutely necessary.\n"
        )
    else:
        mode_intro = (
            "MODE: New quiz generation.\n"
            "You are given study material and/or user guidance. Your task is to:\n"
            "1. Generate entirely new questions strictly from the provided `source_material` and/or `user_additional_instructions`.\n"
            "2. Do not use knowledge outside the provided material.\n"
            "3. Ensure every question is original, semantically unique, and directly derived from the provided content.\n"
        )

    # Base constraints
    constraints = [
        f"Topic: {topic}" if topic else "Topic: (Infer from provided content)",
        f"Question Types Allowed: {', '.join(quiz_type)}" if quiz_type else "Question Types: (Infer best types from provided content)",
        f"Number of Questions Required: {num_questions}" if num_questions else "Number of Questions: (Infer based on content length and detail)",
        f"Number of Options per Question: {options_per_question} (only applies to MCQ/SATA)" if options_per_question else "Number of Options: (Default to schema rules unless specified)",
        f"Answer Required: {answer_required}",
        f"Explanation Required: {explanation_required}",
    ]

    # Source material
    if source_material:
        constraints.append("SOURCE MATERIAL:\n" + source_material.strip())
    else:
        constraints.append("SOURCE MATERIAL: None provided — rely only on user instructions.")

    # Additional instructions
    if user_additional_instructions:
        constraints.append("ADDITIONAL USER INSTRUCTIONS:\n" + user_additional_instructions.strip())

    # Final compliance reminder
    compliance = (
        "\nIMPORTANT COMPLIANCE RULES:\n"
        "- Always return output that **exactly validates** against the given JSON schema.\n"
        "- Never introduce information not present in `source_material` or `user_additional_instructions`.\n"
        "- For SATA (select all that apply) questions, the `answer` field must always be a JSON array, even if it contains only one element.\n"
        "- All MCQ and SATA questions must have exactly the specified number of options if `options_per_question` is provided.\n"
        "- All generated or converted questions must be semantically unique — no duplicates or rephrasings.\n"
        "- If you cannot fully comply with a parameter, stop and output nothing rather than guessing.\n"
        "- Do not add extra commentary, markdown formatting, or explanatory text outside the JSON structure."
    )

    return "\n".join([
        mode_intro,
        "\n--- TASK PARAMETERS ---",
        "\n".join(constraints),
        compliance
    ])

