import os
import django
import sys

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academic_management.settings')
django.setup()

from accounts.models import User

def create_superuser():
    """Create a superuser if one doesn't exist"""
    try:
        # Check if superuser already exists
        if User.objects.filter(is_superuser=True).exists():
            print("✅ Superuser already exists")
            return
        
        # Create superuser
        superuser = User.objects.create_superuser(
            username='admin',
            email='admin@academicmanagement.com',
            password='admin123',
            first_name='System',
            last_name='Administrator',
            role='admin',
            department='IT'
        )
        
        print("✅ Superuser created successfully!")
        print(f"   Username: {superuser.username}")
        print(f"   Email: {superuser.email}")
        print(f"   Role: {superuser.get_role_display()}")
        print("   Password: admin123")
        
    except Exception as e:
        print(f"❌ Error creating superuser: {e}")

if __name__ == "__main__":
    create_superuser()
