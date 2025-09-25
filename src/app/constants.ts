import path from 'node:path';
import os from 'node:os';

// Directory paths
export const CONFIG_DIR = path.join(os.homedir(), '.khora');
export const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');
export const SESSIONS_DIR = path.join(CONFIG_DIR, 'sessions');
export const PAGES_DIR = path.join(CONFIG_DIR, 'pages');
export const IMAGES_DIR = path.join(CONFIG_DIR, 'images');

// API endpoints
export const DASHSCOPE_API_BASE = 'https://dashscope.aliyuncs.com/api/v1';
export const DASHSCOPE_IMAGE_SYNTHESIS_ENDPOINT = `${DASHSCOPE_API_BASE}/services/aigc/text2image/image-synthesis`;
export const DASHSCOPE_TASK_ENDPOINT = (taskId: string) => `${DASHSCOPE_API_BASE}/tasks/${taskId}`;

// Default values
export const DEFAULT_IMAGE_MODEL = 'wanx2.1-t2i-turbo';
export const DEFAULT_IMAGE_SIZE = '1024*1024' as const;
export const DEFAULT_IMAGE_COUNT = 1;

// Task polling configuration
export const MAX_POLL_ATTEMPTS = 30;
export const POLL_INTERVAL_MS = 2000;

// Available models
export const AVAILABLE_CHAT_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro'
] as const;

export type ChatModel = typeof AVAILABLE_CHAT_MODELS[number];
