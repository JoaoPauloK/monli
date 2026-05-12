# Copyright (c) 2026 Monli. All rights reserved.

"""Product entity."""

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Column, Numeric
from sqlmodel import Field, Relationship

from monli.entities.base_entity import TenantMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from monli.entities.inventory_entity import InventoryItem
    from monli.entities.recipe_entity import Recipe
    from monli.entities.selling_entity import SellingProduct


class Product(UUIDMixin, TenantMixin, TimestampMixin, table=True):
    """Represents a product produced by recipes and sold to customers."""

    __tablename__ = "products" # type: ignore

    name: str = Field(min_length=1, max_length=120, index=True)
    description: str | None = Field(default=None, max_length=500)
    sale_price: Decimal = Field(
        default=Decimal("0.00"),
        sa_column=Column(Numeric(12, 2), nullable=False),
    )
    estimated_cost: Decimal = Field(
        default=Decimal("0.00"),
        sa_column=Column(Numeric(12, 2), nullable=False),
    )
    is_active: bool = Field(default=True, nullable=False)

    recipe: "Recipe" = Relationship(back_populates="product")
    selling_links: list["SellingProduct"] = Relationship(back_populates="product")
    inventory_items: list["InventoryItem"] = Relationship(back_populates="product")
