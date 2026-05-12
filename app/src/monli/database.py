# Copyright (c) 2026 Monli. All rights reserved.

"""Database session configuration."""

from collections.abc import AsyncIterator

from sqlmodel import Session, create_engine

import monli.entities  # noqa: F401

from monli.settings import settings

engine = create_engine(settings.database_url)


async def get_session() -> AsyncIterator[Session]:
    """Yield a database session for dependency injection."""
    with Session(engine) as session:
        yield session
