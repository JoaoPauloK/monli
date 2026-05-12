# Copyright (c) 2026 Monli. All rights reserved.

"""Recipe business service."""

from dataclasses import dataclass
from decimal import Decimal
from uuid import UUID

from sqlmodel import Session

from monli.entities import Recipe, RecipeIngredient
from monli.repositories import IngredientRepository, ProductRepository, RecipeRepository


@dataclass(frozen=True)
class RecipeIngredientInput:
    """Ingredient quantity required by a recipe."""

    ingredient_id: UUID
    quantity: Decimal


class RecipeService:
    """Coordinates recipe creation and production cost estimation."""

    def __init__(
        self,
        session: Session,
        ingredient_repository: IngredientRepository,
        product_repository: ProductRepository,
        recipe_repository: RecipeRepository,
    ) -> None:
        self.session = session
        self.tenant_id = recipe_repository.tenant_id
        self.ingredient_repository = ingredient_repository
        self.product_repository = product_repository
        self.recipe_repository = recipe_repository

    def create_recipe(
        self,
        product_id: UUID,
        ingredients: list[RecipeIngredientInput],
        *,
        instructions: str | None = None,
    ) -> Recipe:
        """Create a recipe and update the product estimated cost."""
        if not ingredients:
            msg = "Recipe must have at least one ingredient."
            raise ValueError(msg)

        product = self.product_repository.get(product_id)
        if product is None:
            msg = "Product not found for this tenant."
            raise ValueError(msg)

        existing = self.recipe_repository.get_by_product(product_id)
        if existing is None:
            recipe = self.recipe_repository.add(
                Recipe(
                    tenant_id=self.tenant_id,
                    product_id=product_id,
                    instructions=instructions,
                ),
                commit=False,
            )
        else:
            self.session.refresh(existing, attribute_names=["ingredients"])
            for old_ri in existing.ingredients:
                self.session.delete(old_ri)
            self.session.flush()
            existing.instructions = instructions
            recipe = existing

        estimated_cost = Decimal("0.00")
        for ingredient_input in ingredients:
            if ingredient_input.quantity <= Decimal("0"):
                msg = "Recipe ingredient quantity must be greater than zero."
                raise ValueError(msg)

            ingredient = self.ingredient_repository.get(ingredient_input.ingredient_id)
            if ingredient is None:
                msg = "Ingredient not found for this tenant."
                raise ValueError(msg)

            estimated_cost += ingredient.unit_cost * ingredient_input.quantity
            self.session.add(
                RecipeIngredient(
                    tenant_id=self.tenant_id,
                    recipe_id=recipe.id,
                    ingredient_id=ingredient.id,
                    quantity=ingredient_input.quantity,
                ),
            )

        product.estimated_cost = estimated_cost
        self.session.add(product)
        self.session.commit()
        self.session.refresh(recipe, attribute_names=["ingredients"])
        for ri in recipe.ingredients:
            self.session.refresh(ri, attribute_names=["ingredient"])
        self.session.refresh(product)
        return recipe

    def get_recipe_by_product(self, product_id: UUID) -> Recipe | None:
        """Return the recipe for a product, with its ingredients loaded."""
        recipe = self.recipe_repository.get_by_product(product_id)
        if recipe is not None:
            self.session.refresh(recipe, attribute_names=["ingredients"])
            for ri in recipe.ingredients:
                self.session.refresh(ri, attribute_names=["ingredient"])
        return recipe

    def estimate_product_cost(self, product_id: UUID) -> Decimal:
        """Estimate the production cost for one product from its recipe."""
        recipe = self.recipe_repository.get_by_product(product_id)
        if recipe is None:
            msg = "Recipe not found for this product."
            raise ValueError(msg)

        total = Decimal("0.00")
        self.session.refresh(recipe, attribute_names=["ingredients"])
        for recipe_ingredient in recipe.ingredients:
            ingredient = self.ingredient_repository.get(recipe_ingredient.ingredient_id)
            if ingredient is None:
                msg = "Ingredient not found for this tenant."
                raise ValueError(msg)
            total += ingredient.unit_cost * recipe_ingredient.quantity

        return total
