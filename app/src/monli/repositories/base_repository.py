# Copyright (c) 2026 Monli. All rights reserved.

"""Base repository abstraction for SQLModel entities."""

from collections.abc import Sequence
from typing import Any
from uuid import UUID

from sqlmodel import Session, SQLModel, select


class Repository[ModelT: SQLModel]:
    """Provides common persistence operations for one SQLModel entity."""

    def __init__(self, session: Session, model: type[ModelT]) -> None:
        self.session = session
        self.model = model

    def add(self, entity: ModelT, *, commit: bool = True) -> ModelT:
        """Persist an entity and refresh it when committed."""
        self.session.add(entity)
        if commit:
            self.session.commit()
            self.session.refresh(entity)
        return entity

    def get(self, entity_id: UUID) -> ModelT | None:
        """Return one entity by primary key, or None when it does not exist."""
        return self.session.get(self.model, entity_id)

    def list(self, *, offset: int = 0, limit: int = 100) -> Sequence[ModelT]:
        """Return entities ordered by insertion-independent primary key."""
        statement = select(self.model).offset(offset).limit(limit)
        return self.session.exec(statement).all()

    def update(
        self,
        entity: ModelT,
        values: dict[str, Any],
        *,
        commit: bool = True,
    ) -> ModelT:
        """Apply field values to an existing entity and persist it."""
        for field, value in values.items():
            setattr(entity, field, value)

        self.session.add(entity)
        if commit:
            self.session.commit()
            self.session.refresh(entity)
        return entity

    def delete(self, entity: ModelT, *, commit: bool = True) -> None:
        """Delete an entity."""
        self.session.delete(entity)
        if commit:
            self.session.commit()

    def exists(self, entity_id: UUID) -> bool:
        """Return True when an entity with the given ID exists."""
        return self.get(entity_id) is not None


class TenantScopedRepository[ModelT: SQLModel](Repository[ModelT]):
    """Scopes repository operations to one tenant."""

    def __init__(self, session: Session, model: type[ModelT], tenant_id: UUID) -> None:
        super().__init__(session, model)
        self.tenant_id = tenant_id

    def add(self, entity: ModelT, *, commit: bool = True) -> ModelT:
        """Persist an entity that belongs to this repository tenant."""
        entity_tenant_id = getattr(entity, "tenant_id", None)
        if entity_tenant_id != self.tenant_id:
            msg = "Entity tenant_id does not match repository tenant_id."
            raise ValueError(msg)

        return super().add(entity, commit=commit)

    def get(self, entity_id: UUID) -> ModelT | None:
        """Return one tenant-owned entity by primary key."""
        statement = select(self.model).where(
            self.model.id == entity_id,  # type: ignore[attr-defined]
            self.model.tenant_id == self.tenant_id,  # type: ignore[attr-defined]
        )
        return self.session.exec(statement).first()

    def list(self, *, offset: int = 0, limit: int = 100) -> Sequence[ModelT]:
        """Return tenant-owned entities."""
        statement = (
            select(self.model)
            .where(self.model.tenant_id == self.tenant_id)  # type: ignore[attr-defined]
            .offset(offset)
            .limit(limit)
        )
        return self.session.exec(statement).all()

    def update(
        self,
        entity: ModelT,
        values: dict[str, Any],
        *,
        commit: bool = True,
    ) -> ModelT:
        """Update an entity without allowing tenant ownership changes."""
        if values.get("tenant_id", self.tenant_id) != self.tenant_id:
            msg = "Cannot move an entity between tenants."
            raise ValueError(msg)

        if getattr(entity, "tenant_id", None) != self.tenant_id:
            msg = "Entity tenant_id does not match repository tenant_id."
            raise ValueError(msg)

        return super().update(entity, values, commit=commit)
