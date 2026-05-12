# Copyright (c) 2026 Monli. All rights reserved.

"""Purchase API controller."""

from datetime import date
from typing import List
from uuid import UUID

from monli.entities import Purchase
from monli.services import PurchaseIngredientInput, PurchaseService
from monli.api.schemas import PurchaseExtractionRead, PurchaseImageConfirm, PurchaseRead


class PurchaseController:
    """Coordinates purchase HTTP operations."""

    def __init__(self, purchase_service: PurchaseService) -> None:
        self.purchase_service = purchase_service

    def create(
        self,
        ingredients: list[PurchaseIngredientInput],
        *,
        supplier_id: UUID | None,
        purchased_on: date | None,
        notes: str | None,
    ) -> PurchaseRead:
        """Create a purchase for this tenant."""
        purchase: Purchase = self.purchase_service.create_purchase(
            ingredients,
            supplier_id=supplier_id,
            purchased_on=purchased_on,
            notes=notes,
        )
        return PurchaseRead.model_validate(purchase)

    def list(self) -> List[PurchaseRead]:
        """List purchases for this tenant."""
        purchases = self.purchase_service.list_purchases()
        return [PurchaseRead.model_validate(purchase) for purchase in purchases]

    def get(self, purchase_id: UUID) -> PurchaseRead:
        """Get a purchase by ID."""
        purchase = self.purchase_service.get_purchase(purchase_id)
        if not purchase:
            raise ValueError("Purchase not found.")
        return PurchaseRead.model_validate(purchase)

    def delete(self, purchase_id: UUID) -> None:
        """Delete a purchase by ID."""
        purchase = self.purchase_service.get_purchase(purchase_id)
        if not purchase:
            raise ValueError("Purchase not found.")
        self.purchase_service.delete_purchase(purchase_id)
    
    async def preview_by_image(self, image_bytes: bytes) -> PurchaseExtractionRead:
        """Extract purchase data from an image without writing to the database."""
        data = await self.purchase_service.preview_purchase_by_image(image_bytes)
        return PurchaseExtractionRead.model_validate(data)

    def update(
        self,
        purchase_id: UUID,
        ingredients: list[PurchaseIngredientInput],
        *,
        supplier_id: UUID | None,
        purchased_on: date | None,
        notes: str | None,
    ) -> PurchaseRead:
        """Update a purchase."""
        purchase = self.purchase_service.update_purchase(
            purchase_id,
            ingredients,
            supplier_id=supplier_id,
            purchased_on=purchased_on,
            notes=notes,
        )
        return PurchaseRead.model_validate(purchase)

    def confirm_from_image(self, payload: PurchaseImageConfirm) -> PurchaseRead:
        """Create a purchase from user-confirmed extracted items."""
        purchase = self.purchase_service.confirm_purchase_from_image(
            payload.ingredients,
            purchase_date=payload.purchase_date,
            notes=payload.notes,
        )
        return PurchaseRead.model_validate(purchase)