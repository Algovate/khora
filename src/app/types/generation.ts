/**
 * Type definitions for code generation functionality
 */

export enum CodeGenType {
  HTML_SINGLE = 'html-single',
  MULTI_FILE = 'multi-file',
  VUE_PROJECT = 'vue-project',
  AUTO_DETECT = 'auto-detect'
}

// Core generation types
export interface CodeGenResult {
  type: CodeGenType;
  outputPath: string;
  files: string[];
  success: boolean;
  error?: string;
}

export interface CodeGenProgress {
  stage: 'initializing' | 'generating' | 'saving' | 'completed' | 'error';
  message: string;
  progress?: number; // 0-100
  details?: CodeGenProgressDetails;
}

export interface CodeGenProgressDetails {
  chunkCount?: number;
  estimatedTime?: string;
  currentTask?: string;
  tokensProcessed?: number;
  modelName?: string;
  projectType?: string;
  fileCount?: number;
  currentStep?: string;
  totalSteps?: number;
  stepProgress?: number;
  generatedFiles?: string[];
  codeSections?: string[];
}

export interface ProjectInfo {
  id: string;
  name: string;
  type: CodeGenType;
  createdAt: Date;
  outputPath: string;
  files: string[];
}

// Generation options
export interface GenerationOptions {
  prompt: string;
  type?: CodeGenType;
  modelName?: string;
  onProgress?: (progress: CodeGenProgress) => void;
}

// Code detection patterns
export interface CodeSectionPattern {
  pattern: RegExp;
  name: string;
}

// File validation result
export interface FileValidationResult {
  isValid: boolean;
  issues: string[];
  fileSize?: number;
}

// Generation statistics
export interface GenerationStats {
  startTime: number;
  endTime?: number;
  duration?: number;
  tokensProcessed?: number;
  filesGenerated?: number;
  chunksReceived?: number;
}
