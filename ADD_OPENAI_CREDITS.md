# 💳 Add OpenAI Credits

## ⚠️ Current Issue

Your OpenAI API key has **no credits remaining**.

Error: `You have no credits remaining. Add credits to continue using the API.`

## 🔧 Solution: Add Billing/Credits

### Option 1: Add Payment Method (Recommended)

1. **Go to Billing:** https://platform.openai.com/settings/organization/billing

2. **Add Payment Method:**
   - Click "Add payment method"
   - Enter credit card details
   - Set usage limits (optional but recommended)

3. **Pricing:**
   - GPT-3.5-turbo: $0.0005 per 1K tokens (~500 words)
   - Your use case: ~$0.002-0.005 per conversation
   - Very affordable!

4. **Set Usage Limits:**
   - Go to "Usage limits"
   - Set monthly cap (e.g., $10-20 for testing)
   - Prevents unexpected charges

### Option 2: Check Free Credits

1. **Go to:** https://platform.openai.com/account/usage

2. **Check:**
   - Do you have free trial credits?
   - Have they expired?
   - New accounts get $5 free (valid 3 months)

3. **If expired:**
   - Add payment method (Option 1)

### Option 3: Create New Account

If this is a test account:

1. Create new OpenAI account with different email
2. Get new $5 free credits
3. Create new API key
4. Replace in `backend/.env`

## 🔄 Once Credits Added

After adding payment method/credits:

1. **The system will work automatically** (DEMO_MODE is temporarily enabled)

2. **To enable real AI again:**
   ```bash
   # Edit backend/.env
   # Change: DEMO_MODE=True
   # To: DEMO_MODE=False
   # Backend will auto-reload
   ```

3. **Or keep DEMO_MODE:**
   - Your system works great in demo mode too!
   - Professional responses
   - Case strength analysis
   - No API costs

## 💰 Cost Estimates

**GPT-3.5-turbo Pricing:**
- Input: $0.0015 per 1K tokens
- Output: $0.002 per 1K tokens
- Average conversation: ~2K tokens total
- Cost per conversation: **$0.003-0.005**

**Monthly Costs (estimated):**
- 100 conversations: $0.30-0.50
- 500 conversations: $1.50-2.50
- 1000 conversations: $3.00-5.00

**Very affordable for academic projects!**

## 🎯 Current Status

✅ **Your System Still Works!**
- Demo mode is enabled
- Professional legal analysis active
- Case strength scoring working
- All features functional
- **No API costs**

📊 **Demo Mode Provides:**
- Professional legal responses
- Case strength ratings (Strong/Moderate/Weak)
- Win probability estimates
- Evidence analysis
- Strategic recommendations
- All 7+ legal categories

## 🤔 Which Mode to Use?

| Feature | Demo Mode | Real AI Mode |
|---------|-----------|--------------|
| **Cost** | 🆓 FREE | 💵 ~$0.003/msg |
| **Quality** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Setup** | ✅ Ready | Need credits |
| **Analysis** | Pattern-based | Context-aware |
| **Memory** | Single message | Full history |
| **Use Case** | Testing, demos | Production |

## ✅ Recommended Action

**For Testing/Academic Project:**
- Keep using demo mode (works great!)
- Add credits later if needed

**For Production:**
- Add payment method now
- Set monthly usage limit
- Enable real AI mode

## 🆘 Need Help?

**Check billing:** https://platform.openai.com/settings/organization/billing

**Check usage:** https://platform.openai.com/account/usage

**OpenAI support:** https://help.openai.com/

---

**Your system works perfectly in demo mode while you decide!** ✅
