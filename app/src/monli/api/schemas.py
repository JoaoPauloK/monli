# Copyright (c) 2026 Monli. All rights reserved.

"""Request and response schemas for the HTTP API."""

from datetime import date, datetime
from decimal import Decimal
from typing import List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from monli.entities import InventoryItemType


class UserCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=150)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8)
    tenant_name: str = Field(min_length=1, max_length=120)
    tenant_slug: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9-]+$")


class UserLogin(BaseModel):
    email: str
    password: str
    tenant_slug: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    tenant_name: str = ""
    full_name: str
    email: str
    is_superuser: bool


class TokenPayload(BaseModel):
    sub: str
    tenant_id: str
    type: str
    exp: int


class TenantCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    slug: str = Field(min_length=1, max_length=80)


class TenantRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    is_active: bool


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    sale_price: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0"))


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    name: str
    description: str | None
    sale_price: Decimal
    estimated_cost: Decimal
    is_active: bool


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    sale_price: Decimal | None = Field(default=None, ge=Decimal("0"))


class IngredientCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    unit: str = Field(min_length=1, max_length=20)
    unit_cost: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0"))
    supplier_id: UUID | None = None


class IngredientRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    name: str
    unit: str
    unit_cost: Decimal
    avg_price: Decimal
    last_price: Decimal
    supplier_id: UUID | None


class IngredientUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    unit: str | None = Field(default=None, min_length=1, max_length=20)
    unit_cost: Decimal | None = Field(default=None, ge=Decimal("0"))
    supplier_id: UUID | None = None


class RecipeIngredientCreate(BaseModel):
    ingredient_id: UUID
    quantity: Decimal = Field(gt=Decimal("0"))


class RecipeCreate(BaseModel):
    product_id: UUID
    ingredients: list[RecipeIngredientCreate] = Field(min_length=1)
    instructions: str | None = Field(default=None, max_length=1000)


class RecipeIngredientRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ingredient: IngredientRead
    # unit: str
    quantity: Decimal


class RecipeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    product_id: UUID
    instructions: str | None
    ingredients: list[RecipeIngredientRead]


class ProductCostRead(BaseModel):
    product_id: UUID
    estimated_cost: Decimal


class PurchaseIngredientCreate(BaseModel):
    ingredient_id: UUID
    quantity: Decimal = Field(gt=Decimal("0"))
    unit_cost: Decimal = Field(ge=Decimal("0"))

class PurchaseIngredientRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    ingredient: IngredientRead
    quantity: Decimal
    unit_cost: Decimal

class PurchaseCreate(BaseModel):
    ingredients: list[PurchaseIngredientCreate] = Field(min_length=1)
    supplier_id: UUID | None = None
    purchased_on: date | None = None
    notes: str | None = Field(default=None, max_length=500)


class PurchaseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    supplier: SupplierRead | None
    purchased_on: date
    total_amount: Decimal
    ingredients: list[PurchaseIngredientRead] = Field(min_length=1)
    notes: str | None


class PurchaseUpdate(BaseModel):
    ingredients: list[PurchaseIngredientCreate] = Field(min_length=1)
    supplier_id: UUID | None = None
    purchased_on: date | None = None
    notes: str | None = Field(default=None, max_length=500)


class PurchaseImageCreate(BaseModel):
    image_bytes: bytes


class ExtractedItemRead(BaseModel):
    name: str
    quantity: Decimal
    unit_cost: Decimal
    unit: str
    matched_ingredient_id: UUID | None
    is_new_ingredient: bool


class PurchaseExtractionRead(BaseModel):
    purchase_date: date | None
    total_amount: Decimal | None
    ingredients: list[ExtractedItemRead]


class ExtractedItemConfirm(BaseModel):
    matched_ingredient_id: UUID | None = None
    name: str
    unit: str
    quantity: Decimal = Field(gt=Decimal("0"))
    unit_cost: Decimal = Field(ge=Decimal("0"))


class PurchaseImageConfirm(BaseModel):
    ingredients: list[ExtractedItemConfirm] = Field(min_length=1)
    purchase_date: date | None = None
    notes: str | None = Field(default=None, max_length=500)


class SellingProductCreate(BaseModel):
    product_id: UUID
    quantity: Decimal = Field(gt=Decimal("0"))
    unit_price: Decimal = Field(ge=Decimal("0"))


class SellingCreate(BaseModel):
    products: list[SellingProductCreate] = Field(min_length=1)
    customer_id: UUID | None = None
    sold_on: date | None = None
    notes: str | None = Field(default=None, max_length=500)


class SellingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    customer_id: UUID | None
    sold_on: date
    total_amount: Decimal
    notes: str | None


class SellingProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    product_id: UUID
    quantity: Decimal
    unit_price: Decimal


class SellingDetailRead(SellingRead):
    products: list[SellingProductRead] = []


class SellingUpdate(BaseModel):
    products: list[SellingProductCreate] = Field(min_length=1)
    customer_id: UUID | None = None
    sold_on: date | None = None
    notes: str | None = Field(default=None, max_length=500)


class InventoryItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    item_type: InventoryItemType
    ingredient_id: UUID | None
    product_id: UUID | None
    quantity: Decimal
    minimum_quantity: Decimal
    created_at: datetime
    updated_at: datetime


class SupplierCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=32)
    notes: str | None = Field(default=None, max_length=500)


class SupplierUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=32)
    notes: str | None = Field(default=None, max_length=500)


class SupplierRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    name: str
    email: str | None
    phone: str | None
    notes: str | None


class CustomerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=32)
    notes: str | None = Field(default=None, max_length=500)


class CustomerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=32)
    notes: str | None = Field(default=None, max_length=500)


class CustomerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    name: str
    email: str | None
    phone: str | None
    notes: str | None
