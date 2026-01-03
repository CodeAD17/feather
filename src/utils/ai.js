// AI utility for generating LinkedIn posts using Groq API

import { getSettings } from './storage';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Generate post from certificate/event
export const generateCertificatePost = async (data) => {
  const settings = getSettings();
  
  if (!settings.groqApiKey) {
    throw new Error('Groq API key not configured. Please add your API key in Settings.');
  }

  const { title, issuer, skills, context, tone = 'professional' } = data;

  const toneInstructions = {
    professional: 'Write in a professional, articulate tone. Focus on the value and impact.',
    casual: 'Write in a friendly, conversational tone. Be approachable and relatable.',
    storytelling: 'Write as a brief story with a beginning, middle, and end. Include a personal reflection.',
  };

  const prompt = `You are a LinkedIn content expert. Create a compelling LinkedIn post about completing a certification or attending an event.

Details:
- Certificate/Event: ${title}
- Issuer/Organizer: ${issuer}
- Skills Learned: ${skills}
- Additional Context: ${context}

FORMATTING RULES:
- ${toneInstructions[tone]}
- DO NOT use markdown like **bold** or *italics* - LinkedIn doesn't render these
- For emphasis, use UPPERCASE for key words
- Keep it concise (150-250 words max)
- Focus on learning and growth, not bragging
- Be authentic and humble
- Include 2-3 relevant hashtags at the end
- Don't use clichés like "excited to announce" or "thrilled to share"
- Use 1-2 emojis max for visual interest
- End with a question or call-to-action to encourage engagement

Write the LinkedIn post now (NO markdown formatting):`;

  return await callGroqAPI(prompt, settings.groqApiKey);
};

// Generate post from GitHub activity
export const generateGitHubPost = async (data) => {
  const settings = getSettings();
  
  if (!settings.groqApiKey) {
    throw new Error('Groq API key not configured. Please add your API key in Settings.');
  }

  const { summary, selectedRepos, focus, tone = 'professional' } = data;

  const toneInstructions = {
    professional: 'Write in a professional, articulate tone focusing on technical achievements.',
    casual: 'Write in a friendly, developer-to-developer tone. Be relatable.',
    enthusiastic: 'Write with energy and enthusiasm about the progress made.',
  };

  const repoDetails = selectedRepos
    .map((r) => `- ${r.name}: ${r.description} (${r.language})`)
    .join('\n');

  const commitSummary = summary.commits
    .slice(0, 10)
    .map((c) => `- ${c.message}`)
    .join('\n');

  const prompt = `You are a LinkedIn content expert specializing in "building in public" posts for developers.

Weekly GitHub Activity Summary:
- Total push events: ${summary.pushEvents}
- Pull requests: ${summary.pullRequests}
- Repositories worked on: ${summary.repos.length}

Selected Projects to Highlight:
${repoDetails}

Recent Commits:
${commitSummary}

Focus Area: ${focus || 'General development progress'}

IMPORTANT FORMATTING RULES:
- ${toneInstructions[tone]}
- DO NOT use markdown syntax like **bold** or *italics* - LinkedIn does not render these
- For emphasis, use UPPERCASE for key words or phrases
- Use emojis sparingly (1-3 max) for visual interest
- Use line breaks and whitespace for readability
- Use bullet points with dashes (-) or arrows (→) for lists
- Keep it concise (150-250 words max)
- Focus on progress and learning, not perfection
- Be authentic about challenges faced
- Include 2-3 relevant tech hashtags at the end
- Don't use clichés like "excited to announce"
- End with a question to encourage engagement

Write the LinkedIn post now (remember: NO markdown, NO **asterisks** for bold):`;

  return await callGroqAPI(prompt, settings.groqApiKey);
};

// Generate post from custom content
export const generateCustomPost = async (data) => {
  const settings = getSettings();
  
  if (!settings.groqApiKey) {
    throw new Error('Groq API key not configured. Please add your API key in Settings.');
  }

  const { topic, keyPoints, tone = 'professional' } = data;

  const toneInstructions = {
    professional: 'Write in a professional, articulate tone.',
    casual: 'Write in a friendly, conversational tone.',
    storytelling: 'Write as a brief personal story.',
  };

  const prompt = `You are a LinkedIn content expert. Create a compelling LinkedIn post about the following topic.

Topic: ${topic}
Key Points: ${keyPoints}

Guidelines:
- ${toneInstructions[tone]}
- Keep it concise (150-250 words max)
- Focus on value and insights
- Be authentic and genuine
- Include 2-3 relevant hashtags
- Don't use clichés or excessive emojis
- End with engagement-driving question

Write the LinkedIn post now:`;

  return await callGroqAPI(prompt, settings.groqApiKey);
};

// Improve/refine existing post
export const improvePost = async (content, instructions) => {
  const settings = getSettings();
  
  if (!settings.groqApiKey) {
    throw new Error('Groq API key not configured. Please add your API key in Settings.');
  }

  const prompt = `You are a LinkedIn content expert. Improve the following LinkedIn post based on the instructions.

Current Post:
${content}

Improvement Instructions:
${instructions}

Guidelines:
- Maintain the core message
- Keep it concise
- Make it more engaging
- Ensure it sounds natural and authentic

Write the improved LinkedIn post now:`;

  return await callGroqAPI(prompt, settings.groqApiKey);
};

// Call Groq API
const callGroqAPI = async (prompt, apiKey) => {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'You are a professional LinkedIn content creator who writes authentic, engaging posts. CRITICAL: LinkedIn does NOT render markdown. Never use **asterisks** for bold or *asterisks* for italics. For emphasis, use UPPERCASE words, emojis, or line breaks. Focus on learning and growth. Never sound promotional or use clichés.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
};

// Validate API key
export const validateApiKey = async (apiKey) => {
  try {
    // Use a smaller, faster model for validation
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('API Validation Error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('API Validation Error:', error);
    return false;
  }
};
