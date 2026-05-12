# Copyright (c) 2026 Monli. All rights reserved.

"""Product API routes."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from monli.api.controllers import ProductController
from monli.api.dependencies import get_current_user
from monli.api.schemas import ProductCreate, ProductRead, ProductUpdate
from monli.database import get_session
from monli.entities import User
from monli.services import build_product_service

router = APIRouter(prefix="/products", tags=["products"])


async def get_product_controller(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ProductController:
    return ProductController(build_product_service(session, current_user.tenant_id))


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate,
    controller: Annotated[ProductController, Depends(get_product_controller)],
) -> ProductRead:
    """Create a product."""
    return ProductRead.model_validate(
        controller.create(name=payload.name, description=payload.description, sale_price=payload.sale_price)
    )


@router.get("", response_model=list[ProductRead])
async def list_products(
    controller: Annotated[ProductController, Depends(get_product_controller)],
) -> list[ProductRead]:
    """List products."""
    return [ProductRead.model_validate(product) for product in controller.list()]


@router.get("/{product_id}", response_model=ProductRead)
async def get_product(
    product_id: UUID,
    controller: Annotated[ProductController, Depends(get_product_controller)],
) -> ProductRead:
    """Return a product."""
    product = controller.get(product_id)
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found.")
    return ProductRead.model_validate(product)


@router.patch("/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: UUID,
    payload: ProductUpdate,
    controller: Annotated[ProductController, Depends(get_product_controller)],
) -> ProductRead:
    """Update a product."""
    product = controller.update(product_id, payload.model_dump(exclude_none=True))
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found.")
    return ProductRead.model_validate(product)
