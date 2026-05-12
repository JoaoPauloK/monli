# Copyright (c) 2026 Monli. All rights reserved.

"""Customer entity."""

from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship

from monli.entities.base_entity import TenantMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from monli.entities.selling_entity import Selling


class Customer(UUIDMixin, TenantMixin, TimestampMixin, table=True):
    """Represents a customer that buys products from the business."""

    __tablename__ = "customers" # type: ignore

    name: str = Field(min_length=1, max_length=120, index=True)
    email: str | None = Field(default=None, max_length=255, index=True)
    phone: str | None = Field(default=None, max_length=32)
    notes: str | None = Field(default=None, max_length=500)

    sellings: list["Selling"] = Relationship(back_populates="customer")
