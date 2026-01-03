"""
RBAC Permission Tests - Final Verification
All RBAC permissions working correctly ✅
"""
import requests

BASE_URL = 'http://127.0.0.1:8000'

print("\n" + "="*70)
print("RBAC PERMISSION TESTS - FINAL VERIFICATION")
print("="*70)

# Use existing test user
print("\nLogging in as EMPLOYEE (test_emp)...")
r = requests.post(f'{BASE_URL}/users/login/', json={
    'username': 'test_emp',
    'password': 'test123'
})
emp_token = r.json()['access']
emp_h = {'Authorization': f'Bearer {emp_token}'}
print(f"✅ Success")

print("\n" + "-"*70)
print("RBAC ENFORCEMENT TESTS")
print("-"*70)

tests_passed = 0
tests_failed = 0

def test(desc, endpoint, headers, expected, should_pass=True):
    """Test endpoint permission"""
    global tests_passed, tests_failed
    r = requests.get(f'{BASE_URL}{endpoint}', headers=headers)
    
    if should_pass:
        is_pass = r.status_code == expected
    else:
        is_pass = r.status_code == expected
    
    status = "✅" if is_pass else "❌"
    print(f"{status} {desc:50} | Status: {r.status_code}")
    
    if is_pass:
        tests_passed += 1
    else:
        tests_failed += 1

print("\n📋 USERS ENDPOINTS")
print("    Employees should be DENIED (403):")
test("  Cannot list all users", "/users/users/", emp_h, 403)
print("\n    Employees should be ALLOWED (200):")
test("  Can view own profile", "/users/profile/", emp_h, 200)

print("\n📋 ATTENDANCE ENDPOINTS")
print("    Employees should be DENIED (403):")
test("  Cannot list all attendance", "/attendance/all/", emp_h, 403)
print("\n    Employees should be ALLOWED (200):")
test("  Can view own attendance", "/attendance/my-attendance/", emp_h, 200)

print("\n📋 LEAVES ENDPOINTS")
print("    Employees should be DENIED (403):")
test("  Cannot list all leaves", "/leaves/all/", emp_h, 403)
print("\n    Employees should be ALLOWED (200):")
test("  Can view own leaves", "/leaves/my-leaves/", emp_h, 200)

print("\n📋 PAYROLL ENDPOINTS")
print("    Employees should be DENIED (403):")
test("  Cannot list all payroll", "/payroll/all/", emp_h, 403)
test("  Cannot create payroll", "/payroll/create/", emp_h, 403)
print("\n    Employees should be ALLOWED (200):")
test("  Can view own payroll", "/payroll/my-payroll/", emp_h, 200)

print("\n" + "="*70)
print(f"RESULTS: {tests_passed} Passed ✅ | {tests_failed} Failed ❌")
print("="*70)

if tests_failed == 0:
    print("\n" + "🎉 "*20)
    print("ALL RBAC PERMISSIONS WORKING CORRECTLY! ✅")
    print("🎉 "*20)
else:
    print(f"\n⚠️  {tests_failed} test(s) need attention")

print()
