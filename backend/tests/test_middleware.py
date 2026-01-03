"""
Quick test to verify middleware is working
"""
import requests
import time

BASE_URL = "http://127.0.0.1:8000"

print("\n" + "="*60)
print("TESTING MIDDLEWARE FUNCTIONALITY")
print("="*60 + "\n")

# Test 1: Request Logging - Public endpoint
print("1. Testing Request Logging (registration endpoint)...")
data = {
    "username": f"middleware_test_{int(time.time())}",
    "email": f"test_{int(time.time())}@example.com",
    "password": "TestPass123!",
    "password2": "TestPass123!",
    "employee_id": f"MW{int(time.time())}",
    "first_name": "Middleware",
    "last_name": "Test",
    "role": "EMPLOYEE"
}
response = requests.post(f"{BASE_URL}/users/register/", json=data)
print(f"   Status: {response.status_code}")
print(f"   Duration header: {response.headers.get('X-Request-Duration', 'N/A')}")

# Test 2: JWT Middleware - Login
print("\n2. Testing JWT Middleware (login)...")
login_data = {
    "username": data["username"],
    "password": "TestPass123!"
}
response = requests.post(f"{BASE_URL}/users/login/", json=login_data)
print(f"   Status: {response.status_code}")
if response.status_code == 200:
    token = response.json()['access']
    print(f"   Token received: {token[:30]}...")
    
    # Test 3: Audit Logging - Protected endpoint with authentication
    print("\n3. Testing Audit Logging (check-in with auth)...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/attendance/check-in/", headers=headers)
    print(f"   Status: {response.status_code}")
    print(f"   Token expiry header: {response.headers.get('X-Token-Expires-At', 'N/A')}")
    print(f"   Duration header: {response.headers.get('X-Request-Duration', 'N/A')}")

# Test 4: Error Handling - Invalid endpoint
print("\n4. Testing Error Handling (invalid endpoint)...")
response = requests.get(f"{BASE_URL}/invalid/endpoint/")
print(f"   Status: {response.status_code}")
if response.status_code >= 400:
    print(f"   Error response: {response.json()}")

# Test 5: CORS Headers
print("\n5. Testing CORS Headers...")
response = requests.options(f"{BASE_URL}/users/profile/", 
                           headers={"Origin": "http://localhost:5173"})
print(f"   Status: {response.status_code}")
print(f"   CORS headers: {response.headers.get('Access-Control-Allow-Origin', 'N/A')}")

print("\n" + "="*60)
print("MIDDLEWARE TEST COMPLETE")
print("\nCheck logs in backend/Dayflow/logs/:")
print("  - dayflow.log (request/response logs)")
print("  - audit.log (user action logs)")
print("  - errors.log (error logs)")
print("="*60 + "\n")
