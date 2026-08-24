export type LocalLanguage = 'twi' | 'ga' | 'ewe' | 'dagbani' | 'english';

export const SUPPORTED_LANGUAGES: { code: LocalLanguage; label: string }[] = [
  { code: 'english', label: 'English' },
  { code: 'twi', label: 'Twi' },
  { code: 'ga', label: 'Ga' },
  { code: 'ewe', label: 'Ewe' },
  { code: 'dagbani', label: 'Dagbani' },
];

const PROXY_URL = import.meta.env.VITE_CLAUDE_TRANSLATION_PROXY_URL;

/**
 * Routes policy text through a server-side proxy in front of the Claude API.
 * The proxy holds the API key; the client never talks to Claude directly.
 */
export async function translatePolicyText(text: string, targetLanguage: LocalLanguage): Promise<string> {
  if (targetLanguage === 'english') return text;

  if (!PROXY_URL) {
    console.warn('VITE_CLAUDE_TRANSLATION_PROXY_URL is not set; returning original text.');
    return text;
  }

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLanguage }),
  });

  if (!response.ok) {
    throw new Error(`Translation request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.translatedText as string;
}
