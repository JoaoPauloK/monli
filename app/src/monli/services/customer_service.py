# Copyright (c) 2026 Monli. All rights reserved.

"""Customer business service."""

from collections.abc import Sequence
from uuid import UUID

from monli.entities import Customer
from monli.repositories import CustomerRepository


class CustomerService:
    """Manages customer CRUD for a tenant."""

    def __init__(self, customer_repository: CustomerRepository) -> None:
        self.customer_repository = customer_repository
        self.tenant_id = customer_repository.tenant_id

    def create(self, *, name: str, email: str | None, phone: str | None, notes: str | None) -> Customer:
        return self.customer_repository.add(
            Customer(
                tenant_id=self.tenant_id,
                name=name,
                email=email,
                phone=phone,
                notes=notes,
            )
        )

    def list(self) -> Sequence[Customer]:
        return self.customer_repository.list()

    def get(self, customer_id: UUID) -> Customer | None:
        return self.customer_repository.get(customer_id)

    def update(self, customer_id: UUID, values: dict) -> Customer | None:
        customer = self.customer_repository.get(customer_id)
        if customer is None:
            return None
        return self.customer_repository.update(customer, {k: v for k, v in values.items() if v is not None})

    def delete(self, customer_id: UUID) -> bool:
        customer = self.customer_repository.get(customer_id)
        if customer is None:
            return False
        self.customer_repository.delete(customer)
        return True
