"""
EcoSense Carbon Footprint Platform – FastAPI application entry point.

Initialises Firebase Admin SDK, configures CORS, registers all API
routers, and exposes a health-check endpoint.
"""

from __future__ import annotations

import json
import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import firebase_admin  # type: ignore[import-untyped]
from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ---------------------------------------------------------------------------
# Environment & logging
# ---------------------------------------------------------------------------

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger("ecosense")


# ---------------------------------------------------------------------------
# Firebase initialisation helper
# ---------------------------------------------------------------------------

def _init_firebase() -> None:
    """Initialise the Firebase Admin SDK from environment variables.

    Builds a service-account certificate dict from individual env vars
    (matching the .env.example layout) and calls
    ``firebase_admin.initialize_app``.  If Firebase is already
    initialised the call is silently skipped.
    """
    if firebase_admin._apps:  # noqa: SLF001 – already initialised
        logger.info("Firebase Admin SDK already initialised.")
        return

    project_id = os.environ.get("FIREBASE_PROJECT_ID", "")
    private_key = os.environ.get("FIREBASE_PRIVATE_KEY", "")
    client_email = os.environ.get("FIREBASE_CLIENT_EMAIL", "")

    if not all([project_id, private_key, client_email]):
        logger.warning(
            "Firebase credentials are incomplete – Firestore endpoints "
            "will fail at runtime.  Set FIREBASE_PROJECT_ID, "
            "FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL."
        )
        return

    # The private key is typically stored with literal "\n" in env vars;
    # replace them with real newlines.
    private_key = private_key.replace("\\n", "\n")

    cred_dict = {
        "type": "service_account",
        "project_id": project_id,
        "private_key_id": os.environ.get("FIREBASE_PRIVATE_KEY_ID", ""),
        "private_key": private_key,
        "client_email": client_email,
        "client_id": os.environ.get("FIREBASE_CLIENT_ID", ""),
        "auth_uri": os.environ.get(
            "FIREBASE_AUTH_URI", "https://accounts.google.com/o/oauth2/auth"
        ),
        "token_uri": os.environ.get(
            "FIREBASE_TOKEN_URI", "https://oauth2.googleapis.com/token"
        ),
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": (
            f"https://www.googleapis.com/robot/v1/metadata/x509/"
            f"{client_email}"
        ),
    }

    cred = firebase_admin.credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)
    logger.info("Firebase Admin SDK initialised for project '%s'.", project_id)


# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: startup & shutdown hooks."""
    # ── Startup ──
    logger.info("Starting EcoSense backend …")
    _init_firebase()
    logger.info("EcoSense backend ready.")

    yield

    # ── Shutdown ──
    logger.info("Shutting down EcoSense backend …")


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(
    title="EcoSense API",
    description=(
        "Carbon footprint calculator, AI-powered eco-insights, "
        "challenges, and a community leaderboard."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")

allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    frontend_url,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────
from routes.footprint import router as footprint_router  # noqa: E402
from routes.ai_insights import router as insights_router  # noqa: E402
from routes.leaderboard import router as leaderboard_router  # noqa: E402
from routes.challenges import router as challenges_router  # noqa: E402

app.include_router(footprint_router)
app.include_router(insights_router)
app.include_router(leaderboard_router)
app.include_router(challenges_router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get(
    "/",
    tags=["Health"],
    summary="Health check",
    description="Returns the service status and version.",
)
async def health_check() -> dict:
    """Simple liveness probe."""
    return {
        "status": "healthy",
        "service": "EcoSense API",
        "version": "1.0.0",
    }


# ---------------------------------------------------------------------------
# Global exception handlers
# ---------------------------------------------------------------------------

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    """Catch unhandled ``ValueError`` exceptions and return 422."""
    logger.warning("ValueError at %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": str(exc)},
    )


@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unexpected server errors."""
    logger.error("Unhandled error at %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred."},
    )


# ---------------------------------------------------------------------------
# Direct execution
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "8000")),
        reload=True,
    )
