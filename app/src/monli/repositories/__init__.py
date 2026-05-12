# Copyright (c) 2026 Monli. All rights reserved.

"""Persistence repositories for Monli entities."""

from monli.repositories.base_repository import Repository, TenantScopedRepository
from monli.repositories.customer_repository import CustomerRepository
from monli.repositories.ingredient_repository import IngredientRepository
from monli.repositories.inventory_repository import InventoryRepository
from monli.repositories.product_repository import ProductRepository
from monli.repositories.purchase_repository import PurchaseRepository
from monli.repositories.recipe_repository import RecipeRepository
from monli.repositories.selling_repository import SellingRepository
from monli.repositories.supplier_repository import SupplierRepository
from monli.repositories.tenant_repository import TenantRepository
from monli.repositories.user_repository import UserRepository

__all__ = [
    "CustomerRepository",
    "IngredientRepository",
    "InventoryRepository",
    "ProductRepository",
    "PurchaseRepository",
    "RecipeRepository",
    "Repository",
    "SellingRepository",
    "SupplierRepository",
    "TenantRepository",
    "TenantScopedRepository",
    "UserRepository",
]
