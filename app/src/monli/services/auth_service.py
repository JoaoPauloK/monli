# Copyright (c) 2026 Monli. All rights reserved.

"""Authentication service: registration and login flows."""

from sqlmodel import Session

from monli.api.schemas import UserCreate, UserLogin
from monli.api.security import hash_password, verify_password
from monli.entities import Tenant, User
from monli.repositories import TenantRepository, UserRepository


class AuthService:
    """Handles user registration and login."""

    def __init__(self, session: Session) -> None:
        self.session = session

    def register(self, data: UserCreate) -> tuple[User, Tenant]:
        """Create a new tenant and its first user; raise ValueError on conflict."""
        tenant_repo = TenantRepository(self.session)
        if tenant_repo.get_by_slug(data.tenant_slug):
            raise ValueError("Slug already taken.")

        tenant = Tenant(name=data.tenant_name, slug=data.tenant_slug)
        tenant_repo.add(tenant)

        user_repo = UserRepository(self.session, tenant.id)
        user = user_repo.create(
            full_name=data.full_name,
            email=data.email,
            hashed_password=hash_password(data.password),
        )
        return user, tenant

    def login(self, data: UserLogin) -> User:
        """Return the authenticated user; raise ValueError on bad credentials."""
        tenant_repo = TenantRepository(self.session)
        tenant = tenant_repo.get_by_slug(data.tenant_slug)
        if not tenant:
            raise ValueError("Invalid credentials.")

        user_repo = UserRepository(self.session, tenant.id)
        user = user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise ValueError("Invalid credentials.")
        if not user.is_active:
            raise ValueError("User is inactive.")
        return user
