# Copyright (c) 2026 Monli. All rights reserved.

"""Product business service."""

from collections.abc import Sequence
from decimal import Decimal
from uuid import UUID

from monli.entities import Product
from monli.repositories import ProductRepository


class ProductService:
    """Manages product CRUD for a tenant."""

    def __init__(self, product_repository: ProductRepository) -> None:
        self.product_repository = product_repository
        self.tenant_id = product_repository.tenant_id

    def create(
        self,
        *,
        name: str,
        description: str | None,
        sale_price: Decimal,
    ) -> Product:
        return self.product_repository.add(
            Product(
                tenant_id=self.tenant_id,
                name=name,
                description=description,
                sale_price=sale_price,
            )
        )

    def list(self) -> Sequence[Product]:
        return self.product_repository.list()

    def get(self, product_id: UUID) -> Product | None:
        return self.product_repository.get(product_id)

    def update(self, product_id: UUID, values: dict) -> Product | None:
        """Update a product's fields."""
        product = self.product_repository.get(product_id)
        if product is None:
            return None
        return self.product_repository.update(product, {k: v for k, v in values.items() if v is not None})
