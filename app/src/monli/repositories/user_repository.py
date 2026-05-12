# Copyright (c) 2026 Monli. All rights reserved.

"""User repository."""

from uuid import UUID

from sqlmodel import Session, select

from monli.entities import User
from monli.repositories.base_repository import TenantScopedRepository


class UserRepository(TenantScopedRepository[User]):
    """Persistence operations for users."""

    def __init__(self, session: Session, tenant_id: UUID) -> None:
        super().__init__(session, User, tenant_id)

    def get_by_email(self, email: str) -> User | None:
        """Return a user by email within this tenant."""
        statement = select(User).where(
            User.tenant_id == self.tenant_id,
            User.email == email,
        )
        return self.session.exec(statement).first()

    def create(self, full_name: str, email: str, hashed_password: str) -> User:
        """Create and persist a new user in this tenant."""
        user = User(
            tenant_id=self.tenant_id,
            full_name=full_name,
            email=email,
            hashed_password=hashed_password,
        )
        return self.add(user)
