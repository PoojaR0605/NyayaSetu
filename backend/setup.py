"""
Setup script for NYAYASETU backend.
Automates environment setup and database initialization.
"""

import os
import sys
import subprocess
from pathlib import Path


def run_command(command, description):
    """Run a shell command and handle errors."""
    print(f"\n{'='*60}")
    print(f"📌 {description}")
    print(f"{'='*60}")
    
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"❌ Error: {result.stderr}")
        return False
    
    if result.stdout:
        print(result.stdout)
    
    print(f"✅ {description} completed successfully")
    return True


def check_python_version():
    """Check if Python version is adequate."""
    if sys.version_info < (3, 10):
        print("❌ Python 3.10+ is required")
        return False
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True


def setup_environment():
    """Setup Python environment."""
    print("\n" + "="*60)
    print("🚀 NYAYASETU Backend Setup")
    print("="*60)
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Create virtual environment
    venv_path = Path("venv")
    if not venv_path.exists():
        if not run_command("python -m venv venv", "Creating virtual environment"):
            return False
    else:
        print("✅ Virtual environment already exists")
    
    # Activate and install dependencies
    if os.name == 'nt':  # Windows
        pip_cmd = r".\venv\Scripts\pip"
        python_cmd = r".\venv\Scripts\python"
    else:  # Unix/Linux
        pip_cmd = "./venv/bin/pip"
        python_cmd = "./venv/bin/python"
    
    if not run_command(f"{pip_cmd} install --upgrade pip", "Upgrading pip"):
        return False
    
    if not run_command(f"{pip_cmd} install -r requirements.txt", "Installing dependencies"):
        return False
    
    # Setup .env file
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if not env_file.exists() and env_example.exists():
        import shutil
        shutil.copy(env_example, env_file)
        print("✅ Created .env file from .env.example")
        print("⚠️  Please edit .env with your configuration")
    
    # Create logs directory
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    print("✅ Created logs directory")
    
    return True


def initialize_database():
    """Initialize database with sample data."""
    print("\n" + "="*60)
    print("🗄️  Database Initialization")
    print("="*60)
    
    if os.name == 'nt':
        python_cmd = r".\venv\Scripts\python"
    else:
        python_cmd = "./venv/bin/python"
    
    return run_command(
        f"{python_cmd} -m app.db.init_db",
        "Initializing database"
    )


def main():
    """Main setup function."""
    print("\n")
    print("╔" + "="*58 + "╗")
    print("║" + " "*15 + "NYAYASETU BACKEND SETUP" + " "*20 + "║")
    print("╚" + "="*58 + "╝")
    
    # Setup environment
    if not setup_environment():
        print("\n❌ Setup failed")
        return 1
    
    # Ask about database initialization
    print("\n" + "="*60)
    response = input("Initialize database with sample data? (y/n): ").lower()
    
    if response == 'y':
        if not initialize_database():
            print("\n❌ Database initialization failed")
            return 1
    
    # Success message
    print("\n" + "╔" + "="*58 + "╗")
    print("║" + " "*15 + "✅ SETUP COMPLETED!" + " "*22 + "║")
    print("╚" + "="*58 + "╝")
    
    print("\n📝 Next steps:")
    print("1. Edit .env file with your configuration")
    print("2. Activate virtual environment:")
    if os.name == 'nt':
        print("   .\\venv\\Scripts\\activate")
    else:
        print("   source venv/bin/activate")
    print("3. Run the server:")
    print("   python -m app.main")
    print("   OR")
    print("   uvicorn app.main:app --reload")
    print("\n4. Access the API:")
    print("   http://localhost:8000")
    print("   http://localhost:8000/api/docs (API documentation)")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
