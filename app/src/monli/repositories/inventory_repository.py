# Copyright (c) 2026 Monli. All rights reserved.

"""Inventory repository."""

from collections.abc import Sequence
from uuid import UUID

from sqlmodel import Session, select

from monli.entities import InventoryItem, InventoryItemType
from monli.repositories.base_repository import TenantScopedRepository


class InventoryRepository(TenantScopedRepository[InventoryItem]):
    """Persistence operations for inventory records."""

    def __init__(self, session: Session, tenant_id: UUID) -> None:
        super().__init__(session, InventoryItem, tenant_id)

    def get_by_ingredient(self, ingredient_id: UUID) -> InventoryItem | None:
        """Return the inventory record for one ingredient."""
        statement = select(InventoryItem).where(
            InventoryItem.tenant_id == self.tenant_id,
            InventoryItem.item_type == InventoryItemType.INGREDIENT,
            InventoryItem.ingredient_id == ingredient_id,
        )
        return self.session.exec(statement).first()

    def get_by_product(self, product_id: UUID) -> InventoryItem | None:
        """Return the inventory record for one product."""
        statement = select(InventoryItem).where(
            InventoryItem.tenant_id == self.tenant_id,
            InventoryItem.item_type == InventoryItemType.PRODUCT,
            InventoryItem.product_id == product_id,
        )
        return self.session.exec(statement).first()

    def list_low_stock(self) -> Sequence[InventoryItem]:
        """Return inventory records whose quantity is at or below the minimum."""
        statement = select(InventoryItem).where(
            InventoryItem.tenant_id == self.tenant_id,
            InventoryItem.quantity <= InventoryItem.minimum_quantity,
        )
        return self.session.exec(statement).all()
