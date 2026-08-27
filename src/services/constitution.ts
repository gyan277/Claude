const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const FALLBACK_ANSWER =
  "The Constitution Assistant requires a Groq API key to be set in your .env file (VITE_GROQ_API_KEY). Once configured, this will answer questions grounded in the 1992 Constitution of Ghana.";

/**
 * Uses Groq AI to answer questions about Ghana's 1992 Constitution
 */
export async function askConstitution(question: string): Promise<string> {
  if (!GROQ_API_KEY) {
    console.warn('Groq API key not found');
    return FALLBACK_ANSWER;
  }

  console.log('Sending question to Groq:', question);

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
            content: `You are a knowledgeable assistant specializing in Ghana's 1992 Constitution. Answer questions accurately based on constitutional law, providing clear and concise responses. Include relevant article numbers when applicable. If you're unsure about something, say so rather than guessing. Keep responses concise and under 150 words.`,
          },
          {
            role: 'user',
            content: question,
          },
        ],
        temperature: 0.4,
        max_tokens: 800,
      }),
    });

    console.log('Groq response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error response:', errorText);
      
      // Try to parse as JSON
      try {
        const errorData = JSON.parse(errorText);
        console.error('Groq API error details:', errorData);
        
        if (response.status === 401) {
          return 'Invalid API key. Please check your Groq API key in the .env file.';
        }
        if (response.status === 429) {
          return 'Rate limit exceeded. Please wait a moment and try again.';
        }
      } catch {
        // Not JSON, log raw text
      }
      
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    console.log('Groq response data:', data);
    
    const answer = data.choices?.[0]?.message?.content;
    if (!answer) {
      console.error('No content in Groq response');
      return 'Sorry, I received an empty response. Please try again.';
    }
    
    return answer;
  } catch (error) {
    console.error('Constitution assistant error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    return 'Sorry, I encountered an error processing your question. Please try again.';
  }
}


