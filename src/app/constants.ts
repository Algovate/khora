import path from 'node:path';
import os from 'node:os';

// Directory paths
export const CONFIG_DIR = path.join(os.homedir(), '.khora');
export const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');
export const SESSIONS_DIR = path.join(CONFIG_DIR, 'sessions');
export const GENERATED_DIR = path.join(process.cwd(), 'generated');

// Available models
export const AVAILABLE_CHAT_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro'
] as const;

export type ChatModel = typeof AVAILABLE_CHAT_MODELS[number];
