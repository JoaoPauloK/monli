# Copyright (c) 2026 Monli. All rights reserved.

"""Ingredient entity."""

from decimal import Decimal
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Column, Numeric
from sqlmodel import Field, Relationship

from monli.entities.base_entity import TenantMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from monli.entities.inventory_entity import InventoryItem
    from monli.entities.purchase_entity import PurchaseIngredient
    from monli.entities.recipe_entity import RecipeIngredient
    from monli.entities.supplier_entity import Supplier


class Ingredient(UUIDMixin, TenantMixin, TimestampMixin, table=True):
    """Represents a raw material used to produce sellable products."""

    __tablename__ = "ingredients" # type: ignore

    name: str = Field(min_length=1, max_length=120, index=True)
    unit: str = Field(min_length=1, max_length=20)
    unit_cost: Decimal = Field(
        default=Decimal("0.00"),
        sa_column=Column(Numeric(12, 2), nullable=False),
    )
    avg_price: Decimal = Field(
        default=Decimal("0.00"),
        sa_column=Column(Numeric(12, 2), nullable=False),
    )
    last_price: Decimal = Field(
        default=Decimal("0.00"),
        sa_column=Column(Numeric(12, 2), nullable=False),
    )
    supplier_id: UUID | None = Field(default=None, foreign_key="suppliers.id")

    supplier: "Supplier" = Relationship(back_populates="ingredients")
    recipe_links: list["RecipeIngredient"] = Relationship(back_populates="ingredient")
    purchase_links: list["PurchaseIngredient"] = Relationship(
        back_populates="ingredient",
    )
    inventory_items: list["InventoryItem"] = Relationship(back_populates="ingredient")
