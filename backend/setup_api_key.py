"""
Quick setup script to add OpenAI API key to .env file
"""

import os
import re

print("=" * 60)
print("NYAYASETU - OpenAI API Key Setup")
print("=" * 60)
print()
print("This script will help you add your OpenAI API key to the .env file")
print()
print("📝 Steps to get your OpenAI API key:")
print("1. Visit: https://platform.openai.com/signup")
print("2. Sign up or log in")
print("3. Go to: https://platform.openai.com/api-keys")
print("4. Click 'Create new secret key'")
print("5. Copy the key (starts with 'sk-')")
print()
print("=" * 60)
print()

# Get API key from user
api_key = input("Enter your OpenAI API key (or press Enter to skip): ").strip()

if not api_key:
    print("\n❌ No API key provided. Exiting...")
    print("\n💡 You can manually edit backend/.env and replace:")
    print("   OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE")
    print("   with your actual key")
    exit(0)

# Validate format
if not api_key.startswith('sk-'):
    print("\n⚠️  Warning: API key doesn't start with 'sk-'")
    print("   Are you sure this is a valid OpenAI API key?")
    confirm = input("   Continue anyway? (y/n): ").strip().lower()
    if confirm != 'y':
        print("\n❌ Setup cancelled")
        exit(0)

# Read .env file
env_path = '.env'
if not os.path.exists(env_path):
    print(f"\n❌ Error: {env_path} not found!")
    exit(1)

with open(env_path, 'r') as f:
    env_content = f.read()

# Replace API key
new_content = re.sub(
    r'OPENAI_API_KEY=.*',
    f'OPENAI_API_KEY={api_key}',
    env_content
)

# Write back
with open(env_path, 'w') as f:
    f.write(new_content)

print("\n✅ API key added successfully!")
print()
print("=" * 60)
print("Next Steps:")
print("=" * 60)
print("1. Restart the backend server:")
print("   • Stop current server (Ctrl+C)")
print("   • Run: python -m uvicorn app.main:app --reload")
print()
print("2. The chatbot will now use real AI (OpenAI GPT-3.5)")
print()
print("3. Test it at: http://localhost:5174/assessment")
print()
print("=" * 60)
print()
print("💰 Cost Info:")
print("   • GPT-3.5-turbo: ~$0.001-0.002 per conversation")
print("   • Very affordable for testing and projects!")
print()
print("✅ Setup complete!")
