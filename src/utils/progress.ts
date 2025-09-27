/**
 * Progress display utilities
 */

import { PROGRESS_CONFIG, PROGRESS_CHARS, STAGE_EMOJIS, UI_LIMITS, TIMING_CONFIG } from '../core/constants.js';
import type { CodeGenProgress } from '../types/generation.js';

/**
 * Safely creates a progress bar with clamped values
 */
export function createProgressBar(progress: number, length: number = PROGRESS_CONFIG.BAR_LENGTH): string {
  const clampedProgress = Math.max(PROGRESS_CONFIG.MIN_PROGRESS, Math.min(PROGRESS_CONFIG.MAX_PROGRESS, progress));
  const filled = Math.round(clampedProgress / (PROGRESS_CONFIG.MAX_PROGRESS / length));
  const empty = length - filled;

  return `[${PROGRESS_CHARS.FILLED.repeat(filled)}${PROGRESS_CHARS.EMPTY.repeat(empty)}] ${clampedProgress}%`;
}

/**
 * Creates a step indicator bar
 */
export function createStepIndicator(current: number, total: number, length: number = PROGRESS_CONFIG.STEP_BAR_LENGTH): string {
  const safeCurrent = Math.max(0, current);
  const safeTotal = Math.max(1, total);
  const filled = Math.max(0, Math.min(length, Math.round((safeCurrent / safeTotal) * length)));
  const empty = length - filled;

  const bar = PROGRESS_CHARS.FILLED.repeat(filled) + PROGRESS_CHARS.EMPTY.repeat(empty);
  return `[${bar}] ${safeCurrent}/${safeTotal}`;
}

/**
 * Gets emoji for a given stage
 */
export function getStageEmoji(stage: CodeGenProgress['stage']): string {
  return STAGE_EMOJIS[stage] || STAGE_EMOJIS.default;
}

/**
 * Builds detailed progress content with multiple lines
 */
export function buildDetailedProgressContent(
  progress: CodeGenProgress,
  progressBar: string
): string {
  const lines: string[] = [];
  const emoji = getStageEmoji(progress.stage);

  // Main progress line
  lines.push(`${emoji} ${progress.message} ${progressBar}`);

  if (progress.details) {
    const details = progress.details;

    // Step information
    if (details.currentStep && details.totalSteps && details.stepProgress !== undefined) {
      const stepIndicator = createStepIndicator(details.stepProgress + 1, details.totalSteps);
      lines.push(`   ${stepIndicator} ${details.currentStep}`);
    }

    // Code sections (limited to last one)
    if (details.codeSections && details.codeSections.length > 0) {
      const sections = details.codeSections.slice(-1);
      if (sections.length > 0) {
        lines.push(`   🔧 ${sections[0]}`);
      }
    }

    // Generated files (only at completion)
    if (details.generatedFiles && details.generatedFiles.length > 0 && progress.stage === 'completed') {
      const files = details.generatedFiles.slice(0, UI_LIMITS.MAX_FILES_DISPLAY);
      if (files.length > 0) {
        lines.push(`   📁 ${files.map(f => f.split('/').pop()).join(', ')}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Calculates estimated time remaining
 */
export function calculateEstimatedTime(
  elapsedSeconds: number,
  estimatedProgress: number
): string {
  if (estimatedProgress <= 0) return 'Calculating...';

  const estimatedTotal = (elapsedSeconds / estimatedProgress) * PROGRESS_CONFIG.MAX_PROGRESS;
  const remaining = Math.max(0, estimatedTotal - elapsedSeconds);

  return remaining > 0 ? `${Math.round(remaining)}s remaining` : 'Almost done...';
}

/**
 * Safely calculates step progress
 */
export function calculateStepProgress(
  estimatedProgress: number,
  stepsLength: number,
  baseProgress: number = TIMING_CONFIG.PROGRESS_STEP_BASE,
  stepRange: number = TIMING_CONFIG.PROGRESS_STEP_RANGE
): number {
  const stepProgress = Math.max(0, Math.min(
    Math.floor((estimatedProgress - baseProgress) / (stepRange / stepsLength)),
    stepsLength - 1
  ));
  return Math.max(0, Math.min(stepProgress, stepsLength - 1));
}
