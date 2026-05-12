# Copyright (c) 2026 Monli. All rights reserved.

"""Ingredient business service."""

from collections.abc import Sequence
from decimal import Decimal
from uuid import UUID

from monli.entities import Ingredient
from monli.repositories import IngredientRepository


class IngredientService:
    """Manages ingredient CRUD for a tenant."""

    def __init__(self, ingredient_repository: IngredientRepository) -> None:
        self.ingredient_repository = ingredient_repository
        self.tenant_id = ingredient_repository.tenant_id

    def create(
        self,
        *,
        name: str,
        unit: str,
        unit_cost: Decimal,
        supplier_id: UUID | None,
    ) -> Ingredient:
        return self.ingredient_repository.add(
            Ingredient(
                tenant_id=self.tenant_id,
                name=name,
                unit=unit,
                unit_cost=unit_cost,
                supplier_id=supplier_id,
            )
        )

    def list(self) -> Sequence[Ingredient]:
        return self.ingredient_repository.list()

    def get(self, ingredient_id: UUID) -> Ingredient | None:
        return self.ingredient_repository.get(ingredient_id)

    def update(self, ingredient_id: UUID, values: dict) -> Ingredient | None:
        """Update an ingredient's fields."""
        ingredient = self.ingredient_repository.get(ingredient_id)
        if ingredient is None:
            return None
        return self.ingredient_repository.update(ingredient, {k: v for k, v in values.items() if v is not None})
