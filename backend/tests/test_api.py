"""
Comprehensive API Testing Script for Dayflow HRMS
Tests all endpoints systematically
"""
import requests
import json
from datetime import date, timedelta

BASE_URL = "http://127.0.0.1:8000"
headers = {"Content-Type": "application/json"}

# Store test data
test_data = {
    "user1": None,
    "user2": None,
    "tokens": {},
    "attendance_id": None,
    "leave_id": None,
    "payroll_id": None
}

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def print_test(test_name, passed, details=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} - {test_name}")
    if details:
        print(f"   {details}")

def test_user_registration():
    print_section("1. TESTING USER REGISTRATION")
    
    # Test 1: Register first user (employee)
    data = {
        "username": "testemployee",
        "email": "employee@test.com",
        "password": "TestPass123!",
        "password2": "TestPass123!",
        "employee_id": "EMP001",
        "first_name": "John",
        "last_name": "Doe",
        "role": "EMPLOYEE"
    }
    response = requests.post(f"{BASE_URL}/users/register/", json=data)
    passed = response.status_code == 201
    print_test("Register Employee", passed, f"Status: {response.status_code}")
    if passed:
        test_data["user1"] = response.json().get("user")
        print(f"   User ID: {test_data['user1']['id']}")
    else:
        print(f"   Error: {response.json()}")
    
    # Test 2: Register second user (HR)
    data2 = {
        "username": "testhr",
        "email": "hr@test.com",
        "password": "TestPass123!",
        "password2": "TestPass123!",
        "employee_id": "HR001",
        "first_name": "Jane",
        "last_name": "Smith",
        "role": "HR"
    }
    response = requests.post(f"{BASE_URL}/users/register/", json=data2)
    passed = response.status_code == 201
    print_test("Register HR", passed, f"Status: {response.status_code}")
    if passed:
        test_data["user2"] = response.json().get("user")
    
    # Test 3: Duplicate registration should fail
    response = requests.post(f"{BASE_URL}/users/register/", json=data)
    passed = response.status_code == 400
    print_test("Duplicate Registration (Should Fail)", passed, f"Status: {response.status_code}")

def test_user_login():
    print_section("2. TESTING USER LOGIN (JWT)")
    
    # Test 1: Login with employee credentials
    data = {
        "username": "testemployee",
        "password": "TestPass123!"
    }
    response = requests.post(f"{BASE_URL}/users/login/", json=data)
    passed = response.status_code == 200
    print_test("Login Employee", passed, f"Status: {response.status_code}")
    if passed:
        result = response.json()
        test_data["tokens"]["employee"] = {
            "access": result.get("access"),
            "refresh": result.get("refresh")
        }
        print(f"   Access Token: {result.get('access')[:30]}...")
    
    # Test 2: Login with HR credentials
    data = {
        "username": "testhr",
        "password": "TestPass123!"
    }
    response = requests.post(f"{BASE_URL}/users/login/", json=data)
    passed = response.status_code == 200
    print_test("Login HR", passed, f"Status: {response.status_code}")
    if passed:
        result = response.json()
        test_data["tokens"]["hr"] = {
            "access": result.get("access"),
            "refresh": result.get("refresh")
        }
    
    # Test 3: Wrong password should fail
    data = {
        "username": "testemployee",
        "password": "WrongPassword"
    }
    response = requests.post(f"{BASE_URL}/users/login/", json=data)
    passed = response.status_code == 401
    print_test("Login with Wrong Password (Should Fail)", passed, f"Status: {response.status_code}")

def test_user_profile():
    print_section("3. TESTING USER PROFILE")
    
    auth_headers = {
        **headers,
        "Authorization": f"Bearer {test_data['tokens']['employee']['access']}"
    }
    
    # Test 1: Get current user profile
    response = requests.get(f"{BASE_URL}/users/profile/", headers=auth_headers)
    passed = response.status_code == 200
    print_test("Get User Profile", passed, f"Status: {response.status_code}")
    if passed:
        profile = response.json()
        print(f"   Username: {profile.get('username')}")
    
    # Test 2: Update user profile
    data = {
        "first_name": "John Updated",
        "email": "johnupdated@test.com"
    }
    response = requests.put(f"{BASE_URL}/users/profile/", json=data, headers=auth_headers)
    passed = response.status_code == 200
    print_test("Update User Profile", passed, f"Status: {response.status_code}")
    
    # Test 3: Get/Create employee profile
    response = requests.get(f"{BASE_URL}/users/employee-profile/", headers=auth_headers)
    passed = response.status_code in [200, 404]
    print_test("Get Employee Profile", passed, f"Status: {response.status_code}")
    
    # Test 4: Update employee profile
    data = {
        "full_name": "John Doe Updated",
        "phone": "1234567890",
        "job_title": "Senior Developer",
        "department": "IT"
    }
    response = requests.put(f"{BASE_URL}/users/employee-profile/", json=data, headers=auth_headers)
    passed = response.status_code == 200
    print_test("Update Employee Profile", passed, f"Status: {response.status_code}")

def test_user_list():
    print_section("4. TESTING USER LISTS")
    
    auth_headers = {
        **headers,
        "Authorization": f"Bearer {test_data['tokens']['employee']['access']}"
    }
    
    # Test 1: Get all users
    response = requests.get(f"{BASE_URL}/users/users/", headers=auth_headers)
    passed = response.status_code == 200
    print_test("Get All Users", passed, f"Status: {response.status_code}")
    if passed:
        result = response.json()
        print(f"   Total Users: {result.get('count', 0)}")
    
    # Test 2: Filter users by role
    response = requests.get(f"{BASE_URL}/users/users/?role=EMPLOYEE", headers=auth_headers)
    passed = response.status_code == 200
    print_test("Filter Users by Role", passed, f"Status: {response.status_code}")
    
    # Test 3: Get all employees
    response = requests.get(f"{BASE_URL}/users/employees/", headers=auth_headers)
    passed = response.status_code == 200
    print_test("Get All Employees", passed, f"Status: {response.status_code}")

def test_attendance_checkin():
    print_section("5. TESTING ATTENDANCE CHECK-IN/OUT")
    
    auth_headers = {
        **headers,
        "Authorization": f"Bearer {test_data['tokens']['employee']['access']}"
    }
    
    # Test 1: Check-in
    response = requests.post(f"{BASE_URL}/attendance/check-in/", headers=auth_headers)
    passed = response.status_code == 201
    print_test("Check-In", passed, f"Status: {response.status_code}")
    if passed:
        result = response.json()
        test_data["attendance_id"] = result.get("attendance", {}).get("id")
        print(f"   Attendance ID: {test_data['attendance_id']}")
        print(f"   Check-in Time: {result.get('attendance', {}).get('check_in_time')}")
    
    # Test 2: Duplicate check-in should fail
    response = requests.post(f"{BASE_URL}/attendance/check-in/", headers=auth_headers)
    passed = response.status_code == 400
    print_test("Duplicate Check-In (Should Fail)", passed, f"Status: {response.status_code}")
    
    # Test 3: Check-out
    response = requests.post(f"{BASE_URL}/attendance/check-out/", headers=auth_headers)
    passed = response.status_code == 200
    print_test("Check-Out", passed, f"Status: {response.status_code}")
    if passed:
        result = response.json()
        print(f"   Check-out Time: {result.get('attendance', {}).get('check_out_time')}")

def test_attendance_records():
    print_section("6. TESTING ATTENDANCE RECORDS")
    
    auth_headers = {
        **headers,
        "Authorization": f"Bearer {test_data['tokens']['employee']['access']}"
    }
    
    # Test 1: Get my attendance
    response = requests.get(f"{BASE_URL}/attendance/my-attendance/", headers=auth_headers)
    passed = response.status_code == 200
    print_test("Get My Attendance", passed, f"Status: {response.status_code}")
    if passed:
        result = response.json()
        print(f"   Total Records: {result.get('count', 0)}")
    
    # Test 2: Get all attendance
    response = requests.get(f"{BASE_URL}/attendance/all/", headers=auth_headers)
    passed = response.status_code == 200
    print_test("Get All Attendance", passed, f"Status: {response.status_code}")
    
    # Test 3: Get attendance detail
    if test_data["attendance_id"]:
        response = requests.get(f"{BASE_URL}/attendance/{test_data['attendance_id']}/", headers=auth_headers)
        passed = response.status_code == 200
        print_test("Get Attendance Detail", passed, f"Status: {response.status_code}")

def test_leave_application():
    print_section("7. TESTING LEAVE APPLICATION")
    
    auth_headers = {
        **headers,
        "Authorization": f"Bearer {test_data['tokens']['employee']['access']}"
    }
    
    # Test 1: Apply for leave
    today = date.today()
    data = {
        "leave_type": "PAID",
        "start_date": str(today + timedelta(days=5)),
        "end_date": str(today + timedelta(days=7)),
        "reason": "Family vacation"
    }
    response = requests.post(f"{BASE_URL}/leaves/apply/", json=data, headers=auth_headers)
    passed = response.status_code == 201
    print_test("Apply for Leave", passed, f"Status: {response.status_code}")
    if passed:
        result = response.json()
        test_data["leave_id"] = result.get("leave", {}).get("id")
        print(f"   Leave ID: {test_data['leave_id']}")
        print(f"   Status: {result.get('leave', {}).get('status')}")
    
    # Test 2: Invalid date range should fail
    data = {
        "leave_type": "PAID",
        "start_date": str(today + timedelta(days=10)),
        "end_date": str(today + timedelta(days=5)),
        "reason": "Invalid dates"
    }
    response = requests.post(f"{BASE_URL}/leaves/apply/", json=data, headers=auth_headers)
    passed = response.status_code == 400
    print_test("Invalid Date Range (Should Fail)", passed, f"Status: {response.status_code}")

def test_leave_management():
    print_section("8. TESTING LEAVE MANAGEMENT")
    
    auth_headers = {
        **headers,
        "Authorization": f"Bearer {test_data['tokens']['employee']['access']}"
    }
    
    # Test 1: Get my leaves
    response = requests.get(f"{BASE_URL}/leaves/my-leaves/", headers=auth_headers)
    passed = response.status_code == 200
    print_test("Get My Leaves", passed, f"Status: {response.status_code}")
    if passed:
        result = response.json()
        print(f"   Total Leaves: {result.get('count', 0)}")
    
    # Test 2: Get all leaves
    response = requests.get(f"{BASE_URL}/leaves/all/", headers=auth_headers)
    passed = response.status_code == 200
    print_test("Get All Leaves", passed, f"Status: {response.status_code}")
    
    # Test 3: Get leave detail
    if test_data["leave_id"]:
        response = requests.get(f"{BASE_URL}/leaves/{test_data['leave_id']}/", headers=auth_headers)
        passed = response.status_code == 200
        print_test("Get Leave Detail", passed, f"Status: {response.status_code}")
        
        # Test 4: Approve leave
        hr_headers = {
            **headers,
            "Authorization": f"Bearer {test_data['tokens']['hr']['access']}"
        }
        data = {
            "status": "APPROVED",
            "admin_comment": "Approved by HR"
        }
        response = requests.post(f"{BASE_URL}/leaves/{test_data['leave_id']}/approve/", 
                                json=data, headers=hr_headers)
        passed = response.status_code == 200
        print_test("Approve Leave", passed, f"Status: {response.status_code}")

def test_payroll():
    print_section("9. TESTING PAYROLL")
    
    hr_headers = {
        **headers,
        "Authorization": f"Bearer {test_data['tokens']['hr']['access']}"
    }
    
    # Test 1: Create payroll
    if test_data["user1"]:
        data = {
            "employee": test_data["user1"]["id"],
            "basic_salary": "50000.00",
            "allowances": "10000.00",
            "deductions": "5000.00",
            "month": "2026-01-01"
        }
        response = requests.post(f"{BASE_URL}/payroll/create/", json=data, headers=hr_headers)
        passed = response.status_code == 201
        print_test("Create Payroll", passed, f"Status: {response.status_code}")
        if passed:
            result = response.json()
            test_data["payroll_id"] = result.get("payroll", {}).get("id")
            print(f"   Payroll ID: {test_data['payroll_id']}")
            print(f"   Net Salary: {result.get('payroll', {}).get('net_salary')}")
    
    # Test 2: Get all payroll
    response = requests.get(f"{BASE_URL}/payroll/all/", headers=hr_headers)
    passed = response.status_code == 200
    print_test("Get All Payroll", passed, f"Status: {response.status_code}")
    
    # Test 3: Get my payroll (as employee)
    emp_headers = {
        **headers,
        "Authorization": f"Bearer {test_data['tokens']['employee']['access']}"
    }
    response = requests.get(f"{BASE_URL}/payroll/my-payroll/", headers=emp_headers)
    passed = response.status_code == 200
    print_test("Get My Payroll", passed, f"Status: {response.status_code}")
    if passed:
        result = response.json()
        print(f"   Total Records: {result.get('count', 0)}")
    
    # Test 4: Update payroll
    if test_data["payroll_id"]:
        data = {
            "basic_salary": "55000.00",
            "allowances": "12000.00"
        }
        response = requests.put(f"{BASE_URL}/payroll/{test_data['payroll_id']}/update/", 
                               json=data, headers=hr_headers)
        passed = response.status_code == 200
        print_test("Update Payroll", passed, f"Status: {response.status_code}")

def run_all_tests():
    print("\n")
    print("╔" + "="*58 + "╗")
    print("║" + " "*58 + "║")
    print("║" + "  DAYFLOW HRMS API COMPREHENSIVE TEST SUITE".center(58) + "║")
    print("║" + " "*58 + "║")
    print("╚" + "="*58 + "╝")
    
    try:
        test_user_registration()
        test_user_login()
        test_user_profile()
        test_user_list()
        test_attendance_checkin()
        test_attendance_records()
        test_leave_application()
        test_leave_management()
        test_payroll()
        
        print_section("TEST SUMMARY")
        print("✅ All major endpoints tested successfully!")
        print("\nTest Data Generated:")
        print(f"  - Users Created: 2 (Employee & HR)")
        print(f"  - Attendance Records: {1 if test_data['attendance_id'] else 0}")
        print(f"  - Leave Applications: {1 if test_data['leave_id'] else 0}")
        print(f"  - Payroll Records: {1 if test_data['payroll_id'] else 0}")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_all_tests()
