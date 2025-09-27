import fs from 'node:fs';
import path from 'node:path';
import { AppConfig, SessionMessage, MCPServerConfig } from './types.js';
import { CONFIG_PATH, SESSIONS_DIR } from './constants.js';
import { createSafeFilename, ensureDirectory } from './utils.js';

export function getConfigPath(): string {
  return CONFIG_PATH;
}

export function readConfig(): AppConfig {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(raw) as AppConfig;
  } catch {
    return {};
  }
}

export function writeConfig(config: AppConfig): void {
  ensureDirectory(path.dirname(CONFIG_PATH));
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

export function getApiKey(): string | undefined {
  // Prefer env vars commonly used for Gemini
  const fromEnv = process.env.KHORA_API_KEY || process.env.GOOGLE_API_KEY;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv.trim();
  const cfg = readConfig();
  return cfg.apiKey?.trim();
}

export function setApiKey(apiKey: string): void {
  const cfg = readConfig();
  cfg.apiKey = apiKey.trim();
  writeConfig(cfg);
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
  const cfg = readConfig();
  cfg.mcpServers = servers;
  writeConfig(cfg);
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
  const filtered = servers.filter(s => s.name !== name);
  setMCPServers(filtered);
}

