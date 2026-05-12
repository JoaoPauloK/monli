# Copyright (c) 2026 Monli. All rights reserved.

"""Ingredient API controller."""

from collections.abc import Sequence
from decimal import Decimal
from uuid import UUID

from monli.entities import Ingredient
from monli.services.ingredient_service import IngredientService


class IngredientController:
    """Coordinates ingredient HTTP operations."""

    def __init__(self, ingredient_service: IngredientService) -> None:
        self.ingredient_service = ingredient_service

    def create(
        self,
        *,
        name: str,
        unit: str,
        unit_cost: Decimal,
        supplier_id: UUID | None,
    ) -> Ingredient:
        return self.ingredient_service.create(name=name, unit=unit, unit_cost=unit_cost, supplier_id=supplier_id)

    def list(self) -> Sequence[Ingredient]:
        return self.ingredient_service.list()

    def get(self, ingredient_id: UUID) -> Ingredient | None:
        return self.ingredient_service.get(ingredient_id)

    def update(self, ingredient_id: UUID, values: dict) -> Ingredient | None:
        """Update an ingredient."""
        return self.ingredient_service.update(ingredient_id, values)
