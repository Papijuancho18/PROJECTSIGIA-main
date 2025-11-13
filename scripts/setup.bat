@echo off
echo 🚀 Setting up Academic Management System Backend...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is required but not installed.
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if PostgreSQL is available
psql --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  PostgreSQL client not found. Please install PostgreSQL.
    echo Download from: https://www.postgresql.org/download/windows/
    echo.
)

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
python -m pip install --upgrade pip

REM Install dependencies
echo 📚 Installing dependencies...
pip install -r requirements.txt

REM Copy environment file
echo ⚙️  Setting up environment variables...
copy .env.example .env
echo 📝 Please edit .env file with your PostgreSQL configuration

REM Wait for user to configure .env
echo.
echo Please configure your .env file now:
echo 1. Open .env file in a text editor
echo 2. Set your PostgreSQL credentials
echo 3. Save the file
echo.
pause

REM Database setup instructions
echo.
echo 🗄️  Database setup:
echo 1. Make sure PostgreSQL is running
echo 2. Open Command Prompt as Administrator
echo 3. Run: createdb -U postgres academic_management
echo 4. Or use pgAdmin to create database 'academic_management'
echo.
pause

REM Run migrations
echo 🔄 Running database migrations...
python manage.py makemigrations
python manage.py migrate

REM Create superuser
echo 👤 Creating superuser...
python manage.py createsuperuser

REM Load initial data
echo 📊 Loading initial data...
python manage.py loaddata fixtures/initial_data.json

REM Collect static files
echo 🎨 Collecting static files...
python manage.py collectstatic --noinput

echo.
echo ✅ Setup complete!
echo.
echo 🚀 To start the development server:
echo    venv\Scripts\activate
echo    python manage.py runserver
echo.
echo 🌐 Your application will be available at:
echo    • API: http://localhost:8000/api/
echo    • Admin: http://localhost:8000/admin/
echo    • API Docs: http://localhost:8000/swagger/
echo.
pause
