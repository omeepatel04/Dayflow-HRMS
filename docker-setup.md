# Docker Setup Guide - Dayflow HRMS

This guide explains how to run the entire Dayflow HRMS project using Docker.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- Git

## Quick Start

### 1. Clone & Navigate to Project

```bash
git clone <repo-url>
cd Dayflow-HRMS
```

### 2. Setup Environment Variables

Copy the example env files:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp client/.env.example client/.env
```

Edit `.env` files with your configuration if needed.

### 3. Build & Start Services

```bash
# Build Docker images
docker-compose build

# Start all services (backend, frontend, database)
docker-compose up -d
```

### 4. Initialize Database

```bash
# Run migrations
docker-compose exec backend python Dayflow/manage.py migrate

# Create superuser for admin panel
docker-compose exec backend python Dayflow/manage.py createsuperuser
```

### 5. Access Services

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **Database**: SQLite (local, at `backend/db.sqlite3`)

## Services Overview

### 1. **Backend (Django)**

- Framework: Django 6.0
- REST API: Django REST Framework
- Authentication: JWT (Simple JWT)
- Database: SQLite (local db.sqlite3)
- Port: 8000
- Auto-reload: Yes (development)

### 2. **Frontend (React + Vite)**

- Framework: React + Vite
- Port: 5173
- Hot Module Replacement: Enabled
- API Base: http://localhost:8000/api

## Detailed Commands

### Backend Commands

```bash
# Shell access
docker-compose exec backend bash

# Run migrations
docker-compose exec backend python Dayflow/manage.py migrate

# Create superuser
docker-compose exec backend python Dayflow/manage.py createsuperuser

# Run tests
docker-compose exec backend python Dayflow/manage.py test

# Create app
docker-compose exec backend python Dayflow/manage.py startapp <app_name>

# Collect static files
docker-compose exec backend python Dayflow/manage.py collectstatic --noinput

# View logs
docker-compose logs -f backend
```

### Frontend Commands

```bash
# Shell access
docker-compose exec frontend sh

# Install dependencies
docker-compose exec frontend npm install

# View logs
docker-compose logs -f frontend
```

### Database Commands

```bash
# SQLite is stored locally at backend/db.sqlite3
# To backup:
cp backend/db.sqlite3 backup_$(date +%Y%m%d_%H%M%S).sqlite3

# To restore:
cp backup_20260103_120000.sqlite3 backend/db.sqlite3
```

## Environment Variables

### Backend (.env)

```env
DEBUG=True                              # Set to False in production
SECRET_KEY=your-secret-key             # Change in production
DB_ENGINE=django.db.backends.sqlite3   # SQLite database
DB_NAME=./db.sqlite3                   # Local database file
ALLOWED_HOSTS=localhost,127.0.0.1,backend
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Dayflow HRMS
VITE_ENV=development
```

## Project Structure

```
Dayflow-HRMS/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   └── Dayflow/
│       ├── manage.py
│       └── ...
├── client/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   └── src/
│       └── ...
├── docker-compose.yml
└── docker-setup.md (this file)
```

## Volumes & Data Persistence

### Docker Volumes

Since we're using SQLite, the database file is stored locally:

```bash
# Database file location
backend/db.sqlite3

# Backup database
cp backend/db.sqlite3 backup_$(date +%Y%m%d_%H%M%S).sqlite3

# Restore database
cp backup_20260103_120000.sqlite3 backend/db.sqlite3
```

### Local Development

Both backend and frontend have live volume mounts for development:

```yaml
volumes:
  - ./backend:/app/backend # Backend code
  - ./client:/app/client # Frontend code
```

Changes are reflected instantly without rebuilding.

## Production Setup

For production deployment:

1. **Update Settings**:

   - Set `DEBUG=False` in backend .env
   - Update `ALLOWED_HOSTS`
   - Change `SECRET_KEY` to a secure value
   - Switch to PostgreSQL or managed database for better scalability

2. **Security**:

   - Set secure environment variables
   - Use HTTPS (configure reverse proxy like Nginx if needed)
   - Use environment variables for secrets

3. **Database**:

   - For production, consider using PostgreSQL or managed databases (AWS RDS, etc.)
   - Current SQLite setup is suitable for development and small deployments only

4. **Scaling**:
   - Use Docker Swarm or Kubernetes
   - Configure load balancing

## Troubleshooting

### Port Already in Use

```bash
# Find what's using port 8000
lsof -i :8000

# Or kill process
kill -9 <PID>

# Change port in docker-compose.yml
```

### Database Connection Issues

```bash
# Check if database container is running
docker-compose ps

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Build Failures

```bash
# Clear cache and rebuild
docker-compose build --no-cache

# Check Docker logs
docker-compose logs
```

### Permission Issues

```bash
# May need to adjust permissions on volumes
sudo chown -R $USER:$USER ./backend
sudo chown -R $USER:$USER ./client
```

## Useful Docker Commands

```bash
# View running containers
docker-compose ps

# View all logs
docker-compose logs

# View specific service logs (last 100 lines)
docker-compose logs --tail=100 backend

# Stop all services
docker-compose down

# Stop and remove volumes (careful!)
docker-compose down -v

# Remove unused images
docker image prune -a

# Clean up all unused resources
docker system prune -a --volumes
```

## CI/CD Integration

Example GitHub Actions workflow (create `.github/workflows/docker.yml`):

```yaml
name: Docker Build

on:
  push:
    branches: [main, dev]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build images
        run: docker-compose build
      - name: Start services
        run: docker-compose up -d
      - name: Run migrations
        run: docker-compose exec -T backend python Dayflow/manage.py migrate
      - name: Run tests
        run: docker-compose exec -T backend python Dayflow/manage.py test
```

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Django Deployment with Docker](https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/gunicorn/)
- [React Docker Setup](https://reactjs.org/docs/deployment.html)

## Support

For issues or questions:

1. Check logs: `docker-compose logs`
2. Review .env configuration
3. Ensure Docker and Docker Compose are up to date
4. Check network connectivity between services
