/**
 * Constants for code generation functionality
 */

export enum CodeGenType {
  HTML_SINGLE = 'html-single',
  MULTI_FILE = 'multi-file',
  VUE_PROJECT = 'vue-project',
  AUTO_DETECT = 'auto-detect'
}

// Progress bar configuration
export const PROGRESS_CONFIG = {
  BAR_LENGTH: 10,
  STEP_BAR_LENGTH: 4,
  MIN_PROGRESS: 0,
  MAX_PROGRESS: 100,
  UPDATE_INTERVAL_MS: 500,
  CHUNK_UPDATE_FREQUENCY: 5
} as const;

// Code generation timing
export const TIMING_CONFIG = {
  INITIALIZATION_DELAY_MS: 300,
  PROGRESS_ESTIMATION_BASE: 30,
  PROGRESS_ESTIMATION_MULTIPLIER: 1.5,
  PROGRESS_ESTIMATION_MAX: 70,
  PROGRESS_STEP_BASE: 30,
  PROGRESS_STEP_RANGE: 40
} as const;

// Progress bar characters
export const PROGRESS_CHARS = {
  FILLED: '█',
  EMPTY: '░',
  SEPARATOR: '='
} as const;

// Emoji mappings for different stages
export const STAGE_EMOJIS = {
  initializing: '🔄',
  generating: '⚡',
  saving: '💾',
  completed: '✅',
  error: '❌',
  default: '🔄'
} as const;

// UI display limits
export const UI_LIMITS = {
  MAX_PROGRESS_DISPLAY_LINES: 4,
  MAX_CODE_SECTIONS_DISPLAY: 3,
  MAX_FILES_DISPLAY: 2,
  MAX_MESSAGE_LENGTH: 200,
  SEPARATOR_LENGTH: 50
} as const;

// File size limits
export const FILE_SIZE_LIMITS = {
  MIN_HTML_SIZE: 500,
  MIN_CSS_SIZE: 100,
  MIN_JS_SIZE: 50,
  MAX_TOKEN_ESTIMATION: 20000,
  MAX_FILE_COUNT: 30
} as const;

// Model configuration
export const MODEL_CONFIG = {
  DEFAULT_MODEL: 'gemini-2.5-flash',
  TOKEN_ESTIMATION_RATIO: 4, // characters per token
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000
} as const;

// Error messages
export const ERROR_MESSAGES = {
  MISSING_API_KEY: 'Missing API key. Set GOOGLE_API_KEY or run login.',
  NO_HTML_BLOCK: 'No HTML code block found in response',
  NO_CODE_BLOCKS: 'No code blocks found in response',
  GENERATION_FAILED: 'Code generation failed',
  INVALID_PROGRESS: 'Invalid progress value'
} as const;
