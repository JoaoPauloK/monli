# Copyright (c) 2026 Monli. All rights reserved.

"""Selling repository."""

from collections.abc import Sequence
from datetime import date
from uuid import UUID

from sqlmodel import Session, select

from monli.entities import Selling
from monli.repositories.base_repository import TenantScopedRepository


class SellingRepository(TenantScopedRepository[Selling]):
    """Persistence operations for customer sales."""

    def __init__(self, session: Session, tenant_id: UUID) -> None:
        super().__init__(session, Selling, tenant_id)

    def list_by_customer(self, customer_id: UUID) -> Sequence[Selling]:
        """Return sales linked to one customer."""
        statement = select(Selling).where(
            Selling.tenant_id == self.tenant_id,
            Selling.customer_id == customer_id,
        )
        return self.session.exec(statement).all()

    def list_between(self, start_date: date, end_date: date) -> Sequence[Selling]:
        """Return sales within an inclusive date range."""
        statement = select(Selling).where(
            Selling.tenant_id == self.tenant_id,
            Selling.sold_on >= start_date,
            Selling.sold_on <= end_date,
        )
        return self.session.exec(statement).all()
