from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import connect_db, disconnect_db
from app.api import auth as auth_router
from app.api import environmental as environmental_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(
    title="Green-pulse Core API",
    description="Backend services for the Green-Pulse ESG Management Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router.router, prefix="/api/v1")
app.include_router(environmental_router.router, prefix="/api/v1")


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Green-Pulse Core API",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "core-backend"}
