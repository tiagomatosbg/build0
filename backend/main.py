from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Dict

app = FastAPI(
    title="Pessoas API",
    description="API for the Pessoas Recruitment and Selection Platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root() -> Dict[str, str]:
    """
    Root endpoint to verify API is running
    """
    return {"message": "Welcome to Pessoas API"}

@app.get("/health")
async def health_check() -> JSONResponse:
    """
    Health check endpoint
    """
    return JSONResponse(
        content={
            "status": "healthy",
            "version": "1.0.0"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 