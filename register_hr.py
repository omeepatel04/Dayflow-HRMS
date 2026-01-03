#!/usr/bin/env python
"""Register HR user with specified credentials"""
import requests
import json

BASE_URL = "http://localhost:8000"

data = {
    'username': 'hetmistry',
    'email': 'hetmistry537@gmail.com',
    'password': 'Hm316306HR',
    'password2': 'Hm316306HR',
    'employee_id': 'HR_HETMISTRY',
    'first_name': 'Het',
    'last_name': 'Mistry',
    'role': 'HR'
}

try:
    response = requests.post(f'{BASE_URL}/users/register/', json=data)
    print(f'Status Code: {response.status_code}')
    print('Response:')
    print(json.dumps(response.json(), indent=2))
    
    if response.status_code == 201:
        print("\n✅ HR User created successfully!")
        print(f"Username: hetmistry")
        print(f"Email: hetmistry537@gmail.com")
        print(f"Password: Hm316306HR")
    else:
        print("\n❌ Failed to create user")
except Exception as e:
    print(f"Error: {e}")
