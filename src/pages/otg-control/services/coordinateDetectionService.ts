import { farmAPI } from './farmAPI';

export interface TikTokCoordinates {
  deviceId: string;
  screenWidth: number;
  screenHeight: number;
  coordinates: {
    like: { x: number; y: number } | null;
    comment: { x: number; y: number } | null;
    share: { x: number; y: number } | null;
    save: { x: number; y: number } | null;
  };
  lastUpdated: Date;
}

class CoordinateDetectionService {
  private coordinatesCache: Map<string, TikTokCoordinates> = new Map();

  async detectTikTokCoordinates(deviceId: string): Promise<TikTokCoordinates | null> {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      console.error('❌ No OpenAI API key found');
      return null;
    }

    try {
      // Take screenshot
      const screenshot = await farmAPI.getDeviceScreenshot(deviceId);
      if (screenshot.status !== 0 || !screenshot.data.img) {
        console.error('❌ Failed to capture screenshot for coordinate detection');
        return null;
      }

      const imageData = `data:image/jpeg;base64,${screenshot.data.img}`;
      
      const promptText = `Analyze this TikTok screenshot and identify the exact pixel coordinates of the following buttons on the right side of the screen:

1. LIKE button (heart icon ❤️) - usually at the top right
2. COMMENT button (speech bubble icon 💬) - usually below the like button
3. SHARE button (arrow icon ➡️) - usually below the comment button  
4. SAVE/BOOKMARK button (bookmark icon 🔖) - usually below the share button

For each button you can identify, provide the center coordinates in this EXACT format:
LIKE: x,y
COMMENT: x,y
SHARE: x,y
SAVE: x,y

If you cannot clearly identify a button, write "NOT_FOUND" for that button.

Example response:
LIKE: 360,420
COMMENT: 360,480
SHARE: 360,540
SAVE: NOT_FOUND

Only respond with the coordinates in the exact format above, nothing else.`;

      const requestBody = {
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: promptText
            },
            {
              type: 'image_url',
              image_url: {
                url: imageData
              }
            }
          ]
        }],
        max_tokens: 100,
        temperature: 0
      };

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI API Error:', errorText);
        return null;
      }

      const data = await response.json();
      const result = data.choices[0]?.message?.content?.trim();
      
      // Parse the coordinates from the response
      const coordinates = this.parseCoordinateResponse(result);
      
      // Get device screen dimensions (assuming we have this info)
      const deviceInfo = { width: 400, height: 800 }; // Default, should get from device
      
      const tikTokCoords: TikTokCoordinates = {
        deviceId,
        screenWidth: deviceInfo.width,
        screenHeight: deviceInfo.height,
        coordinates,
        lastUpdated: new Date()
      };
      
      // Cache the coordinates
      this.coordinatesCache.set(deviceId, tikTokCoords);
      
      return tikTokCoords;
      
    } catch (error) {
      console.error('❌ Error detecting coordinates:', error);
      return null;
    }
  }

  private parseCoordinateResponse(response: string): TikTokCoordinates['coordinates'] {
    const coordinates = {
      like: null as { x: number; y: number } | null,
      comment: null as { x: number; y: number } | null,
      share: null as { x: number; y: number } | null,
      save: null as { x: number; y: number } | null,
    };

    if (!response) return coordinates;

    const lines = response.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('LIKE:')) {
        const coords = this.extractCoordinates(trimmedLine.replace('LIKE:', '').trim());
        if (coords) coordinates.like = coords;
      } else if (trimmedLine.startsWith('COMMENT:')) {
        const coords = this.extractCoordinates(trimmedLine.replace('COMMENT:', '').trim());
        if (coords) coordinates.comment = coords;
      } else if (trimmedLine.startsWith('SHARE:')) {
        const coords = this.extractCoordinates(trimmedLine.replace('SHARE:', '').trim());
        if (coords) coordinates.share = coords;
      } else if (trimmedLine.startsWith('SAVE:')) {
        const coords = this.extractCoordinates(trimmedLine.replace('SAVE:', '').trim());
        if (coords) coordinates.save = coords;
      }
    }

    return coordinates;
  }

  private extractCoordinates(coordString: string): { x: number; y: number } | null {
    if (coordString === 'NOT_FOUND' || !coordString) return null;
    
    const parts = coordString.split(',');
    if (parts.length !== 2) return null;
    
    const x = parseInt(parts[0].trim());
    const y = parseInt(parts[1].trim());
    
    if (isNaN(x) || isNaN(y)) return null;
    
    return { x, y };
  }

  getCoordinates(deviceId: string): TikTokCoordinates | null {
    return this.coordinatesCache.get(deviceId) || null;
  }

  clearCoordinates(deviceId: string): void {
    this.coordinatesCache.delete(deviceId);
  }

  isCoordinatesCacheValid(deviceId: string, maxAgeMinutes: number = 30): boolean {
    const coords = this.coordinatesCache.get(deviceId);
    if (!coords) return false;
    
    const ageMinutes = (Date.now() - coords.lastUpdated.getTime()) / (1000 * 60);
    return ageMinutes < maxAgeMinutes;
  }
}

export const coordinateDetectionService = new CoordinateDetectionService();