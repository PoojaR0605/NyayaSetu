
"""
NYAYASETU FastAPI Application
Main application entry point.
"""

import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from app.core.config import get_settings
from app.core.logging import setup_logging, get_logger
from app.db.session import init_db, check_db_connection

from app.api.v1 import (
    auth,
    sessions,
    assessments,
    legal_resources,
    document_analysis,
    nearby_lawyers,
)

settings = get_settings()
logger = setup_logging()
app_logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize application services on startup."""
    app_logger.info(
        "Starting %s v%s",
        settings.APP_NAME,
        settings.APP_VERSION,
    )
    app_logger.info("Environment: %s", settings.APP_ENV)

    try:
        init_db()

        if check_db_connection():
            app_logger.info("Database connection successful")
        else:
            app_logger.error("Database connection failed")

    except Exception:
        app_logger.exception("Database initialization error")

    # Verify case-strength route is registered.
    expected_path = "/api/v1/sessions/{session_token}/case-strength"
    registered_paths = {
        route.path
        for route in app.routes
        if hasattr(route, "path")
    }
    if expected_path in registered_paths:
        app_logger.info("Case-strength endpoint registered: GET %s", expected_path)
    else:
        app_logger.error("Case-strength endpoint NOT registered: %s", expected_path)

    yield

    app_logger.info("Shutting down application")


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "AI-powered legal aid discovery, case triage, "
        "and preliminary legal document review."
    ),
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
)


# Cross-origin requests from the frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log request paths, response codes, and durations."""
    start_time = time.time()

    response = await call_next(request)

    duration = time.time() - start_time
    app_logger.info(
        "%s %s - Status: %s - Duration: %.3fs",
        request.method,
        request.url.path,
        response.status_code,
        duration,
    )

    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    """Return JSON-safe request validation errors."""
    app_logger.warning(
        "Validation error on %s %s",
        request.method,
        request.url.path,
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "detail": jsonable_encoder(exc.errors()),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(
    request: Request,
    exc: Exception,
):
    """Log unexpected errors and return a safe response."""
    app_logger.error(
        "Unhandled exception on %s %s",
        request.method,
        request.url.path,
        exc_info=True,
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": (
                str(exc)
                if settings.DEBUG
                else "An unexpected error occurred"
            ),
        },
    )


@app.get("/", tags=["Root"])
async def root():
    """Return basic API information."""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "status": "running",
        "docs": (
            "/api/docs"
            if settings.DEBUG
            else "disabled in production"
        ),
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Report API and database health."""
    db_status = check_db_connection()

    return {
        "status": "healthy" if db_status else "unhealthy",
        "version": settings.APP_VERSION,
        "checks": {
            "database": (
                "connected" if db_status else "disconnected"
            ),
            "api": "operational",
        },
        "timestamp": time.time(),
    }


@app.get("/api/v1/status", tags=["Status"])
async def api_status():
    """Return API status and feature flags."""
    return {
        "api_version": "v1",
        "app_version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "demo_mode": settings.DEMO_MODE,
        "features": {
            "authentication": True,
            "conversations": True,
            "assessments": True,
            "legal_resources": True,
            "document_analysis": True,
            "admin": True,
        },
    }


# Register the existing API routers.
app.include_router(
    auth.router,
    prefix="/api/v1/auth",
    tags=["Authentication"],
)

app.include_router(
    sessions.router,
    prefix="/api/v1/sessions",
    tags=["Sessions"],
)

app.include_router(
    assessments.router,
    prefix="/api/v1/assessments",
    tags=["Assessments"],
)

app.include_router(
    legal_resources.router,
    prefix="/api/v1/legal-resources",
    tags=["Legal Resources"],
)

app.include_router(
    document_analysis.router,
    prefix="/api/v1",
)

app.include_router(
    nearby_lawyers.router,
    prefix="/api/v1/nearby-lawyers",
    tags=["Nearby Lawyers"],
)


if __name__ == "__main__":
    import uvicorn

    app_logger.info(
        "Starting server on %s:%s",
        settings.HOST,
        settings.PORT,
    )

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
