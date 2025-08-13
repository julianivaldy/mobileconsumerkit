
/**
 * Global type declarations for the application
 */

// Google Tag Manager window extension
declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export {};
