export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type SessionMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type AppConfig = {
  apiKey?: string;
};

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

export interface CommandHandler {
  canHandle(command: string): boolean;
  handle(command: string, args: string, context: CommandContext): Promise<CommandResult>;
}
