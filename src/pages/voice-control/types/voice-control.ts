/**
 * TypeScript interfaces for Voice Control functionality
 */

/**
 * Voice Control Device interface
 */
export interface VoiceDevice {
  deviceid: string;
  name: string;
  device_name?: string; // Add this to match existing structure
  language: string;
}

/**
 * Device Action interface - matches existing data structure
 */
export interface DeviceAction {
  samples: string[]; // Keep as strings to match existing structure
}

/**
 * Device Actions Record interface
 */
export interface DeviceActions {
  [deviceId: string]: {
    [actionName: string]: DeviceAction;
  };
}

/**
 * Voice Control State interface
 */
export interface VoiceControlState {
  devices: Record<string, VoiceDevice>;
  deviceActions: DeviceActions;
  enabledActions: Record<string, Record<string, boolean>>;
  selectedDevice: string;
  isListening: boolean;
  isAutomationRunning: boolean;
}

/**
 * Automation Log Entry interface - simplified to match existing structure
 */
export interface AutomationLogEntry {
  timestamp: string | number;
  deviceId: string;
  action: string;
  word?: string;
  message: string;
}

/**
 * Voice Control Manager Props interface
 */
export interface VoiceControlManagerProps {
  hasApiKey: boolean;
  isToolSelected: boolean;
}