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
