Write-Host "🚀 Setting up Academic Management System Backend..." -ForegroundColor Green

# Check if Python is installed
try {
    $pythonVersion = python --version 2>$null
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is required but not installed." -ForegroundColor Red
    Write-Host "Please install Python from https://www.python.org/downloads/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if PostgreSQL is available
try {
    $psqlVersion = psql --version 2>$null
    Write-Host "✅ PostgreSQL found: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL client not found." -ForegroundColor Yellow
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
}

# Create virtual environment
Write-Host "📦 Creating virtual environment..." -ForegroundColor Cyan
python -m venv venv

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Cyan
& "venv\Scripts\Activate.ps1"

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
Write-Host "📚 Installing dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt

# Copy environment file
Write-Host "⚙️  Setting up environment variables..." -ForegroundColor Cyan
Copy-Item ".env.example" ".env"
Write-Host "📝 Please edit .env file with your PostgreSQL configuration" -ForegroundColor Yellow

# Wait for user to configure .env
Write-Host ""
Write-Host "Please configure your .env file now:" -ForegroundColor Yellow
Write-Host "1. Open .env file in a text editor" -ForegroundColor White
Write-Host "2. Set your PostgreSQL credentials" -ForegroundColor White
Write-Host "3. Save the file" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter when ready to continue"

# Database setup instructions
Write-Host ""
Write-Host "🗄️  Database setup:" -ForegroundColor Cyan
Write-Host "1. Make sure PostgreSQL is running" -ForegroundColor White
Write-Host "2. Open Command Prompt as Administrator" -ForegroundColor White
Write-Host "3. Run: createdb -U postgres academic_management" -ForegroundColor White
Write-Host "4. Or use pgAdmin to create database 'academic_management'" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter when database is ready"

# Run migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Cyan
python manage.py makemigrations
python manage.py migrate

# Create superuser
Write-Host "👤 Creating superuser..." -ForegroundColor Cyan
python manage.py createsuperuser

# Load initial data
Write-Host "📊 Loading initial data..." -ForegroundColor Cyan
python manage.py loaddata fixtures/initial_data.json

# Collect static files
Write-Host "🎨 Collecting static files..." -ForegroundColor Cyan
python manage.py collectstatic --noinput

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 To start the development server:" -ForegroundColor Cyan
Write-Host "   venv\Scripts\activate" -ForegroundColor White
Write-Host "   python manage.py runserver" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Your application will be available at:" -ForegroundColor Cyan
Write-Host "   • API: http://localhost:8000/api/" -ForegroundColor White
Write-Host "   • Admin: http://localhost:8000/admin/" -ForegroundColor White
Write-Host "   • API Docs: http://localhost:8000/swagger/" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
