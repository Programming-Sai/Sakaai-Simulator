from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import health, generate, evaluate  # your route modules



app = FastAPI(
    title="Sakaai Simulator",
    description="LMS-style AI quiz generator + evaluator inspired by Sakai. Upload materials, generate questions, assess responses. Simulates real quiz workflows.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




app.include_router(health.router, tags=["Health"])
app.include_router(generate.router, tags=["Generate"])
# app.include_router(evaluate.router, tags=["Evaluate"])



@app.on_event("startup")
async def startup_event():
    print("Starting Sakaai Simulator...")

@app.on_event("shutdown")
async def shutdown_event():
    print("Shutting down gracefully...")


"""
{
  "topic": {
    "type": "string",
    "required": false,
    "description": "High-level subject of the quiz (e.g. “Photosynthesis”)."
  },
  "quiz_type": {
    "type": "string[]",
    "required": false,
    "description": "List of formats to include. Valid values: [“mcq”, “sata”, “tf”, “fitb”, “essay”]."
  },
  "num_questions": {
    "type": "integer",
    "required": false,
    "description": "Total number of questions to generate."
  },
  "num_of_options_per_question": {
    "type": "integer",
    "required": false,
    "description": "For MCQ/SATA types, how many choices each should have."
  },
  "answer_required": {
    "type": "boolean",
    "required": true,
    "description": "Whether each question must include a correct answer field."
  },
  "explanation_required": {
    "type": "boolean",
    "required": true,
    "description": "Whether each question must include a short explanation field."
  },
  "source_material": {
    "type": "string",
    "required": false,
    "description": "Either the raw text or a filepath/URL to use as source material."
  },
  "file_intent": {
    "type": "string",
    "required": false,
    "description": "Either “study_material” (generate new quiz) or “existing_quiz” (parse and convert an existing quiz)."
  },
  "user_additional_instructions": {
    "type": "string",
    "required": false,
    "description": "Any extra guidance, e.g. “Focus on light vs dark reactions.”"
  }
}


"""


"""
SYSTEM:
You are an AI Quiz Generator.  You MUST output **exactly** valid JSON matching the schema below.

--- begin JSON SCHEMA ---
{{ quiz_generation_response_schema }}
--- end JSON SCHEMA ---

**Field Definitions (glossary):**
{% for name, info in parameter_glossary.items() %}
- **{{ name }}** ({{ info.type }}){% if info.required %} **[Required]**{% endif %}: {{ info.description }}
{% endfor %}

**QUICK REFERENCE:**
- **quiz_type** values map to these item schemas:
  - “mcq” → MCQQuiz  
  - “sata” → SATAQuiz  
  - “tf” → TFQuiz  
  - “fitb” → FITBSimpleQuiz or FITBKeywordQuiz (depending on keywords vs single answer)  
  - “essay” → EssayQuiz  

**RULES:**
1. **Do not** output any fields or values outside the given schema.
2. If `"file_intent": "existing_quiz"`, parse that quiz file and **only** convert it—do not generate new questions.
3. If `"quiz_type"` is provided, generate **only** those types, in **any** order if none is specified.
4. If `"quiz_type"` is missing, infer the best format(s) from the source material.
5. Always honor `"answer_required"` and `"explanation_required"`.
6. Do not ask clarifying questions; assume the provided inputs are correct.

END SYSTEM.

"""

"""
{{system_prompt}}

HUMAN:
Generate a quiz using the details below.

{% if topic %}
Topic: {{ topic }}
{% endif %}

{% if quiz_type %}
Type of Quiz: {{ quiz_type }}
{% else %}
(The quiz type has not been specified. Infer the best type based on the material.)
{% endif %}

{% if num_questions %}
Number of Questions: {{ num_questions }}
{% endif %}

{% if options_per_question %}
Options per Question: {{ options_per_question }}
{% endif %}

{% if source_material %}
Source Material:
{{ source_material }}

{% if source_is_existing_quiz and not quiz_type %}
(The material appears to be an existing quiz. Determine its type automatically and clean it up accordingly.)
{% endif %}
{% endif %}

{% if user_additional_instructions %}
Additional Instructions:
{{ user_additional_instructions }}
{% endif %}

Please:
- Only use the information provided or clearly implied.
- Return the quiz in the standard JSON format.


Remember to output **only** JSON that validates against the schema.

"""