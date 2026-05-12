# Copyright (c) 2026 Monli. All rights reserved.

"""Entity smoke tests."""

from decimal import Decimal
from uuid import uuid4

from sqlmodel import SQLModel, create_engine

from monli.entities import Ingredient, Product, Recipe, RecipeIngredient


def test_entities_can_create_database_metadata() -> None:
    engine = create_engine("sqlite:///:memory:")

    SQLModel.metadata.create_all(engine)


def test_recipe_links_product_and_ingredients() -> None:
    tenant_id = uuid4()
    product = Product(
        tenant_id=tenant_id,
        name="Cake slice",
        sale_price=Decimal("12.00"),
    )
    ingredient = Ingredient(
        tenant_id=tenant_id,
        name="Flour",
        unit="kg",
        unit_cost=Decimal("5.50"),
    )
    recipe = Recipe(tenant_id=tenant_id, product=product)
    recipe_ingredient = RecipeIngredient(
        tenant_id=tenant_id,
        recipe=recipe,
        ingredient=ingredient,
        quantity=Decimal("0.250"),
    )

    assert recipe.product.name == "Cake slice"
    assert recipe_ingredient.ingredient.unit == "kg"
    assert recipe_ingredient.quantity == Decimal("0.250")
