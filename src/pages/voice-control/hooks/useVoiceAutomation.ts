
import { useRef, useState, useCallback } from "react";
import { VoiceDevice } from '../types/voice-control';

export type AutomationLogEntry = {
  timestamp: number;
  deviceId: string;
  action: string;
  word: string;
  message: string;
};

type VoiceSample = { word: string; audioUrl?: string; isConfirmed?: boolean };

export interface UseVoiceAutomationParams {
  devices: Record<string, VoiceDevice>;
  enabledActions: Record<string, Record<string, boolean>>;
  sampleAudio: Record<string, Record<string, VoiceSample[]>>;
  automationMode: "random" | "like" | "save";
  scrollDelayMin: number;
  scrollDelayMax: number;
  postIntervalMin: number;
  postIntervalMax: number;
  onLog: (entry: AutomationLogEntry) => void;
}

export const useVoiceAutomation = ({
  devices,
  enabledActions,
  sampleAudio,
  automationMode,
  scrollDelayMin,
  scrollDelayMax,
  postIntervalMin,
  postIntervalMax,
  onLog,
}: UseVoiceAutomationParams) => {
  const [isRunning, setIsRunning] = useState(false);
  const timers = useRef<NodeJS.Timeout[]>([]);
  const runningRef = useRef(false);
  const actionCounters = useRef<Record<string, { count: number; target: number }>>({});
  const interactionInProgress = useRef<Record<string, boolean>>({});

  // Helper: Get confirmed samples (audio, isConfirmed) for a device/action
  function getValidSamples(deviceId: string, action: string): VoiceSample[] {
    const samples = (sampleAudio?.[deviceId]?.[action] || []).filter(
      (s) => s.audioUrl && s.isConfirmed
    );
    return samples;
  }

  // Helper: Get a random element
  function randSample<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Helper: Get random number in range
  function getRandomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Helper: Trigger interaction action (like/save) - NOT scroll
  async function triggerInteractionAction(deviceId: string) {
    // Set interaction in progress flag
    interactionInProgress.current[deviceId] = true;
    
    const actions = enabledActions[deviceId] || {};
    const availableAudioActions = Object.keys(sampleAudio?.[deviceId] || {});
    
    // Find the correct action names from available samples
    const likeActions = availableAudioActions.filter(action => 
      action.toLowerCase().includes('like') && 
      actions[action] && 
      getValidSamples(deviceId, action).length > 0
    );
    
    const saveActions = availableAudioActions.filter(action => 
      action.toLowerCase().includes('save') && 
      actions[action] && 
      getValidSamples(deviceId, action).length > 0
    );
    
    let selectedAction: string | null = null;
    
    // Determine which action to perform based on automation mode
    if (automationMode === "random") {
      const allCandidates = [...likeActions, ...saveActions];
      
      if (allCandidates.length === 0) {
        interactionInProgress.current[deviceId] = false;
        return;
      }
      
      selectedAction = randSample(allCandidates);
      
    } else if (automationMode === "like") {
      if (likeActions.length === 0) {
        interactionInProgress.current[deviceId] = false;
        return;
      }
      selectedAction = likeActions[0]; // Take first available like action
      
    } else if (automationMode === "save") {
      if (saveActions.length === 0) {
        interactionInProgress.current[deviceId] = false;
        return;
      }
      selectedAction = saveActions[0]; // Take first available save action
    }
    
    if (!selectedAction) {
      interactionInProgress.current[deviceId] = false;
      return;
    }
    
    // Get samples for the selected action
    const samples = getValidSamples(deviceId, selectedAction);
    
    if (samples.length > 0) {
      const sample = randSample(samples);
      
      // Add 2 second delay before interaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const audio = new Audio(sample.audioUrl!);
      await audio.play().catch(() => {
        // Silently handle audio play errors
      });
      
      onLog({
        timestamp: Date.now(),
        deviceId,
        action: selectedAction,
        word: sample.word,
        message: `🎯 INTERACTION: Played ${selectedAction} audio: "${sample.word}"`,
      });
      
      // Add 2 second delay after interaction
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Clear interaction in progress flag
    interactionInProgress.current[deviceId] = false;
  }

  // Main automation start
  const start = useCallback(() => {
    setIsRunning(true);
    runningRef.current = true;
    timers.current = [];
    actionCounters.current = {};
    interactionInProgress.current = {};

    // Initialize action counters for each device
    Object.values(devices).forEach((dev: VoiceDevice) => {
      const deviceId = dev.deviceid;
      const target = getRandomInRange(postIntervalMin, postIntervalMax);
      actionCounters.current[deviceId] = {
        count: 0,
        target: target
      };
      interactionInProgress.current[deviceId] = false;
    });

    // For every enabled device, launch scroll timers
    Object.values(devices).forEach((dev: VoiceDevice) => {
      const deviceId = dev.deviceid;
      const actions = enabledActions[deviceId] || {};
      
      // ---- Scroll action (interval in seconds) ----
      if (actions.scroll) {
        
        const scrollFn = async () => {
          if (!runningRef.current) {
            return;
          }
          
          // Skip scroll if interaction is in progress
          if (interactionInProgress.current[deviceId]) {
            const nextDelay = getRandomInRange(scrollDelayMin, scrollDelayMax);
            const t = setTimeout(scrollFn, nextDelay * 1000);
            timers.current.push(t);
            return;
          }
          
          const samples = getValidSamples(deviceId, "scroll");
          if (samples.length) {
            const sample = randSample(samples);
            
            const audio = new Audio(sample.audioUrl!);
            audio.play().catch(() => {
              // Silently handle audio play errors
            });
            
            onLog({
              timestamp: Date.now(),
              deviceId,
              action: "scroll",
              word: sample.word,
              message: `📜 SCROLL: Played scroll audio: "${sample.word}"`,
            });

            // Increment action counter and check if we should trigger interaction
            const counter = actionCounters.current[deviceId];
            if (counter) {
              counter.count++;
              
              if (counter.count >= counter.target) {
                // Trigger interaction action and reset counter (async to handle delays)
                triggerInteractionAction(deviceId).then(() => {
                  counter.count = 0;
                  counter.target = getRandomInRange(postIntervalMin, postIntervalMax);
                });
              }
            }
          }
          
          // Schedule next scroll
          const nextDelay = getRandomInRange(scrollDelayMin, scrollDelayMax);
          const t = setTimeout(scrollFn, nextDelay * 1000);
          timers.current.push(t);
        };
        
        // Initial run
        const initialDelay = getRandomInRange(scrollDelayMin, scrollDelayMax);
        const t = setTimeout(scrollFn, initialDelay * 1000);
        timers.current.push(t);
      }
    });
  }, [
    devices,
    enabledActions,
    sampleAudio,
    automationMode,
    scrollDelayMin,
    scrollDelayMax,
    postIntervalMin,
    postIntervalMax,
    onLog,
  ]);

  const stop = useCallback(() => {
    setIsRunning(false);
    runningRef.current = false;
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
    actionCounters.current = {};
    interactionInProgress.current = {};
    onLog({
      timestamp: Date.now(),
      deviceId: "-",
      action: "-",
      word: "-",
      message: "Automation stopped",
    });
  }, [onLog]);

  return { isRunning, start, stop };
};
