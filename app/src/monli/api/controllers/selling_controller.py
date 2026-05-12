# Copyright (c) 2026 Monli. All rights reserved.

"""Selling API controller."""

from collections.abc import Sequence
from datetime import date
from uuid import UUID

from monli.api.schemas import SellingDetailRead, SellingRead
from monli.entities import Selling
from monli.services import SellingProductInput, SellingService


class SellingController:
    """Coordinates selling HTTP operations."""

    def __init__(self, selling_service: SellingService) -> None:
        self.selling_service = selling_service

    def create(
        self,
        products: list[SellingProductInput],
        *,
        customer_id: UUID | None,
        sold_on: date | None,
        notes: str | None,
    ) -> Selling:
        """Create a selling for this tenant."""
        return self.selling_service.create_selling(
            products,
            customer_id=customer_id,
            sold_on=sold_on,
            notes=notes,
        )

    def list(self) -> Sequence[SellingRead]:
        """Return sellings for this tenant."""
        return [SellingRead.model_validate(selling) for selling in self.selling_service.selling_repository.list()]

    def update(
        self,
        selling_id: UUID,
        products: list[SellingProductInput],
        *,
        customer_id: UUID | None,
        sold_on: date | None,
        notes: str | None,
    ) -> SellingDetailRead:
        """Update a selling."""
        selling = self.selling_service.update_selling(
            selling_id,
            products,
            customer_id=customer_id,
            sold_on=sold_on,
            notes=notes,
        )
        return SellingDetailRead.model_validate(selling)

    def get(self, selling_id: UUID) -> SellingDetailRead | None:
        """Return a selling for this tenant."""
        selling = self.selling_service.selling_repository.get(selling_id)
        if selling is None:
            return None
        return SellingDetailRead.model_validate(selling)
