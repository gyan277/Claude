# Groq AI Setup Guide

This application uses Groq AI for:
- **Policy Translations** - Translate policies to Twi, Ga, Ewe, and Dagbani
- **Constitution Assistant** - Answer questions about Ghana's 1992 Constitution

## Getting Your Groq API Key

1. Visit [https://console.groq.com/](https://console.groq.com/)
2. Sign up for a free account (no credit card required)
3. Navigate to the API Keys section
4. Click "Create API Key"
5. Copy your API key

## Setting Up the API Key

1. Open the `.env` file in the root of your project
2. Add your Groq API key:
   ```
   VITE_GROQ_API_KEY=gsk_your_api_key_here
   ```
3. Save the file
4. Restart your development server (`npm run dev`)

## Features Using Groq

### 1. Policy Translation
- Navigate to any policy page
- Click the language selector (Languages button)
- Select your preferred language (Twi, Ga, Ewe, Dagbani)
- The policy will be translated using Groq's `llama-3.3-70b-versatile` model

### 2. Constitution Assistant
- Access the floating chat button on the bottom right
- Ask questions about Ghana's 1992 Constitution
- Get accurate, context-aware answers powered by Groq AI

## Models Used

- **Translation**: `llama-3.3-70b-versatile`
  - Fast, accurate translations
  - Supports multiple Ghanaian languages
  - Low temperature (0.3) for consistency

- **Constitution Assistant**: `llama-3.3-70b-versatile`
  - Knowledge-based Q&A
  - Includes article references
  - Temperature (0.4) for balanced accuracy

## Rate Limits

Groq offers generous free tier limits:
- 30 requests per minute
- 7,000 requests per day

For production use, consider upgrading to a paid plan.

## Troubleshooting

**Translations not working?**
- Check that `VITE_GROQ_API_KEY` is set in `.env`
- Verify your API key is valid at [https://console.groq.com/](https://console.groq.com/)
- Check browser console for error messages
- Restart the dev server after adding the API key

**Constitution assistant not responding?**
- Same steps as above
- Ensure you have a stable internet connection
- Check if you've exceeded rate limits

## Security Notes

- Never commit your `.env` file to version control
- Use `.env.local` for local overrides (already gitignored)
- In production, use environment variables from your hosting platform
- The API key is exposed in the client - consider using a backend proxy for production

## Alternative: Using a Backend Proxy

For production, it's recommended to:
1. Create a backend API endpoint
2. Store the Groq API key on the server
3. Have your frontend call your backend
4. Your backend then calls Groq API

This keeps your API key secure and allows you to implement:
- Rate limiting
- Request logging
- Cost monitoring
- User authentication
