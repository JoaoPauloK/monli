# Copyright (c) 2026 Monli. All rights reserved.

"""JWT and password security utilities."""

from datetime import UTC, datetime, timedelta
import base64

import hashlib
from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext

from monli.api.schemas import TokenPayload
from monli.settings import settings

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def _prepare_password(plain: str) -> str:
    sha256_hash = hashlib.sha256(plain.encode('utf-8')).digest()
    return base64.b64encode(sha256_hash).decode('utf-8')


def hash_password(plain: str) -> str:
    """Return a bcrypt hash of the given password."""
    return _pwd_context.hash(_prepare_password(plain))


def verify_password(plain: str, hashed: str) -> bool:
    """Return True when plain matches the stored bcrypt hash."""
    return _pwd_context.verify(_prepare_password(plain), hashed)


def create_access_token(user_id: str, tenant_id: str) -> str:
    """Return a short-lived JWT access token."""
    expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode(
        {"sub": user_id, "tenant_id": tenant_id, "type": "access", "exp": expire},
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def create_refresh_token(user_id: str, tenant_id: str) -> str:
    """Return a long-lived JWT refresh token."""
    expire = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)
    return jwt.encode(
        {"sub": user_id, "tenant_id": tenant_id, "type": "refresh", "exp": expire},
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def decode_token(token: str, *, token_type: str = "access") -> TokenPayload:
    """Decode and validate a JWT; raise 401 if invalid or wrong type."""
    try:
        data = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token.") from exc
    if data.get("type") != token_type:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token type.")
    return TokenPayload(**data)
