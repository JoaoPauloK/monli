# Copyright (c) 2026 Monli. All rights reserved.

"""Purchase API routes."""

from typing import Annotated, List
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, status
from sqlmodel import Session

from monli.api.controllers import PurchaseController
from monli.api.dependencies import get_current_user
from monli.api.schemas import PurchaseCreate, PurchaseExtractionRead, PurchaseImageConfirm, PurchaseRead, PurchaseUpdate
from monli.database import get_session
from monli.entities import User
from monli.services import PurchaseIngredientInput, build_purchase_service

router = APIRouter(prefix="/purchases", tags=["purchases"])


async def get_purchase_controller(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> PurchaseController:
    """Build the purchase controller."""
    return PurchaseController(build_purchase_service(session, current_user.tenant_id))


@router.post("", response_model=PurchaseRead, status_code=status.HTTP_201_CREATED)
async def create_purchase(
    payload: PurchaseCreate,
    controller: Annotated[PurchaseController, Depends(get_purchase_controller)],
) -> PurchaseRead:
    """Create a purchase."""
    assert payload.supplier_id is not None, "Supplier must be provided"
    try:
        return controller.create(
            [
                PurchaseIngredientInput(
                    ingredient.ingredient_id,
                    ingredient.quantity,
                    ingredient.unit_cost,
                )
                for ingredient in payload.ingredients
            ],
            supplier_id=payload.supplier_id,
            purchased_on=payload.purchased_on,
            notes=payload.notes,
        )
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc

@router.get("", response_model=List[PurchaseRead])
async def list_purchases(
    controller: Annotated[PurchaseController, Depends(get_purchase_controller)],
) -> List[PurchaseRead]:
    """List purchases."""
    return list(controller.list())

@router.post("/image/preview", response_model=PurchaseExtractionRead, status_code=status.HTTP_200_OK)
async def preview_purchase_by_image(
    controller: Annotated[PurchaseController, Depends(get_purchase_controller)],
    image_bytes: bytes = File(...),
) -> PurchaseExtractionRead:
    """Extract purchase data from an image for user review, without saving to the database."""
    try:
        return await controller.preview_by_image(image_bytes)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


@router.post("/image", response_model=PurchaseRead, status_code=status.HTTP_201_CREATED)
async def confirm_purchase_from_image(
    payload: PurchaseImageConfirm,
    controller: Annotated[PurchaseController, Depends(get_purchase_controller)],
) -> PurchaseRead:
    """Create a purchase from user-confirmed extracted items."""
    try:
        return controller.confirm_from_image(payload)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc

@router.get("/{purchase_id}", response_model=PurchaseRead)
async def get_purchase(
    purchase_id: UUID,
    controller: Annotated[PurchaseController, Depends(get_purchase_controller)],
) -> PurchaseRead:
    """Get a purchase."""
    try:
        return controller.get(purchase_id)
    except ValueError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc

@router.patch("/{purchase_id}", response_model=PurchaseRead)
async def update_purchase(
    purchase_id: UUID,
    payload: PurchaseUpdate,
    controller: Annotated[PurchaseController, Depends(get_purchase_controller)],
) -> PurchaseRead:
    """Update a purchase."""
    try:
        return controller.update(
            purchase_id,
            [
                PurchaseIngredientInput(
                    ingredient.ingredient_id,
                    ingredient.quantity,
                    ingredient.unit_cost,
                )
                for ingredient in payload.ingredients
            ],
            supplier_id=payload.supplier_id,
            purchased_on=payload.purchased_on,
            notes=payload.notes,
        )
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc

@router.delete("/{purchase_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_purchase(
    purchase_id: Annotated[UUID, Depends(get_purchase_controller)],
    controller: Annotated[PurchaseController, Depends(get_purchase_controller)],
) -> None:
    """Delete a purchase."""
    try:
        controller.delete(purchase_id)
    except ValueError as exc:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(exc)) from exc
