/**
 * Validation utilities for code generation
 */

import { FILE_SIZE_LIMITS } from '../constants/generation.js';
import { CodeGenType } from '../constants/generation.js';

/**
 * Validates progress values to prevent negative numbers
 */
export function validateProgress(progress: number): number {
  return Math.max(0, Math.min(100, progress));
}

/**
 * Validates step progress values
 */
export function validateStepProgress(current: number, total: number): { current: number; total: number } {
  return {
    current: Math.max(0, current),
    total: Math.max(1, total)
  };
}

/**
 * Validates file content size
 */
export function validateFileSize(content: string, minSize: number = FILE_SIZE_LIMITS.MIN_HTML_SIZE): boolean {
  return content.length >= minSize;
}

/**
 * Validates HTML content structure
 */
export function validateHtmlStructure(content: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!content.includes('<!DOCTYPE html>') && !content.includes('<html')) {
    issues.push('Missing HTML document structure');
  }

  if (!content.includes('<style') && !content.includes('style=')) {
    issues.push('No CSS styles found');
  }

  return { isValid: issues.length === 0, issues };
}

/**
 * Validates project type specific requirements
 */
export function validateProjectType(type: CodeGenType, files: string[]): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  switch (type) {
    case CodeGenType.MULTI_FILE:
      const requiredFiles = ['index.html', 'style.css', 'script.js'];
      for (const requiredFile of requiredFiles) {
        if (!files.includes(requiredFile)) {
          issues.push(`Missing required file: ${requiredFile}`);
        }
      }
      break;

    case CodeGenType.HTML_SINGLE:
      if (!files.includes('index.html')) {
        issues.push('Missing index.html file');
      }
      break;
  }

  return { isValid: issues.length === 0, issues };
}
