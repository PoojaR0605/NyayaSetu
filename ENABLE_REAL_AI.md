# 🤖 Enable Real AI Chatbot - Quick Guide

## ✅ Changes Made

1. ✅ **Disabled DEMO_MODE** in `.env` 
2. ✅ **Added End Session button** to chat interface
3. ✅ **Backend endpoint** `/api/v1/sessions/{token}/close` ready
4. ✅ **All code ready** for real OpenAI integration

## 🔑 You Need: OpenAI API Key

### Option 1: Automated Setup (Easiest)

```bash
cd backend
python setup_api_key.py
```

Follow the prompts to enter your API key.

### Option 2: Manual Setup

1. **Get API Key:**
   - Go to https://platform.openai.com/signup
   - Create account / Sign in
   - Visit https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

2. **Add to .env:**
   Open `backend/.env` and replace:
   ```
   OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
   ```
   with:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Verify Settings:**
   Ensure these lines in `backend/.env`:
   ```
   DEMO_MODE=False
   LLM_MODEL=gpt-3.5-turbo
   LLM_MAX_TOKENS=500
   ```

## 🚀 Restart Backend

After adding the API key:

```bash
# Stop current backend (Ctrl+C in terminal)

# Restart with:
cd backend
python -m uvicorn app.main:app --reload
```

## ✅ Test Real AI

1. Visit http://localhost:5174/assessment
2. Start chatting
3. Try: "My employer hasn't paid salary for 3 months"
4. You'll get intelligent, context-aware responses!

## 🆕 New Features

### End Session Button
- Shows at bottom of chat after you start chatting
- Click to end session gracefully
- Saves conversation to backend
- Returns to home page

### Real AI Benefits
- **Context-Aware**: Remembers your conversation
- **Intelligent**: Understands complex situations
- **Personalized**: Adapts to your specific case
- **Location-Aware**: Uses your state/district info
- **Legal Expert**: Trained on Indian legal system

## 💰 Cost Information

**GPT-3.5-turbo Pricing:**
- ~$0.001 - $0.002 per message
- 1000 messages ≈ $1-2 USD
- Very affordable for projects!

**Free Credits:**
- New OpenAI accounts get $5 free credit
- Enough for 2500-5000 conversations
- Perfect for testing and demos!

## 🔄 Fallback to Demo Mode

If you encounter issues or run out of credits:

1. Edit `backend/.env`:
   ```
   DEMO_MODE=True
   ```

2. Restart backend

3. System will use enhanced keyword responses (no API needed)

## 🆘 Troubleshooting

**"Invalid API key" error:**
- Verify key starts with `sk-`
- Check no extra spaces
- Ensure key is active on OpenAI dashboard

**"Rate limit exceeded":**
- You've hit usage limits
- Wait a few minutes
- Or upgrade OpenAI plan

**"Module not found: openai":**
```bash
pip install openai==1.12.0
```

**Backend won't start:**
- Check `.env` syntax (no quotes around values)
- Ensure all environment variables are set
- Check logs: `backend/logs/nyayasetu.log`

## 📊 What's Different

| Feature | Demo Mode | Real AI Mode |
|---------|-----------|--------------|
| Response Quality | Good (keyword-based) | Excellent (context-aware) |
| Conversation Memory | None | Full history |
| Personalization | Generic | Personalized |
| Legal Accuracy | Static patterns | Dynamic reasoning |
| Cost | Free | ~$0.001/message |
| API Required | No | Yes (OpenAI) |

## ✨ Both Modes Work Great!

- **Demo Mode**: Perfect for testing, no API needed
- **Real AI Mode**: Best experience, requires OpenAI key

Choose based on your needs!

---

## 📞 Quick Reference

**OpenAI Platform:** https://platform.openai.com  
**API Keys:** https://platform.openai.com/api-keys  
**Pricing:** https://openai.com/pricing  
**Documentation:** https://platform.openai.com/docs  

---

**Questions?** Check `AI_SETUP_GUIDE.md` for more details!
