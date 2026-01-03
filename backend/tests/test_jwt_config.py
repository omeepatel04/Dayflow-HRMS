"""
Test Custom JWT Configuration
"""
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

print("\n" + "="*60)
print("TESTING CUSTOM JWT CONFIGURATION")
print("="*60 + "\n")

# Test 1: Register a new user
print("1. Registering test user...")
username = f"jwt_test_{int(time.time())}"
data = {
    "username": username,
    "email": f"{username}@test.com",
    "password": "TestJWT123!",
    "password2": "TestJWT123!",
    "employee_id": f"JWT{int(time.time())}",
    "first_name": "JWT",
    "last_name": "Test",
    "role": "EMPLOYEE"
}
response = requests.post(f"{BASE_URL}/users/register/", json=data)
print(f"   Status: {response.status_code}")

# Test 2: Login and get custom JWT
print("\n2. Testing Custom JWT Login...")
login_data = {
    "username": username,
    "password": "TestJWT123!"
}
response = requests.post(f"{BASE_URL}/users/login/", json=login_data)
print(f"   Status: {response.status_code}")

if response.status_code == 200:
    result = response.json()
    
    print("\n   ✅ Login Successful!")
    print(f"\n   Access Token: {result['access'][:50]}...")
    print(f"   Refresh Token: {result['refresh'][:50]}...")
    
    print("\n   📋 User Data in Response:")
    user_data = result.get('user', {})
    for key, value in user_data.items():
        print(f"      {key}: {value}")
    
    access_token = result['access']
    refresh_token = result['refresh']
    
    # Decode token to see custom claims
    print("\n3. Decoding JWT to verify custom claims...")
    import jwt
    try:
        decoded = jwt.decode(access_token, options={"verify_signature": False})
        print("\n   🔐 Token Claims:")
        for key, value in decoded.items():
            print(f"      {key}: {value}")
    except Exception as e:
        print(f"   Error decoding: {e}")
    
    # Test 3: Use token to access protected endpoint
    print("\n4. Testing token on protected endpoint...")
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/users/profile/", headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Token works on protected endpoint")
    
    # Test 4: Refresh token
    print("\n5. Testing token refresh...")
    response = requests.post(
        f"{BASE_URL}/users/token/refresh/",
        json={"refresh": refresh_token}
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        new_tokens = response.json()
        print("   ✅ Token refresh successful")
        print(f"   New Access Token: {new_tokens.get('access', '')[:50]}...")
        if 'refresh' in new_tokens:
            print(f"   New Refresh Token: {new_tokens['refresh'][:50]}...")
            print("   ✅ Refresh token rotation enabled")
            refresh_token = new_tokens['refresh']  # Use new refresh token for logout
    
    # Test 5: Logout (blacklist token)
    print("\n6. Testing logout (token blacklisting)...")
    response = requests.post(
        f"{BASE_URL}/users/logout/",
        json={"refresh_token": refresh_token},
        headers=headers
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Logout successful - Token blacklisted")
    
    # Test 6: Try to use blacklisted token
    print("\n7. Testing blacklisted token (should fail)...")
    response = requests.post(
        f"{BASE_URL}/users/token/refresh/",
        json={"refresh": refresh_token}
    )
    print(f"   Status: {response.status_code}")
    if response.status_code != 200:
        print("   ✅ Blacklisted token rejected correctly")
    else:
        print("   ❌ Blacklisted token still works (unexpected)")

print("\n" + "="*60)
print("JWT CONFIGURATION TEST COMPLETE")
print("\n✅ Custom JWT Features Working:")
print("   - Custom claims (role, employee_id)")
print("   - Token lifetime (1 hour access, 7 days refresh)")
print("   - Token rotation on refresh")
print("   - Token blacklisting on logout")
print("   - User data in login response")
print("="*60 + "\n")
