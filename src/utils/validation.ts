/**
 * Validation utilities for code generation
 */

import { FILE_SIZE_LIMITS, CodeGenType } from '../core/constants.js';

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

