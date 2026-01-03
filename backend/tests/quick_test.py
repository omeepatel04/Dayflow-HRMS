import requests
import json

BASE_URL = "http://127.0.0.1:8000"

print("\n" + "="*60)
print("QUICK API TEST")
print("="*60 + "\n")

# Test 1: Registration
print("1. Testing User Registration...")
data = {
    "username": "quicktest1",
    "email": "quick1@test.com",
    "password": "Test123!@#",
    "password2": "Test123!@#",
    "employee_id": "QT001",
    "first_name": "Quick",
    "last_name": "Test",
    "role": "EMPLOYEE"
}
try:
    r = requests.post(f"{BASE_URL}/users/register/", json=data, timeout=5)
    print(f"   Status: {r.status_code} - {'✅ PASS' if r.status_code == 201 else '❌ FAIL'}")
    if r.status_code == 201:
        print(f"   User ID: {r.json()['user']['id']}")
except Exception as e:
    print(f"   ❌ Error: {str(e)[:100]}")

# Test 2: Login
print("\n2. Testing Login...")
try:
    r = requests.post(f"{BASE_URL}/users/login/", json={"username": "quicktest1", "password": "Test123!@#"}, timeout=5)
    print(f"   Status: {r.status_code} - {'✅ PASS' if r.status_code == 200 else '❌ FAIL'}")
    if r.status_code == 200:
        token = r.json()['access']
        print(f"   Token: {token[:30]}...")
        
        # Test 3: Get Profile
        print("\n3. Testing Get Profile...")
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.get(f"{BASE_URL}/users/profile/", headers=headers, timeout=5)
        print(f"   Status: {r.status_code} - {'✅ PASS' if r.status_code == 200 else '❌ FAIL'}")
        
        # Test 4: Check-in
        print("\n4. Testing Attendance Check-in...")
        r = requests.post(f"{BASE_URL}/attendance/check-in/", headers=headers, timeout=5)
        print(f"   Status: {r.status_code} - {'✅ PASS' if r.status_code == 201 else '❌ FAIL'}")
        if r.status_code == 201:
            att_id = r.json()['attendance']['id']
            print(f"   Attendance ID: {att_id}")
        
        # Test 5: Check-out
        print("\n5. Testing Attendance Check-out...")
        r = requests.post(f"{BASE_URL}/attendance/check-out/", headers=headers, timeout=5)
        print(f"   Status: {r.status_code} - {'✅ PASS' if r.status_code == 200 else '❌ FAIL'}")
        
        # Test 6: Apply Leave
        print("\n6. Testing Leave Application...")
        leave_data = {
            "leave_type": "PAID",
            "start_date": "2026-01-10",
            "end_date": "2026-01-12",
            "reason": "Quick test leave"
        }
        r = requests.post(f"{BASE_URL}/leaves/apply/", json=leave_data, headers=headers, timeout=5)
        print(f"   Status: {r.status_code} - {'✅ PASS' if r.status_code == 201 else '❌ FAIL'}")
        if r.status_code == 201:
            leave_id = r.json()['leave']['id']
            print(f"   Leave ID: {leave_id}")
        
        # Test 7: Get My Leaves
        print("\n7. Testing Get My Leaves...")
        r = requests.get(f"{BASE_URL}/leaves/my-leaves/", headers=headers, timeout=5)
        print(f"   Status: {r.status_code} - {'✅ PASS' if r.status_code == 200 else '❌ FAIL'}")
        if r.status_code == 200:
            print(f"   Total leaves: {r.json()['count']}")
        
except Exception as e:
    print(f"   ❌ Error: {str(e)[:100]}")

print("\n" + "="*60)
print("QUICK TEST COMPLETE")
print("="*60 + "\n")
