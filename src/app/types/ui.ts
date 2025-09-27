/**
 * Type definitions for UI and command handling
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface SessionMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AppConfig {
  apiKey?: string;
}

export interface CommandContext {
  messages: Message[];
  setMessages: (fn: (prev: Message[]) => Message[]) => void;
  setIsThinking: (thinking: boolean) => void;
  setInput: (input: string) => void;
  modelName: string;
}

export interface CommandResult {
  success: boolean;
  message?: string | undefined;
  shouldQuit?: boolean | undefined;
}

// Progress display types
export interface ProgressDisplayConfig {
  showSteps: boolean;
  showCodeSections: boolean;
  showFiles: boolean;
  maxLines: number;
}

export interface ProgressBarConfig {
  length: number;
  filledChar: string;
  emptyChar: string;
  showPercentage: boolean;
}

// Command parsing types
export interface ParsedCommand {
  command: string;
  args: string;
  isValid: boolean;
}

export interface CommandHandler {
  canHandle(command: string): boolean;
  handle(command: string, args: string, context: CommandContext): Promise<CommandResult>;
}
