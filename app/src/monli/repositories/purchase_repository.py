# Copyright (c) 2026 Monli. All rights reserved.

"""Purchase repository."""

from collections.abc import Sequence
from datetime import date
from uuid import UUID

from sqlmodel import Session, select

from monli.entities import Purchase
from monli.repositories.base_repository import TenantScopedRepository


class PurchaseRepository(TenantScopedRepository[Purchase]):
    """Persistence operations for supplier purchases."""

    def __init__(self, session: Session, tenant_id: UUID) -> None:
        super().__init__(session, Purchase, tenant_id)

    def list_by_supplier(self, supplier_id: UUID) -> Sequence[Purchase]:
        """Return purchases linked to one supplier."""
        statement = select(Purchase).where(
            Purchase.tenant_id == self.tenant_id,
            Purchase.supplier_id == supplier_id,
        )
        return self.session.exec(statement).all()

    def list_between(self, start_date: date, end_date: date) -> Sequence[Purchase]:
        """Return purchases within an inclusive date range."""
        statement = select(Purchase).where(
            Purchase.tenant_id == self.tenant_id,
            Purchase.purchased_on >= start_date,
            Purchase.purchased_on <= end_date,
        )
        return self.session.exec(statement).all()
