# Copyright (c) 2026 Monli. All rights reserved.

"""Default dependency factories for service construction."""

from uuid import UUID

from sqlmodel import Session

from monli.repositories import (
    CustomerRepository,
    IngredientRepository,
    InventoryRepository,
    ProductRepository,
    PurchaseRepository,
    RecipeRepository,
    SellingRepository,
    SupplierRepository,
    TenantRepository,
)
from monli.services.customer_service import CustomerService
from monli.services.ingredient_service import IngredientService
from monli.services.inventory_service import InventoryService
from monli.services.product_service import ProductService
from monli.services.purchase_service import PurchaseService
from monli.services.recipe_service import RecipeService
from monli.services.selling_service import SellingService
from monli.services.supplier_service import SupplierService
from monli.services.tenant_service import TenantService


def build_tenant_service(session: Session) -> TenantService:
    return TenantService(TenantRepository(session))


def build_customer_service(session: Session, tenant_id: UUID) -> CustomerService:
    return CustomerService(CustomerRepository(session, tenant_id))


def build_ingredient_service(session: Session, tenant_id: UUID) -> IngredientService:
    return IngredientService(IngredientRepository(session, tenant_id))


def build_product_service(session: Session, tenant_id: UUID) -> ProductService:
    return ProductService(ProductRepository(session, tenant_id))


def build_supplier_service(session: Session, tenant_id: UUID) -> SupplierService:
    return SupplierService(SupplierRepository(session, tenant_id))


def build_inventory_service(session: Session, tenant_id: UUID) -> InventoryService:
    return InventoryService(InventoryRepository(session, tenant_id))


def build_recipe_service(session: Session, tenant_id: UUID) -> RecipeService:
    return RecipeService(
        session,
        IngredientRepository(session, tenant_id),
        ProductRepository(session, tenant_id),
        RecipeRepository(session, tenant_id),
    )


def build_purchase_service(session: Session, tenant_id: UUID) -> PurchaseService:
    return PurchaseService(
        session,
        IngredientRepository(session, tenant_id),
        PurchaseRepository(session, tenant_id),
        SupplierRepository(session, tenant_id),
        build_inventory_service(session, tenant_id),
    )


def build_selling_service(session: Session, tenant_id: UUID) -> SellingService:
    return SellingService(
        session,
        CustomerRepository(session, tenant_id),
        ProductRepository(session, tenant_id),
        SellingRepository(session, tenant_id),
        build_inventory_service(session, tenant_id),
    )
