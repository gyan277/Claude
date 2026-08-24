const PROXY_URL = import.meta.env.VITE_CLAUDE_CONSTITUTION_PROXY_URL;

const FALLBACK_ANSWER =
  "This demo isn't connected to a live constitution assistant yet. Once VITE_CLAUDE_CONSTITUTION_PROXY_URL points to a server-side proxy in front of the Claude API, this will answer questions grounded in the 1992 Constitution of Ghana.";

/**
 * Routes a citizen's question through a server-side proxy in front of the
 * Claude API. The proxy holds the API key and the constitution reference
 * text; the client never talks to Claude directly.
 */
export async function askConstitution(question: string): Promise<string> {
  if (!PROXY_URL) {
    return FALLBACK_ANSWER;
  }

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error(`Constitution assistant request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.answer as string;
}
