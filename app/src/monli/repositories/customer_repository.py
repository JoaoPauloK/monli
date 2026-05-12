# Copyright (c) 2026 Monli. All rights reserved.

"""Customer repository."""

from collections.abc import Sequence
from uuid import UUID

from sqlmodel import Session, select

from monli.entities import Customer
from monli.repositories.base_repository import TenantScopedRepository


class CustomerRepository(TenantScopedRepository[Customer]):
    """Persistence operations for customers."""

    def __init__(self, session: Session, tenant_id: UUID) -> None:
        super().__init__(session, Customer, tenant_id)

    def search_by_name(self, name: str) -> Sequence[Customer]:
        """Return customers whose names contain the given text."""
        statement = select(Customer).where(
            Customer.tenant_id == self.tenant_id,
            Customer.name.ilike(f"%{name}%"), # type: ignore[attr-defined]
        )
        return self.session.exec(statement).all()

    def get_by_email(self, email: str) -> Customer | None:
        """Return a customer by email."""
        statement = select(Customer).where(
            Customer.tenant_id == self.tenant_id,
            Customer.email == email,
        )
        return self.session.exec(statement).first()
