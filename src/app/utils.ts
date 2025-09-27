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

