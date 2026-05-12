# Copyright (c) 2026 Monli. All rights reserved.

"""FastAPI dependency helpers."""

from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from sqlmodel import Session

from monli.api.security import decode_token
from monli.database import get_session
from monli.entities import User


async def get_current_user(
    request: Request,
    session: Annotated[Session, Depends(get_session)],
) -> User:
    """Return the authenticated user from the access token cookie."""
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated.")
    payload = decode_token(token)
    user = session.get(User, UUID(payload.sub))
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User inactive or not found.")
    return user
