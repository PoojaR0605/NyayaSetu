# AI Chatbot Setup Guide

## Current Status
✅ AI service integrated with OpenAI GPT  
✅ Karnataka & Maharashtra legal resources added (13 total)  
⚙️ Demo Mode: **ENABLED** (keyword-based responses)

## Enabling Full AI Chatbot

### Step 1: Get OpenAI API Key

1. Go to https://platform.openai.com/signup
2. Create an account (or sign in)
3. Navigate to https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

### Step 2: Update .env File

Open `backend/.env` and update these lines:

```bash
# Replace with your actual API key
OPENAI_API_KEY=sk-your-actual-key-here

# Set to False to enable AI mode
DEMO_MODE=False
```

### Step 3: Restart Backend

```bash
# Stop the current backend (Ctrl+C)
# Then restart:
cd backend
python -m uvicorn app.main:app --reload
```

## AI Features

When AI mode is enabled (DEMO_MODE=False):

- **Intelligent Responses**: GPT-powered legal guidance
- **Context-Aware**: Remembers conversation history
- **Location-Aware**: Uses user's state/district in responses
- **Legal Domain Expert**: Trained on Indian legal system
- **Empathetic**: Court-themed but compassionate responses

## Demo Mode (Current)

When DEMO_MODE=True:

- **Keyword Matching**: Simple pattern-based responses
- **No API Cost**: Free to use
- **Court-Themed**: Professional language
- **Common Topics**: Employment, tenancy, property, consumer, family law
- **No External Dependencies**: Works offline

## Cost Estimate (OpenAI)

Using GPT-3.5-turbo with 500 max tokens per response:

- ~$0.001 - $0.002 per conversation message
- 1000 messages ≈ $1-2 USD
- Very affordable for academic projects!

## Testing AI Mode

1. Enable AI mode (set DEMO_MODE=False with valid API key)
2. Restart backend
3. Go to http://localhost:5174/assessment
4. Start chatting
5. Try questions like:
   - "My employer hasn't paid my salary for 3 months"
   - "My landlord is trying to evict me without notice"
   - "I bought a defective phone and the seller refuses refund"

## Fallback Behavior

If OpenAI API fails or key is invalid:
- System automatically uses fallback responses
- User sees helpful error message
- Chat continues to work

## Alternative: Anthropic Claude

To use Claude instead of GPT:

1. Get API key from https://console.anthropic.com/
2. Install: `pip install anthropic`
3. Modify `app/services/ai_service.py` to use Anthropic client

## Support

For issues:
- Check backend logs: `backend/logs/nyayasetu.log`
- Verify API key is valid
- Ensure `openai` package is installed: `pip install openai==1.12.0`
