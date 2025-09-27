import { StateGraph, MessagesAnnotation, END } from '@langchain/langgraph';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import {
  HTML_SINGLE_FILE_SYSTEM_PROMPT,
  MULTI_FILE_SYSTEM_PROMPT,
  VUE_PROJECT_SYSTEM_PROMPT
} from './prompts.js';
import { getApiKey } from './config.js';
import fs from 'node:fs';
import path from 'node:path';
import { ensureDirectory, createSafeFilename } from './utils.js';

export enum CodeGenType {
  HTML_SINGLE = 'html-single',
  MULTI_FILE = 'multi-file',
  VUE_PROJECT = 'vue-project',
  AUTO_DETECT = 'auto-detect'
}

export interface CodeGenResult {
  type: CodeGenType;
  outputPath: string;
  files: string[];
  success: boolean;
  error?: string;
}

export interface ProjectInfo {
  id: string;
  name: string;
  type: CodeGenType;
  createdAt: Date;
  outputPath: string;
  files: string[];
}

function createModel(modelName: string = 'gemini-2.5-flash'): ChatGoogleGenerativeAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Missing API key. Set GOOGLE_API_KEY or run login.');
  }
  return new ChatGoogleGenerativeAI({ model: modelName, apiKey });
}

function getSystemPrompt(type: CodeGenType): string {
  switch (type) {
    case CodeGenType.HTML_SINGLE:
      return HTML_SINGLE_FILE_SYSTEM_PROMPT;
    case CodeGenType.MULTI_FILE:
      return MULTI_FILE_SYSTEM_PROMPT;
    case CodeGenType.VUE_PROJECT:
      return VUE_PROJECT_SYSTEM_PROMPT;
    default:
      return HTML_SINGLE_FILE_SYSTEM_PROMPT;
  }
}

export async function generateCode(
  prompt: string,
  type: CodeGenType = CodeGenType.AUTO_DETECT,
  modelName: string = 'gemini-2.5-flash'
): Promise<CodeGenResult> {
  try {
    // Verbose log: input parameters
    console.log(`[generateCode] Called with prompt="${prompt}", type="${type}", modelName="${modelName}"`);

    // Auto-detect type if not specified
    if (type === CodeGenType.AUTO_DETECT) {
      type = detectCodeGenType(prompt);
      console.log(`[generateCode] Auto-detected code generation type: ${type}`);
    }

    const graph = createCodeGenGraph(type, modelName);
    const systemPrompt = getSystemPrompt(type);
    console.log(`[generateCode] Using system prompt: ${systemPrompt.substring(0, 100)}...`);
    const sys = new SystemMessage(systemPrompt);
    const userMsg = new HumanMessage(prompt);

    console.log(`[generateCode] Invoking graph with system and user messages...`);
    const res = await graph.invoke({ messages: [sys, userMsg] });
    const last = (res as any)?.messages?.slice(-1)[0];
    const content = extractTextFromContent(last?.content);

    console.log(`[generateCode] Model response content (truncated): ${typeof content === 'string' ? content.substring(0, 200) : '[non-string content]'}`);

    const result = await saveGeneratedCode(content, type, prompt);
    console.log(`[generateCode] Code generation result:`, result);
    return result;
  } catch (error) {
    console.error(`[generateCode] Error:`, error);
    return {
      type,
      outputPath: '',
      files: [],
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function detectCodeGenType(prompt: string): CodeGenType {
  const lowerPrompt = prompt.toLowerCase();

  // Vue project indicators
  if (lowerPrompt.includes('vue') ||
      lowerPrompt.includes('spa') ||
      lowerPrompt.includes('router') ||
      lowerPrompt.includes('component') ||
      lowerPrompt.includes('单页应用') ||
      lowerPrompt.includes('多页面')) {
    return CodeGenType.VUE_PROJECT;
  }

  // Multi-file indicators
  if (lowerPrompt.includes('separate') ||
      lowerPrompt.includes('modular') ||
      lowerPrompt.includes('文件分离') ||
      lowerPrompt.includes('模块化')) {
    return CodeGenType.MULTI_FILE;
  }

  // Default to single HTML file
  return CodeGenType.HTML_SINGLE;
}

function createCodeGenGraph(type: CodeGenType, modelName?: string) {
  async function modelNode(state: typeof MessagesAnnotation.State): Promise<Partial<typeof MessagesAnnotation.State>> {
    const model = createModel(modelName);
    const res = await model.invoke(state.messages as BaseMessage[]);
    return { messages: [res] };
  }

  const builder = new StateGraph(MessagesAnnotation)
    .addNode('model', modelNode)
    .addEdge('__start__', 'model')
    .addEdge('model', END);
  return builder.compile();
}

function extractTextFromContent(content: unknown): string {
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

async function saveGeneratedCode(
  content: string,
  type: CodeGenType,
  prompt: string
): Promise<CodeGenResult> {
  const timestamp = Date.now();
  const projectName = createSafeFilename(prompt.slice(0, 30), 'project');
  const projectDir = path.join(process.cwd(), 'generated', `${projectName}_${timestamp}`);

  ensureDirectory(projectDir);

  const files: string[] = [];

  switch (type) {
    case CodeGenType.HTML_SINGLE:
      return await saveHtmlSingleFile(content, projectDir, files);

    case CodeGenType.MULTI_FILE:
      return await saveMultiFile(content, projectDir, files);

    case CodeGenType.VUE_PROJECT:
      return await saveVueProject(content, projectDir, files);

    default:
      return await saveHtmlSingleFile(content, projectDir, files);
  }
}

async function saveHtmlSingleFile(content: string, projectDir: string, files: string[]): Promise<CodeGenResult> {
  try {
    // Extract HTML from code blocks
    const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/);
    if (!htmlMatch || !htmlMatch[1]) {
      throw new Error('No HTML code block found in response');
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

async function saveMultiFile(content: string, projectDir: string, files: string[]): Promise<CodeGenResult> {
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
      throw new Error('No code blocks found in response');
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

async function saveVueProject(content: string, projectDir: string, files: string[]): Promise<CodeGenResult> {
  try {
    // For Vue projects, we'll create a basic structure
    // The AI should generate the files, but we'll provide fallback structure

    // Create package.json
    const packageJson = {
      name: "vue-project",
      version: "1.0.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview"
      },
      dependencies: {
        "vue": "^3.3.4",
        "vue-router": "^4.2.4"
      },
      devDependencies: {
        "@vitejs/plugin-vue": "^4.2.3",
        "vite": "^4.4.5"
      }
    };

    const packageJsonPath = path.join(projectDir, 'package.json');
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    files.push('package.json');

    // Create vite.config.js
    const viteConfig = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})`;

    const viteConfigPath = path.join(projectDir, 'vite.config.js');
    fs.writeFileSync(viteConfigPath, viteConfig, 'utf8');
    files.push('vite.config.js');

    // Create src directory
    const srcDir = path.join(projectDir, 'src');
    ensureDirectory(srcDir);

    // Create basic main.js
    const mainJs = `import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')`;

    const mainJsPath = path.join(srcDir, 'main.js');
    fs.writeFileSync(mainJsPath, mainJs, 'utf8');
    files.push('src/main.js');

    // Create basic App.vue
    const appVue = `<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 10px;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>`;

    const appVuePath = path.join(srcDir, 'App.vue');
    fs.writeFileSync(appVuePath, appVue, 'utf8');
    files.push('src/App.vue');

    // Create router directory
    const routerDir = path.join(srcDir, 'router');
    ensureDirectory(routerDir);

    // Create basic router
    const routerJs = `import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../pages/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router`;

    const routerJsPath = path.join(routerDir, 'index.js');
    fs.writeFileSync(routerJsPath, routerJs, 'utf8');
    files.push('src/router/index.js');

    // Create pages directory
    const pagesDir = path.join(srcDir, 'pages');
    ensureDirectory(pagesDir);

    // Create basic Home page
    const homeVue = `<template>
  <div class="home">
    <h1>Welcome to Vue 3</h1>
    <p>This is a generated Vue project. Customize as needed.</p>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
.home {
  padding: 20px;
}

h1 {
  color: #42b983;
}
</style>`;

    const homeVuePath = path.join(pagesDir, 'Home.vue');
    fs.writeFileSync(homeVuePath, homeVue, 'utf8');
    files.push('src/pages/Home.vue');

    // Create index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue Project</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`;

    const indexPath = path.join(projectDir, 'index.html');
    fs.writeFileSync(indexPath, indexHtml, 'utf8');
    files.push('index.html');

    return {
      type: CodeGenType.VUE_PROJECT,
      outputPath: projectDir,
      files,
      success: true
    };
  } catch (error) {
    return {
      type: CodeGenType.VUE_PROJECT,
      outputPath: projectDir,
      files,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export function listGeneratedProjects(): ProjectInfo[] {
  const generatedDir = path.join(process.cwd(), 'generated');
  if (!fs.existsSync(generatedDir)) {
    return [];
  }

  const projects: ProjectInfo[] = [];
  const entries = fs.readdirSync(generatedDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const projectPath = path.join(generatedDir, entry.name);
      const stats = fs.statSync(projectPath);

      // Try to determine project type
      let type = CodeGenType.HTML_SINGLE;
      const indexPath = path.join(projectPath, 'index.html');
      const packageJsonPath = path.join(projectPath, 'package.json');

      if (fs.existsSync(packageJsonPath)) {
        type = CodeGenType.VUE_PROJECT;
      } else if (fs.existsSync(indexPath)) {
        const stylePath = path.join(projectPath, 'style.css');
        const scriptPath = path.join(projectPath, 'script.js');
        if (fs.existsSync(stylePath) || fs.existsSync(scriptPath)) {
          type = CodeGenType.MULTI_FILE;
        }
      }

      const files = fs.readdirSync(projectPath, { recursive: true })
        .filter(f => typeof f === 'string')
        .map(f => f as string);

      projects.push({
        id: entry.name,
        name: entry.name,
        type,
        createdAt: stats.birthtime,
        outputPath: projectPath,
        files
      });
    }
  }

  return projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function cleanGeneratedProjects(): { deleted: number; totalSize: number } {
  const generatedDir = path.join(process.cwd(), 'generated');
  if (!fs.existsSync(generatedDir)) {
    return { deleted: 0, totalSize: 0 };
  }

  let deleted = 0;
  let totalSize = 0;

  function deleteRecursive(dirPath: string): number {
    let size = 0;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        size += deleteRecursive(fullPath);
        fs.rmdirSync(fullPath);
      } else {
        const stats = fs.statSync(fullPath);
        size += stats.size;
        fs.unlinkSync(fullPath);
        deleted++;
      }
    }

    return size;
  }

  totalSize = deleteRecursive(generatedDir);
  fs.rmdirSync(generatedDir);

  return { deleted, totalSize };
}
