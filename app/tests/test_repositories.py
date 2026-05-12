# Copyright (c) 2026 Monli. All rights reserved.

"""Repository smoke tests."""

from collections.abc import Iterator
from decimal import Decimal
from uuid import UUID

import pytest
from sqlmodel import Session, SQLModel, create_engine

from monli.entities import Ingredient, Product, Tenant, User
from monli.repositories import (
    IngredientRepository,
    ProductRepository,
    TenantRepository,
    UserRepository,
)


@pytest.fixture()
def session() -> Iterator[Session]:
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        yield session


@pytest.fixture()
def tenant_id(session: Session) -> UUID:
    tenant = TenantRepository(session).add(Tenant(name="Cake Co", slug="cake-co"))
    return tenant.id


def test_repository_add_get_update_and_delete(
    session: Session,
    tenant_id: UUID,
) -> None:
    repository = UserRepository(session, tenant_id)
    user = repository.add(
        User(
            tenant_id=tenant_id,
            full_name="Monli Admin",
            email="admin@monli.test",
            hashed_password="hashed",
        ),
    )

    found_user = repository.get(user.id)

    assert found_user is not None
    assert found_user.email == "admin@monli.test"

    repository.update(found_user, {"full_name": "Updated Admin"})
    assert repository.get(user.id).full_name == "Updated Admin"  # type: ignore[union-attr]

    repository.delete(found_user)
    assert repository.get(user.id) is None


def test_user_repository_get_by_email(session: Session, tenant_id: UUID) -> None:
    repository = UserRepository(session, tenant_id)
    repository.add(
        User(
            tenant_id=tenant_id,
            full_name="Monli Admin",
            email="admin@monli.test",
            hashed_password="hashed",
        ),
    )

    user = repository.get_by_email("admin@monli.test")

    assert user is not None
    assert user.full_name == "Monli Admin"


def test_product_repository_lists_active_products(
    session: Session,
    tenant_id: UUID,
) -> None:
    repository = ProductRepository(session, tenant_id)
    repository.add(
        Product(
            tenant_id=tenant_id,
            name="Cake slice",
            sale_price=Decimal("12.00"),
        ),
    )
    repository.add(Product(tenant_id=tenant_id, name="Archived item", is_active=False))

    products = repository.list_active()

    assert [product.name for product in products] == ["Cake slice"]


def test_ingredient_repository_lists_by_supplier(
    session: Session,
    tenant_id: UUID,
) -> None:
    repository = IngredientRepository(session, tenant_id)
    ingredient = repository.add(
        Ingredient(
            tenant_id=tenant_id,
            name="Flour",
            unit="kg",
            unit_cost=Decimal("5.50"),
        ),
    )

    ingredients = repository.search_by_name("flo")

    assert ingredients == [ingredient]


def test_tenant_scoped_repository_does_not_leak_records(
    session: Session,
    tenant_id: UUID,
) -> None:
    other_tenant_id = TenantRepository(session).add(
        Tenant(name="Bread Co", slug="bread-co"),
    ).id
    first_repository = ProductRepository(session, tenant_id)
    other_repository = ProductRepository(session, other_tenant_id)
    first_product = first_repository.add(
        Product(tenant_id=tenant_id, name="Cake slice"),
    )
    other_repository.add(Product(tenant_id=other_tenant_id, name="Bread loaf"))

    assert first_repository.get(first_product.id) == first_product
    assert other_repository.get(first_product.id) is None
    assert [product.name for product in first_repository.list()] == ["Cake slice"]


def test_tenant_scoped_repository_rejects_wrong_tenant(
    session: Session,
    tenant_id: UUID,
) -> None:
    other_tenant_id = TenantRepository(session).add(
        Tenant(name="Bread Co", slug="bread-co"),
    ).id
    repository = ProductRepository(session, tenant_id)

    with pytest.raises(ValueError, match="tenant_id does not match"):
        repository.add(Product(tenant_id=other_tenant_id, name="Bread loaf"))
