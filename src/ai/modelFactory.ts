/**
 * AI Model Factory
 * Centralizes AI model creation and configuration
 */

import { ChatOpenAI } from '@langchain/openai';
import { getApiKey, getModel } from '../core/config.js';
import { OPENROUTER_CONFIG, OPENROUTER_ERRORS } from '../core/openrouter.js';

export interface ModelConfig {
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ChatOpenAIConfig {
  model: string;
  apiKey: string;
  temperature: number;
  maxRetries: number;
  configuration: {
    baseURL: string;
    defaultHeaders: {
      'HTTP-Referer': string;
      'X-Title': string;
    };
  };
  maxTokens?: number;
}

/**
 * Create an OpenRouter-based ChatOpenAI instance
 */
export function createOpenRouterModel(config: ModelConfig = {}): ChatOpenAI {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error(
      `${OPENROUTER_ERRORS.MISSING_KEY}\n${OPENROUTER_ERRORS.GET_KEY_URL}`
    );
  }

  const modelName = config.modelName || getModel();
  const temperature = config.temperature ?? OPENROUTER_CONFIG.temperature;

  const chatConfig: ChatOpenAIConfig = {
    model: modelName,
    apiKey: apiKey,
    temperature,
    maxRetries: 2,
    configuration: {
      baseURL: OPENROUTER_CONFIG.baseURL,
      defaultHeaders: {
        'HTTP-Referer': OPENROUTER_CONFIG.siteUrl,
        'X-Title': OPENROUTER_CONFIG.siteName,
      },
    },
  };

  if (config.maxTokens) {
    chatConfig.maxTokens = config.maxTokens;
  }

  return new ChatOpenAI(chatConfig as any);
}

/**
 * Legacy function for backward compatibility
 */
export function createModel(modelName?: string): ChatOpenAI {
  return createOpenRouterModel(modelName ? { modelName } : {});
}
