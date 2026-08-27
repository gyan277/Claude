import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * AI Policy Summarization
 * Takes a long policy and creates a concise summary with key points
 */
export async function summarizePolicy(policyText: string): Promise<{
  summary: string;
  keyPoints: string[];
  actionItems: string[];
}> {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that summarizes government policies for Ghanaian citizens. 
          Create clear, concise summaries that highlight:
          1. Main purpose of the policy
          2. Key points (3-5 bullet points)
          3. Action items for citizens (what they need to do)
          
          Format your response as JSON:
          {
            "summary": "One paragraph summary",
            "keyPoints": ["point 1", "point 2", "point 3"],
            "actionItems": ["action 1", "action 2"]
          }`,
        },
        {
          role: 'user',
          content: `Summarize this policy:\n\n${policyText}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return {
      summary: parsed.summary || 'Unable to generate summary',
      keyPoints: parsed.keyPoints || [],
      actionItems: parsed.actionItems || [],
    };
  } catch (error) {
    console.error('Error summarizing policy:', error);
    return {
      summary: 'Unable to generate summary at this time.',
      keyPoints: [],
      actionItems: [],
    };
  }
}

/**
 * AI Sentiment Analysis
 * Analyzes the sentiment of forum posts and comments
 */
export async function analyzeSentiment(text: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1
  emotions: string[];
}> {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a sentiment analysis expert. Analyze the sentiment of text and respond in JSON format:
          {
            "sentiment": "positive" | "negative" | "neutral",
            "score": -1.0 to 1.0,
            "emotions": ["emotion1", "emotion2"]
          }
          
          Score scale: -1.0 (very negative) to 1.0 (very positive), 0 (neutral)
          Emotions can be: happy, angry, sad, frustrated, hopeful, concerned, supportive, critical, etc.`,
        },
        {
          role: 'user',
          content: `Analyze this text:\n\n${text}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return {
      sentiment: parsed.sentiment || 'neutral',
      score: parsed.score || 0,
      emotions: parsed.emotions || [],
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return {
      sentiment: 'neutral',
      score: 0,
      emotions: [],
    };
  }
}

/**
 * AI Content Moderation
 * Flags inappropriate content in forums
 */
export async function moderateContent(text: string): Promise<{
  isAppropriate: boolean;
  reason?: string;
  severity: 'low' | 'medium' | 'high';
  categories: string[];
}> {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a content moderation expert for a civic engagement platform in Ghana. 
          Check if content is appropriate and respond in JSON:
          {
            "isAppropriate": true/false,
            "reason": "explanation if inappropriate",
            "severity": "low" | "medium" | "high",
            "categories": ["hate speech", "violence", "spam", "misinformation", etc.]
          }
          
          Flag content that contains:
          - Hate speech or discrimination
          - Threats or violence
          - Spam or scams
          - Misinformation about government
          - Personal attacks
          - Explicit content
          
          Be culturally sensitive to Ghanaian context.`,
        },
        {
          role: 'user',
          content: `Moderate this content:\n\n${text}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return {
      isAppropriate: parsed.isAppropriate !== false,
      reason: parsed.reason,
      severity: parsed.severity || 'low',
      categories: parsed.categories || [],
    };
  } catch (error) {
    console.error('Error moderating content:', error);
    return {
      isAppropriate: true,
      severity: 'low',
      categories: [],
    };
  }
}

/**
 * AI Policy Recommendations
 * Suggests policies based on user's district and interests
 */
export async function recommendPolicies(
  userDistrict: string,
  userInterests: string[],
  availablePolicies: Array<{ id: string; title: string; description: string; category: string }>
): Promise<Array<{ policyId: string; relevanceScore: number; reason: string }>> {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a policy recommendation engine for Ghana's civic platform.
          Analyze policies and recommend the most relevant ones for the user.
          
          Respond in JSON array format:
          [
            {
              "policyId": "policy-id",
              "relevanceScore": 0.0 to 1.0,
              "reason": "why this is relevant"
            }
          ]
          
          Consider:
          - User's district
          - User's interests
          - Policy category
          - Policy description
          
          Return top 5 recommendations.`,
        },
        {
          role: 'user',
          content: `User District: ${userDistrict}
User Interests: ${userInterests.join(', ')}

Available Policies:
${availablePolicies.map(p => `ID: ${p.id}\nTitle: ${p.title}\nCategory: ${p.category}\nDescription: ${p.description}\n`).join('\n---\n')}

Recommend the top 5 most relevant policies.`,
        },
      ],
      temperature: 0.4,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || '[]';
    const parsed = JSON.parse(content);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error recommending policies:', error);
    return [];
  }
}

/**
 * AI Forum Topic Extraction
 * Extracts main topics from forum discussions
 */
export async function extractTopics(posts: Array<{ title: string; content: string }>): Promise<{
  topics: Array<{ name: string; frequency: number; sentiment: string }>;
  trending: string[];
}> {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a topic extraction expert for civic forums.
          Analyze forum posts and identify main topics, themes, and trends.
          
          Respond in JSON:
          {
            "topics": [
              {
                "name": "topic name",
                "frequency": number of mentions,
                "sentiment": "positive" | "negative" | "neutral"
              }
            ],
            "trending": ["trending topic 1", "trending topic 2"]
          }
          
          Focus on civic issues relevant to Ghana.`,
        },
        {
          role: 'user',
          content: `Analyze these forum posts:\n\n${posts.map(p => `${p.title}\n${p.content}`).join('\n\n---\n\n')}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return {
      topics: parsed.topics || [],
      trending: parsed.trending || [],
    };
  } catch (error) {
    console.error('Error extracting topics:', error);
    return {
      topics: [],
      trending: [],
    };
  }
}

/**
 * AI Smart Search
 * Semantic search across policies and forums
 */
export async function smartSearch(
  query: string,
  items: Array<{ id: string; title: string; content: string; type: 'policy' | 'post' }>
): Promise<Array<{ id: string; relevanceScore: number; snippet: string }>> {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a semantic search engine for civic content.
          Find the most relevant items based on the user's query.
          
          Respond in JSON array:
          [
            {
              "id": "item-id",
              "relevanceScore": 0.0 to 1.0,
              "snippet": "relevant excerpt"
            }
          ]
          
          Return top 10 results ranked by relevance.`,
        },
        {
          role: 'user',
          content: `Query: ${query}

Items to search:
${items.map(i => `ID: ${i.id}\nType: ${i.type}\nTitle: ${i.title}\nContent: ${i.content.substring(0, 200)}...\n`).join('\n---\n')}

Find the most relevant items.`,
        },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '[]';
    const parsed = JSON.parse(content);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error in smart search:', error);
    return [];
  }
}

/**
 * AI Comment Suggestions
 * Suggests constructive comments for forum discussions
 */
export async function suggestComment(postTitle: string, postContent: string): Promise<string[]> {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a civic engagement assistant for Ghana.
          Suggest 3 constructive, thoughtful comment ideas for forum posts.
          
          Comments should be:
          - Respectful and constructive
          - Add value to the discussion
          - Encourage civic participation
          - Culturally appropriate for Ghana
          
          Respond with JSON array of 3 suggestions:
          ["suggestion 1", "suggestion 2", "suggestion 3"]`,
        },
        {
          role: 'user',
          content: `Post Title: ${postTitle}\n\nPost Content: ${postContent}\n\nSuggest 3 comment ideas.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '[]';
    const parsed = JSON.parse(content);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error suggesting comments:', error);
    return [];
  }
}
