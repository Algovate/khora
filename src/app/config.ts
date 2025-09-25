import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export type AppConfig = {
  apiKey?: string;
};

const CONFIG_DIR = path.join(os.homedir(), '.khora');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');
const SESSIONS_DIR = path.join(CONFIG_DIR, 'sessions');
const PAGES_DIR = path.join(CONFIG_DIR, 'pages');

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
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
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

export type SessionMessage = { id: string; role: 'user' | 'assistant' | 'system'; content: string };

export function ensureSessionsDir(): string {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  return SESSIONS_DIR;
}

export function saveSessionToFile(messages: SessionMessage[], name?: string): string {
  const dir = ensureSessionsDir();
  const safeName = (name || new Date().toISOString().replace(/[:.]/g, '-')).replace(/[^a-zA-Z0-9-_]/g, '_');
  const filePath = path.join(dir, `${safeName}.json`);
  const payload = { messages };
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
  return filePath;
}

export function ensurePagesDir(): string {
  fs.mkdirSync(PAGES_DIR, { recursive: true });
  return PAGES_DIR;
}

export function saveHtmlToFile(html: string, name?: string): string {
  const dir = ensurePagesDir();
  const base = (name || `page-${new Date().toISOString().replace(/[:.]/g, '-')}`).replace(/[^a-zA-Z0-9-_]/g, '_');
  const filePath = path.join(dir, `${base}.html`);
  fs.writeFileSync(filePath, html, 'utf8');
  return filePath;
}

export type SavedHtmlPackage = {
  directory: string;
  indexPath: string;
  cssPath: string | undefined;
  jsPath: string | undefined;
};

function extractBetween(html: string, tag: 'style' | 'script'): { content: string; without: string } {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = html.match(re);
  if (!m) return { content: '', without: html };
  const content = m[1] ?? '';
  const without = html.replace(re, '');
  return { content, without };
}

export function saveHtmlPackage(html: string, name?: string): SavedHtmlPackage {
  const dir = ensurePagesDir();
  const base = (name || `site-${new Date().toISOString().replace(/[:.]/g, '-')}`).replace(/[^a-zA-Z0-9-_]/g, '_');
  const pkgDir = path.join(dir, base);
  fs.mkdirSync(pkgDir, { recursive: true });

  // Extract first <style> and <script>
  const cssRes = extractBetween(html, 'style');
  const jsRes = extractBetween(cssRes.without, 'script');

  let indexHtml = jsRes.without;
  let cssPath: string | undefined;
  let jsPath: string | undefined;

  if (cssRes.content.trim()) {
    cssPath = path.join(pkgDir, 'styles.css');
    fs.writeFileSync(cssPath, cssRes.content.trim() + '\n', 'utf8');
    indexHtml = indexHtml.replace('</head>', '  <link rel="stylesheet" href="./styles.css" />\n</head>');
  }

  if (jsRes.content.trim()) {
    jsPath = path.join(pkgDir, 'script.js');
    fs.writeFileSync(jsPath, jsRes.content.trim() + '\n', 'utf8');
    indexHtml = indexHtml.replace('</body>', '  <script src="./script.js"></script>\n</body>');
  }

  const indexPath = path.join(pkgDir, 'index.html');
  fs.writeFileSync(indexPath, indexHtml, 'utf8');

  return { directory: pkgDir, indexPath, cssPath, jsPath };
}