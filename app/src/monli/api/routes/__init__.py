# Copyright (c) 2026 Monli. All rights reserved.

"""API route modules."""

from fastapi import APIRouter

from monli.api.routes import (
    auth_routes,
    customers_routes,
    ingredients_routes,
    inventory_routes,
    products_routes,
    purchases_routes,
    recipes_routes,
    sellings_routes,
    suppliers_routes,
    tenants_routes,
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_routes.router)
api_router.include_router(tenants_routes.router)
api_router.include_router(products_routes.router)
api_router.include_router(ingredients_routes.router)
api_router.include_router(recipes_routes.router)
api_router.include_router(purchases_routes.router)
api_router.include_router(sellings_routes.router)
api_router.include_router(inventory_routes.router)
api_router.include_router(suppliers_routes.router)
api_router.include_router(customers_routes.router)

__all__ = ["api_router"]
