# Copyright (c) 2026 Monli. All rights reserved.

"""Product API controller."""

from collections.abc import Sequence
from decimal import Decimal
from uuid import UUID

from monli.entities import Product
from monli.services.product_service import ProductService


class ProductController:
    """Coordinates product HTTP operations."""

    def __init__(self, product_service: ProductService) -> None:
        self.product_service = product_service

    def create(
        self,
        *,
        name: str,
        description: str | None,
        sale_price: Decimal,
    ) -> Product:
        return self.product_service.create(name=name, description=description, sale_price=sale_price)

    def list(self) -> Sequence[Product]:
        return self.product_service.list()

    def get(self, product_id: UUID) -> Product | None:
        return self.product_service.get(product_id)

    def update(self, product_id: UUID, values: dict) -> Product | None:
        """Update a product."""
        return self.product_service.update(product_id, values)
