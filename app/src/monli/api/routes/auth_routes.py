# Copyright (c) 2026 Monli. All rights reserved.

"""Authentication API routes."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlmodel import Session

from monli.api.controllers import AuthController
from monli.api.dependencies import get_current_user
from monli.api.schemas import UserCreate, UserLogin, UserRead
from monli.api.security import create_access_token, create_refresh_token, decode_token
from monli.database import get_session
from monli.entities import Tenant, User
from monli.services.auth_service import AuthService
from monli.settings import settings

router = APIRouter(prefix="/auth", tags=["auth"])

_ACCESS_MAX_AGE = settings.access_token_expire_minutes * 60
_REFRESH_MAX_AGE = settings.refresh_token_expire_days * 86400


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    secure = settings.app_env != "development"
    response.set_cookie(
        "access_token",
        access_token,
        httponly=True,
        secure=secure,
        samesite="lax",
        max_age=_ACCESS_MAX_AGE,
        path="/",
    )
    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        secure=secure,
        samesite="lax",
        max_age=_REFRESH_MAX_AGE,
        path="/api/v1/auth/refresh",
    )


def _with_tenant_name(user_read: UserRead, session: Session) -> UserRead:
    tenant = session.get(Tenant, user_read.tenant_id)
    return user_read.model_copy(update={"tenant_name": tenant.name if tenant else ""})


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserCreate,
    response: Response,
    session: Annotated[Session, Depends(get_session)],
) -> UserRead:
    """Create a new tenant and user; return user info with auth cookies set."""
    controller = AuthController(AuthService(session))
    try:
        user, tenant = controller.register(payload)
    except ValueError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc

    access_token = create_access_token(str(user.id), str(user.tenant_id))
    refresh_token = create_refresh_token(str(user.id), str(user.tenant_id))
    _set_auth_cookies(response, access_token, refresh_token)
    return user.model_copy(update={"tenant_name": tenant.name})


@router.post("/login", response_model=UserRead)
async def login(
    payload: UserLogin,
    response: Response,
    session: Annotated[Session, Depends(get_session)],
) -> UserRead:
    """Authenticate user; return user info with auth cookies set."""
    controller = AuthController(AuthService(session))
    try:
        user = controller.login(payload)
    except ValueError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(exc)) from exc

    access_token = create_access_token(str(user.id), str(user.tenant_id))
    refresh_token = create_refresh_token(str(user.id), str(user.tenant_id))
    _set_auth_cookies(response, access_token, refresh_token)
    return _with_tenant_name(user, session)


@router.post("/refresh")
async def refresh(
    request: Request,
    response: Response,
    session: Annotated[Session, Depends(get_session)],
) -> dict:
    """Issue a new access token from a valid refresh token."""
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No refresh token.")

    payload = decode_token(token, token_type="refresh")
    user = session.get(User, UUID(payload.sub))
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token.")

    secure = settings.app_env != "development"
    access_token = create_access_token(str(user.id), str(user.tenant_id))
    response.set_cookie(
        "access_token",
        access_token,
        httponly=True,
        secure=secure,
        samesite="lax",
        max_age=_ACCESS_MAX_AGE,
        path="/",
    )
    return {"ok": True}


@router.post("/logout")
async def logout(response: Response) -> dict:
    """Clear auth cookies."""
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/api/v1/auth/refresh")
    return {"ok": True}


@router.get("/me", response_model=UserRead)
async def me(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
) -> UserRead:
    """Return the currently authenticated user."""
    user_read = UserRead.model_validate(current_user)
    return _with_tenant_name(user_read, session)
