# Copyright (c) 2026 Monli. All rights reserved.

"""Purchase entities."""

from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Column, Numeric, UniqueConstraint
from sqlmodel import Field, Relationship

from monli.entities.base_entity import TenantMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from monli.entities.ingredient_entity import Ingredient
    from monli.entities.supplier_entity import Supplier


class Purchase(UUIDMixin, TenantMixin, TimestampMixin, table=True):
    """Represents a supplier purchase that increases ingredient inventory."""

    __tablename__ = "purchases" # type: ignore

    supplier_id: UUID | None = Field(
        default=None,
        foreign_key="suppliers.id",
        index=True,
    )
    purchased_on: date = Field(default_factory=date.today, nullable=False)
    total_amount: Decimal = Field(
        default=Decimal("0.00"),
        sa_column=Column(Numeric(12, 2), nullable=False),
    )
    notes: str | None = Field(default=None, max_length=500)

    supplier: "Supplier" = Relationship(back_populates="purchases")
    ingredients: list["PurchaseIngredient"] = Relationship(back_populates="purchase")


class PurchaseIngredient(UUIDMixin, TenantMixin, TimestampMixin, table=True):
    """Links a purchase to an ingredient, quantity, and unit cost."""

    __tablename__ = "purchase_ingredients" # type: ignore
    # __table_args__ = (
    #     UniqueConstraint("purchase_id", "ingredient_id", name="uq_purchase_ingredient"),
    # )

    purchase_id: UUID = Field(foreign_key="purchases.id", index=True)
    ingredient_id: UUID = Field(foreign_key="ingredients.id", index=True)
    quantity: Decimal = Field(sa_column=Column(Numeric(12, 3), nullable=False))
    unit_cost: Decimal = Field(sa_column=Column(Numeric(12, 2), nullable=False))

    purchase: "Purchase" = Relationship(back_populates="ingredients")
    ingredient: "Ingredient" = Relationship(back_populates="purchase_links")
