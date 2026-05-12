# Copyright (c) 2026 Monli. All rights reserved.

"""Supplier business service."""

from collections.abc import Sequence
from uuid import UUID

from monli.entities import Supplier
from monli.repositories import SupplierRepository


class SupplierService:
    """Manages supplier CRUD for a tenant."""

    def __init__(self, supplier_repository: SupplierRepository) -> None:
        self.supplier_repository = supplier_repository
        self.tenant_id = supplier_repository.tenant_id

    def create(self, *, name: str, email: str | None, phone: str | None, notes: str | None) -> Supplier:
        return self.supplier_repository.add(
            Supplier(
                tenant_id=self.tenant_id,
                name=name,
                email=email,
                phone=phone,
                notes=notes,
            )
        )

    def list(self) -> Sequence[Supplier]:
        return self.supplier_repository.list()

    def get(self, supplier_id: UUID) -> Supplier | None:
        return self.supplier_repository.get(supplier_id)

    def update(self, supplier_id: UUID, values: dict) -> Supplier | None:
        supplier = self.supplier_repository.get(supplier_id)
        if supplier is None:
            return None
        return self.supplier_repository.update(supplier, {k: v for k, v in values.items() if v is not None})

    def delete(self, supplier_id: UUID) -> bool:
        supplier = self.supplier_repository.get(supplier_id)
        if supplier is None:
            return False
        self.supplier_repository.delete(supplier)
        return True
