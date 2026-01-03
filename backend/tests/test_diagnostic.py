"""
Diagnostic Test - Check Permission Enforcement
"""
import requests
import json

BASE_URL = 'http://127.0.0.1:8000'

print("\n" + "="*60)
print("PERMISSION DIAGNOSTIC TEST")
print("="*60)

# First, get an existing user token
print("\n1. Getting existing user token...")
resp = requests.post(f'{BASE_URL}/users/login/', json={
    'username': 'testemployee',
    'password': 'password123'
})

if resp.status_code == 200:
    token = resp.json().get('access')
    print(f"   ✅ Got token for employee1")
    print(f"   Token: {token[:50]}...")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test accessing user list (should be denied for employee)
    print("\n2. Employee accessing /users/users/ (should be 403)...")
    resp = requests.get(f'{BASE_URL}/users/users/', headers=headers)
    print(f"   Status: {resp.status_code}")
    print(f"   Response: {resp.text[:200]}")
    
    if resp.status_code == 403:
        print(f"   ✅ PERMISSION CORRECTLY ENFORCED")
    else:
        print(f"   ❌ PERMISSION NOT ENFORCED - Should be 403, got {resp.status_code}")
        
    # Test accessing own profile (should work)
    print("\n3. Employee accessing /users/profile/ (should be 200)...")
    resp = requests.get(f'{BASE_URL}/users/profile/', headers=headers)
    print(f"   Status: {resp.status_code}")
    if resp.status_code == 200:
        print(f"   ✅ Can access own profile")
    else:
        print(f"   ❌ Cannot access own profile")
        print(f"   Response: {resp.text[:200]}")
else:
    print(f"   ❌ Failed to login: {resp.status_code}")
    print(f"   Response: {resp.text}")

print("\n" + "="*60)
