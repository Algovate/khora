/**
 * OpenRouter Configuration Module
 * Centralizes all OpenRouter-related configuration
 */

export const OPENROUTER_CONFIG = {
  baseURL: 'https://openrouter.ai/api/v1',
  defaultModel: 'x-ai/grok-4-fast:free',
  temperature: 0.7,
  siteName: 'Khora',
  siteUrl: 'https://github.com/your-org/khora',
} as const;

export const OPENROUTER_ENV_VARS = [
  'KHORA_API_KEY',
  'OPENROUTER_API_KEY',
] as const;

/**
 * Get OpenRouter API key from environment
 */
export function getOpenRouterApiKey(): string | undefined {
  for (const envVar of OPENROUTER_ENV_VARS) {
    const value = process.env[envVar];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

/**
 * Validate OpenRouter API key format
 */
export function isValidOpenRouterKey(key: string): boolean {
  return key.startsWith('sk-or-v1-') && key.length > 20;
}

/**
 * OpenRouter API key error messages
 */
export const OPENROUTER_ERRORS = {
  MISSING_KEY: 'Missing OpenRouter API key. Set KHORA_API_KEY or OPENROUTER_API_KEY environment variable.',
  INVALID_KEY: 'Invalid OpenRouter API key format. Key should start with "sk-or-v1-".',
  GET_KEY_URL: 'Get your API key at: https://openrouter.ai/',
} as const;
