# Copyright (c) 2026 Monli. All rights reserved.

"""Selling entities."""

from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Column, Numeric, UniqueConstraint
from sqlmodel import Field, Relationship

from monli.entities.base_entity import TenantMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from monli.entities.customer_entity import Customer
    from monli.entities.product_entity import Product


class Selling(UUIDMixin, TenantMixin, TimestampMixin, table=True):
    """Represents a customer sale that decreases product inventory."""

    __tablename__ = "sellings" # type: ignore

    customer_id: UUID | None = Field(
        default=None,
        foreign_key="customers.id",
        index=True,
    )
    sold_on: date = Field(default_factory=date.today, nullable=False)
    total_amount: Decimal = Field(
        default=Decimal("0.00"),
        sa_column=Column(Numeric(12, 2), nullable=False),
    )
    notes: str | None = Field(default=None, max_length=500)

    customer: "Customer" = Relationship(back_populates="sellings")
    products: list["SellingProduct"] = Relationship(back_populates="selling")


class SellingProduct(UUIDMixin, TenantMixin, TimestampMixin, table=True):
    """Links a sale to a product, quantity, and unit price."""

    __tablename__ = "selling_products" # type: ignore
    __table_args__ = (
        UniqueConstraint("selling_id", "product_id", name="uq_selling_product"),
    )

    selling_id: UUID = Field(foreign_key="sellings.id", index=True)
    product_id: UUID = Field(foreign_key="products.id", index=True)
    quantity: Decimal = Field(sa_column=Column(Numeric(12, 3), nullable=False))
    unit_price: Decimal = Field(sa_column=Column(Numeric(12, 2), nullable=False))

    selling: "Selling" = Relationship(back_populates="products")
    product: "Product" = Relationship(back_populates="selling_links")
