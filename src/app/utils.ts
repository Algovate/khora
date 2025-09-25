import fs from 'node:fs';

/**
 * Creates a safe filename by replacing invalid characters
 */
export function createSafeFilename(name: string, prefix?: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseName = prefix ? `${prefix}-${name}` : name;
  return `${baseName}-${timestamp}`.replace(/[^a-zA-Z0-9-_]/g, '_');
}

/**
 * Ensures a directory exists, creating it if necessary
 */
export function ensureDirectory(dir: string): string {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Extracts content between HTML tags
 */
export function extractBetween(html: string, tag: 'style' | 'script'): { content: string; without: string } {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = html.match(re);
  if (!m) return { content: '', without: html };
  const content = m[1] ?? '';
  const without = html.replace(re, '');
  return { content, without };
}

/**
 * Sleeps for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a random seed for image generation
 */
export function generateRandomSeed(): number {
  return Math.floor(Math.random() * 1000000);
}
