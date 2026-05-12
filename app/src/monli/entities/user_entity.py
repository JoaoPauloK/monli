# Copyright (c) 2026 Monli. All rights reserved.

"""User entity."""

from sqlalchemy import UniqueConstraint
from sqlmodel import Field

from monli.entities.base_entity import TenantMixin, TimestampMixin, UUIDMixin


class User(UUIDMixin, TenantMixin, TimestampMixin, table=True):
    """Represents an application user that authenticates into Monli."""

    __tablename__ = "users" # type: ignore
    __table_args__ = (
        UniqueConstraint("tenant_id", "email", name="uq_users_tenant_email"),
    )

    full_name: str = Field(min_length=1, max_length=120)
    email: str = Field(index=True, max_length=255)
    hashed_password: str = Field(min_length=1, max_length=255)
    is_active: bool = Field(default=True, nullable=False)
    is_superuser: bool = Field(default=False, nullable=False)
