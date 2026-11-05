# Monli Backend

This directory contains the backend API for Monli, a financial management platform for small food businesses. The service is built with FastAPI and uses a modular architecture to handle authentication, entities, repositories, services, and API routes.

## Purpose

The backend exposes business logic and persistence services for the Monli ecosystem, including:

- Customer, supplier, and user management
- Inventory and ingredient tracking
- Product and recipe workflows
- Purchase and sales operations
- Reporting and analytics endpoints
- Authentication and authorization

## Tech stack

- Python 3.13+
- FastAPI
- SQLModel
- PostgreSQL-compatible database access
- Redis support
- Alembic for database migrations
- Pydantic for validation and settings

## Project structure

```text
app/
├── migrations/
│   ├── versions/
│   ├── env.py
│   ├── README
│   └── script.py.mako
├── src/
│   └── monli/
│       ├── api/
│       ├── entities/
│       ├── repositories/
│       ├── services/
│       ├── scripts/
│       ├── database.py
│       ├── main.py
│       └── settings.py
├── tests/
├── pyproject.toml
├── requirements.txt
├── README.md
├── LICENSE
└── alembic.ini
```

## Getting started

From this folder, create a virtual environment and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# or:
pip install -e .
```

Start the API:

```bash
PYTHONPATH=src uvicorn monli.main:app --reload
```

The API documentation will be available at:

- http://localhost:8000/docs
- http://localhost:8000/redoc

## Configuration

The application settings are defined in `src/monli/settings.py` and support environment-based configuration through a `.env` file. Standard settings include the app environment, secret key, JWT configuration, database URL, and frontend URL.

## Development notes

- Database migrations are managed with Alembic.
- Business logic is separated into entities, repositories, and services.
- API routes are organized under the `monli.api` package.
- Tests live under the `tests/` folder.

## License

This backend is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
