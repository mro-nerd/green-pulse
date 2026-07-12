from fastapi import FastAPI

app = FastAPI(
    title="EcoSphere Core API",
    description="Backend services for the EcoSphere ESG Management Platform",
    version="1.0.0",
)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the EcoSphere Core API",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "core-backend"}
