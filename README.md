# Dayflow HRMS

![Dayflow HRMS Logo](https://placehold.co/960x180/0f172a/ffffff?text=Dayflow+HRMS)

[![Django](https://img.shields.io/badge/Django-5.x-0f172a?logo=django&logoColor=fff)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/DRF-3.16-ff6b6b)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/React-19-0ea5e9?logo=react&logoColor=fff)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-8b5cf6?logo=vite&logoColor=fff)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-0db7ed?logo=docker&logoColor=fff)](https://docs.docker.com/compose/)

Dayflow is a full-stack Human Resource Management System that ships a Django REST API and a Vite + React frontend. It covers core HR flows: authentication, attendance, leave management, payroll, notifications, and lightweight dashboards for employees and HR/Admin roles.

## Features

- **Auth & RBAC**: Custom user model with roles (ADMIN, HR, EMPLOYEE), JWT auth (access/refresh), password reset, change password, logout, token refresh.
- **Attendance**: Check-in/out, monthly summaries, detailed records, regularization requests with HR/Admin approval.
- **Leaves**: Apply/cancel, HR/Admin approval, filters; leave types include PAID, SICK, UNPAID, CASUAL.
- **Payroll**: Salary structures, payroll components (allowance/deduction), payroll generation, status updates (DRAFT/PROCESSED/PAID), summaries, employee self-view.
- **Notifications**: Per-user notifications, broadcast, mark-all-read, preferences, stats.
- **Dashboards**: Employee snapshot (today’s attendance, pending leaves, current payroll) and HR snapshot (attendance counts, pending leaves, payroll processed).
- **Middleware & Logging**: Request logging, JWT middleware, audit logging, global error handling, rotating logs in `logs/`.

## Tech Stack

- **Backend**: Django/DRF, SimpleJWT, CORS headers, Pillow; default SQLite storage.
- **Frontend**: React 19, Vite, TailwindCSS v4, React Router v7, Framer Motion.
- **Infrastructure**: Docker Compose services for backend (Python 3.14) and frontend (Node 20 alpine).

## Repository Layout

- `backend/Dayflow/` – Django project with apps: users, attendance, leaves, payroll, dashboard, notifications, middleware.
- `client/` – React SPA (Vite) consuming the API.
- `api-endpoints.md` – Endpoint reference.
- `docker-compose.yml` – Local orchestration (backend + frontend).

## Quick Links

- Frontend guide: [client/README.md](client/README.md)
- Backend guide: [backend/README.md](backend/README.md)
- API reference: [api-endpoints.md](api-endpoints.md)
- Backend settings: [backend/Dayflow/Dayflow/settings.py](backend/Dayflow/Dayflow/settings.py)

## Quickstart (Docker Compose)

1. Prerequisites: Docker + Docker Compose.
2. Build and start: `docker compose up --build -d` (runs migrations before starting backend).
3. Frontend: http://localhost:3000
4. Backend API: http://localhost:8000
5. Stop: `docker compose down`

## Backend (local dev)

1. Python 3.10+ recommended.
2. `cd backend`
3. `python -m venv .venv && source .venv/bin/activate` (PowerShell: `.venv\Scripts\Activate`)
4. Install deps: `pip install -r requirements.txt` (use this file as the canonical dependency list).
5. `python Dayflow/manage.py migrate`
6. `python Dayflow/manage.py runserver 0.0.0.0:8000`

## Frontend (local dev)

1. `cd client`
2. `npm install`
3. Create `.env.local` with `VITE_API_BASE_URL=http://localhost:8000`
4. `npm run dev` (defaults to http://localhost:5173)

## Environment Variables

Backend (commonly used):

- `SECRET_KEY` – Django secret.
- `DEBUG` – `True`/`False`.
- `DB_ENGINE`, `DB_NAME` – Defaults to SQLite `db.sqlite3`.
- `ALLOWED_HOSTS` – Comma-separated hosts.
- `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` – For SMTP if sending real emails.

Frontend:

- `VITE_API_BASE_URL` – Base API URL (e.g., http://localhost:8000).

## Architecture

- SPA frontend (Vite/React) consuming REST APIs.
- Django/DRF backend with JWT auth and RBAC.
- SQLite by default; swap `DATABASES` for Postgres in production.
- Docker Compose for local dev: backend (Python 3.14) + frontend (Node 20) on a shared bridge network.

## API Reference

- See [api-endpoints.md](api-endpoints.md) for endpoint details (users, attendance, leaves, payroll, notifications, dashboards).

## Logging

- Logs are written to `logs/dayflow.log`, `logs/audit.log`, and `logs/errors.log` with rotation configured.

## Testing

- Backend: `cd backend && python Dayflow/manage.py test`
- Frontend: `cd client && npm test`
