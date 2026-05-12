# Copyright (c) 2026 Monli. All rights reserved.

"""Selling API routes."""

from typing import Annotated, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from monli.entities.selling_entity import Selling
from monli.api.controllers import SellingController
from monli.api.dependencies import get_current_user
from monli.api.schemas import SellingCreate, SellingDetailRead, SellingRead, SellingUpdate
from monli.database import get_session
from monli.entities import User
from monli.services import SellingProductInput, build_selling_service

router = APIRouter(prefix="/sellings", tags=["sellings"])


async def get_selling_controller(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> SellingController:
    """Build the selling controller."""
    return SellingController(build_selling_service(session, current_user.tenant_id))


@router.post("", response_model=SellingRead, status_code=status.HTTP_201_CREATED)
async def create_selling(
    payload: SellingCreate,
    controller: Annotated[SellingController, Depends(get_selling_controller)],
) -> SellingRead:
    """Create a selling."""
    try:
        selling: Selling = controller.create(
            [
                SellingProductInput(
                    product.product_id,
                    product.quantity,
                    product.unit_price,
                )
                for product in payload.products
            ],
            customer_id=payload.customer_id,
            sold_on=payload.sold_on,
            notes=payload.notes,
        )
        return SellingRead.model_validate(selling)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


@router.get("", response_model=List[SellingRead])
async def list_sellings(
    controller: Annotated[SellingController, Depends(get_selling_controller)],
) -> list[SellingRead]:
    """List sellings."""
    return list(controller.list())


@router.patch("/{selling_id}", response_model=SellingDetailRead)
async def update_selling(
    selling_id: UUID,
    payload: SellingUpdate,
    controller: Annotated[SellingController, Depends(get_selling_controller)],
) -> SellingDetailRead:
    """Update a selling."""
    try:
        return controller.update(
            selling_id,
            [
                SellingProductInput(
                    product.product_id,
                    product.quantity,
                    product.unit_price,
                )
                for product in payload.products
            ],
            customer_id=payload.customer_id,
            sold_on=payload.sold_on,
            notes=payload.notes,
        )
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


@router.get("/{selling_id}", response_model=SellingDetailRead)
async def get_selling(
    selling_id: UUID,
    controller: Annotated[SellingController, Depends(get_selling_controller)],
) -> SellingDetailRead:
    """Return a selling with its line items."""
    selling = controller.get(selling_id)
    if selling is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Selling not found.")
    return selling
