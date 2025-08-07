# import app.utils.nltk_setup
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routes import feedback, health, generate #, evaluate  
import os
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
# from slowapi.util import get_remote_address, get_retry_after
from app.utils.logger import log_event
from app.utils.rate_limiter import limiter

APP_NAME=os.getenv("APP_NAME")
# Define limiter (used ONLY for routes that explicitly decorate with @limiter.limit)

app = FastAPI(
    title=APP_NAME,
    description="LMS-style AI quiz generator + evaluator inspired by Sakai. Upload materials, generate questions, assess responses. Simulates real quiz workflows.",
    version="1.0.0"
)


# Global rate limit error handler (APPLIES TO ENTIRE APP)
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    now = datetime.now(timezone.utc)
    tomorrow = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    seconds_until_midnight = int((tomorrow - now).total_seconds())

    try:
        form = await request.form()
        request_id = form.get("request_id", "Unknown")
    except Exception:
        request_id = "Unknown"

    log_event(
        event_type="RateLimitExceeded",
        request_id=request_id,
        client_ip=request.client.host,
        path=request.url.path,
        method=request.method,
        retry_after=seconds_until_midnight,
        user_agent=request.headers.get("user-agent", "unknown"),
        rate_limit=os.getenv("MAX_REQUEST_PER_DAILY", "5/day")
    )
    
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Rate limit exceeded. Please try again later.",
            "retry_after": seconds_until_midnight
        },
        headers={
            "Retry-After": str(seconds_until_midnight)
        }
    )



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
# limiter.init_app(app)




app.include_router(health.router, tags=["Health"])
app.include_router(generate.router, tags=["Generate"])
# app.include_router(evaluate.router, tags=["Evaluate"])
app.include_router(feedback.router, tags=["Feedback"])



@app.on_event("startup")
async def startup_event():
    print(f"Starting {APP_NAME}...")

@app.on_event("shutdown")
async def shutdown_event():
    print("Shutting down gracefully...")
