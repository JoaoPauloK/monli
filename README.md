# Monli

Monli is a full-stack financial management platform designed for small food businesses. The project combines a FastAPI backend for business logic, API endpoints, authentication, and persistence with a Vite + React frontend for a modern web experience.

## Overview

This repository is organized into two main areas:

- `app/` — the backend application built with Python, FastAPI, SQLModel, and PostgreSQL-ready data access.
- `web/` — the client application built with React, TypeScript, and Vite.

Together, these services provide a workflow for managing inventory, suppliers, customers, recipes, sales, purchases, and reporting.

## Project structure

```text
monli/
├── app/
│   ├── migrations/
│   ├── src/
│   ├── tests/
│   ├── pyproject.toml
│   ├── requirements.txt
│   └── README.md
├── web/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
├── README.md
├── LICENSE
└── .git/
```

## Main capabilities

- Customer, supplier, and inventory tracking
- Ingredient and recipe management
- Sales and purchase flows
- Financial reporting and operational dashboards
- Secure authentication and user management
- API-first backend architecture suitable for integrations and automation

## Getting started

### Backend

```bash
cd app
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# or install the project in editable mode
pip install -e .
```

Then run the API server:

```bash
PYTHONPATH=src uvicorn monli.main:app --reload
```

The backend API documentation is typically available at:

- http://localhost:8000/docs
- http://localhost:8000/redoc

### Frontend

```bash
cd web
npm install
npm run dev
```

The frontend is usually served locally at:

- http://localhost:5173

## Environment configuration

The backend reads settings from an environment file or defaults defined in the application configuration. For local development, make sure your environment variables are configured before starting the API.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
