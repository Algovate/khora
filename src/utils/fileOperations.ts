/**
 * File operations and validation utilities
 */

import fs from 'node:fs';
import path from 'node:path';
import { ensureDirectory, createSafeFilename } from './utils.js';
import { CodeGenType, ERROR_MESSAGES } from '../core/constants.js';
import type { CodeGenResult, FileValidationResult } from '../types/generation.js';

/**
 * Validates generated files and their structure
 */
export function validateGeneratedFiles(
  outputPath: string,
  files: string[],
  type: CodeGenType
): FileValidationResult {
  const issues: string[] = [];

  if (!fs.existsSync(outputPath)) {
    issues.push(`Output directory does not exist: ${outputPath}`);
    return { isValid: false, issues };
  }

  for (const file of files) {
    const filePath = path.join(outputPath, file);
    if (!fs.existsSync(filePath)) {
      issues.push(`Generated file does not exist: ${file}`);
    } else {
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        issues.push(`Generated file is empty: ${file}`);
      }
    }
  }

  // Type-specific validations
  if (type === CodeGenType.HTML_SINGLE) {
    const indexPath = path.join(outputPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      if (!content.includes('<html') || !content.includes('</html>')) {
        issues.push('HTML file missing proper HTML structure');
      }
    }
  } else if (type === CodeGenType.MULTI_FILE) {
    const requiredFiles = ['index.html', 'style.css', 'script.js'];
    for (const requiredFile of requiredFiles) {
      if (!files.includes(requiredFile)) {
        issues.push(`Multi-file project missing required file: ${requiredFile}`);
      }
    }
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Saves HTML single file project
 */
export async function saveHtmlSingleFile(
  content: string,
  projectDir: string,
  files: string[]
): Promise<CodeGenResult> {
  try {
    // Extract HTML from code blocks
    const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/);
    if (!htmlMatch || !htmlMatch[1]) {
      throw new Error(ERROR_MESSAGES.NO_HTML_BLOCK);
    }

    const htmlContent = htmlMatch[1].trim();
    const indexPath = path.join(projectDir, 'index.html');
    fs.writeFileSync(indexPath, htmlContent, 'utf8');
    files.push('index.html');

    return {
      type: CodeGenType.HTML_SINGLE,
      outputPath: projectDir,
      files,
      success: true
    };
  } catch (error) {
    return {
      type: CodeGenType.HTML_SINGLE,
      outputPath: projectDir,
      files,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Saves multi-file project
 */
export async function saveMultiFile(
  content: string,
  projectDir: string,
  files: string[]
): Promise<CodeGenResult> {
  try {
    // Extract HTML
    const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/);
    if (htmlMatch && htmlMatch[1]) {
      const htmlContent = htmlMatch[1].trim();
      const indexPath = path.join(projectDir, 'index.html');
      fs.writeFileSync(indexPath, htmlContent, 'utf8');
      files.push('index.html');
    }

    // Extract CSS
    const cssMatch = content.match(/```css\n([\s\S]*?)\n```/);
    if (cssMatch && cssMatch[1]) {
      const cssContent = cssMatch[1].trim();
      const cssPath = path.join(projectDir, 'style.css');
      fs.writeFileSync(cssPath, cssContent, 'utf8');
      files.push('style.css');
    }

    // Extract JavaScript
    const jsMatch = content.match(/```javascript\n([\s\S]*?)\n```/);
    if (jsMatch && jsMatch[1]) {
      const jsContent = jsMatch[1].trim();
      const jsPath = path.join(projectDir, 'script.js');
      fs.writeFileSync(jsPath, jsContent, 'utf8');
      files.push('script.js');
    }

    if (files.length === 0) {
      throw new Error(ERROR_MESSAGES.NO_CODE_BLOCKS);
    }

    return {
      type: CodeGenType.MULTI_FILE,
      outputPath: projectDir,
      files,
      success: true
    };
  } catch (error) {
    return {
      type: CodeGenType.MULTI_FILE,
      outputPath: projectDir,
      files,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Creates project directory and returns project info
 */
export function createProjectDirectory(prompt: string): { projectDir: string; projectName: string } {
  const timestamp = Date.now();
  const projectName = createSafeFilename(prompt.slice(0, 30), 'project');
  const projectDir = path.join(process.cwd(), 'generated', `${projectName}_${timestamp}`);

  ensureDirectory(projectDir);

  return { projectDir, projectName };
}

