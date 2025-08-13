import { farmAPI } from './farmAPI';
import { ocrService } from './ocrService';
import { deviceCoordinateMappingService, DeviceCoordinates } from './deviceCoordinateMapping';

export interface AutomationConfig {
  skipPostsCount: number;
  skipPostsCountMin?: number;
  skipPostsCountMax?: number;
  scrollIntervalMin: number;
  scrollIntervalMax: number;
  triggers: AutomationTrigger[];
}

export interface AutomationTrigger {
  id: string;
  name: string;
  action: 'like' | 'comment' | 'save';
  commentText?: string;
  commentTexts?: string[];
  commentMode?: 'manual' | 'ai';
  conditions: TriggerCondition[];
  enabled: boolean;
}

export interface TriggerCondition {
  type: 'ocr_contains' | 'comments_contain' | 'bio_contains';
  value: string;
  caseSensitive?: boolean;
}

export interface AutomationSession {
  deviceId: string;
  isRunning: boolean;
  config: AutomationConfig;
  stats: {
    postsScrolled: number;
    postsAnalyzed: number;
    actionsPerformed: number;
    errors: number;
  };
  currentPostCount: number;
}

type LogCallback = (deviceId: string, log: string) => void;

class StandardizedAutomationEngine {
  private sessions: Map<string, AutomationSession> = new Map();
  private intervalIds: Map<string, NodeJS.Timeout> = new Map();
  private logListeners: Set<LogCallback> = new Set();
  private logBuffers: Map<string, string[]> = new Map();

  private emitLog(deviceId: string, message: string) {
    if (!this.logBuffers.has(deviceId)) {
      this.logBuffers.set(deviceId, []);
    }
    this.logBuffers.get(deviceId)!.push(message);
    if (this.logBuffers.get(deviceId)!.length > 200) {
      this.logBuffers.get(deviceId)!.shift();
    }
    this.logListeners.forEach((cb) => cb(deviceId, message));
  }
  
  getDeviceLogs(deviceId: string): string[] {
    return this.logBuffers.get(deviceId) ?? [];
  }

  onLog(cb: LogCallback) {
    this.logListeners.add(cb);
    return () => this.logListeners.delete(cb);
  }

  clearDeviceLogs(deviceId: string) {
    this.logBuffers.set(deviceId, []);
  }

  async startAutomation(deviceId: string, config: AutomationConfig): Promise<void> {
    if (this.sessions.has(deviceId)) {
      throw new Error('Automation already running for this device');
    }

    this.emitLog(deviceId, '🔍 Getting device info...');
    const deviceInfo = await this.getDeviceInfo(deviceId);
    if (!deviceInfo) throw new Error('Failed to get device information');
    
    this.emitLog(deviceId, `📱 Device info: ${deviceInfo.width}x${deviceInfo.height}`);
    
    const coordinates = deviceCoordinateMappingService.getCoordinatesForDevice(deviceId, deviceInfo);
    if (coordinates) {
      this.emitLog(deviceId, `📍 Device coordinates loaded:`);
      this.emitLog(deviceId, `  ❤️ Like: (${coordinates.like.x}, ${coordinates.like.y})`);
      this.emitLog(deviceId, `  💬 Comment: (${coordinates.comment.x}, ${coordinates.comment.y})`);
      this.emitLog(deviceId, `  🔖 Save: (${coordinates.save.x}, ${coordinates.save.y})`);
    }

    const session: AutomationSession = {
      deviceId,
      isRunning: true,
      config,
      stats: { postsScrolled: 0, postsAnalyzed: 0, actionsPerformed: 0, errors: 0 },
      currentPostCount: 0
    };

    this.sessions.set(deviceId, session);
    this.emitLog(deviceId, `🚀 Starting automation for device ${deviceId}`);
    this.clearDeviceLogs(deviceId);
    this.startAutomationLoop(session);
  }

  private async getDeviceInfo(deviceId: string): Promise<any> {
    try {
      const deviceListResponse = await farmAPI.getDeviceList();
      if (deviceListResponse.status === 0 && deviceListResponse.data[deviceId]) {
        const device = deviceListResponse.data[deviceId];
        return {
          width: device.width || 1080,
          height: device.height || 1920,
          deviceType: 'android'
        };
      }
      return {
        width: 1080,
        height: 1920,
        deviceType: 'android'
      };
    } catch (error) {
      this.emitLog(deviceId, `⚠️ Failed to get device info from API, using defaults: ${error}`);
      return {
        width: 1080,
        height: 1920,
        deviceType: 'android'
      };
    }
  }

  stopAutomation(deviceId: string): void {
    const intervalId = this.intervalIds.get(deviceId);
    if (intervalId) {
      clearTimeout(intervalId);
      this.intervalIds.delete(deviceId);
    }

    const session = this.sessions.get(deviceId);
    if (session) {
      session.isRunning = false;
      this.sessions.delete(deviceId);
      this.emitLog(deviceId, `⏹️ Stopped automation for device ${deviceId}`);
    }
  }

  getSession(deviceId: string): AutomationSession | undefined {
    return this.sessions.get(deviceId);
  }

  private startAutomationLoop(session: AutomationSession): void {
    const loop = async () => {
      if (!session.isRunning) return;

      try {
        session.currentPostCount++;
        session.stats.postsScrolled++;
        this.emitLog(session.deviceId, `📱 POST #${session.currentPostCount}`);

        let skipMin = typeof session.config.skipPostsCountMin === 'number'
          ? session.config.skipPostsCountMin
          : session.config.skipPostsCount;
        let skipMax = typeof session.config.skipPostsCountMax === 'number'
          ? session.config.skipPostsCountMax
          : session.config.skipPostsCount;

        if (!skipMin) skipMin = 1;
        if (!skipMax) skipMax = skipMin;

        if (!(session as any)._currentSkipPostsCount) {
          (session as any)._currentSkipPostsCount = this.getRandomInt(skipMin, skipMax);
          this.emitLog(session.deviceId, `🎯 Selected skipPostsCount interval for this analysis window: ${(session as any)._currentSkipPostsCount}`);
        }

        let skipPostsCountThisWindow = (session as any)._currentSkipPostsCount as number;

        if (session.currentPostCount % skipPostsCountThisWindow === 0) {
          this.emitLog(session.deviceId, `🔍 Analyzing post #${session.currentPostCount} (every ${skipPostsCountThisWindow} posts)`);
          (session as any)._currentSkipPostsCount = this.getRandomInt(skipMin, skipMax);
          this.emitLog(session.deviceId, `🔄 Next skipPostsCount interval will be ${(session as any)._currentSkipPostsCount}`);
          await this.analyzeCurrentPost(session);
        }

        await this.scrollToNextPost(session.deviceId);

        const minMs = session.config.scrollIntervalMin * 1000;
        const maxMs = session.config.scrollIntervalMax * 1000;
        const delay = minMs + Math.random() * (maxMs - minMs);

        const timeoutId = setTimeout(loop, delay);
        this.intervalIds.set(session.deviceId, timeoutId);

      } catch (error: any) {
        this.emitLog(session.deviceId, '💥 Automation error: ' + (error?.message || error));
        session.stats.errors++;
        const timeoutId = setTimeout(loop, 5000);
        this.intervalIds.set(session.deviceId, timeoutId);
      }
    };

    loop();
  }

  private async analyzeCurrentPost(session: AutomationSession): Promise<void> {
    try {
      this.emitLog(session.deviceId, '🔍 STARTING ANALYSIS...');
      await this.delay(2000);

      // Take screenshot
      this.emitLog(session.deviceId, '📸 Taking screenshot...');
      const screenshot = await farmAPI.getDeviceScreenshot(session.deviceId);
      if (screenshot.status !== 0 || !screenshot.data.img) throw new Error('Failed to capture screenshot');
      this.emitLog(session.deviceId, '✅ Screenshot captured');

      // Check if normal post
      const imageData = `data:image/jpeg;base64,${screenshot.data.img}`;
      const isNormalPost = await this.checkIfNormalPost(imageData, session.deviceId);

      if (!isNormalPost) {
        this.emitLog(session.deviceId, '⏭️ SKIPPING: Not a normal post (missing like/comment counts)');
        return;
      }
      this.emitLog(session.deviceId, '✅ Confirmed: Normal post detected - proceeding with trigger analysis');

      // Perform OCR trigger analysis
      const ocrResult = await ocrService.extractTextFromImage(imageData, session.config.triggers);
      session.stats.postsAnalyzed++;
      this.emitLog(session.deviceId, '📊 Trigger analysis completed');

      const matchedTriggers = [];

      if (ocrResult.triggerAnalysis) {
        for (const trigger of session.config.triggers) {
          if (!trigger.enabled) {
            this.emitLog(session.deviceId, `"${trigger.name}": ❌ DISABLED`);
            continue;
          }

          const analysis = ocrResult.triggerAnalysis[trigger.id];
          if (analysis) {
            if (analysis.matched) {
              this.emitLog(session.deviceId, `"${trigger.name}": ✅ MATCHED. Reason: ${analysis.justification}`);
              matchedTriggers.push(trigger);
            } else {
              this.emitLog(session.deviceId, `"${trigger.name}": ❌ NO MATCH. Reason: ${analysis.justification}`);
            }
          } else {
            this.emitLog(session.deviceId, `"${trigger.name}": ⚠️ NO ANALYSIS DATA`);
          }
        }
      } else {
        this.emitLog(session.deviceId, '⚠️ No trigger analysis received');
        session.stats.errors++;
      }

      if (matchedTriggers.length > 0) {
        this.emitLog(session.deviceId, `🎯 Executing ${matchedTriggers.length} actions...`);
        for (let i = 0; i < matchedTriggers.length; i++) {
          const trigger = matchedTriggers[i];
          this.emitLog(session.deviceId, `🚀 Executing action: ${trigger.action.toUpperCase()} for trigger "${trigger.name}"`);

          const actionSuccess = await this.executeTriggerAction(trigger, session);

          if (actionSuccess) {
            this.emitLog(session.deviceId, `✅ Action "${trigger.action}" completed successfully`);
          } else {
            this.emitLog(session.deviceId, `❌ Action "${trigger.action}" failed`);
          }
        }
        this.emitLog(session.deviceId, `🏁 All actions completed for this post`);
      } else {
        this.emitLog(session.deviceId, `⏭️ No triggers matched - continuing to next post`);
      }

      this.emitLog(
        session.deviceId,
        `📈 Stats: Analyzed=${session.stats.postsAnalyzed}, Actions=${session.stats.actionsPerformed}, Errors=${session.stats.errors}`
      );

    } catch (error: any) {
      this.emitLog(session.deviceId, "💥 Analysis failed: " + (error?.message || error));
      session.stats.errors++;
    }
  }

  private async checkIfNormalPost(imageData: string, deviceId?: string): Promise<boolean> {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) return true;

    try {
      this.emitLog(deviceId ?? 'global', '👁️ Checking if screenshot shows a normal post...');
      const promptText = `Look at this social media screenshot. Check if you can see BOTH of these elements:

1. Like icon/button with a number (heart symbol ❤️ with count like "1.2K", "234", etc.)
2. Comment icon/button with a number (comment symbol 💬 with count like "45", "1.1K", etc.)

If you can see BOTH like count AND comment count displayed: respond "YES"
If either one is missing or not visible: respond "NO"

Respond with ONLY "YES" or "NO".`;

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
        max_tokens: 5,
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
        this.emitLog(deviceId ?? 'global', "⚠️ OpenAI API call failed, assuming normal post");
        return true;
      }

      const data = await response.json();
      const result = data.choices[0]?.message?.content?.trim().toUpperCase();
      const isNormalPost = result === 'YES';
      this.emitLog(deviceId ?? 'global', `🤖 Vision analysis result: ${result}`);
      this.emitLog(deviceId ?? 'global', `📝 Decision: ${isNormalPost ? 'Normal post - Will analyze' : 'Not normal - Will skip'}`);
      return isNormalPost;

    } catch (error: any) {
      this.emitLog(deviceId ?? 'global', '⚠️ Error checking post type, defaulting to normal post');
      return true;
    }
  }

  private async executeTriggerAction(trigger: AutomationTrigger, session: AutomationSession): Promise<boolean> {
    try {
      this.emitLog(session.deviceId, `🎯 Starting ${trigger.action.toUpperCase()} action for trigger: "${trigger.name}"`);
      
      let actionSuccess = false;
      switch (trigger.action) {
        case 'like': {
          const likeDeviceInfo = await this.getDeviceInfo(session.deviceId);
          if (!likeDeviceInfo) {
            session.stats.errors++;
            this.emitLog(session.deviceId, `❌ No device info found. Cannot perform like action.`);
            return false;
          }

          const coordinates = deviceCoordinateMappingService.getCoordinatesForDevice(session.deviceId, likeDeviceInfo);
          if (!coordinates) {
            session.stats.errors++;
            this.emitLog(session.deviceId, `❌ No coordinates found for device. Cannot perform like action.`);
            return false;
          }

          actionSuccess = await this.performLikeAction(session.deviceId, coordinates);
          break;
        }
        case 'comment': {
          const commentDeviceInfo = await this.getDeviceInfo(session.deviceId);
          if (!commentDeviceInfo) {
            session.stats.errors++;
            this.emitLog(session.deviceId, `❌ No device info found. Cannot perform comment action.`);
            return false;
          }

          const coordinates = deviceCoordinateMappingService.getCoordinatesForDevice(session.deviceId, commentDeviceInfo);
          if (!coordinates) {
            session.stats.errors++;
            this.emitLog(session.deviceId, `❌ No coordinates found for device. Cannot perform comment action.`);
            return false;
          }

          let commentText: string | undefined = undefined;
          let commentMode = trigger.commentMode || 'manual';

          if (commentMode === 'ai') {
            this.emitLog(session.deviceId, 'AI Mode: Generating comment using OpenAI API...');
            try {
              const videoContext = 'TikTok video; generate relevant short authentic comment for this type of video (content and description available if possible)';
              const apiKey = localStorage.getItem('openai_api_key');
              if (!apiKey) {
                this.emitLog(session.deviceId, "No OpenAI API key set. Cannot use AI Mode.");
                commentText = "Cool!";
              } else {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                      {
                        role: 'system',
                        content: "Generate a short, authentic, under 100 character TikTok comment for this video's context and description. It should look like a real TikTok comment. Reply ONLY with the comment.",
                      },
                      {
                        role: 'user',
                        content: videoContext,
                      }
                    ],
                    temperature: 0.85,
                    max_tokens: 100
                  })
                });
                if (!response.ok) {
                  this.emitLog(session.deviceId, "OpenAI API error, fallback to generic comment.");
                  commentText = "Cool!";
                } else {
                  let suggestion = (await response.json()).choices[0]?.message?.content || "";
                  suggestion = suggestion.trim();
                  if (suggestion.startsWith('"') && suggestion.endsWith('"') && suggestion.length > 1) {
                    suggestion = suggestion.slice(1, -1).trim();
                  }
                  if (
                    !suggestion ||
                    suggestion.toLowerCase().includes('sorry') ||
                    suggestion.toLowerCase().includes('no context') ||
                    suggestion.toLowerCase().match(/need (more )?context/i) ||
                    suggestion.length === 0
                  ) {
                    suggestion = "Cool!";
                  }
                  commentText = suggestion;
                  this.emitLog(session.deviceId, `AI comment generated: "${commentText}"`);
                }
              }
            } catch (err) {
              this.emitLog(session.deviceId, "Error generating AI comment, fallback to generic comment.");
              commentText = "Cool!";
            }
          } else {
            let comments: string[] = [];
            if (Array.isArray(trigger.commentTexts) && trigger.commentTexts.length > 0) {
              comments = trigger.commentTexts.filter(Boolean);
            } else if (trigger.commentText) {
              comments = [trigger.commentText];
            }

            if (comments.length === 0) {
              commentText = "Cool!";
            } else {
              const last = (session as any)._lastManualComment;
              let filtered = comments;
              if (typeof last === 'string' && comments.length > 1) {
                filtered = comments.filter(t => t !== last);
              }
              commentText = filtered[Math.floor(Math.random() * filtered.length)];
              (session as any)._lastManualComment = commentText;
            }
          }

          actionSuccess = await this.performCommentAction(session.deviceId, coordinates, commentDeviceInfo, commentText || 'Cool!');
          break;
        }
        case 'save':
          const saveDeviceInfo = await this.getDeviceInfo(session.deviceId);
          if (!saveDeviceInfo) {
            session.stats.errors++;
            this.emitLog(session.deviceId, `❌ No device info found. Cannot perform save action.`);
            return false;
          }

          const saveCoordinates = deviceCoordinateMappingService.getCoordinatesForDevice(session.deviceId, saveDeviceInfo);
          if (!saveCoordinates) {
            session.stats.errors++;
            this.emitLog(session.deviceId, `❌ No coordinates found for device. Cannot perform save action.`);
            return false;
          }

          actionSuccess = await this.performSaveAction(session.deviceId, saveCoordinates);
          break;
        default:
          return false;
      }

      if (actionSuccess) {
        session.stats.actionsPerformed++;
        this.emitLog(session.deviceId, `✅ ${trigger.action.toUpperCase()} action completed successfully`);
      } else {
        this.emitLog(session.deviceId, `❌ ${trigger.action.toUpperCase()} action failed`);
      }
      return actionSuccess;
    } catch (error: any) {
      session.stats.errors++;
      this.emitLog(session.deviceId, `💥 Action "${trigger.action}" failed with error: ${error?.message || error}`);
      return false;
    }
  }

  private async performLikeAction(deviceId: string, coordinates: DeviceCoordinates): Promise<boolean> {
    try {
      const likeX = coordinates.like.x;
      const likeY = coordinates.like.y;
      
      this.emitLog(deviceId, `❤️ Performing LIKE action at coordinates: (${likeX}, ${likeY})`);
      
      // Add a small delay before clicking
      await this.delay(500);
      
      // Perform a single click at the like button coordinates
      const clickResult = await farmAPI.mouseClick(deviceId, likeX, likeY, 'left');
      
      if (clickResult.status !== 0) {
        this.emitLog(deviceId, `❌ LIKE action failed: ${clickResult.message}`);
        return false;
      }
      
      this.emitLog(deviceId, `✅ LIKE action completed successfully!`);
      await this.delay(500);
      return true;
      
    } catch (error) {
      this.emitLog(deviceId, `💥 LIKE action exception: ${error}`);
      return false;
    }
  }

  private async performCommentAction(deviceId: string, coordinates: DeviceCoordinates, deviceInfo: any, commentText: string): Promise<boolean> {
    try {
      // Step 1: Click the comment button (speech bubble) based on coordinates
      const commentPosition = coordinates.comment;
      this.emitLog(deviceId, `💬 Clicking comment button at: (${commentPosition.x}, ${commentPosition.y})`);
      
      const commentClickResult = await farmAPI.mouseClick(deviceId, commentPosition.x, commentPosition.y, 'left');
      this.emitLog(deviceId, `Comment button click result: status=${commentClickResult.status}`);
      
      if (commentClickResult.status !== 0) {
        this.emitLog(deviceId, "❌ Failed to click comment button");
        return false;
      }
      await this.delay(1500);

      // Step 2: Click the 'Add Comment' button (static coords X:134, Y:715)
      this.emitLog(deviceId, `📝 Clicking 'Add Comment' at: (134, 715)`);
      const addCommentClickResult = await farmAPI.mouseClick(deviceId, 134, 715, 'left');
      this.emitLog(deviceId, `Add comment click result: status=${addCommentClickResult.status}`);
      await this.delay(1000);

      // Step 3: Write the comment text with API
      this.emitLog(deviceId, `⌨️ Typing comment: "${commentText}"`);
      const typeResult = await farmAPI.sendKey(deviceId, commentText);
      this.emitLog(deviceId, `Type result: status=${typeResult.status}`);
      await this.delay(800);

      // Step 4: Try to submit the comment by pressing ENTER using key_down and key_up
      this.emitLog(deviceId, "📤 Submitting comment with ENTER key...");

      // Key down ENTER
      const enterDownResult = await farmAPI.keyDown(deviceId, "ENTER");
      this.emitLog(deviceId, `ENTER key_down result: status=${enterDownResult.status}`);
      await this.delay(150);

      // Key up ENTER
      const enterUpResult = await farmAPI.keyUp(deviceId, "ENTER");
      this.emitLog(deviceId, `ENTER key_up result: status=${enterUpResult.status}`);
      await this.delay(1000);

      // Step 5: Return to the 'For You' feed (click X:195, Y:110)
      this.emitLog(deviceId, `🔙 Returning to feed at: (195, 110)`);
      const returnToFeedClickResult = await farmAPI.mouseClick(deviceId, 195, 110, 'left');
      this.emitLog(deviceId, `Return to feed result: status=${returnToFeedClickResult.status}`);
      await this.delay(1000);

      return true;
    } catch (error) {
      this.emitLog(deviceId, "💥 Comment action exception: " + (error?.message || error));
      return false;
    }
  }

  private async performSaveAction(deviceId: string, coordinates: DeviceCoordinates): Promise<boolean> {
    try {
      const savePosition = coordinates.save;
      
      this.emitLog(deviceId, `🔖 Attempting to click SAVE at coordinates: (${savePosition.x}, ${savePosition.y})`);
      
      // Add a small delay before clicking
      await this.delay(500);
      
      const clickResult = await farmAPI.mouseClick(deviceId, savePosition.x, savePosition.y, 'left');
      
      this.emitLog(deviceId, `🖱️ Save click result: status=${clickResult.status}, message="${clickResult.message}"`);
      
      if (clickResult.status === 0) {
        this.emitLog(deviceId, `✅ SAVE click successful!`);
        await this.delay(500);
        return true;
      } else {
        this.emitLog(deviceId, `❌ SAVE click failed: ${clickResult.message}`);
        return false;
      }
      
    } catch (error) {
      this.emitLog(deviceId, `💥 SAVE action exception: ${error}`);
      return false;
    }
  }

  private async scrollToNextPost(deviceId: string): Promise<void> {
    try {
      this.emitLog(deviceId, '📜 Scrolling to next post...');
      
      await farmAPI.mouseSwipe(deviceId, {
        direction: 'up',
        length: 0.6,
        duration: 800
      });
      
      await this.delay(1000 + Math.random() * 1000);
      
    } catch (error) {
      this.emitLog(deviceId, `⚠️ Scroll error: ${error}`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getRandomInt(min: number, max: number) {
    min = Math.floor(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export const standardizedAutomationEngine = new StandardizedAutomationEngine();