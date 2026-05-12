# Copyright (c) 2026 Monli. All rights reserved.

"""Tenant entity."""

from sqlmodel import Field

from monli.entities.base_entity import TimestampMixin, UUIDMixin


class Tenant(UUIDMixin, TimestampMixin, table=True):
    """Represents one isolated business workspace in the shared database."""

    __tablename__ = "tenants" # type: ignore

    name: str = Field(min_length=1, max_length=120, index=True)
    slug: str = Field(unique=True, min_length=1, max_length=80, index=True)
    is_active: bool = Field(default=True, nullable=False)
