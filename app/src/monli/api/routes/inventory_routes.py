# Copyright (c) 2026 Monli. All rights reserved.

"""Inventory API routes."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from monli.api.controllers import InventoryController
from monli.api.dependencies import get_current_user
from monli.api.schemas import InventoryItemRead
from monli.database import get_session
from monli.entities import User
from monli.services import build_inventory_service

router = APIRouter(prefix="/inventory", tags=["inventory"])


async def get_inventory_controller(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> InventoryController:
    return InventoryController(build_inventory_service(session, current_user.tenant_id))


@router.get("/ingredients/{ingredient_id}", response_model=InventoryItemRead)
async def get_ingredient_inventory(
    ingredient_id: UUID,
    controller: Annotated[InventoryController, Depends(get_inventory_controller)],
) -> InventoryItemRead:
    """Return inventory for one ingredient."""
    inventory_item = controller.get_by_ingredient(ingredient_id)
    if inventory_item is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Inventory item not found.")
    return InventoryItemRead.model_validate(inventory_item)


@router.get("/products/{product_id}", response_model=InventoryItemRead)
async def get_product_inventory(
    product_id: UUID,
    controller: Annotated[InventoryController, Depends(get_inventory_controller)],
) -> InventoryItemRead:
    """Return inventory for one product."""
    inventory_item = controller.get_by_product(product_id)
    if inventory_item is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Inventory item not found.")
    return InventoryItemRead.model_validate(inventory_item)


@router.get("/low-stock", response_model=list[InventoryItemRead])
async def list_low_stock(
    controller: Annotated[InventoryController, Depends(get_inventory_controller)],
) -> list[InventoryItemRead]:
    """Return low stock inventory items."""
    return [InventoryItemRead.model_validate(item) for item in controller.list_low_stock()]
