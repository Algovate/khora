import fs from 'node:fs';
import path from 'node:path';
import { AppConfig, SessionMessage, MCPServerConfig } from '../types/types.js';
import { CONFIG_PATH, SESSIONS_DIR } from './constants.js';
import { createSafeFilename, ensureDirectory } from '../utils/utils.js';
import { OPENROUTER_CONFIG, getOpenRouterApiKey } from './openrouter.js';

// Cached config to avoid repeated file reads
let cachedConfig: AppConfig | null = null;

export function getConfigPath(): string {
  return CONFIG_PATH;
}

export function readConfig(): AppConfig {
  if (cachedConfig !== null) {
    return cachedConfig;
  }

  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    cachedConfig = JSON.parse(raw) as AppConfig;
    return cachedConfig;
  } catch {
    cachedConfig = {};
    return cachedConfig;
  }
}

export function writeConfig(config: AppConfig): void {
  ensureDirectory(path.dirname(CONFIG_PATH));
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
  cachedConfig = config; // Update cache
}

/**
 * Clear config cache - useful for testing or when file is modified externally
 */
export function clearConfigCache(): void {
  cachedConfig = null;
}

/**
 * Update config with partial updates
 */
function updateConfig(updates: Partial<AppConfig>): void {
  const cfg = readConfig();
  writeConfig({ ...cfg, ...updates });
}

export function getApiKey(): string | undefined {
  // First check environment variables
  const fromEnv = getOpenRouterApiKey();
  if (fromEnv) return fromEnv;

  // Then check config file
  const cfg = readConfig();
  return cfg.apiKey?.trim();
}

export function setApiKey(apiKey: string): void {
  updateConfig({ apiKey: apiKey.trim() });
}

export function getModel(): string {
  const cfg = readConfig();
  return cfg.model || OPENROUTER_CONFIG.defaultModel;
}

export function setModel(model: string): void {
  updateConfig({ model });
}


export function ensureSessionsDir(): string {
  return ensureDirectory(SESSIONS_DIR);
}

export function saveSessionToFile(messages: SessionMessage[], name?: string): string {
  const dir = ensureSessionsDir();
  const safeName = createSafeFilename(name || 'session');
  const filePath = path.join(dir, `${safeName}.json`);
  const payload = { messages };
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
  return filePath;
}

export function getMCPServers(): MCPServerConfig[] {
  const cfg = readConfig();
  return cfg.mcpServers || [];
}

export function setMCPServers(servers: MCPServerConfig[]): void {
  updateConfig({ mcpServers: servers });
}

export function addMCPServer(server: MCPServerConfig): void {
  const servers = getMCPServers();
  const existingIndex = servers.findIndex(s => s.name === server.name);

  if (existingIndex >= 0) {
    servers[existingIndex] = server;
  } else {
    servers.push(server);
  }

  setMCPServers(servers);
}

export function removeMCPServer(name: string): void {
  const servers = getMCPServers();
  setMCPServers(servers.filter(s => s.name !== name));
}

