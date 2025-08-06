# Sakaai-Simulator

LMS-style AI quiz generator + evaluator inspired by Sakai. Upload materials, generate questions, assess responses. Simulates real quiz workflows.

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Features & Endpoints](#features--endpoints)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [Configuration](#configuration)
6. [Usage Examples](#usage-examples)
7. [Frontend Integration](#frontend-integration)
8. [Logging & Monitoring](#logging--monitoring)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Acknowledgement](#acknowledgements)

---

## Overview

**Sakaai-Simulator** is a **custom-built** backend API that supports:

- **Quiz Generation & Conversion**
  • Generate new quizzes from text, notes, or uploaded docs
  • Convert existing quizzes (DOCX/TXT) into a validated JSON schema

- **Subjective Answer Evaluation**
  • Score essays & fill-in-the-blank responses (0–10 scale)

- **Feedback Collection**
  • Collect user feedback via a modal and persist to Google Sheets

While the **frontend** will emulate Sakai’s quiz-taking and grading UI, this **backend** focuses on AI-driven logic, strict validation, and robust observability.

---

## Features & Endpoints

### 1. Health Check

`GET /health` → `{ "status": "ok" }`

### 2. Quiz Generation / Conversion

`POST /generate` (rate-limited, default **5/day**)
**Form Data** (`multipart/form-data`):

| Field                          | Type      | Req. | Description                                         |
| ------------------------------ | --------- | :--: | --------------------------------------------------- |
| `request_id`                   | string    | Yes  | Client-generated UUID for tracing                   |
| `user_additional_instructions` | string    | Yes  | Main prompt                                         |
| `topic`                        | string    |  No  | High-level subject                                  |
| `quiz_type`                    | string\[] |  No  | `mcq`, `sata`, `tf`, `fitb`, `essay`                |
| `num_questions`                | integer   |  No  | Desired count                                       |
| `options_per_question`         | integer   |  No  | Choices per MCQ/SATA                                |
| `answer_required`              | boolean   | Yes  | Include `answer` field                              |
| `explanation_required`         | boolean   | Yes  | Include `explanation` field                         |
| `file_intent`                  | string    |  No  | `study_material` or `existing_quiz`                 |
| `file`                         | file      |  No  | `.txt`, `.docx`, `.pdf` (server extracts text only) |

**Success (200)**

```json
{
  "model_used": "...",
  "inference_time": 1.23,
  "question_count": 10,
  "attempt_number": 1,
  "token_usage": {
    "prompt_tokens": 2046,
    "completion_tokens": 446,
    "total_tokens": 2492
  },
  "quizzes": [
    /* MCQ/SATA/TF/FITB/Essay items */
  ]
}
```

**Errors**

- `400` Bad Request
- `413` Payload Too Large
- `429` Rate Limit Exceeded (`{ retry_after: <sec until midnight UTC> }`)
- `502`/`503` Internal or model errors

---

### 3. Subjective Evaluation

`POST /evaluate`
**JSON**:

```json
{
  "question": {
    /* EssayQuiz or FITBKeywordQuiz */
  },
  "user_answer": "..."
}
```

**Success (200)**:

```json
{
  "keyword": 8.0,
  "similarity": 9.5,
  "readability": 8.0,
  "structure": 10.0,
  "final_score": 8.88,
  "time_taken": 0.12,
  "word_count": 45,
  "character_count": 256
}
```

---

### 4. Feedback Submission

`POST /feedback`
**JSON**:

```json
{
  "requestId": "…",
  "answers": [
    "What feature made you smile?",
    "What annoyed you most?",
    "Which question felt off?",
    "If you could zap one part, what would it be?",
    "Any final thoughts or rants?"
  ]
}
```

**Success (200)**:

```json
{ "status": "ok", "message": "Feedback recorded" }
```

---

## Tech Stack

- **FastAPI** + **SlowAPI** (async, rate-limited)
- **Groq** + **LangChain** (LLM orchestration)
- **Pydantic** (schema validation)
- **Unstructured** (file → text parsing)
- **RapidFuzz**, **NLTK**, **textstat** (subjective scoring)
- **gspread** + **Google Service Accounts** (feedback storage)

---

## Getting Started

1. **Clone**

   ```bash
   git clone https://github.com/Programming-Sai/Sakaai-Simulator.git
   cd Sakaai-Simulator
   ```

2. **Virtual Env**

   ```bash
   python -m venv venv
   source venv/bin/activate   # macOS/Linux
   venv\Scripts\activate      # Windows
   ```

3. **Install**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure** ➡️ [see **Configuration**](#configuration)
5. **Run**

   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **API Docs** → [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Configuration

Create a `.env`:

```dotenv
GROQ_API_KEY=your_groq_key
MAX_REQUEST_PER_DAILY=5/day
MAX_NUM_QUESTIONS=30

MAX_FILE_SIZE_MB=2
MAX_TOKENS=10000

GOOGLE_SERVICE_ACCOUNT_INFO='{"type":"service_account", … }'
FEEDBACK_SHEET_ID=your_sheet_id
```

---

## Usage Examples

- **Generate Quiz** (cURL):

  ```bash
  curl -X POST http://localhost:8000/generate \
    -F request_id="$(uuidgen)" \
    -F user_additional_instructions="Explain photosynthesis in 5 MCQs" \
    -F quiz_type='["mcq"]' \
    -F num_questions=5
  ```

- **Evaluate Essay**:

  ```bash
  curl -X POST http://localhost:8000/evaluate \
    -H "Content-Type: application/json" \
    -d '{"question":{…},"user_answer":"…"}'
  ```

- **Submit Feedback**:

  ```bash
  curl -X POST http://localhost:8000/feedback \
    -H "Content-Type: application/json" \
    -d '{"request_id":"ID-ONE","answers":[…]}'
  ```

---

## Frontend Integration

Your React/Vue/… app will:

1. **POST** `/generate` ➡️ Render quiz UI
2. **Collect** answers ➡️ **POST** `/evaluate` per question
3. **Show** scores & explanations
4. **Popup modal** for feedback ➡️ **POST** `/feedback`

Use `request_id` (UUID) to correlate logs, evaluations, and feedback.

---

## Logging & Monitoring

All requests are logged as structured JSON (inc. `request_id`, model metadata, token counts, timings).
Rate-limit hits include `retry_after` until UTC midnight.
Optional persistence to Google Sheets for analytics.

---

## Testing

- **Unit**: `pytest`
- **Integration**: test `/generate`, `/evaluate`, `/feedback` via Swagger or HTTP client.
- **Edge Cases**: large files, invalid schemas, rate limits, model failures.

---

## Deployment

- Dockerize your app or directly deploy with **uvicorn** behind a reverse proxy.
- Set env vars in your hosting platform (Render, Heroku, AWS, etc.).
- Monitor logs for structured entries.

---

## Acknowledgements

Powered by Groq, LangChain, FastAPI, Unstructured, RapidFuzz, and the Google Sheets API.
