"""
Test Dashboard APIs
"""
import requests

BASE_URL = 'http://127.0.0.1:8000'

# Login as employee
print("\n📊 DASHBOARD API TEST")
print("-" * 60)

r = requests.post(f'{BASE_URL}/users/login/', json={
    'username': 'test_emp',
    'password': 'test123'
})
emp_token = r.json()['access']
emp_h = {'Authorization': f'Bearer {emp_token}'}

print("\n1. Employee Dashboard:")
r = requests.get(f'{BASE_URL}/dashboard/employee/', headers=emp_h)
print(f"   Status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    print(f"   ✅ Employee: {data['employee']['name']}")
    print(f"   ✅ Checked in: {data['attendance']['checked_in']}")
    print(f"   ✅ Pending leaves: {data['leaves']['pending_count']}")
else:
    print(f"   ❌ Error: {r.text}")

# Create HR user and test HR dashboard
print("\n2. HR Dashboard:")
r = requests.post(f'{BASE_URL}/users/register/', json={
    'username': f'test_hr_{int(__import__("time").time()) % 10000}',
    'email': f'hr_{int(__import__("time").time()) % 10000}@test.com',
    'password': 'test123',
    'role': 'HR',
    'first_name': 'Test',
    'last_name': 'HR'
})

if r.status_code == 201:
    hr_user = r.json()['user']['username']
    r = requests.post(f'{BASE_URL}/users/login/', json={
        'username': hr_user,
        'password': 'test123'
    })
    hr_token = r.json()['access']
    hr_h = {'Authorization': f'Bearer {hr_token}'}
    
    r = requests.get(f'{BASE_URL}/dashboard/hr/', headers=hr_h)
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"   ✅ Total employees: {data['employees']['total']}")
        print(f"   ✅ Present today: {data['attendance']['present']}")
        print(f"   ✅ Pending leaves: {data['leaves']['pending_count']}")
    else:
        print(f"   ❌ Error: {r.text}")

print("\n✅ Dashboard APIs working!\n")
