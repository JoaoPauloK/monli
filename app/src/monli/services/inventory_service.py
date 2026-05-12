# Copyright (c) 2026 Monli. All rights reserved.

"""Inventory business service."""

from decimal import Decimal
from uuid import UUID

from monli.entities import InventoryItem, InventoryItemType
from monli.repositories import InventoryRepository


class InventoryService:
    """Coordinates inventory changes for ingredients and products."""

    def __init__(self, inventory_repository: InventoryRepository) -> None:
        self.inventory_repository = inventory_repository
        self.tenant_id = inventory_repository.tenant_id

    def increase_ingredient(
        self,
        ingredient_id: UUID,
        quantity: Decimal,
        *,
        commit: bool = True,
    ) -> InventoryItem:
        """Increase available stock for one ingredient."""
        self._ensure_positive_quantity(quantity)
        inventory_item = self.inventory_repository.get_by_ingredient(ingredient_id)

        if inventory_item is None:
            inventory_item = InventoryItem(
                tenant_id=self.tenant_id,
                item_type=InventoryItemType.INGREDIENT,
                ingredient_id=ingredient_id,
                quantity=quantity,
            )
            return self.inventory_repository.add(inventory_item, commit=commit)

        inventory_item.quantity += quantity
        return self.inventory_repository.update(
            inventory_item,
            {"quantity": inventory_item.quantity},
            commit=commit,
        )

    def increase_product(
        self,
        product_id: UUID,
        quantity: Decimal,
        *,
        commit: bool = True,
    ) -> InventoryItem:
        """Increase available stock for one product."""
        self._ensure_positive_quantity(quantity)
        inventory_item = self.inventory_repository.get_by_product(product_id)

        if inventory_item is None:
            inventory_item = InventoryItem(
                tenant_id=self.tenant_id,
                item_type=InventoryItemType.PRODUCT,
                product_id=product_id,
                quantity=quantity,
            )
            return self.inventory_repository.add(inventory_item, commit=commit)

        inventory_item.quantity += quantity
        return self.inventory_repository.update(
            inventory_item,
            {"quantity": inventory_item.quantity},
            commit=commit,
        )

    def decrease_product(
        self,
        product_id: UUID,
        quantity: Decimal,
        *,
        commit: bool = True,
    ) -> InventoryItem:
        """Decrease available stock for one product."""
        self._ensure_positive_quantity(quantity)
        inventory_item = self.inventory_repository.get_by_product(product_id)

        if inventory_item is None or inventory_item.quantity < quantity:
            msg = "Insufficient product inventory."
            raise ValueError(msg)

        inventory_item.quantity -= quantity
        return self.inventory_repository.update(
            inventory_item,
            {"quantity": inventory_item.quantity},
            commit=commit,
        )

    def decrease_ingredient(
        self,
        ingredient_id: UUID,
        quantity: Decimal,
        *,
        commit: bool = True,
    ) -> InventoryItem:
        """Decrease available stock for one ingredient."""
        self._ensure_positive_quantity(quantity)
        inventory_item = self.inventory_repository.get_by_ingredient(ingredient_id)

        if inventory_item is None or inventory_item.quantity < quantity:
            msg = "Insufficient ingredient inventory."
            raise ValueError(msg)

        inventory_item.quantity -= quantity
        return self.inventory_repository.update(
            inventory_item,
            {"quantity": inventory_item.quantity},
            commit=commit,
        )

    def get_by_ingredient(self, ingredient_id: UUID) -> InventoryItem | None:
        return self.inventory_repository.get_by_ingredient(ingredient_id)

    def get_by_product(self, product_id: UUID) -> InventoryItem | None:
        return self.inventory_repository.get_by_product(product_id)

    def list_low_stock(self) -> list[InventoryItem]:
        return list(self.inventory_repository.list_low_stock())

    def _ensure_positive_quantity(self, quantity: Decimal) -> None:
        if quantity <= Decimal("0"):
            msg = "Quantity must be greater than zero."
            raise ValueError(msg)
