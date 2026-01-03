# Dayflow HRMS - Backend

![Dayflow Backend Logo](https://placehold.co/960x160/0f172a/ffffff?text=Dayflow+HRMS+Backend)

[![Django](https://img.shields.io/badge/Django-5.x-0f172a?logo=django&logoColor=fff)](https://www.djangoproject.com/) [![DRF](https://img.shields.io/badge/DRF-3.16-ff6b6b)](https://www.django-rest-framework.org/) [![SimpleJWT](https://img.shields.io/badge/SimpleJWT-auth-10b981)](https://django-rest-framework-simplejwt.readthedocs.io/en/latest/)

Django REST API powering Dayflow HRMS: authentication, attendance, leaves, payroll, notifications, dashboards, logging, and middleware.

## Apps

- `users` (custom user + JWT + profiles)
- `attendance` (check-in/out, regularization)
- `leaves` (apply/approve, CASUAL included)
- `payroll` (salary structure, payroll runs, components)
- `dashboard` (employee and HR snapshots)
- `notifications` (user notifications, broadcast)
- `middleware` (request logging, audit, JWT, error handling)

## Setup (local)

1. `cd backend`
2. `python -m venv .venv && .venv\\Scripts\\Activate` (PowerShell) or `source .venv/bin/activate` (bash)
3. Install deps (canonical): `pip install -r requirements.txt`
4. Migrate: `python Dayflow/manage.py migrate`
5. Run: `python Dayflow/manage.py runserver 0.0.0.0:8000`

> There is also `Dayflow/requirements.txt`. Use `backend/requirements.txt` as the canonical list for now.

## Setup (Docker Compose)

- Service name: `backend`
- Build/run: `docker compose up --build -d backend`
- Logs: `docker compose logs -f backend`

## Environment

- `SECRET_KEY` – Django secret
- `DEBUG` – True/False
- `ALLOWED_HOSTS` – comma-separated
- `DB_ENGINE`, `DB_NAME` – defaults to SQLite `db.sqlite3`
- `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` – if enabling SMTP

## Auth & RBAC

- JWT via SimpleJWT (access 1h, refresh 7d, rotation + blacklist)
- Roles: ADMIN, HR, EMPLOYEE
- Most endpoints require `Authorization: Bearer <token>`

## Key Paths

- Settings: `Dayflow/Dayflow/settings.py`
- URLs: `Dayflow/Dayflow/urls.py`
- Logs directory: `backend/logs/` (dayflow.log, audit.log, errors.log)

## Data & Migrations

- SQLite DB at `backend/Dayflow/db.sqlite3` by default
- Migrations: `python Dayflow/manage.py makemigrations` then `migrate`

## Admin

- Create superuser: `python Dayflow/manage.py createsuperuser`
- Admin URL: `/admin/`

## Testing

- Run: `python Dayflow/manage.py test`

## Notes

- Leave types allowed: PAID, SICK, UNPAID, CASUAL
- Payroll statuses: DRAFT, PROCESSED, PAID
- Attendance regularization supports approve/reject by HR/Admin
