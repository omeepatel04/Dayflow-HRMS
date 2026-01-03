# API Endpoints Documentation - Dayflow HRMS

## Base URL

`http://localhost:8000`

---

## 1. Users Module (`/users/`)

### Authentication Endpoints

#### Register User

- **POST** `/users/register/`
- **Body**:

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "password2": "string",
  "employee_id": "string",
  "first_name": "string",
  "last_name": "string",
  "role": "EMPLOYEE|HR|ADMIN"
}
```

#### Login (JWT)

- **POST** `/users/login/`
- **Body**:

```json
{
  "username": "string",
  "password": "string"
}
```

- **Response**: Returns access and refresh tokens

#### Refresh Token

- **POST** `/users/token/refresh/`
- **Body**:

```json
{
  "refresh": "string"
}
```

### Profile Management

#### Get Current User Profile

- **GET** `/users/profile/`
- **Returns**: Current user details

#### Update Current User Profile

- **PUT** `/users/profile/`
- **Body**: User fields to update

#### Get Employee Profile

- **GET** `/users/employee-profile/`
- **Returns**: Employee profile with full details

#### Update Employee Profile

- **PUT** `/users/employee-profile/`
- **Body**:

```json
{
  "full_name": "string",
  "phone": "string",
  "address": "string",
  "profile_picture": "file",
  "job_title": "string",
  "department": "string",
  "date_of_joining": "YYYY-MM-DD"
}
```

### User Management (Admin/HR)

#### List All Users

- **GET** `/users/users/`
- **Query Params**:
  - `role` - Filter by role (ADMIN, HR, EMPLOYEE)
  - `is_active` - Filter by active status (true/false)

#### Get User Details

- **GET** `/users/users/<id>/`

#### Update User

- **PUT** `/users/users/<id>/`

#### Delete User

- **DELETE** `/users/users/<id>/`

#### List All Employees

- **GET** `/users/employees/`
- **Query Params**:
  - `department` - Filter by department

---

## 2. Attendance Module (`/attendance/`)

### Check-In/Out

#### Check-In

- **POST** `/attendance/check-in/`
- **Body**: Not required (uses current user and timestamp)

#### Check-Out

- **POST** `/attendance/check-out/`
- **Body**: Not required (uses current user and timestamp)

### Attendance Records

#### Get My Attendance

- **GET** `/attendance/my-attendance/`
- **Query Params**:
  - `from_date` - Start date (YYYY-MM-DD)
  - `to_date` - End date (YYYY-MM-DD)
  - `status` - Filter by status (PRESENT, ABSENT, HALF_DAY, LEAVE)

#### Get All Attendance (Admin/HR/Manager)

- **GET** `/attendance/all/`
- **Query Params**:
  - `employee_id` - Filter by employee
  - `from_date` - Start date
  - `to_date` - End date
  - `status` - Filter by status

#### Get Attendance Details

- **GET** `/attendance/<id>/`

#### Update Attendance

- **PUT** `/attendance/<id>/`
- **Body**:

```json
{
  "check_in_time": "HH:MM:SS",
  "check_out_time": "HH:MM:SS",
  "status": "PRESENT|ABSENT|HALF_DAY|LEAVE"
}
```

#### Delete Attendance

- **DELETE** `/attendance/<id>/`

### Attendance Regularization

- **POST** `/attendance/regularization/request/`

  - Body:

  ```json
  {
    "date": "YYYY-MM-DD",
    "requested_check_in": "HH:MM:SS",
    "requested_check_out": "HH:MM:SS",
    "reason": "string"
  }
  ```

- **GET** `/attendance/regularization/my-requests/` — current user's requests
- **GET** `/attendance/regularization/all/` — Admin/HR (optional `status`, `employee_id`)
- **POST** `/attendance/regularization/<id>/approve/`
  - Body: `{ "action": "approve" | "reject" }`

---

## 3. Leaves Module (`/leaves/`)

### Leave Management

#### Apply for Leave

- **POST** `/leaves/apply/`
- **Body**:

```json
{
  "leave_type": "PAID|SICK|UNPAID|CASUAL",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "reason": "string"
}
```

#### Get My Leaves

- **GET** `/leaves/my-leaves/`
- **Query Params**:
  - `status` - Filter by status (PENDING, APPROVED, REJECTED)
  - `leave_type` - Filter by type
  - `from_date` - Start date
  - `to_date` - End date

#### Get All Leaves (Admin/HR/Manager)

- **GET** `/leaves/all/`
- **Query Params**:
  - `employee_id` - Filter by employee
  - `status` - Filter by status
  - `leave_type` - Filter by type
  - `from_date` - Start date
  - `to_date` - End date

#### Get Leave Details

- **GET** `/leaves/<id>/`

#### Update Leave

- **PUT** `/leaves/<id>/`
- **Note**: Only allowed if status is PENDING

#### Delete Leave

- **DELETE** `/leaves/<id>/`
- **Note**: Only allowed if status is PENDING

#### Approve/Reject Leave (Admin/HR/Manager)

- **POST** `/leaves/<id>/approve/`
- **Body**:

```json
{
  "status": "APPROVED|REJECTED",
  "admin_comment": "string"
}
```

#### Cancel Leave

- **POST** `/leaves/<id>/cancel/`

---

## 4. Payroll Module (`/payroll/`)

### Payroll Management

#### Create Payroll (Admin/HR)

- **POST** `/payroll/create/`
- **Body**:

```json
{
  "employee": 1,
  "basic_salary": "10000.00",
  "allowances": "2000.00",
  "deductions": "500.00",
  "month": "YYYY-MM-01"
}
```

#### Update Payroll (Admin/HR)

- **PUT** `/payroll/<id>/update/`
- **Body**: Same as create

#### Get My Payroll

- **GET** `/payroll/my-payroll/`
- **Query Params**:
  - `month` - Filter by month (1-12)
  - `year` - Filter by year

#### Get All Payroll (Admin/HR)

- **GET** `/payroll/all/`
- **Query Params**:
  - `employee_id` - Filter by employee
  - `month` - Filter by month (1-12)
  - `year` - Filter by year

#### Get Payroll Details

- **GET** `/payroll/<id>/`

#### Delete Payroll (Admin/HR)

- **DELETE** `/payroll/<id>/`

#### Payroll Components (Admin/HR)

- **GET** `/payroll/components/` (optional `type=ALLOWANCE|DEDUCTION`)
- **POST** `/payroll/components/`
  - Body: `{ "name": "string", "component_type": "ALLOWANCE|DEDUCTION", "description": "string" }

#### Salary Structure

- **GET** `/payroll/salary-structure/` — current user; HR/Admin can pass `employee_id`
- **POST** `/payroll/salary-structure/` (HR/Admin)
  - Body includes salary components (basic_salary, hra, transport_allowance, medical_allowance, special_allowance, provident_fund, professional_tax, income_tax, effective_from, employee)

#### Generate Payroll (Admin/HR)

- **POST** `/payroll/generate/`
  - Body: `{ "employee_id": 1, "month": "YYYY-MM-01" }`

#### Update Payroll Status (Admin/HR)

- **PATCH** `/payroll/<id>/status/`
  - Body: `{ "status": "DRAFT|PROCESSED|PAID" }`

#### Payroll Summary (Admin/HR)

- **GET** `/payroll/summary/` (query: `year`, optional `month`)

---

## Response Format

### Success Response

```json
{
  "message": "Operation successful",
  "data": { ... },
  "count": 10  // For list endpoints
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": { ... }  // Validation errors
}
```

---

## Status Codes

- `200` - OK
- `201` - Created
- `204` - No Content (Delete successful)
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes

1. **Authentication**: Most endpoints require JWT authentication (except register and login)
2. **Date Format**: Use `YYYY-MM-DD` for dates
3. **Time Format**: Use `HH:MM:SS` for time fields
4. **Filtering**: Use query parameters for filtering list endpoints
5. **Permissions**: Admin/HR restrictions apply to management endpoints (users, all attendance/leaves, payroll creation/approval, notifications broadcast)
6. **Headers**: Include `Authorization: Bearer <access_token>` on protected endpoints; CORS is enabled for localhost dev.

---

## Additional Modules

- **Notifications** (`/notifications/`): my notifications, detail, mark-all-read, create, broadcast, preferences, stats.
- **Dashboards** (`/dashboard/`): employee and HR snapshots.
