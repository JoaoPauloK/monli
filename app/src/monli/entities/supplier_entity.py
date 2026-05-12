# Copyright (c) 2026 Monli. All rights reserved.

"""Supplier entity."""

from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship

from monli.entities.base_entity import TenantMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from monli.entities.ingredient_entity import Ingredient
    from monli.entities.purchase_entity import Purchase


class Supplier(UUIDMixin, TenantMixin, TimestampMixin, table=True):
    """Represents a supplier that provides ingredients to the business."""

    __tablename__ = "suppliers" # type: ignore

    name: str = Field(min_length=1, max_length=120, index=True)
    email: str | None = Field(default=None, max_length=255, index=True)
    phone: str | None = Field(default=None, max_length=32)
    notes: str | None = Field(default=None, max_length=500)

    ingredients: list["Ingredient"] = Relationship(back_populates="supplier")
    purchases: list["Purchase"] = Relationship(back_populates="supplier")
