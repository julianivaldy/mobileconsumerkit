interface ParsedBehavior {
  actions: {
    type: 'like' | 'comment' | 'share' | 'save' | 'scroll';
    frequency: number; // Execute every N videos
    condition?: string; // Optional condition
    value?: string; // For comments
  }[];
}

class BehaviorParserService {
  private openAIKey: string | null = null;

  constructor() {
    this.openAIKey = localStorage.getItem('openai_api_key');
  }

  setOpenAIKey(key: string) {
    this.openAIKey = key;
    localStorage.setItem('openai_api_key', key);
  }

  async parseBehaviorDescription(description: string): Promise<ParsedBehavior> {
    if (!this.openAIKey) {
      throw new Error('OpenAI API key not found. Please set it in the settings.');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'system',
            content: `You are a TikTok automation behavior parser. Parse user instructions into specific automation actions.

Return ONLY a JSON object with this exact format:
{
  "actions": [
    {"type": "like", "frequency": 3, "condition": "", "value": ""},
    {"type": "comment", "frequency": 5, "condition": "", "value": "Great content!"}
  ]
}

Rules:
- type: must be "like", "comment", "share", "save", or "scroll"
- frequency: execute every N videos (1 = every video, 3 = every 3rd video)
- condition: optional text condition for when to execute
- value: comment text if type is "comment"
- Always include scroll action with frequency 1
- Parse numbers like "every 3 videos" as frequency: 3

Examples:
"like every 3 videos" -> {"type": "like", "frequency": 3}
"comment occasionally" -> {"type": "comment", "frequency": 5, "value": "Amazing!"}
"like and share" -> [{"type": "like", "frequency": 1}, {"type": "share", "frequency": 1}]`
          }, {
            role: 'user',
            content: `Parse this behavior: "${description}"`
          }],
          temperature: 0.1,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      let parsedBehavior: ParsedBehavior;
      
      try {
        parsedBehavior = JSON.parse(content);
      } catch (e) {
        // Try to extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedBehavior = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse JSON from OpenAI response');
        }
      }

      // Validate the response
      if (!parsedBehavior.actions || !Array.isArray(parsedBehavior.actions)) {
        throw new Error('Invalid behavior format from OpenAI');
      }

      // Ensure scroll action is included
      const hasScroll = parsedBehavior.actions.some(action => action.type === 'scroll');
      if (!hasScroll) {
        parsedBehavior.actions.push({ type: 'scroll', frequency: 1 });
      }

      return parsedBehavior;

    } catch (error) {
      // Fallback to simple parsing
      return this.fallbackParseBehavior(description);
    }
  }

  private fallbackParseBehavior(description: string): ParsedBehavior {
    const actions: ParsedBehavior['actions'] = [];
    const lowerDesc = description.toLowerCase();
    
    // Look for "every X videos" pattern
    const everyMatch = lowerDesc.match(/every (\d+) videos?/);
    const frequency = everyMatch ? parseInt(everyMatch[1]) : 1;
    
    if (lowerDesc.includes('like')) {
      actions.push({ type: 'like', frequency });
    }
    
    if (lowerDesc.includes('comment')) {
      actions.push({ type: 'comment', frequency: frequency * 2, value: 'Great content!' });
    }
    
    if (lowerDesc.includes('share')) {
      actions.push({ type: 'share', frequency: frequency * 3 });
    }

    if (lowerDesc.includes('save')) {
      actions.push({ type: 'save', frequency: frequency * 2 });
    }
    
    // Always add scroll
    actions.push({ type: 'scroll', frequency: 1 });
    
    return { actions };
  }
}

export const behaviorParser = new BehaviorParserService();
export type { ParsedBehavior };