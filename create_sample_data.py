import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')  # Replace 'your_project'
django.setup()

from django.contrib.auth.models import User

def create_sample_data():
    # Create admin user
    admin_user = User.objects.create_superuser(
        username='admin',
        password='adminpassword',
        email='admin@example.com'
    )
    print(f"Admin user '{admin_user.username}' created.")

    # Create staff users
    staff_user1 = User.objects.create_user(
        username='staff1',
        password='staff1password',
        email='staff1@example.com',
        is_staff=True
    )
    print(f"Staff user '{staff_user1.username}' created.")

    staff_user2 = User.objects.create_user(
        username='staff2',
        password='staff2password',
        email='staff2@example.com',
        is_staff=True
    )
    print(f"Staff user '{staff_user2.username}' created.")


if __name__ == "__main__":
    create_sample_data()
