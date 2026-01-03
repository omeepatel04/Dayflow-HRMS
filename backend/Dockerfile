# Use official Python runtime as base image
FROM python:3.14-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Set work directory
WORKDIR /app/backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements (if exists) or install from scratch
COPY requirements.txt* ./

# Install Python dependencies
RUN if [ -f requirements.txt ]; then pip install -r requirements.txt; \
    else pip install django==6.0 djangorestframework==3.16.1 djangorestframework-simplejwt==5.5.1 django-cors-headers==4.9.0 python-decouple==3.8 pillow==12.1.0; fi

# Copy project
COPY . .

# Create necessary directories
RUN mkdir -p /app/backend/staticfiles /app/backend/media

# Expose port
EXPOSE 8000

# Run gunicorn (or django dev server)
CMD ["python", "Dayflow/manage.py", "runserver", "localhost:8000"]
