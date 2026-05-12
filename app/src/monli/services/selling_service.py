# Copyright (c) 2026 Monli. All rights reserved.

"""Selling business service."""

from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlmodel import Session

from monli.entities import Selling, SellingProduct
from monli.repositories import CustomerRepository, ProductRepository, SellingRepository
from monli.services.inventory_service import InventoryService


@dataclass(frozen=True)
class SellingProductInput:
    """Product sold with quantity and unit price."""

    product_id: UUID
    quantity: Decimal
    unit_price: Decimal


class SellingService:
    """Coordinates sales and product inventory updates."""

    def __init__(
        self,
        session: Session,
        customer_repository: CustomerRepository,
        product_repository: ProductRepository,
        selling_repository: SellingRepository,
        inventory_service: InventoryService,
    ) -> None:
        self.session = session
        self.tenant_id = selling_repository.tenant_id
        self.customer_repository = customer_repository
        self.product_repository = product_repository
        self.selling_repository = selling_repository
        self.inventory_service = inventory_service

    def create_selling(
        self,
        products: list[SellingProductInput],
        *,
        customer_id: UUID | None = None,
        sold_on: date | None = None,
        notes: str | None = None,
    ) -> Selling:
        """Create a sale and decrease product inventory."""
        if not products:
            msg = "Selling must have at least one product."
            raise ValueError(msg)

        customer_missing = (
            customer_id is not None
            and self.customer_repository.get(customer_id) is None
        )
        if customer_missing:
            msg = "Customer not found for this tenant."
            raise ValueError(msg)

        total_amount = Decimal("0.00")
        selling = self.selling_repository.add(
            Selling(
                tenant_id=self.tenant_id,
                customer_id=customer_id,
                sold_on=sold_on or date.today(),
                notes=notes,
            ),
            commit=False,
        )

        for product_input in products:
            self._validate_line(product_input)
            product = self.product_repository.get(product_input.product_id)
            if product is None:
                msg = "Product not found for this tenant."
                raise ValueError(msg)

            total_amount += product_input.quantity * product_input.unit_price
            self.session.add(
                SellingProduct(
                    tenant_id=self.tenant_id,
                    selling_id=selling.id,
                    product_id=product.id,
                    quantity=product_input.quantity,
                    unit_price=product_input.unit_price,
                ),
            )
            self.inventory_service.decrease_product(
                product.id,
                product_input.quantity,
                commit=False,
            )

        selling.total_amount = total_amount
        self.session.add(selling)
        self.session.commit()
        self.session.refresh(selling)
        return selling

    def update_selling(
        self,
        selling_id: UUID,
        products: list[SellingProductInput],
        *,
        customer_id: UUID | None = None,
        sold_on: date | None = None,
        notes: str | None = None,
    ) -> Selling:
        """Update a selling and reconcile product inventory."""
        selling = self.selling_repository.get(selling_id)
        if not selling:
            raise ValueError("Selling not found.")

        if not products:
            raise ValueError("Selling must have at least one product.")

        customer_missing = (
            customer_id is not None
            and self.customer_repository.get(customer_id) is None
        )
        if customer_missing:
            raise ValueError("Customer not found for this tenant.")

        old_lines = list(selling.products)

        for line in old_lines:
            self.inventory_service.increase_product(line.product_id, line.quantity, commit=False)

        for line in old_lines:
            self.session.delete(line)
        self.session.flush()

        total_amount = Decimal("0.00")
        for inp in products:
            self._validate_line(inp)
            product = self.product_repository.get(inp.product_id)
            if product is None:
                raise ValueError("Product not found for this tenant.")
            total_amount += inp.quantity * inp.unit_price
            self.session.add(
                SellingProduct(
                    tenant_id=self.tenant_id,
                    selling_id=selling.id,
                    product_id=product.id,
                    quantity=inp.quantity,
                    unit_price=inp.unit_price,
                )
            )
            self.inventory_service.decrease_product(product.id, inp.quantity, commit=False)

        self.selling_repository.update(
            selling,
            {
                "customer_id": customer_id,
                "sold_on": sold_on or date.today(),
                "notes": notes,
                "total_amount": total_amount,
            },
            commit=False,
        )
        self.session.commit()
        self.session.refresh(selling)
        return selling

    def _validate_line(self, product_input: SellingProductInput) -> None:
        if product_input.quantity <= Decimal("0"):
            msg = "Selling quantity must be greater than zero."
            raise ValueError(msg)
        if product_input.unit_price < Decimal("0"):
            msg = "Selling unit price cannot be negative."
            raise ValueError(msg)
