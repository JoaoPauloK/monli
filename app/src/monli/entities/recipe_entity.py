# Copyright (c) 2026 Monli. All rights reserved.

"""Recipe entities."""

from decimal import Decimal
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Column, Numeric, UniqueConstraint
from sqlmodel import Field, Relationship

from monli.entities.base_entity import TenantMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from monli.entities.ingredient_entity import Ingredient
    from monli.entities.product_entity import Product


class Recipe(UUIDMixin, TenantMixin, TimestampMixin, table=True):
    """Defines the ingredients required to produce one product."""

    __tablename__ = "recipes" # type: ignore

    product_id: UUID = Field(foreign_key="products.id", unique=True, index=True)
    instructions: str | None = Field(default=None, max_length=1000)

    product: "Product" = Relationship(back_populates="recipe")
    ingredients: list["RecipeIngredient"] = Relationship(back_populates="recipe")


class RecipeIngredient(UUIDMixin, TenantMixin, TimestampMixin, table=True):
    """Links a recipe to one ingredient and the required production quantity."""

    __tablename__ = "recipe_ingredients" # type: ignore
    __table_args__ = (
        UniqueConstraint("recipe_id", "ingredient_id", name="uq_recipe_ingredient"),
    )

    recipe_id: UUID = Field(foreign_key="recipes.id", index=True)
    ingredient_id: UUID = Field(foreign_key="ingredients.id", index=True)
    quantity: Decimal = Field(sa_column=Column(Numeric(12, 3), nullable=False))

    recipe: "Recipe" = Relationship(back_populates="ingredients")
    ingredient: "Ingredient" = Relationship(back_populates="recipe_links")
