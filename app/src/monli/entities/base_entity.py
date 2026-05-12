# Copyright (c) 2026 Monli. All rights reserved.

"""Shared entity mixins."""

from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    """Return a timezone-aware UTC timestamp for entity defaults."""
    return datetime.now(UTC)


class UUIDMixin(SQLModel):
    """Adds a UUID primary key to an entity."""

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)


class TimestampMixin(SQLModel):
    """Adds creation and update timestamps to an entity."""

    created_at: datetime = Field(default_factory=utc_now, nullable=False)
    updated_at: datetime = Field(default_factory=utc_now, nullable=False)


class TenantMixin(SQLModel):
    """Adds tenant ownership to entities stored in shared tables."""

    tenant_id: UUID = Field(foreign_key="tenants.id", index=True, nullable=False)
