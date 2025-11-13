#!/bin/bash

echo "🚀 Setting up Academic Management System Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found. Please install PostgreSQL."
    echo "   Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "   macOS: brew install postgresql"
    echo "   Windows: Download from https://www.postgresql.org/download/"
fi

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Upgrade pip
pip install --upgrade pip

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Copy environment file
echo "⚙️  Setting up environment variables..."
cp .env.example .env
echo "📝 Please edit .env file with your PostgreSQL configuration"

# Wait for user to configure .env
read -p "Press Enter after you've configured your .env file..."

# Create database (optional helper)
echo "🗄️  Database setup:"
echo "   1. Make sure PostgreSQL is running"
echo "   2. Create database: createdb academic_management"
echo "   3. Or use psql: CREATE DATABASE academic_management;"
read -p "Press Enter when database is ready..."

# Run migrations
echo "🔄 Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser
echo "👤 Creating superuser..."
python manage.py createsuperuser

# Load initial data
echo "📊 Loading initial data..."
python manage.py loaddata fixtures/initial_data.json

# Collect static files
echo "🎨 Collecting static files..."
python manage.py collectstatic --noinput

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   source venv/bin/activate  # (or venv\\Scripts\\activate on Windows)"
echo "   python manage.py runserver"
echo ""
echo "🌐 Your application will be available at:"
echo "   • API: http://localhost:8000/api/"
echo "   • Admin: http://localhost:8000/admin/"
echo "   • API Docs: http://localhost:8000/swagger/"
echo ""
echo "📝 Don't forget to:"
echo "   • Configure your .env file"
echo "   • Start PostgreSQL service"
echo "   • Create the database: academic_management"
