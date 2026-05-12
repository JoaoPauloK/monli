# Copyright (c) 2026 Monli. All rights reserved.

"""Tenant API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from monli.api.controllers import TenantController
from monli.api.schemas import TenantCreate, TenantRead
from monli.database import get_session
from monli.services import build_tenant_service

router = APIRouter(prefix="/tenants", tags=["tenants"])


async def get_tenant_controller(
    session: Annotated[Session, Depends(get_session)],
) -> TenantController:
    return TenantController(build_tenant_service(session))


@router.post("", response_model=TenantRead, status_code=status.HTTP_201_CREATED)
async def create_tenant(
    payload: TenantCreate,
    controller: Annotated[TenantController, Depends(get_tenant_controller)],
) -> TenantRead:
    """Create a tenant."""
    return TenantRead.model_validate(controller.create(payload.name, payload.slug))


@router.get("/{slug}", response_model=TenantRead)
async def get_tenant_by_slug(
    slug: str,
    controller: Annotated[TenantController, Depends(get_tenant_controller)],
) -> TenantRead:
    """Return a tenant by slug."""
    tenant = controller.get_by_slug(slug)
    if tenant is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found.")
    return TenantRead.model_validate(tenant)
