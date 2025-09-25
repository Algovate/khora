import fs from 'node:fs';
import path from 'node:path';
import { AppConfig, SessionMessage, SavedHtmlPackage } from './types.js';
import { CONFIG_PATH, SESSIONS_DIR, PAGES_DIR, IMAGES_DIR } from './constants.js';
import { createSafeFilename, ensureDirectory, extractBetween } from './utils.js';

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

export function getImageApiKey(): string | undefined {
  // Prefer env vars commonly used for image generation
  const fromEnv = process.env.KHORA_IMAGE_API_KEY || process.env.DASHSCOPE_API_KEY;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv.trim();
  const cfg = readConfig();
  return cfg.imageApiKey?.trim();
}

export function setImageApiKey(apiKey: string): void {
  const cfg = readConfig();
  cfg.imageApiKey = apiKey.trim();
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

export function ensurePagesDir(): string {
  return ensureDirectory(PAGES_DIR);
}

export function saveHtmlToFile(html: string, name?: string): string {
  const dir = ensurePagesDir();
  const base = createSafeFilename(name || 'page', 'page');
  const filePath = path.join(dir, `${base}.html`);
  fs.writeFileSync(filePath, html, 'utf8');
  return filePath;
}

export function saveHtmlPackage(html: string, name?: string): SavedHtmlPackage {
  const dir = ensurePagesDir();
  const base = createSafeFilename(name || 'site', 'site');
  const pkgDir = path.join(dir, base);
  ensureDirectory(pkgDir);

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

export function ensureImagesDir(): string {
  return ensureDirectory(IMAGES_DIR);
}

export function saveImageToFile(imageBuffer: Buffer, name?: string): string {
  const dir = ensureImagesDir();
  const base = createSafeFilename(name || 'image', 'image');
  const filePath = path.join(dir, `${base}.png`);
  fs.writeFileSync(filePath, imageBuffer);
  return filePath;
}