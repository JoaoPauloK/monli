# Copyright (c) 2026 Monli. All rights reserved.

"""Tenant business service."""

from monli.entities import Tenant
from monli.repositories import TenantRepository


class TenantService:
    """Manages tenant operations."""

    def __init__(self, tenant_repository: TenantRepository) -> None:
        self.tenant_repository = tenant_repository

    def create(self, name: str, slug: str) -> Tenant:
        return self.tenant_repository.add(Tenant(name=name, slug=slug))

    def get_by_slug(self, slug: str) -> Tenant | None:
        return self.tenant_repository.get_by_slug(slug)
