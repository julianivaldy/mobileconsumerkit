/**
 * Common TypeScript interfaces and types used across the application
 */

// Device-related interfaces
export interface Device {
  deviceid: string;
  gid: string;
  name?: string;
  device_name?: string;
  ip?: string;
  state?: number;
  width?: string;
  height?: string;
  status?: string;
  [key: string]: unknown;
}

export interface DeviceGroup {
  gid: string;
  name: string;
  deviceCount?: number;
  [key: string]: unknown;
}

// API Response interfaces
export interface ApiResponse<T = unknown> {
  success: boolean;
  status: number;
  message?: string;
  data?: T;
}

// Error interfaces
export interface AppError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Keyword interfaces (used in ASO features)
export interface Keyword {
  name?: string;
  id?: string;
  [key: string]: unknown;
}

export type KeywordType = string | Keyword;

// Analysis data interfaces
export interface AnalysisScore {
  titleScore: number;
  descriptionScore: number;
  keywordDensity: number;
  recommendations: string[];
}

export interface AppAnalysisData {
  appUrl: string;
  title: string;
  description: string;
  keywords: KeywordType[];
  category: string;
  rating: number;
  downloads: string;
  developer: string;
  version: string;
  lastUpdated: string;
  analysis: AnalysisScore;
}

// Tool configuration
export interface ToolConfig {
  id: string;
  name: string;
  apiKey: 'rapidapi' | 'openai' | 'apify';
  description?: string;
  enabled?: boolean;
}

// Storage keys (for type safety)
export const STORAGE_KEYS = {
  RAPIDAPI_KEY: 'rapidapi_key',
  OPENAI_API_KEY: 'openai_api_key',
  APIFY_API_TOKEN: 'apify_api_token',
  SELECTED_TOOLS: 'selected_tools',
  VERIFIED_API_KEYS: 'verified_api_keys',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];