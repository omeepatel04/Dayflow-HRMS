from django.contrib.auth import get_user_model

User = get_user_model()

u = User.objects.filter(username="hetmistry").first()
if u:
    print(f"✅ User found: {u.username}")
    print(f"Email: {u.email}")
    print(f"Employee ID: {u.employee_id}")
    print(f"Role: {u.role}")
    print(f"Is active: {u.is_active}")
else:
    print("❌ User not found!")
    print("Creating user now...")
    try:
        u = User.objects.create_user(
            username='hetmistry',
            email='hetmistry537@gmail.com',
            password='Hm316306HR',
            employee_id='HR_HETMISTRY',
            first_name='Het',
            last_name='Mistry',
            role='HR'
        )
        print(f"✅ User created: {u.username}")
    except Exception as e:
        print(f"❌ Error: {e}")
