export type LocalLanguage = 'twi' | 'ga' | 'ewe' | 'dagbani' | 'english';

export const SUPPORTED_LANGUAGES: { code: LocalLanguage; label: string }[] = [
  { code: 'english', label: 'English' },
  { code: 'twi', label: 'Twi' },
  { code: 'ga', label: 'Ga' },
  { code: 'ewe', label: 'Ewe' },
  { code: 'dagbani', label: 'Dagbani' },
];

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Translates policy text using Groq AI API
 */
export async function translatePolicyText(text: string, targetLanguage: LocalLanguage): Promise<string> {
  if (targetLanguage === 'english') return text;

  if (!GROQ_API_KEY) {
    console.warn('VITE_GROQ_API_KEY is not set; returning original text.');
    return text;
  }

  console.log(`Translating to ${targetLanguage}:`, text.substring(0, 50) + '...');

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator specializing in Ghanaian languages. Translate the following text accurately to ${targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1)}. Maintain the original meaning, tone, and formatting. Only provide the translation, no explanations or additional text.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.2,
        max_tokens: 1500,
      }),
    });

    console.log('Translation response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq translation error:', errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid API key');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment.');
      }
      
      throw new Error(`Translation failed with status ${response.status}`);
    }

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content;
    
    if (!translated) {
      console.error('No translation content in response');
      return text;
    }
    
    console.log('Translation successful');
    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text if translation fails
    return text;
  }
}


