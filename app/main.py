from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routes import health, generate, evaluate  # your route modules
import os
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
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
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Please try again later."},
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



@app.on_event("startup")
async def startup_event():
    print(f"Starting {APP_NAME}...")

@app.on_event("shutdown")
async def shutdown_event():
    print("Shutting down gracefully...")
