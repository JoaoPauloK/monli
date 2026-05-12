# Copyright (c) 2026 Monli. All rights reserved.

"""Recipe API routes."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from monli.api.controllers import RecipeController
from monli.api.dependencies import get_current_user
from monli.api.schemas import ProductCostRead, RecipeCreate, RecipeIngredientRead, RecipeRead
from monli.database import get_session
from monli.entities import Recipe, User
from monli.services import RecipeIngredientInput, build_recipe_service

router = APIRouter(prefix="/recipes", tags=["recipes"])


async def get_recipe_controller(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> RecipeController:
    """Build the recipe controller."""
    return RecipeController(build_recipe_service(session, current_user.tenant_id))

@router.post("", response_model=RecipeRead, status_code=status.HTTP_201_CREATED)
async def create_recipe(
    payload: RecipeCreate,
    controller: Annotated[RecipeController, Depends(get_recipe_controller)],
) -> RecipeRead:
    """Create a recipe."""
    try:
        recipe = controller.create(
            payload.product_id,
            [
                RecipeIngredientInput(
                    ingredient.ingredient_id,
                    ingredient.quantity,
                )
                for ingredient in payload.ingredients
            ],
            instructions=payload.instructions,
        )
        return RecipeRead.model_validate(recipe)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


@router.get("/products/{product_id}", response_model=RecipeRead | None)
async def get_product_recipe(
    product_id: UUID,
    controller: Annotated[RecipeController, Depends(get_recipe_controller)],
) -> RecipeRead | None:
    """Return the recipe for a product, or null if none exists."""
    recipe = controller.get_by_product(product_id)
    if recipe is None:
        return None
    return RecipeRead.model_validate(recipe)


@router.get("/products/{product_id}/cost", response_model=ProductCostRead)
async def estimate_product_cost(
    product_id: UUID,
    controller: Annotated[RecipeController, Depends(get_recipe_controller)],
) -> ProductCostRead:
    """Estimate product cost from recipe."""
    try:
        return ProductCostRead(
            product_id=product_id,
            estimated_cost=controller.estimate_product_cost(product_id),
        )
    except ValueError as exc:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(exc)) from exc
