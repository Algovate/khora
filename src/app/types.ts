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
