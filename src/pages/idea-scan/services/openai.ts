import { IdeaScanData } from "@/pages/idea-scan/components/types";
import { toast } from "@/hooks/use-toast";
import { JudgeProfile, judgeProfiles } from "@/pages/idea-scan/components/judgeData";
import { STORAGE_KEYS } from '@/types/common';

// OpenAI API configuration
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Function to get AI-generated feedback from OpenAI
export const getAIFeedback = async (formData: IdeaScanData, retryCount = 0): Promise<string | null> => {
  
  const apiKey = localStorage.getItem(STORAGE_KEYS.OPENAI_API_KEY);
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  const maxRetries = 2;
  
  try {
    const judgeInfo = judgeProfiles[formData.judge] || judgeProfiles.all;
    
    const prompt = `You are ${judgeInfo.name}, providing feedback on this app idea: "${formData.idea}"

Your expertise focuses on: ${judgeInfo.focusAreas.join(", ")}

Core principles you follow:
${judgeInfo.corePrinciples?.map(principle => `- ${principle}`).join('\n') || '- Balanced assessment of app viability'}

Provide detailed, personalized feedback in your unique voice and perspective. Focus on:
- Product-market fit and user needs
- Viral potential and growth mechanics  
- User experience and engagement
- Monetization opportunities
- Overall viability and recommendations

Write in first person as if you're directly speaking to the entrepreneur. Be specific, actionable, and authentic to your known perspective and communication style. Do not use any markdown formatting like ** for bold text - use plain text only.

Keep the response under 400 words and make it feel like genuine, personalized advice from your perspective.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an expert app consultant providing personalized feedback. Do not use any markdown formatting in your response - use plain text only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429 && retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return getAIFeedback(formData, retryCount + 1);
      }
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let feedback = data.choices?.[0]?.message?.content || '';
    
    // Strip any remaining markdown formatting
    feedback = feedback
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1')    // Remove *italic*
      .replace(/__(.*?)__/g, '$1')    // Remove __underline__
      .replace(/_(.*?)_/g, '$1')      // Remove _italic_
      .replace(/`(.*?)`/g, '$1')      // Remove `code`
      .replace(/#{1,6}\s/g, '')       // Remove heading markers
      .trim();
    
    return feedback;
  } catch (error) {
    console.error('Error getting AI feedback:', error);
    if (retryCount < maxRetries) {
      return getAIFeedback(formData, retryCount + 1);
    }
    return null;
  }
};
