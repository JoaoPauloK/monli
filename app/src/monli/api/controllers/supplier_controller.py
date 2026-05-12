# Copyright (c) 2026 Monli. All rights reserved.

"""Supplier API controller."""

from collections.abc import Sequence
from uuid import UUID

from monli.entities import Supplier
from monli.services.supplier_service import SupplierService


class SupplierController:
    """Coordinates supplier HTTP operations."""

    def __init__(self, supplier_service: SupplierService) -> None:
        self.supplier_service = supplier_service

    def create(self, *, name: str, email: str | None, phone: str | None, notes: str | None) -> Supplier:
        return self.supplier_service.create(name=name, email=email, phone=phone, notes=notes)

    def list(self) -> Sequence[Supplier]:
        return self.supplier_service.list()

    def get(self, supplier_id: UUID) -> Supplier | None:
        return self.supplier_service.get(supplier_id)

    def update(self, supplier_id: UUID, values: dict) -> Supplier | None:
        return self.supplier_service.update(supplier_id, values)

    def delete(self, supplier_id: UUID) -> bool:
        return self.supplier_service.delete(supplier_id)
