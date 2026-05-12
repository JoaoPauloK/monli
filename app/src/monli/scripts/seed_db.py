# Copyright (c) 2026 Monli. All rights reserved.

"""Database seeding script for Monli.

This script inserts realistic mock data into every table defined in the project
entities. Run it when you want to populate the database with a complete demo
workspace for development and testing.

Usage:
    cd /home/joaopaulo/monli/app
    PYTHONPATH=src python -m monli.scripts.seed_db
"""

from datetime import date, timedelta
from decimal import Decimal
import random

from sqlmodel import Session, SQLModel, delete

from monli.api.security import hash_password
from monli.database import engine
from monli.entities import (
    Customer,
    Ingredient,
    InventoryItem,
    InventoryItemType,
    Product,
    Purchase,
    PurchaseIngredient,
    Recipe,
    RecipeIngredient,
    Selling,
    SellingProduct,
    Supplier,
    Tenant,
    User,
)


def clear_database(session: Session) -> None:
    """Remove existing records in dependency-safe order."""
    session.exec(delete(SellingProduct))
    session.exec(delete(Selling))
    session.exec(delete(PurchaseIngredient))
    session.exec(delete(Purchase))
    session.exec(delete(RecipeIngredient))
    session.exec(delete(Recipe))
    session.exec(delete(InventoryItem))
    session.exec(delete(Product))
    session.exec(delete(Ingredient))
    session.exec(delete(Supplier))
    session.exec(delete(Customer))
    session.exec(delete(User))
    session.exec(delete(Tenant))
    session.commit()


def seed_database() -> None:
    """Populate the database with mock Monli workspace data using random combinations."""
    SQLModel.metadata.create_all(engine)

    # Data pools for random generation
    first_names = ["Lucas", "Mariana", "João", "Maria", "Pedro", "Ana", "Carlos", "Fernanda", "Roberto", "Juliana", "Gabriel", "Larissa", "Rafael", "Beatriz", "Thiago"]
    last_names = ["Pereira", "Souza", "Silva", "Santos", "Oliveira", "Costa", "Rodrigues", "Almeida", "Nascimento", "Lima", "Fernandes", "Carvalho", "Gomes", "Martins", "Araujo"]
    supplier_names = ["Distribuidora Guimarães", "Alimentos Frescos Sul", "Fornecedora Central", "Suprimentos do Norte", "Distribuição Oeste", "Alimentos do Leste", "Fornecedores Gerais", "Distribuidora Sul"]
    ingredient_names = ["Farinha de trigo", "Ovos", "Leite integral", "Açúcar refinado", "Café em pó", "Manteiga", "Fermento", "Chocolate", "Canela", "Sal", "Óleo", "Queijo", "Presunto", "Tomate", "Cebola", "Alho", "Pimentão", "Cenoura", "Batata", "Arroz", "Frango", "Carne moída", "Peixe", "Maçã", "Banana"]
    product_names = ["Pão de queijo", "Pastel de carne", "Café expresso", "Bolo de chocolate", "Torta de maçã", "Suco natural", "Sanduíche", "Croissant", "Donut", "Pizza pequena", "Salada", "Sopa", "Sorvete", "Refrigerante", "Água mineral", "Hambúrguer", "Batata frita", "Milkshake", "Panqueca", "Biscoito"]
    units = ["kg", "l", "un"]
    instructions_templates = [
        "Misturar os ingredientes secos e líquidos, modelar e assar em forno.",
        "Preparar a massa, rechear e fritar até dourar.",
        "Extrair em máquina e servir quente.",
        "Cortar, misturar e cozinhar.",
        "Montar e servir fresco.",
        "Ferver os ingredientes e temperar.",
        "Assar até dourar e servir.",
        "Misturar e gelar antes de servir."
    ]
    notes_templates = [
        "Cliente tradicional.",
        "Compra diariamente.",
        "Cliente corporativo.",
        "Novo cliente.",
        "Cliente fiel.",
        "Compra em grandes quantidades.",
        "Cliente eventual.",
        "Recomendado por amigo."
    ]

    with Session(engine) as session:
        clear_database(session)

        # Create tenant
        tenant = Tenant(name="Padaria do Lucas", slug="padaria-do-lucas")
        session.add(tenant)
        session.flush()

        # Create users
        num_users = 10
        users = []
        for i in range(num_users):
            full_name = f"{random.choice(first_names)} {random.choice(last_names)}"
            email = f"{full_name.lower().replace(' ', '.')}@padariado.com"
            is_superuser = i == 0  # First user is superuser
            user = User(
                tenant_id=tenant.id,
                full_name=full_name,
                email=email,
                hashed_password=hash_password("senha123"),
                is_superuser=is_superuser,
            )
            users.append(user)
        session.add_all(users)
        session.flush()

        # Create suppliers
        num_suppliers = 8
        suppliers = []
        for i in range(num_suppliers):
            name = supplier_names[i % len(supplier_names)]
            email = f"contato@{name.lower().replace(' ', '').replace('ç', 'c').replace('ã', 'a')}dist.com"
            phone = f"(11) 400{i+2}-892{i+2}"
            notes = f"Fornece itens diversos para o estabelecimento."
            supplier = Supplier(
                tenant_id=tenant.id,
                name=name,
                email=email,
                phone=phone,
                notes=notes,
            )
            suppliers.append(supplier)
        session.add_all(suppliers)
        session.flush()

        # Create ingredients
        num_ingredients = 25
        ingredients = []
        for i in range(num_ingredients):
            name = ingredient_names[i % len(ingredient_names)]
            unit = random.choice(units)
            unit_cost = Decimal(str(round(random.uniform(1.0, 30.0), 2)))
            supplier_id = random.choice(suppliers).id
            ingredient = Ingredient(
                tenant_id=tenant.id,
                name=name,
                unit=unit,
                unit_cost=unit_cost,
                supplier_id=supplier_id,
            )
            ingredients.append(ingredient)
        session.add_all(ingredients)
        session.flush()

        # Create products
        num_products = 20
        products = []
        for i in range(num_products):
            name = product_names[i % len(product_names)]
            description = f"Produto delicioso: {name}."
            sale_price = Decimal(str(round(random.uniform(3.0, 25.0), 2)))
            estimated_cost = Decimal(str(round(float(sale_price) * random.uniform(0.3, 0.6), 2)))
            product = Product(
                tenant_id=tenant.id,
                name=name,
                description=description,
                sale_price=sale_price,
                estimated_cost=estimated_cost,
            )
            products.append(product)
        session.add_all(products)
        session.flush()

        # Create recipes and recipe_ingredients
        recipes = []
        recipe_ingredients = []
        for product in products:
            recipe = Recipe(
                tenant_id=tenant.id,
                product_id=product.id,
                instructions=random.choice(instructions_templates),
            )
            recipes.append(recipe)
            # Add 2-5 random ingredients per recipe
            selected_ingredients = random.sample(ingredients, random.randint(2, 5))
            for ing in selected_ingredients:
                quantity = Decimal(str(round(random.uniform(0.01, 1.0), 3)))
                ri = RecipeIngredient(
                    tenant_id=tenant.id,
                    recipe_id=None,  # Set after flush
                    ingredient_id=ing.id,
                    quantity=quantity,
                )
                recipe_ingredients.append((ri, recipe))  # Pair with recipe
        session.add_all(recipes)
        session.flush()
        # Now set recipe_ids
        for ri, recipe in recipe_ingredients:
            ri.recipe_id = recipe.id
        session.add_all([ri for ri, _ in recipe_ingredients])
        session.flush()

        # Create customers
        num_customers = 20
        customers = []
        for i in range(num_customers):
            name = f"{random.choice(first_names)} {random.choice(last_names)}"
            email = f"{name.lower().replace(' ', '.')}@gmail.com"
            phone = f"(11) 9{random.randint(8000,9999)}-{random.randint(1000,9999)}"
            notes = random.choice(notes_templates)
            customer = Customer(
                tenant_id=tenant.id,
                name=name,
                email=email,
                phone=phone,
                notes=notes,
            )
            customers.append(customer)
        session.add_all(customers)
        session.flush()

        # Create purchases and purchase_ingredients
        num_purchases = 15
        purchases = []
        purchase_ingredients = []
        for i in range(num_purchases):
            supplier = random.choice(suppliers)
            purchased_on = date.today() - timedelta(days=random.randint(0, 30))
            # Select 2-4 random ingredients for this purchase
            selected_ings = random.sample(ingredients, random.randint(2, 4))
            total_amount = Decimal("0.00")
            pis = []
            for ing in selected_ings:
                quantity = Decimal(str(round(random.uniform(10, 100), 3)))
                unit_cost = ing.unit_cost
                pi = PurchaseIngredient(
                    tenant_id=tenant.id,
                    purchase_id=None,  # Set after
                    ingredient_id=ing.id,
                    quantity=quantity,
                    unit_cost=unit_cost,
                )
                pis.append(pi)
                total_amount += quantity * unit_cost
            notes = f"Compra de {', '.join([ing.name for ing in selected_ings])}."
            purchase = Purchase(
                tenant_id=tenant.id,
                supplier_id=supplier.id,
                purchased_on=purchased_on,
                total_amount=total_amount,
                notes=notes,
            )
            purchases.append(purchase)
            purchase_ingredients.extend([(pi, purchase) for pi in pis])
        session.add_all(purchases)
        session.flush()
        # Set purchase_ids
        for pi, purchase in purchase_ingredients:
            pi.purchase_id = purchase.id
        session.add_all([pi for pi, _ in purchase_ingredients])
        session.flush()

        # Create inventory_items for all ingredients and products
        inventory_items = []
        for ing in ingredients:
            quantity = Decimal(str(round(random.uniform(20, 200), 3)))
            minimum_quantity = Decimal(str(round(float(quantity) * 0.2, 3)))
            ii = InventoryItem(
                tenant_id=tenant.id,
                item_type=InventoryItemType.INGREDIENT,
                ingredient_id=ing.id,
                quantity=quantity,
                minimum_quantity=minimum_quantity,
            )
            inventory_items.append(ii)
        for prod in products:
            quantity = Decimal(str(round(random.uniform(10, 100), 3)))
            minimum_quantity = Decimal(str(round(float(quantity) * 0.2, 3)))
            ii = InventoryItem(
                tenant_id=tenant.id,
                item_type=InventoryItemType.PRODUCT,
                product_id=prod.id,
                quantity=quantity,
                minimum_quantity=minimum_quantity,
            )
            inventory_items.append(ii)
        session.add_all(inventory_items)
        session.flush()

        # Create sellings and selling_products
        num_sellings = 30
        sellings = []
        selling_products = []
        for i in range(num_sellings):
            customer = random.choice(customers)
            sold_on = date.today() - timedelta(days=random.randint(0, 30))
            # Select 1-3 random products
            selected_prods = random.sample(products, random.randint(1, 3))
            total_amount = Decimal("0.00")
            sps = []
            for prod in selected_prods:
                quantity = Decimal(str(round(random.uniform(1, 10), 3)))
                unit_price = prod.sale_price
                sp = SellingProduct(
                    tenant_id=tenant.id,
                    selling_id=None,  # Set after
                    product_id=prod.id,
                    quantity=quantity,
                    unit_price=unit_price,
                )
                sps.append(sp)
                total_amount += quantity * unit_price
            notes = f"Venda de {', '.join([prod.name for prod in selected_prods])}."
            selling = Selling(
                tenant_id=tenant.id,
                customer_id=customer.id,
                sold_on=sold_on,
                total_amount=total_amount,
                notes=notes,
            )
            sellings.append(selling)
            selling_products.extend([(sp, selling) for sp in sps])
        session.add_all(sellings)
        session.flush()
        # Set selling_ids
        for sp, selling in selling_products:
            sp.selling_id = selling.id
        session.add_all([sp for sp, _ in selling_products])

        session.commit()

        print("Seed data inserted successfully.")


if __name__ == "__main__":
    seed_database()
