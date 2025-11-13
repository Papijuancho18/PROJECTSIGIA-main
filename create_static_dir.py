import os
from pathlib import Path

# Get the base directory
BASE_DIR = Path(__file__).resolve().parent

# Create static directory
static_dir = BASE_DIR / 'static'
os.makedirs(static_dir, exist_ok=True)
print(f"Created static directory at {static_dir}")

# Create media directory
media_dir = BASE_DIR / 'media'
os.makedirs(media_dir, exist_ok=True)
print(f"Created media directory at {media_dir}")
