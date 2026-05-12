# Copyright (c) 2026 Monli. All rights reserved.

"""Inventory API controller."""

from collections.abc import Sequence
from uuid import UUID

from monli.entities import InventoryItem
from monli.services.inventory_service import InventoryService


class InventoryController:
    """Coordinates inventory HTTP operations."""

    def __init__(self, inventory_service: InventoryService) -> None:
        self.inventory_service = inventory_service

    def get_by_ingredient(self, ingredient_id: UUID) -> InventoryItem | None:
        return self.inventory_service.get_by_ingredient(ingredient_id)

    def get_by_product(self, product_id: UUID) -> InventoryItem | None:
        return self.inventory_service.get_by_product(product_id)

    def list_low_stock(self) -> Sequence[InventoryItem]:
        return self.inventory_service.list_low_stock()
