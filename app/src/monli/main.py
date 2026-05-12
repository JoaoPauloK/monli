# Copyright (c) 2026 Monli. All rights reserved.

"""FastAPI application factory."""

import os
import sys

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
print(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from monli.api.routes import api_router
from monli.settings import settings

@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    print("Starting up...")
    yield
    print("Shutting down...")


def create_app() -> FastAPI:
    """Create the Monli FastAPI application."""
    app = FastAPI(title="Monli API", version="0.1.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        # allow_origins=[settings.app_env == 'development' and '*' or settings.frontend_url],
        allow_origins=['*'],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)
    return app

print("Creating app...")
app = create_app()
print(app)