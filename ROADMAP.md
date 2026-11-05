# Roadmap — Monli

Monli already has a broad FastAPI/React foundation for small food businesses: customers, suppliers, inventory, recipes, products, purchases, sales, reports, authentication, and tests. The next work should focus on making the financial data trustworthy and the daily workflow cohesive.

## 1. Validate end-to-end business workflows

- Define and test complete purchase-to-stock, recipe-to-cost, and sale-to-inventory/financial-result flows.
- Enforce tenant isolation and authorization consistently across every repository and API route.
- Make inventory adjustments transactional and provide a traceable movement history with reasons and actor details.
- Add validation for units, duplicate records, negative stock, and invalid financial values.

## 2. Turn data into operational insight

- Complete reports for cash flow, revenue, costs, margins, low stock, and product/recipe profitability.
- Base recipe and product cost on current ingredient purchase prices, keeping historical cost snapshots for past sales.
- Add configurable dashboard date ranges, filters, exports, and clear empty/loading/error states.

## 3. Improve the small-business experience

- Finish mobile-first create/edit/detail screens across all core entities.
- Add onboarding for a new tenant: company profile, initial inventory, suppliers, and first product/recipe.
- Add settings for currency, tax, units, minimum stock, and team members/roles.

## 4. Prepare for reliable release

- Increase API and frontend coverage around permissions, calculations, and mutations; run both suites in CI.
- Use PostgreSQL and Redis in reproducible local/production environments, with migrations, backups, and health checks.
- Add observability, error reporting, accessibility checks, and deployment documentation.
