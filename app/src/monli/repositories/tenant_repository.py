# Copyright (c) 2026 Monli. All rights reserved.

"""Tenant repository."""

from sqlmodel import Session, select

from monli.entities import Tenant
from monli.repositories.base_repository import Repository


class TenantRepository(Repository[Tenant]):
    """Persistence operations for tenants."""

    def __init__(self, session: Session) -> None:
        super().__init__(session, Tenant)

    def get_by_slug(self, slug: str) -> Tenant | None:
        """Return a tenant by slug."""
        statement = select(Tenant).where(Tenant.slug == slug)
        return self.session.exec(statement).first()
