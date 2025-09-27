/**
 * Constants for UI and display functionality
 */

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

// Command prefixes and patterns
export const COMMAND_CONFIG = {
  PREFIX: '/',
  HELP_COMMANDS: ['help', 'h', '?'],
  QUIT_COMMANDS: ['q', 'quit', 'exit'],
  GEN_COMMANDS: ['gen-html', 'gen-web', 'gen-vue', 'gen-auto'],
  PROJECT_COMMANDS: ['list', 'ls', 'clean', 'rm']
} as const;
