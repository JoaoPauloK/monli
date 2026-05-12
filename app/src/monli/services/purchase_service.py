# Copyright (c) 2026 Monli. All rights reserved.

"""Purchase business service."""

from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from typing import Sequence
from uuid import UUID

import io

from sqlmodel import Session, select

from monli.entities import Purchase, PurchaseIngredient, Ingredient
from monli.repositories import (
    IngredientRepository,
    PurchaseRepository,
    SupplierRepository,
)
from monli.services.inventory_service import InventoryService
from monli.services.extraction_service import extract_purchase_data_from_image

google_client = None


@dataclass(frozen=True)
class PurchaseIngredientInput:
    """Ingredient purchased with quantity and unit cost."""

    ingredient_id: UUID
    quantity: Decimal
    unit_cost: Decimal


class PurchaseService:
    """Coordinates purchases and ingredient inventory updates."""

    def __init__(
        self,
        session: Session,
        ingredient_repository: IngredientRepository,
        purchase_repository: PurchaseRepository,
        supplier_repository: SupplierRepository,
        inventory_service: InventoryService,
    ) -> None:
        self.session = session
        self.tenant_id = purchase_repository.tenant_id
        self.ingredient_repository = ingredient_repository
        self.purchase_repository = purchase_repository
        self.supplier_repository = supplier_repository
        self.inventory_service = inventory_service

    def create_purchase(
        self,
        ingredients: list[PurchaseIngredientInput],
        *,
        supplier_id: UUID | None = None,
        purchased_on: date | None = None,
        notes: str | None = None,
    ) -> Purchase:
        """Create a purchase and increase ingredient inventory."""
        if not ingredients:
            msg = "Purchase must have at least one ingredient."
            raise ValueError(msg)

        supplier_missing = (
            supplier_id is not None
            and self.supplier_repository.get(supplier_id) is None
        )
        if supplier_missing:
            msg = "Supplier not found for this tenant."
            raise ValueError(msg)

        total_amount = Decimal("0.00")
        purchase = self.purchase_repository.add(
            Purchase(
                tenant_id=self.tenant_id,
                supplier_id=supplier_id,
                purchased_on=purchased_on or date.today(),
                notes=notes,
            ),
            commit=False,
        )

        last_prices: dict[UUID, Decimal] = {}
        for ingredient_input in ingredients:
            self._validate_line(ingredient_input)
            ingredient = self.ingredient_repository.get(ingredient_input.ingredient_id)
            if ingredient is None:
                msg = "Ingredient not found for this tenant."
                raise ValueError(msg)

            total_amount += ingredient_input.quantity * ingredient_input.unit_cost
            self.session.add(
                PurchaseIngredient(
                    tenant_id=self.tenant_id,
                    purchase_id=purchase.id,
                    ingredient_id=ingredient.id,
                    quantity=ingredient_input.quantity,
                    unit_cost=ingredient_input.unit_cost,
                ),
            )
            self.inventory_service.increase_ingredient(
                ingredient.id,
                ingredient_input.quantity,
                commit=False,
            )
            last_prices[ingredient.id] = ingredient_input.unit_cost

        purchase.total_amount = total_amount
        self.session.add(purchase)
        self.session.commit()

        for ingredient_id, last_price in last_prices.items():
            self._update_ingredient_prices(ingredient_id, last_price)
        self.session.commit()

        self.session.refresh(purchase)
        return purchase

    def _validate_line(self, ingredient_input: PurchaseIngredientInput) -> None:
        if ingredient_input.quantity <= Decimal("0"):
            msg = "Purchase quantity must be greater than zero."
            raise ValueError(msg)
        if ingredient_input.unit_cost < Decimal("0"):
            msg = "Purchase unit cost cannot be negative."
            raise ValueError(msg)

    def _update_ingredient_prices(self, ingredient_id: UUID, last_price: Decimal) -> None:
        """Recompute weighted avg_price and set last_price on the ingredient."""
        records = self.session.exec(
            select(PurchaseIngredient).where(
                PurchaseIngredient.tenant_id == self.tenant_id,
                PurchaseIngredient.ingredient_id == ingredient_id,
            )
        ).all()
        total_qty = sum(r.quantity for r in records)
        total_val = sum(r.quantity * r.unit_cost for r in records)
        avg = (total_val / total_qty).quantize(Decimal("0.01")) if total_qty else Decimal("0.00")
        ingredient = self.ingredient_repository.get(ingredient_id)
        if ingredient:
            self.ingredient_repository.update(
                ingredient, {"avg_price": avg, "last_price": last_price}, commit=False
            )

    def update_purchase(
        self,
        purchase_id: UUID,
        ingredients: list[PurchaseIngredientInput],
        *,
        supplier_id: UUID | None = None,
        purchased_on: date | None = None,
        notes: str | None = None,
    ) -> Purchase:
        """Update a purchase and reconcile ingredient inventory."""
        purchase = self.purchase_repository.get(purchase_id)
        if not purchase:
            raise ValueError("Purchase not found.")

        if not ingredients:
            raise ValueError("Purchase must have at least one ingredient.")

        supplier_missing = (
            supplier_id is not None
            and self.supplier_repository.get(supplier_id) is None
        )
        if supplier_missing:
            raise ValueError("Supplier not found for this tenant.")

        old_lines = list(purchase.ingredients)

        for line in old_lines:
            inv = self.inventory_service.inventory_repository.get_by_ingredient(line.ingredient_id)
            if inv is not None:
                self.inventory_service.inventory_repository.update(
                    inv, {"quantity": inv.quantity - line.quantity}, commit=False
                )

        for line in old_lines:
            self.session.delete(line)
        self.session.flush()

        total_amount = Decimal("0.00")
        last_prices: dict[UUID, Decimal] = {}
        for inp in ingredients:
            self._validate_line(inp)
            ingredient = self.ingredient_repository.get(inp.ingredient_id)
            if ingredient is None:
                raise ValueError("Ingredient not found for this tenant.")
            total_amount += inp.quantity * inp.unit_cost
            self.session.add(
                PurchaseIngredient(
                    tenant_id=self.tenant_id,
                    purchase_id=purchase.id,
                    ingredient_id=ingredient.id,
                    quantity=inp.quantity,
                    unit_cost=inp.unit_cost,
                )
            )
            self.inventory_service.increase_ingredient(ingredient.id, inp.quantity, commit=False)
            last_prices[ingredient.id] = inp.unit_cost

        self.purchase_repository.update(
            purchase,
            {
                "supplier_id": supplier_id,
                "purchased_on": purchased_on or date.today(),
                "notes": notes,
                "total_amount": total_amount,
            },
            commit=False,
        )
        self.session.commit()

        for ingredient_id, last_price in last_prices.items():
            self._update_ingredient_prices(ingredient_id, last_price)
        self.session.commit()

        self.session.refresh(purchase)
        return purchase

    def list_purchases(self) -> Sequence[Purchase]:
        """List purchases for this tenant."""
        return self.purchase_repository.list()

    def get_purchase(self, purchase_id: UUID) -> Purchase | None:
        """Get a purchase by ID."""
        return self.purchase_repository.get(purchase_id)
    
    def delete_purchase(self, purchase_id: UUID) -> None:
        """Delete a purchase by ID and decrease ingredient inventory."""
        purchase = self.purchase_repository.get(purchase_id)
        if not purchase:
            raise ValueError("Purchase not found.")

        for line in purchase.ingredients:
            self.inventory_service.decrease_ingredient(
                line.ingredient_id,
                line.quantity,
                commit=False,
            )
        self.purchase_repository.delete(purchase, commit=True)
    
    async def preview_purchase_by_image(self, image_bytes: bytes) -> dict:
        """Extract purchase data from an image without writing to the database."""
        dados = await extract_purchase_data_from_image(image_bytes, self.tenant_id, self.session)
        if not dados.get("items"):
            raise ValueError("No items could be extracted from the image.")
        items = []
        for item in dados["items"]:
            matched_id = item.get("matched_ingredient_id")
            items.append({
                "name": item.get("name", ""),
                "quantity": Decimal(str(item.get("quantity", 0))),
                "unit_cost": Decimal(str(item.get("price", 0))),
                "unit": item.get("unit", "un"),
                "matched_ingredient_id": UUID(matched_id) if matched_id else None,
                "is_new_ingredient": bool(item.get("is_new_ingredient", not matched_id)),
            })
        total = sum(i["quantity"] * i["unit_cost"] for i in items)
        raw_date = dados.get("purchase_date")
        return {
            "purchase_date": raw_date,
            "total_amount": total,
            "ingredients": items,
        }

    def confirm_purchase_from_image(
        self,
        items: list,
        *,
        purchase_date: date | None = None,
        notes: str | None = None,
    ) -> Purchase:
        """Create a purchase from user-confirmed extracted items, creating new ingredients as needed."""
        ingredientes_input = []
        for item in items:
            if item.matched_ingredient_id:
                ingredient_id = item.matched_ingredient_id
            else:
                new_ingredient = Ingredient(
                    tenant_id=self.tenant_id,
                    name=item.name,
                    unit=item.unit,
                )
                ingredient_id = self.ingredient_repository.add(
                    new_ingredient,
                    commit=False,
                ).id

            ingredientes_input.append(
                PurchaseIngredientInput(
                    ingredient_id=ingredient_id,
                    quantity=item.quantity,
                    unit_cost=item.unit_cost,
                )
            )
        return self.create_purchase(
            ingredientes_input,
            supplier_id=None,
            purchased_on=purchase_date,
            notes=notes,
        )