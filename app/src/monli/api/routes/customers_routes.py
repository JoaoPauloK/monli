# Copyright (c) 2026 Monli. All rights reserved.

"""Customer API routes."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from monli.api.controllers import CustomerController
from monli.api.dependencies import get_current_user
from monli.api.schemas import CustomerCreate, CustomerRead, CustomerUpdate
from monli.database import get_session
from monli.entities import User
from monli.services import build_customer_service

router = APIRouter(prefix="/customers", tags=["customers"])


async def get_customer_controller(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> CustomerController:
    return CustomerController(build_customer_service(session, current_user.tenant_id))


@router.post("", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
async def create_customer(
    payload: CustomerCreate,
    controller: Annotated[CustomerController, Depends(get_customer_controller)],
) -> CustomerRead:
    """Create a customer."""
    return CustomerRead.model_validate(
        controller.create(name=payload.name, email=payload.email, phone=payload.phone, notes=payload.notes)
    )


@router.get("", response_model=list[CustomerRead])
async def list_customers(
    controller: Annotated[CustomerController, Depends(get_customer_controller)],
) -> list[CustomerRead]:
    return [CustomerRead.model_validate(customer) for customer in controller.list()]


@router.get("/{customer_id}", response_model=CustomerRead)
async def get_customer(
    customer_id: UUID,
    controller: Annotated[CustomerController, Depends(get_customer_controller)],
) -> CustomerRead:
    customer = controller.get(customer_id)
    if customer is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found.")
    return CustomerRead.model_validate(customer)


@router.patch("/{customer_id}", response_model=CustomerRead)
async def update_customer(
    customer_id: UUID,
    payload: CustomerUpdate,
    controller: Annotated[CustomerController, Depends(get_customer_controller)],
) -> CustomerRead:
    customer = controller.update(customer_id, payload.model_dump(exclude_unset=True))
    if customer is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found.")
    return CustomerRead.model_validate(customer)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: UUID,
    controller: Annotated[CustomerController, Depends(get_customer_controller)],
) -> None:
    if not controller.delete(customer_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found.")
