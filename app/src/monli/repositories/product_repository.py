# Copyright (c) 2026 Monli. All rights reserved.

"""Product repository."""

from collections.abc import Sequence
from uuid import UUID

from sqlmodel import Session, select

from monli.entities import Product
from monli.repositories.base_repository import TenantScopedRepository


class ProductRepository(TenantScopedRepository[Product]):
    """Persistence operations for products."""

    def __init__(self, session: Session, tenant_id: UUID) -> None:
        super().__init__(session, Product, tenant_id)

    def search_by_name(self, name: str) -> Sequence[Product]:
        """Return products whose names contain the given text."""
        statement = select(Product).where(
            Product.tenant_id == self.tenant_id,
            Product.name.ilike(f"%{name}%"), # type: ignore[attr-defined]
        )
        return self.session.exec(statement).all()

    def list_active(self) -> Sequence[Product]:
        """Return active products."""
        statement = select(Product).where(
            Product.tenant_id == self.tenant_id,
            Product.is_active.is_(True), # type: ignore[attr-defined]
        )
        return self.session.exec(statement).all()
