# Copyright (c) 2026 Monli. All rights reserved.

"""Supplier repository."""

from collections.abc import Sequence
from uuid import UUID

from sqlmodel import Session, select

from monli.entities import Supplier
from monli.repositories.base_repository import TenantScopedRepository


class SupplierRepository(TenantScopedRepository[Supplier]):
    """Persistence operations for suppliers."""

    def __init__(self, session: Session, tenant_id: UUID) -> None:
        super().__init__(session, Supplier, tenant_id)

    def search_by_name(self, name: str) -> Sequence[Supplier]:
        """Return suppliers whose names contain the given text."""
        statement = select(Supplier).where(
            Supplier.tenant_id == self.tenant_id,
            Supplier.name.ilike(f"%{name}%"), # type: ignore[attr-defined]
        )
        return self.session.exec(statement).all()

    def get_by_email(self, email: str) -> Supplier | None:
        """Return a supplier by email."""
        statement = select(Supplier).where(
            Supplier.tenant_id == self.tenant_id,
            Supplier.email == email,
        )
        return self.session.exec(statement).first()
