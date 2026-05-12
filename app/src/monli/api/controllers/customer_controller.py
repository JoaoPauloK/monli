# Copyright (c) 2026 Monli. All rights reserved.

"""Customer API controller."""

from collections.abc import Sequence
from uuid import UUID

from monli.entities import Customer
from monli.services.customer_service import CustomerService


class CustomerController:
    """Coordinates customer HTTP operations."""

    def __init__(self, customer_service: CustomerService) -> None:
        self.customer_service = customer_service

    def create(self, *, name: str, email: str | None, phone: str | None, notes: str | None) -> Customer:
        return self.customer_service.create(name=name, email=email, phone=phone, notes=notes)

    def list(self) -> Sequence[Customer]:
        return self.customer_service.list()

    def get(self, customer_id: UUID) -> Customer | None:
        return self.customer_service.get(customer_id)

    def update(self, customer_id: UUID, values: dict) -> Customer | None:
        return self.customer_service.update(customer_id, values)

    def delete(self, customer_id: UUID) -> bool:
        return self.customer_service.delete(customer_id)
