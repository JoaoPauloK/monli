# Copyright (c) 2026 Monli. All rights reserved.

"""Service layer tests."""

from collections.abc import Iterator
from decimal import Decimal
from uuid import UUID

import pytest
from sqlmodel import Session, SQLModel, create_engine

from monli.entities import Ingredient, Product, Tenant
from monli.repositories import (
    IngredientRepository,
    ProductRepository,
    TenantRepository,
)
from monli.services import (
    PurchaseIngredientInput,
    RecipeIngredientInput,
    SellingProductInput,
    build_inventory_service,
    build_purchase_service,
    build_recipe_service,
    build_selling_service,
)


@pytest.fixture()
def session() -> Iterator[Session]:
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        yield session


@pytest.fixture()
def tenant_id(session: Session) -> UUID:
    return TenantRepository(session).add(Tenant(name="Cake Co", slug="cake-co")).id


def test_recipe_service_creates_recipe_and_updates_estimated_cost(
    session: Session,
    tenant_id: UUID,
) -> None:
    product = ProductRepository(session, tenant_id).add(
        Product(tenant_id=tenant_id, name="Cake slice"),
    )
    ingredient = IngredientRepository(session, tenant_id).add(
        Ingredient(
            tenant_id=tenant_id,
            name="Flour",
            unit="kg",
            unit_cost=Decimal("8.00"),
        ),
    )

    recipe = build_recipe_service(session, tenant_id).create_recipe(
        product.id,
        [RecipeIngredientInput(ingredient.id, Decimal("0.250"))],
    )
    session.refresh(product)

    assert recipe.product_id == product.id
    assert product.estimated_cost == Decimal("2.00")


def test_purchase_service_increases_ingredient_inventory(
    session: Session,
    tenant_id: UUID,
) -> None:
    ingredient = IngredientRepository(session, tenant_id).add(
        Ingredient(
            tenant_id=tenant_id,
            name="Flour",
            unit="kg",
            unit_cost=Decimal("8.00"),
        ),
    )

    purchase = build_purchase_service(session, tenant_id).create_purchase(
        [
            PurchaseIngredientInput(
                ingredient_id=ingredient.id,
                quantity=Decimal("3.500"),
                unit_cost=Decimal("8.00"),
            ),
        ],
    )
    inventory_item = build_inventory_service(
        session,
        tenant_id,
    ).inventory_repository.get_by_ingredient(ingredient.id)

    assert purchase.total_amount == Decimal("28.00000")
    assert inventory_item is not None
    assert inventory_item.quantity == Decimal("3.500")


def test_selling_service_decreases_product_inventory(
    session: Session,
    tenant_id: UUID,
) -> None:
    product = ProductRepository(session, tenant_id).add(
        Product(
            tenant_id=tenant_id,
            name="Cake slice",
            sale_price=Decimal("12.00"),
        ),
    )
    inventory_service = build_inventory_service(session, tenant_id)
    inventory_service.increase_product(product.id, Decimal("5.000"))

    selling = build_selling_service(session, tenant_id).create_selling(
        [
            SellingProductInput(
                product_id=product.id,
                quantity=Decimal("2.000"),
                unit_price=Decimal("12.00"),
            ),
        ],
    )
    inventory_item = inventory_service.inventory_repository.get_by_product(product.id)

    assert selling.total_amount == Decimal("24.00000")
    assert inventory_item is not None
    assert inventory_item.quantity == Decimal("3.000")


def test_selling_service_rejects_insufficient_inventory(
    session: Session,
    tenant_id: UUID,
) -> None:
    product = ProductRepository(session, tenant_id).add(
        Product(tenant_id=tenant_id, name="Cake slice"),
    )

    with pytest.raises(ValueError, match="Insufficient product inventory"):
        build_selling_service(session, tenant_id).create_selling(
            [
                SellingProductInput(
                    product_id=product.id,
                    quantity=Decimal("1.000"),
                    unit_price=Decimal("12.00"),
                ),
            ],
        )


def test_selling_service_rejects_other_tenant_product(
    session: Session,
    tenant_id: UUID,
) -> None:
    other_tenant_id = TenantRepository(session).add(
        Tenant(name="Bread Co", slug="bread-co"),
    ).id
    other_product = ProductRepository(session, other_tenant_id).add(
        Product(tenant_id=other_tenant_id, name="Bread loaf"),
    )

    with pytest.raises(ValueError, match="Product not found for this tenant"):
        build_selling_service(session, tenant_id).create_selling(
            [
                SellingProductInput(
                    product_id=other_product.id,
                    quantity=Decimal("1.000"),
                    unit_price=Decimal("10.00"),
                ),
            ],
        )
