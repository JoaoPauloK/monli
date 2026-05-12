# Copyright (c) 2026 Monli. All rights reserved.

"""Ingredient API routes."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from monli.api.controllers import IngredientController
from monli.api.dependencies import get_current_user
from monli.api.schemas import IngredientCreate, IngredientRead, IngredientUpdate
from monli.database import get_session
from monli.entities import User
from monli.services import build_ingredient_service

router = APIRouter(prefix="/ingredients", tags=["ingredients"])


async def get_ingredient_controller(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> IngredientController:
    return IngredientController(build_ingredient_service(session, current_user.tenant_id))


@router.post("", response_model=IngredientRead, status_code=status.HTTP_201_CREATED)
async def create_ingredient(
    payload: IngredientCreate,
    controller: Annotated[IngredientController, Depends(get_ingredient_controller)],
) -> IngredientRead:
    """Create an ingredient."""
    return IngredientRead.model_validate(
        controller.create(name=payload.name, unit=payload.unit, unit_cost=payload.unit_cost, supplier_id=payload.supplier_id)
    )


@router.get("", response_model=list[IngredientRead])
async def list_ingredients(
    controller: Annotated[IngredientController, Depends(get_ingredient_controller)],
) -> list[IngredientRead]:
    """List ingredients."""
    return [IngredientRead.model_validate(ingredient) for ingredient in controller.list()]


@router.get("/{ingredient_id}", response_model=IngredientRead)
async def get_ingredient(
    ingredient_id: UUID,
    controller: Annotated[IngredientController, Depends(get_ingredient_controller)],
) -> IngredientRead:
    """Return an ingredient."""
    ingredient = controller.get(ingredient_id)
    if ingredient is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Ingredient not found.")
    return IngredientRead.model_validate(ingredient)


@router.patch("/{ingredient_id}", response_model=IngredientRead)
async def update_ingredient(
    ingredient_id: UUID,
    payload: IngredientUpdate,
    controller: Annotated[IngredientController, Depends(get_ingredient_controller)],
) -> IngredientRead:
    """Update an ingredient."""
    ingredient = controller.update(ingredient_id, payload.model_dump(exclude_none=True))
    if ingredient is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Ingredient not found.")
    return IngredientRead.model_validate(ingredient)
