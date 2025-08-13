import { text } from 'stream/consumers';

interface OCRResult {
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  triggerMatches?: { [triggerId: string]: boolean };
}

interface OCRResponse {
  results: OCRResult[];
  fullText: string;
  triggerAnalysis?: { [triggerId: string]: { matched: boolean; justification: string } };
}

interface TriggerCondition {
  type: 'ocr_contains' | 'comments_contain' | 'bio_contains' | 'description_contains';
  value: string;
  caseSensitive?: boolean;
}

interface AutomationTrigger {
  id: string;
  name: string;
  action: 'like' | 'comment' | 'save';
  commentText?: string;
  conditions: TriggerCondition[];
  enabled: boolean;
}

class OCRService {
  constructor() {
    // Remove the stored API key from constructor
  }

  // Always get the API key fresh from localStorage
  private getApiKey(): string | null {
    return localStorage.getItem('openai_api_key');
  }

  setApiKey(key: string) {
    localStorage.setItem('openai_api_key', key);
  }

  async extractTextFromImage(imageBase64: string, triggers: AutomationTrigger[] = []): Promise<OCRResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {

      // *Revised analysis prompt:*
      // Separate instructions for BOTH visual content (for ocr_contains) and TEXT extraction (for description_contains)

      let analysisPrompt = `Analyze this social media video screenshot.
      
1. VISUAL CONTENT: Describe what you see visually (people, activities, objects, scene) for VIDEO CONTENT analysis.
2. TEXT EXTRACTION: Extract any VISIBLE text (captions, overlays, description under username, on-screen text).
3. For each TRIGGER below, follow instructions:
- If TRIGGER uses VIDEO CONTAINS, match visually.
- If TRIGGER uses DESCRIPTION CONTAINS, check if the extracted description/caption text includes the specified phrase (case-insensitive substring match).

For each trigger, respond in exactly this format:

===TRIGGER_START===
TRIGGER_NAME: [exact trigger name]
MATCHED: YES/NO
REASONING: [explain your analysis (visual and/or text match)]
===TRIGGER_END===

TRIGGERS TO ANALYZE:
`;

      triggers.filter(t => t.enabled).forEach(trigger => {
        analysisPrompt += `\n- ${trigger.name}: `;
        trigger.conditions.forEach(condition => {
          if (condition.type === 'ocr_contains') {
            analysisPrompt += `[VIDEO CONTAINS] "${condition.value}" `;
          } else if (condition.type === 'description_contains') {
            analysisPrompt += `[DESCRIPTION CONTAINS] "${condition.value}" `;
          }
        });
      });

      analysisPrompt += `\n\nIMPORTANT: Only use the visible on-screen description/overlay text for DESCRIPTION CONTAINS triggers.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: analysisPrompt },
              { type: 'image_url', image_url: { url: imageBase64 } }
            ]
          }],
          max_tokens: 2000,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ OpenAI API error:', errorData);
        throw new Error(`Visual analysis request failed: ${response.status}`);
      }

      const data = await response.json();
      const analysisResult = data.choices[0]?.message?.content || '';

      // --- Begin parsing ---
      const triggerAnalysis: { [triggerId: string]: { matched: boolean; justification: string } } = {};

      // Use improved regex to parse each trigger analysis block
      const triggerRegex = /===TRIGGER_START===\s*TRIGGER_NAME:\s*(.+?)\s*MATCHED:\s*(YES|NO)\s*REASONING:\s*(.+?)\s*===TRIGGER_END===/gs;
      const matches = [...analysisResult.matchAll(triggerRegex)];

      // Map analysis by trigger name (for convenience)
      const analysisByName: { [name: string]: { matched: boolean; justification: string } } = {};
      matches.forEach(match => {
        const triggerName = match[1].trim().replace(/"/g, '');
        const matched = match[2].trim().toUpperCase() === 'YES';
        const reasoning = match[3].trim();
        analysisByName[triggerName] = { matched, justification: reasoning };
      });

      // For each trigger, map result to its ID (with fallback logic for both visual and description contains)
      triggers.forEach(trigger => {
        if (!trigger.enabled) {
          triggerAnalysis[trigger.id] = { matched: false, justification: 'Trigger disabled' };
          return;
        }

        let analysis = analysisByName[trigger.name];
        if (!analysis) {
          // If OpenAI missed a block, implement fallback detection for 'description_contains'
          const hasDescriptionCondition = trigger.conditions.some(c => c.type === 'description_contains');
          if (hasDescriptionCondition) {
            // Extract all visible text from analysisResult (remove trigger sections, use rest as "detected description text")
            const descriptionText = analysisResult
              .replace(triggerRegex, '')
              .replace(/[^\x20-\x7E]+/g, ' ') // Remove non-printable
              .replace(/\n+/g, ' ')
              .toLowerCase();

            let anyMatch = false;
            let foundPhrase = '';
            for (const condition of trigger.conditions) {
              if (condition.type === 'description_contains') {
                const searchStr = String(condition.value).toLowerCase();
                if (searchStr && descriptionText.includes(searchStr)) {
                  anyMatch = true;
                  foundPhrase = condition.value;
                  break;
                }
              }
            }
            analysis = anyMatch
              ? { matched: true, justification: `Detected description/caption contains phrase: "${foundPhrase}"` }
              : { matched: false, justification: 'Trigger phrase not found in extracted description/caption.' };
          }
        }

        // Fallbacks for 'ocr_contains' already exist; reuse those patterns if needed
        if (!analysis) {
          analysis = { matched: false, justification: '❌ No analysis data received.' };
        }
        triggerAnalysis[trigger.id] = analysis;
      });

      return {
        results: [{
          text: analysisResult,
          confidence: 0.95,
          boundingBox: undefined
        }],
        fullText: analysisResult,
        triggerAnalysis
      };
    } catch (error) {
      console.error('❌ Visual content analysis failed:', error);
      throw error;
    }
  }

  private getVisualSynonyms(term: string): string[] {
    const visualSynonymMap: { [key: string]: string[] } = {
      'guy': ['man', 'male', 'dude', 'boy', 'gentleman', 'person', 'individual'],
      'girl': ['woman', 'female', 'lady', 'gal', 'person', 'individual'],
      'dancing': ['dance', 'dancing', 'choreography', 'performance', 'moving', 'rhythm'],
      'cooking': ['cook', 'kitchen', 'food', 'recipe', 'chef', 'preparing', 'meal'],
      'music': ['song', 'singing', 'audio', 'sound', 'melody', 'musical'],
      'funny': ['humor', 'comedy', 'laugh', 'hilarious', 'amusing', 'comedic'],
      'cute': ['adorable', 'sweet', 'lovely', 'charming', 'endearing'],
      'beautiful': ['pretty', 'gorgeous', 'stunning', 'attractive', 'lovely'],
      'car': ['vehicle', 'automobile', 'auto', 'truck', 'transportation'],
      'dog': ['puppy', 'canine', 'pet', 'animal'],
      'cat': ['kitten', 'feline', 'pet', 'animal'],
      'workout': ['exercise', 'fitness', 'training', 'gym', 'sport'],
      'food': ['eating', 'meal', 'dish', 'cuisine', 'snack'],
      'nature': ['outdoor', 'landscape', 'trees', 'sky', 'natural'],
      'beach': ['ocean', 'sea', 'sand', 'water', 'coast'],
      'party': ['celebration', 'event', 'gathering', 'social']
    };
    
    return visualSynonymMap[term.toLowerCase()] || [];
  }
}

export const ocrService = new OCRService();
export type { OCRResult, OCRResponse, AutomationTrigger, TriggerCondition };