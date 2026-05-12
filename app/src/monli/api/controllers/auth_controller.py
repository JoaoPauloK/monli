# Copyright (c) 2026 Monli. All rights reserved.

"""Auth HTTP controller."""

from monli.api.schemas import UserCreate, UserLogin, UserRead
from monli.entities import Tenant, User
from monli.services.auth_service import AuthService


class AuthController:
    """Orchestrates auth service calls for HTTP handlers."""

    def __init__(self, service: AuthService) -> None:
        self.service = service

    def register(self, data: UserCreate) -> tuple[UserRead, Tenant]:
        """Register a new tenant+user pair."""
        user: tuple[User, Tenant] = self.service.register(data)
        return UserRead.model_validate(user[0]), user[1]

    def login(self, data: UserLogin) -> UserRead:
        """Authenticate and return the user."""
        user: User = self.service.login(data)
        return UserRead.model_validate(user)
