# Copyright (c) 2026 Monli. All rights reserved.

"""Ingredient repository."""

from collections.abc import Sequence
from uuid import UUID

from sqlmodel import Session, select

from monli.entities import Ingredient
from monli.repositories.base_repository import TenantScopedRepository


class IngredientRepository(TenantScopedRepository[Ingredient]):
    """Persistence operations for ingredients."""

    def __init__(self, session: Session, tenant_id: UUID) -> None:
        super().__init__(session, Ingredient, tenant_id)

    def search_by_name(self, name: str) -> Sequence[Ingredient]:
        """Return ingredients whose names contain the given text."""
        statement = select(Ingredient).where(
            Ingredient.tenant_id == self.tenant_id,
            Ingredient.name.ilike(f"%{name}%"), # type: ignore[attr-defined]
        )
        return self.session.exec(statement).all()

    def list_by_supplier(self, supplier_id: UUID) -> Sequence[Ingredient]:
        """Return ingredients linked to one supplier."""
        statement = select(Ingredient).where(
            Ingredient.tenant_id == self.tenant_id,
            Ingredient.supplier_id == supplier_id,
        )
        return self.session.exec(statement).all()
