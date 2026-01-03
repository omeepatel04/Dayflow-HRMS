# Dayflow HRMS - Backend API

A comprehensive Human Resource Management System built with Django REST Framework and PostgreSQL.

**OdooxGCET'26 Virtual Round Project Implementation**

## 🚀 Project Structure

```
Dayflow-HRMS/
├── dayflow/              # Main project settings
│   ├── settings.py       # Django settings with DRF, JWT, PostgreSQL
│   ├── urls.py           # Main URL configuration
│   ├── wsgi.py
│   └── asgi.py
├── users/                # User authentication & profiles
│   ├── models.py         # Custom User & EmployeeProfile models
│   ├── serializers.py    # DRF serializers
│   ├── views.py          # API views
│   ├── permissions.py    # Custom permissions
│   └── urls.py
├── attendance/           # Attendance management
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── permissions.py
│   └── urls.py
├── leaves/               # Leave management
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── permissions.py
│   └── urls.py
├── payroll/              # Payroll management
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── permissions.py
│   └── urls.py
├── manage.py
├── requirements.txt
├── .env.example
└── README.md
```

## 📋 Prerequisites

- Python 3.10+
- pip (Python package manager)

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
cd "d:\Hackathon Nirma\Oodo\Dayflow-HRMS"
```

### 2. Create Virtual Environment
```bash
python -m venv venv
```

### 3. Activate Virtual Environment
**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

2. Update `.env` with your settings:
```
SECRET_KEY=your-secret-key-here
DEBUG=True
```

### 6. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser
```bash
python manage.py createsuperuser
```

### 8. Run Development Server
```bash
python manage.py runserver
```

The API will be available at: `http://127.0.0.1:8000/`

## 🔐 API Endpoints

### Authentication APIs (`/api/users/`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register/` | User registration | No |
| POST | `/login/` | Login (JWT token) | No |
| POST | `/token/refresh/` | Refresh JWT token | No |
| GET | `/profile/` | Get user profile | Yes |
| PUT | `/profile/` | Update user profile | Yes |
| GET | `/employee-profile/` | Get employee profile | Yes |
| PUT | `/employee-profile/` | Update employee profile | Yes |
| GET | `/employees/` | List all employees (Admin/HR) | Yes |

### Attendance APIs (`/api/attendance/`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/check-in/` | Check-in for the day | Yes |
| PUT | `/check-out/` | Check-out for the day | Yes |
| GET | `/my-attendance/` | View own attendance | Yes |
| GET | `/all/` | View all attendance (Admin/HR) | Yes |

### Leave APIs (`/api/leaves/`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/apply/` | Apply for leave | Yes |
| GET | `/my-leaves/` | View own leaves | Yes |
| GET | `/all/` | View all leaves (Admin/HR) | Yes |
| GET | `/<id>/` | View specific leave details | Yes |
| PUT | `/<id>/approve/` | Approve/Reject leave (Admin/HR) | Yes |

### Payroll APIs (`/api/payroll/`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/create/` | Create payroll (Admin/HR) | Yes |
| PUT | `/<id>/update/` | Update payroll (Admin/HR) | Yes |
| GET | `/my-payroll/` | View own payroll | Yes |
| GET | `/all/` | View all payroll (Admin/HR) | Yes |
| GET | `/<id>/` | View specific payroll | Yes |

## 🔑 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login Flow:
1. POST to `/api/users/login/` with credentials
2. Receive `access` and `refresh` tokens
3. Include access token in headers: `Authorization: Bearer <token>`
4. Refresh token when expired using `/api/users/token/refresh/`

### Example Login Request:
```json
POST /api/users/login/
{
  "username": "employee123",
  "password": "securepassword"
}
```

### Example Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

## 👥 User Roles & Permissions

### 3 User Roles:
1. **ADMIN** - Full access to all resources
2. **HR** - Full access to all resources
3. **EMPLOYEE** - Limited access to own data

### Permission Classes:
- `IsAdminOrHR` - Only Admin/HR can access
- `IsEmployee` - Only Employees can access
- `IsSelfOrAdmin` - Users can access their own data, Admins can access all

## 🧪 Testing the API

### Using Django Admin:
1. Go to `http://127.0.0.1:8000/admin/`
2. Login with superuser credentials
3. Manage all models

### Using Postman:
1. Import the API endpoints
2. Use Bearer Token authentication
3. Test all CRUD operations

### Using cURL:
```bash
# Register
curl -X POST http://127.0.0.1:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{"username": "emp001", "email": "emp@example.com", "employee_id": "EMP001", "password": "pass123", "password2": "pass123", "role": "EMPLOYEE"}'

# Login
curl -X POST http://127.0.0.1:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "emp001", "password": "pass123"}'
```

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with Django's built-in validators
- CORS configuration for frontend integration
- Role-based access control
- Input validation using DRF serializers

## 📦 Technologies Used

- **Django 5.0.1** - Web framework
- **Django REST Framework 3.14.0** - API framework
- **Simple JWT 5.3.1** - JWT authentication
- **SQLite** - Database (Django's built-in)
- **django-cors-headers 4.3.1** - CORS support
- **python-decouple 3.8** - Environment variable management
- **Pillow 10.2.0** - Image handling

## 🎯 Key Features Implemented

✅ Custom User model with role-based access  
✅ JWT authentication with refresh tokens  
✅ Employee profile management  
✅ Attendance check-in/check-out system  
✅ Leave application & approval workflow  
✅ Payroll management with auto-calculation  
✅ Role-based permissions (Admin/HR/Employee)  
✅ DRF serializers for validation  
✅ Proper error handling & HTTP status codes  
✅ Admin panel for all models  
✅ CORS enabled for frontend integration  

## 📝 Database Models

### User
- employee_id (unique)
- username, email, password
- role (ADMIN/HR/EMPLOYEE)

### EmployeeProfile
- One-to-One with User
- full_name, phone, address
- job_title, department
- date_of_joining

### Attendance
- employee (FK)
- date, check_in_time, check_out_time
- status (PRESENT/ABSENT/HALF_DAY/LEAVE)

### Leave
- employee (FK)
- leave_type (PAID/SICK/UNPAID)
- start_date, end_date, reason
- status (PENDING/APPROVED/REJECTED)
- admin_comment

### Payroll
- employee (FK)
- basic_salary, allowances, deductions
- net_salary (auto-calculated)
- month

## 🚀 Next Steps

1. Run migrations: `python manage.py migrate`
2. Create superuser: `python manage.py createsuperuser`
3. Start server: `python manage.py runserver`
4. Test APIs using Postman or cURL
5. Integrate with frontend

## 📞 Support

For any issues or questions, please contact the development team.

---

**Built with ❤️ using Django REST Framework**
