# Copyright (c) 2026 Monli. All rights reserved.

"""Supplier API routes."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from monli.api.controllers import SupplierController
from monli.api.dependencies import get_current_user
from monli.api.schemas import SupplierCreate, SupplierRead, SupplierUpdate
from monli.database import get_session
from monli.entities import User
from monli.services import build_supplier_service

router = APIRouter(prefix="/suppliers", tags=["suppliers"])


async def get_supplier_controller(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> SupplierController:
    return SupplierController(build_supplier_service(session, current_user.tenant_id))


@router.post("", response_model=SupplierRead, status_code=status.HTTP_201_CREATED)
async def create_supplier(
    payload: SupplierCreate,
    controller: Annotated[SupplierController, Depends(get_supplier_controller)],
) -> SupplierRead:
    return SupplierRead.model_validate(
        controller.create(name=payload.name, email=payload.email, phone=payload.phone, notes=payload.notes)
    )


@router.get("", response_model=list[SupplierRead])
async def list_suppliers(
    controller: Annotated[SupplierController, Depends(get_supplier_controller)],
) -> list[SupplierRead]:
    return [SupplierRead.model_validate(supplier) for supplier in controller.list()]


@router.get("/{supplier_id}", response_model=SupplierRead)
async def get_supplier(
    supplier_id: UUID,
    controller: Annotated[SupplierController, Depends(get_supplier_controller)],
) -> SupplierRead:
    supplier = controller.get(supplier_id)
    if supplier is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Supplier not found.")
    return SupplierRead.model_validate(supplier)


@router.patch("/{supplier_id}", response_model=SupplierRead)
async def update_supplier(
    supplier_id: UUID,
    payload: SupplierUpdate,
    controller: Annotated[SupplierController, Depends(get_supplier_controller)],
) -> SupplierRead:
    supplier = controller.update(supplier_id, payload.model_dump(exclude_unset=True))
    if supplier is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Supplier not found.")
    return SupplierRead.model_validate(supplier)


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_supplier(
    supplier_id: UUID,
    controller: Annotated[SupplierController, Depends(get_supplier_controller)],
) -> None:
    if not controller.delete(supplier_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Supplier not found.")
