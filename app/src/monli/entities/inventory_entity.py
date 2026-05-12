# Copyright (c) 2026 Monli. All rights reserved.

"""Inventory entity."""

from decimal import Decimal
from enum import StrEnum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import CheckConstraint, Column, Numeric
from sqlmodel import Field, Relationship

from monli.entities.base_entity import TenantMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from monli.entities.ingredient_entity import Ingredient
    from monli.entities.product_entity import Product


class InventoryItemType(StrEnum):
    """Types of items that can be tracked in inventory."""

    INGREDIENT = "ingredient"
    PRODUCT = "product"


class InventoryItem(UUIDMixin, TenantMixin, TimestampMixin, table=True):
    """Tracks available quantity for either one ingredient or one product."""

    __tablename__ = "inventory" # type: ignore
    __table_args__ = (
        CheckConstraint(
            "(item_type = 'INGREDIENT' AND ingredient_id IS NOT NULL "
            "AND product_id IS NULL) OR "
            "(item_type = 'PRODUCT' AND product_id IS NOT NULL "
            "AND ingredient_id IS NULL)",
            name="ck_inventory_single_item_reference",
        ),
    )

    item_type: InventoryItemType = Field(nullable=False, index=True)
    ingredient_id: UUID | None = Field(
        default=None,
        foreign_key="ingredients.id",
        index=True,
    )
    product_id: UUID | None = Field(default=None, foreign_key="products.id", index=True)
    quantity: Decimal = Field(
        default=Decimal("0.000"),
        sa_column=Column(Numeric(12, 3), nullable=False),
    )
    minimum_quantity: Decimal = Field(
        default=Decimal("0.000"),
        sa_column=Column(Numeric(12, 3), nullable=False),
    )

    ingredient: "Ingredient" = Relationship(back_populates="inventory_items")
    product: "Product" = Relationship(back_populates="inventory_items")
