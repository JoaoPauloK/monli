# Copyright (c) 2026 Monli. All rights reserved.

"""Recipe API controller."""

from decimal import Decimal
from uuid import UUID

from monli.entities import Recipe
from monli.services import RecipeIngredientInput, RecipeService


class RecipeController:
    """Coordinates recipe HTTP operations."""

    def __init__(self, recipe_service: RecipeService) -> None:
        self.recipe_service = recipe_service

    def create(
        self,
        product_id: UUID,
        ingredients: list[RecipeIngredientInput],
        *,
        instructions: str | None,
    ) -> Recipe:
        """Create a recipe for this tenant."""
        return self.recipe_service.create_recipe(
            product_id,
            ingredients,
            instructions=instructions,
        )

    def get_by_product(self, product_id: UUID) -> Recipe | None:
        """Return the recipe for a product, or None if it has none."""
        return self.recipe_service.get_recipe_by_product(product_id)

    def estimate_product_cost(self, product_id: UUID) -> Decimal:
        """Return estimated cost for a product recipe."""
        return self.recipe_service.estimate_product_cost(product_id)
