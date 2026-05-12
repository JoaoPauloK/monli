# Copyright (c) 2026 Monli. All rights reserved.

"""Tenant API controller."""

from monli.entities import Tenant
from monli.services.tenant_service import TenantService


class TenantController:
    """Coordinates tenant HTTP operations."""

    def __init__(self, tenant_service: TenantService) -> None:
        self.tenant_service = tenant_service

    def create(self, name: str, slug: str) -> Tenant:
        return self.tenant_service.create(name, slug)

    def get_by_slug(self, slug: str) -> Tenant | None:
        return self.tenant_service.get_by_slug(slug)
