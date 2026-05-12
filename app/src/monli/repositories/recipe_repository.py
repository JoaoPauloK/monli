# Copyright (c) 2026 Monli. All rights reserved.

"""Recipe repository."""

from uuid import UUID

from sqlmodel import Session, select

from monli.entities import Recipe
from monli.repositories.base_repository import TenantScopedRepository


class RecipeRepository(TenantScopedRepository[Recipe]):
    """Persistence operations for recipes."""

    def __init__(self, session: Session, tenant_id: UUID) -> None:
        super().__init__(session, Recipe, tenant_id)

    def get_by_product(self, product_id: UUID) -> Recipe | None:
        """Return the recipe that produces one product."""
        statement = select(Recipe).where(
            Recipe.tenant_id == self.tenant_id,
            Recipe.product_id == product_id,
        )
        return self.session.exec(statement).first()
