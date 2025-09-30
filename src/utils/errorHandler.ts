/**
 * Centralized Error Handling
 */

export class KhoraError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'KhoraError';
  }
}

export class ConfigError extends KhoraError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'CONFIG_ERROR', context);
    this.name = 'ConfigError';
  }
}

export class APIKeyError extends KhoraError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'API_KEY_ERROR', context);
    this.name = 'APIKeyError';
  }
}

export class ModelError extends KhoraError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'MODEL_ERROR', context);
    this.name = 'ModelError';
  }
}

export class MCPError extends KhoraError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'MCP_ERROR', context);
    this.name = 'MCPError';
  }
}

/**
 * Format error for user display
 */
export function formatError(error: unknown): string {
  if (error instanceof KhoraError) {
    let message = `❌ ${error.message}`;
    if (error.context) {
      const contextStr = Object.entries(error.context)
        .map(([key, value]) => `  ${key}: ${value}`)
        .join('\n');
      message += `\n${contextStr}`;
    }
    return message;
  }
  
  if (error instanceof Error) {
    return `❌ ${error.message}`;
  }
  
  return `❌ ${String(error)}`;
}

/**
 * Safe error handler wrapper
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: unknown) => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      console.error('Error:', formatError(error));
    }
    return null;
  }
}
