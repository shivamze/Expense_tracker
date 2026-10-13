# Trackr : Expense & Savings Tracker

A full-stack personal finance app for recording expenses and savings, scanning receipts with OCR, and seeing where your money goes on a clear dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.116-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

| | |
|---|---|
| **Live app** | https://expense-tracker-topaz-psi-34.vercel.app |
| **API docs (Swagger)** | https://expense-tracker-api-3dzm.onrender.com/docs |
| **Source** | https://github.com/shivamze/Expense_tracker |

> **Note:** the demo runs on free hosting tiers. The backend sleeps after a period of inactivity, so the first request can take up to a minute while it wakes up.

<!-- Add demo credentials here if you create a shared demo account. -->

## Screenshots

| Dashboard | Expenses | Mobile |
|---|---|---|
|<img width="1886" height="904" alt="image" src="https://github.com/user-attachments/assets/7e1b549d-b409-4cd9-905a-711eadff5ceb" />|<img width="1895" height="889" alt="image" src="https://github.com/user-attachments/assets/03f9d699-50e9-4858-9883-57ca32db23f7" /> | <img width="350" height="794" alt="image" src="https://github.com/user-attachments/assets/842300cd-571c-4fb5-b820-24d4ba343c2e" />|

## Features

**Expenses**
- Create, edit and delete expenses with category, amount, date and title
- Server-side pagination, search, category filter, date-range filter and sorting
- Receipt scanning: upload an image and the app pre-fills title, amount and date using Tesseract OCR

**Savings and income**
- Track income, SIPs, investments and other deposits
- The same filtering, pagination and sorting as expenses

**Dashboard**
- Period views for today, this week and any month
- Summary cards for income, expenses, savings and remaining balance
- Spending-by-category pie chart and recent activity
- Amounts formatted in INR (₹)

**Accounts and security**
- Registration and login with short-lived JWT access tokens
- Rotating refresh tokens stored as hashes, delivered in an httpOnly cookie
- Every record is scoped to its owner at the query level

**Experience**
- Responsive layout with a mobile bottom navigation bar
- Loading skeletons, empty states and confirmation dialogs

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, TanStack Query, Axios, Recharts |
| Backend | FastAPI, SQLAlchemy 2, Alembic, Pydantic v2, PyJWT, Argon2 (pwdlib), pytesseract |
| Database | PostgreSQL 16 |
| DevOps | Docker, Docker Compose, multi-stage frontend image |
| Hosting | Vercel (frontend), Render (backend), Neon (database) |

## Architecture

```mermaid
flowchart LR
    B[Browser] -->|loads UI| FE[Next.js<br/>Vercel]
    B -->|REST + JWT| API[FastAPI<br/>Render, Docker]
    API --> DB[(PostgreSQL<br/>Neon)]
    API --> OCR[Tesseract OCR]
```

### Authentication flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    C->>A: POST /auth/login
    A-->>C: access token (body) + refresh token (httpOnly cookie)
    C->>A: request with Bearer access token
    A-->>C: 401 when the access token has expired
    C->>A: POST /auth/refresh (cookie)
    A-->>C: new access token + rotated refresh cookie
    C->>A: retry the original request
```

The Axios client shares a single in-flight refresh promise, so several parallel requests that hit an expired token trigger only one refresh call.

## Project Structure

```text
.
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── alembic/                 # database migrations
│   └── app/
│       ├── main.py              # app entry point, CORS, routers
│       ├── core/                # settings, security helpers, OCR service
│       ├── db/                  # engine, session, SQLAlchemy models
│       ├── modules/
│       │   ├── auth/            # router, crud, schemas, dependencies
│       │   ├── expenses/
│       │   └── savings/
│       └── tests/
└── frontend/
    ├── Dockerfile
    └── src/
        ├── app/                 # routes and UI components
        ├── context/             # AuthContext
        ├── hooks/               # TanStack Query hooks, one per operation
        ├── lib/api.ts           # Axios client with token refresh
        ├── providers/
        ├── types/
        └── middleware.ts        # route guard for protected pages
```

Each backend feature lives in its own module (`router`, `crud`, `schemas`), and each frontend data operation has its own hook.

## Getting Started

### Option 1: Docker Compose (recommended)

Requirements: Docker with Compose.

```bash
git clone https://github.com/shivamze/Expense_tracker.git
cd Expense_tracker
cp .env.example .env        # then edit the values, see Configuration below
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| API docs | http://localhost:8000/docs |
| PostgreSQL (from your machine) | `localhost:5433` |

Database migrations run automatically when the backend container starts.

### Option 2: Run each part manually

**Backend** (Python 3.12 and Tesseract installed locally):

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
# create backend/.env, see Configuration
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend** (Node 20.9 or newer):

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

## Configuration

Copy `.env.example` to `.env` in the project root for Docker Compose. For a manual backend run, place the backend variables in `backend/.env`.

| Variable | Description | Example |
|---|---|---|
| `POSTGRES_DB` | Database name (Compose) | `expense_db` |
| `POSTGRES_USER` | Database user (Compose) | `expense_user` |
| `POSTGRES_PASSWORD` | Database password (Compose) | a strong password |
| `DB_URL` | SQLAlchemy connection string | `postgresql+psycopg://expense_user:PASSWORD@postgres:5432/expense_db` |
| `TEST_DB_URL` | Separate database for tests (optional) | `postgresql+psycopg://expense_user:PASSWORD@postgres:5432/tests` |
| `SECRET_KEY` | Key used to sign JWTs | output of `openssl rand -hex 32` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime | `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime | `7` |
| `TESSERACT_CMD` | Path to the Tesseract binary | `/usr/bin/tesseract` |
| `NEXT_PUBLIC_API_URL` | Backend URL used by the browser | `http://localhost:8000` |

Notes:
- The user, password and database name inside `DB_URL` must match the `POSTGRES_*` values.
- `NEXT_PUBLIC_API_URL` is embedded in the frontend at **build time**. Change it, then rebuild the frontend.
- Never commit `.env`. Generate a new `SECRET_KEY` for every environment.

To generate a secret key without OpenSSL:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## Database Migrations

Schema changes are managed with Alembic:

```bash
cd backend
alembic revision --autogenerate -m "describe the change"
alembic upgrade head
```

## API Overview

Full interactive documentation is available at `/docs`.

| Area | Method and path | Description |
|---|---|---|
| Auth | `POST /auth/register` | Create an account |
| Auth | `POST /auth/login` | Log in (form data), returns an access token and sets the refresh cookie |
| Auth | `POST /auth/refresh` | Rotate the refresh token and issue a new access token |
| Auth | `POST /auth/logout` | Revoke the refresh token and clear the cookie |
| Auth | `GET /auth/me` | Current user |
| Auth | `PUT /auth/update` | Update name or email |
| Auth | `DELETE /auth/delete` | Delete the account |
| Expenses | `GET /expense/` | List with `page`, `page_size`, `search`, `category`, `start_date`, `end_date`, `sort` |
| Expenses | `POST /expense/` | Create |
| Expenses | `PATCH /expense/{id}` | Update |
| Expenses | `DELETE /expense/{id}` | Delete |
| Expenses | `GET /expense/summary` | Totals, category breakdown and recent activity for a date range |
| Savings | `GET /savings/` | List with `page`, `page_size`, `search`, `savings_type`, `start_date`, `end_date`, `sort` |
| Savings | `POST /savings/` | Create |
| Savings | `PATCH /savings/{id}` | Update |
| Savings | `DELETE /savings/{id}` | Delete |
| Savings | `GET /savings/summary` | Income and savings totals for a date range |
| OCR | `POST /extract` | Extract title, amount and date from a receipt image |
| System | `GET /health` | Health check |

## Security

What is implemented:

- **Password hashing:** Argon2 through `pwdlib`.
- **Access tokens:** signed JWTs (HS256) with a configurable short lifetime.
- **Refresh tokens:** random 64-byte values, stored only as SHA-256 hashes, rotated on every use, revoked on logout, and sent in an httpOnly cookie scoped to `/auth`.
- **Authorization:** every query for user-owned data filters by the authenticated user's ID, so one user cannot read, edit or delete another user's records.
- **Output control:** user endpoints return explicit fields, so the password hash is never serialized.
- **CORS:** an explicit origin allow-list with credentials enabled.

Known trade-off: the access token is kept in a JavaScript-readable cookie so the client can attach it as a Bearer header and the route guard can check for a session. The short lifetime and refresh-token rotation limit the impact. Moving the token into memory or proxying API calls through the frontend are the next steps.

## Deployment

The live demo uses three free-tier services:

| Part | Service | Setup |
|---|---|---|
| Database | Neon | Create a project and use its connection string as `DB_URL`, changing the prefix to `postgresql+psycopg://` and keeping `sslmode=require` |
| Backend | Render (Docker) | Root directory `backend`, health check path `/health`, with the backend environment variables from the table above |
| Frontend | Vercel | Root directory `frontend`, with `NEXT_PUBLIC_API_URL` set to the backend URL |

The frontend's exact origin must be listed in the CORS allow-list in `backend/app/main.py`. The project was also deployed earlier on AWS EC2 using the same Docker Compose setup.

## Testing

Backend tests use `pytest` against a separate database:

```bash
cd backend
# TEST_DB_URL must point to an empty, dedicated database
pytest
```

The suite is being updated to match the paginated list endpoints (see Roadmap).

## Roadmap

- [ ] GitHub Actions pipeline for tests, linting and image builds
- [ ] Update and extend the pytest suite, including authorization tests
- [ ] Require authentication, size limits and rate limiting on the receipt-scan endpoint
- [ ] Load CORS origins and cookie settings from environment variables
- [ ] Store money as `Numeric(12, 2)` instead of floating point
- [ ] Fix the `Shoping` category spelling with a migration
- [ ] Custom domain with HTTPS so cookies are first-party
- [ ] Profile settings screen using the existing update and delete endpoints
- [ ] Budgets and savings goals
- [ ] CSV export

## Author

Built by **Shivam Singh** ([@shivamze](https://github.com/shivamze)).
