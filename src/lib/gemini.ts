import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

export interface ModerationResult {
  flagged: boolean;
  reason?: string;
  confidence?: number;
}

export const contentModeration = {
  async moderateContent(content: string): Promise<ModerationResult> {
    try {
      if (!config.gemini.apiKey || config.gemini.apiKey === 'your-gemini-api-key') {
        // If no API key, return as not flagged
        return { flagged: false };
      }

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `
        Analyze this content for inappropriate material including:
        - Hate speech, harassment, or bullying
        - Explicit sexual content
        - Violence or threats
        - Spam or misleading information
        - Academic dishonesty
        - Personal attacks or discrimination
        
        Content: "${content}"
        
        Respond with JSON only in this exact format:
        {
          "flagged": boolean,
          "reason": "explanation if flagged",
          "confidence": number between 0-1
        }
        
        Be strict but fair. Only flag content that is clearly inappropriate.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up the response to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const moderation = JSON.parse(jsonMatch[0]);
        return {
          flagged: moderation.flagged || false,
          reason: moderation.reason,
          confidence: moderation.confidence || 0.5
        };
      }

      // If JSON parsing fails, return as not flagged
      return { flagged: false };
    } catch (error) {
      console.error('Content moderation error:', error);
      // If moderation fails, return as not flagged to avoid blocking content
      return { flagged: false };
    }
  },

  async moderatePost(content: string, postId: string) {
    const result = await this.moderateContent(content);
    
    // Log moderation result
    if (result.flagged) {
      console.log(`Post ${postId} flagged: ${result.reason}`);
    }

    return result;
  }
};

