# Dayflow HRMS - Quick Start Guide

## 🚀 Fastest Way to Get Started

### Step 1: Activate Virtual Environment (if not created, create it first)

**Create venv (only first time):**
```bash
python -m venv venv
```

**Activate:**
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure .env File

```bash
# Copy example file
copy .env.example .env

# Edit .env and update:
SECRET_KEY=your-django-secret-key
```

### Step 4: Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 5: Create Superuser (Admin)
```bash
python manage.py createsuperuser
```

Follow prompts:
- Username: admin
- Email: admin@dayflow.com
- Password: (your secure password)
- Employee ID: ADMIN001
- Role: ADMIN

### Step 6: Start Development Server
```bash
python manage.py runserver
```

### Step 7: Access the Application

- **API Base URL:** http://127.0.0.1:8000/
- **Admin Panel:** http://127.0.0.1:8000/admin/
- **API Documentation:** Check README.md for all endpoints

## ✅ Quick Test

### 1. Login to Admin Panel
- Go to: http://127.0.0.1:8000/admin/
- Login with superuser credentials

### 2. Test API with cURL or Postman

**Register a new user:**
```bash
curl -X POST http://127.0.0.1:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"emp001\", \"email\": \"emp@test.com\", \"employee_id\": \"EMP001\", \"password\": \"testpass123\", \"password2\": \"testpass123\", \"role\": \"EMPLOYEE\"}"
```

**Login:**
```bash
curl -X POST http://127.0.0.1:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"emp001\", \"password\": \"testpass123\"}"
```

## 🎯 What's Ready

✅ All models created (User, EmployeeProfile, Attendance, Leave, Payroll)  
✅ All DRF APIs configured  
✅ JWT authentication setup  
✅ Role-based permissions  
✅ Admin panel configured  
✅ PostgreSQL integration  
✅ CORS enabled  

## 📝 Common Commands

```bash
# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver

# Run on different port
python manage.py runserver 8080

# Run tests
python manage.py test
```

## ⚠️ Troubleshooting

**Issue: ModuleNotFoundError**
- Solution: `pip install -r requirements.txt`

**Issue: Migration errors**
- Delete migrations files (except __init__.py)
- Delete db.sqlite3 if exists
- Run makemigrations and migrate again

## 🔗 All Available Endpoints

- **Users:** `/api/users/`
- **Attendance:** `/api/attendance/`
- **Leaves:** `/api/leaves/`
- **Payroll:** `/api/payroll/`

See [README.md](README.md) for complete API documentation.

---

**You're all set! 🎉**