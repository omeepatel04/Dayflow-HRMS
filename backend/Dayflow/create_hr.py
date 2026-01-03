#!/usr/bin/env python
"""
Script to create HR user
Run: python manage.py shell < create_hr_user.py
"""
from django.contrib.auth import get_user_model

User = get_user_model()

try:
    # Check if user already exists
    if User.objects.filter(username='hetmistry').exists():
        print("❌ User hetmistry already exists!")
    else:
        user = User.objects.create_user(
            username='hetmistry',
            email='hetmistry537@gmail.com',
            password='Hm316306HR',
            employee_id='HR_HETMISTRY',
            first_name='Het',
            last_name='Mistry',
            role='HR'
        )
        print("✅ HR User Created Successfully!")
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"Employee ID: {user.employee_id}")
        print(f"Role: {user.role}")
except Exception as e:
    print(f"❌ Error: {e}")
