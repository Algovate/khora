/**
 * Code detection and analysis utilities
 */

import type { CodeSectionPattern } from '../types/generation.js';

// Code section detection patterns
export const CODE_SECTION_PATTERNS: CodeSectionPattern[] = [
  { pattern: /<html[^>]*>/i, name: 'HTML Structure' },
  { pattern: /<head[^>]*>/i, name: 'HTML Head' },
  { pattern: /<style[^>]*>/i, name: 'CSS Styles' },
  { pattern: /<script[^>]*>/i, name: 'JavaScript Code' },
  { pattern: /<body[^>]*>/i, name: 'HTML Body' },
  { pattern: /<div[^>]*class/i, name: 'Layout Elements' },
  { pattern: /function\s+\w+/i, name: 'Functions' },
  { pattern: /const\s+\w+\s*=/i, name: 'Variables' },
  { pattern: /<template[^>]*>/i, name: 'Vue Template' },
  { pattern: /export\s+default/i, name: 'Vue Component' },
  { pattern: /package\.json/i, name: 'Package Config' },
  { pattern: /\.css/i, name: 'CSS File' },
  { pattern: /\.js/i, name: 'JavaScript File' }
];

/**
 * Detects code sections being generated from content
 */
export function detectCodeSections(content: string, detectedSections: string[]): void {
  for (const { pattern, name } of CODE_SECTION_PATTERNS) {
    if (pattern.test(content) && !detectedSections.includes(name)) {
      detectedSections.push(name);
    }
  }
}

/**
 * Extracts text content from various content types
 */
export function extractTextFromContent(content: unknown): string {
  if (typeof content === 'string') return content;

  if (Array.isArray(content)) {
    try {
      return content.map((c: any) => (typeof c === 'string' ? c : c?.text ?? '')).join('');
    } catch {
      return String(content);
    }
  }

  return content == null ? '' : String(content);
}

/**
 * Estimates token count from text content
 */
export function estimateTokenCount(content: string): number {
  // Rough estimation: 4 characters per token
  return Math.round(content.length / 4);
}

/**
 * Validates HTML content structure
 */
export function validateHtmlContent(content: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for basic HTML structure
  if (!content.includes('<!DOCTYPE html>') && !content.includes('<html')) {
    issues.push('Missing HTML document structure');
  }

  // Check for inline styles (for single file)
  if (!content.includes('<style') && !content.includes('style=')) {
    issues.push('No CSS styles found');
  }

  // Check for forbidden elements (security)
  const forbiddenPatterns = [
    /<script src="http:\/\//i,
    /eval\(/i,
    /document\.write\(/i,
    /innerHTML\s*=/i
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) {
      issues.push(`Security concern: ${pattern.source}`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}
