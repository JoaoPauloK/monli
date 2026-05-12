# Copyright (c) 2026 Monli. All rights reserved.

"""API route tests."""

from collections.abc import AsyncIterator, Iterator

import httpx
import pytest
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from monli.database import get_session
from monli.main import create_app


@pytest.fixture()
def app_client() -> Iterator[tuple[httpx.ASGITransport, str]]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    async def override_get_session() -> AsyncIterator[Session]:
        with Session(engine) as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_session] = override_get_session

    yield httpx.ASGITransport(app=app), "http://test"
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_tenant_product_ingredient_recipe_purchase_and_inventory_flow(
    app_client: tuple[httpx.ASGITransport, str],
) -> None:
    transport, base_url = app_client
    async with httpx.AsyncClient(transport=transport, base_url=base_url) as client:
        auth_response = await client.post(
            "/api/v1/auth/register",
            json={
                "full_name": "Test User",
                "email": "test@example.com",
                "password": "password123",
                "tenant_name": "Cake Co",
                "tenant_slug": "cake-co",
            },
        )
        assert auth_response.status_code == 201
        user_data = auth_response.json()
        tenant_id = user_data["tenant_id"]
        headers = {"X-Tenant-ID": tenant_id}

        product_response = await client.post(
            "/api/v1/products",
            headers=headers,
            json={"name": "Cake slice", "sale_price": "12.00"},
        )
        ingredient_response = await client.post(
            "/api/v1/ingredients",
            headers=headers,
            json={"name": "Flour", "unit": "kg", "unit_cost": "8.00"},
        )
        product_id = product_response.json()["id"]
        ingredient_id = ingredient_response.json()["id"]
        supplier_response = await client.post(
            "/api/v1/suppliers",
            headers=headers,
            json={"name": "Test Supplier"},
        )
        supplier_id = supplier_response.json()["id"]
        recipe_response = await client.post(
            "/api/v1/recipes",
            headers=headers,
            json={
                "product_id": product_id,
                "ingredients": [
                    {"ingredient_id": ingredient_id, "quantity": "0.250"},
                ],
                "instructions": "Mix and bake.",
            },
        )
        cost_response = await client.get(
            f"/api/v1/recipes/products/{product_id}/cost",
            headers=headers,
        )
        purchase_response = await client.post(
            "/api/v1/purchases",
            headers=headers,
            json={
                "supplier_id": supplier_id,
                "ingredients": [
                    {
                        "ingredient_id": ingredient_id,
                        "quantity": "3.500",
                        "unit_cost": "8.00",
                    },
                ],
            },
        )
        inventory_response = await client.get(
            f"/api/v1/inventory/ingredients/{ingredient_id}",
            headers=headers,
        )

    assert auth_response.status_code == 201
    assert product_response.status_code == 201
    assert ingredient_response.status_code == 201
    assert recipe_response.status_code == 201
    assert recipe_response.json()["product_id"] == product_id
    assert cost_response.status_code == 200
    assert cost_response.json()["estimated_cost"] == "2.00000"
    assert purchase_response.status_code == 201
    assert purchase_response.json()["total_amount"] == "28.00"
    assert inventory_response.status_code == 200
    assert inventory_response.json()["quantity"] == "3.500"


@pytest.mark.asyncio
async def test_tenant_header_scopes_product_list(
    app_client: tuple[httpx.ASGITransport, str],
) -> None:
    transport, base_url = app_client
    async with (
        httpx.AsyncClient(transport=transport, base_url=base_url) as client1,
        httpx.AsyncClient(transport=transport, base_url=base_url) as client2,
    ):
        auth_response = await client1.post(
            "/api/v1/auth/register",
            json={
                "full_name": "Test User",
                "email": "test@example.com",
                "password": "password123",
                "tenant_name": "Cake Co",
                "tenant_slug": "cake-co",
            },
        )
        assert auth_response.status_code == 201

        auth_response2 = await client2.post(
            "/api/v1/auth/register",
            json={
                "full_name": "Test User 2",
                "email": "test2@example.com",
                "password": "password123",
                "tenant_name": "Cake Co2",
                "tenant_slug": "cake-co-2",
            },
        )
        assert auth_response2.status_code == 201

        await client1.post("/api/v1/products", json={"name": "Cake slice"})
        await client2.post("/api/v1/products", json={"name": "Bread loaf"})

        response = await client1.get("/api/v1/products")

    assert response.status_code == 200
    assert [product["name"] for product in response.json()] == ["Cake slice"]


@pytest.mark.asyncio
async def test_selling_route_rejects_insufficient_inventory(
    app_client: tuple[httpx.ASGITransport, str],
) -> None:
    transport, base_url = app_client
    async with httpx.AsyncClient(transport=transport, base_url=base_url) as client:
        await client.post(
            "/api/v1/auth/register",
            json={
                "full_name": "Test User",
                "email": "test@example.com",
                "password": "password123",
                "tenant_name": "Cake Co",
                "tenant_slug": "cake-co",
            },
        )
        product_id = (
            await client.post(
                "/api/v1/products",
                json={"name": "Cake slice", "sale_price": "12.00"},
            )
        ).json()["id"]

        response = await client.post(
            "/api/v1/sellings",
            json={
                "products": [
                    {
                        "product_id": product_id,
                        "quantity": "1.000",
                        "unit_price": "12.00",
                    },
                ],
            },
        )

    assert response.status_code == 400
    assert response.json()["detail"] == "Insufficient product inventory."
