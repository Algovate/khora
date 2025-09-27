import { generateCode, CodeGenType, listGeneratedProjects, cleanGeneratedProjects } from './codeGenService.js';
import { saveSessionToFile } from './config.js';

export interface CommandContext {
  messages: Array<{ id: string; role: 'user' | 'assistant' | 'system'; content: string }>;
  setMessages: (fn: (prev: any[]) => any[]) => void;
  setIsThinking: (thinking: boolean) => void;
  setInput: (input: string) => void;
  modelName: string;
}

export class CommandHandler {
  private context: CommandContext;

  constructor(context: CommandContext) {
    this.context = context;
  }

  async handleCommand(input: string): Promise<boolean> {
    const trimmed = input.trim();
    if (!trimmed.startsWith('/')) return false;

    const cmd = trimmed.slice(1).split(/\s+/)[0];
    if (!cmd) return false;
    const args = trimmed.slice(cmd.length + 2);

    switch (cmd) {
      case 'help':
      case 'h':
      case '?':
        return this.handleHelp();
      
      case 'q':
      case 'quit':
      case 'exit':
        return this.handleQuit();
      
      case 'clear':
        return this.handleClear();
      
      case 'model':
        return this.handleModel(args);
      
      case 'reset':
        return this.handleReset();
      
      case 'save':
        return this.handleSave(args);
      
      case 'gen-html':
        return await this.handleCodeGen(args, CodeGenType.HTML_SINGLE, '📄');
      
      case 'gen-web':
        return await this.handleCodeGen(args, CodeGenType.MULTI_FILE, '🌐');
      
      case 'gen-vue':
        return await this.handleCodeGen(args, CodeGenType.VUE_PROJECT, '⚡');
      
      case 'gen-auto':
        return await this.handleCodeGen(args, CodeGenType.AUTO_DETECT, '🎯');
      
      case 'list':
      case 'ls':
        return this.handleList();
      
      case 'clean':
      case 'rm':
        return this.handleClean();
      
      default:
        return false;
    }
  }

  private handleHelp(): boolean {
    const { setMessages } = this.context;
    setMessages(prev => [...prev, { 
      id: `sys-${Date.now()}`, 
      role: 'system', 
      content: 'Commands:\n' +
        '  /help            Show this help\n' +
        '  /q | /quit       Exit\n' +
        '  /clear           Clear history\n' +
        '  /model           Open interactive model picker\n' +
        '  /reset           Reset the conversation context\n' +
        '  /save [name]     Save conversation to ~/.khora/sessions/[name].json\n' +
        '\n' +
        '## 🚀 Code Generation Commands\n' +
        '\n' +
        '/gen-html <prompt>     - Generate single HTML file with inline CSS/JS\n' +
        '/gen-web <prompt>      - Generate separate HTML, CSS, and JS files\n' +
        '/gen-vue <prompt>      - Generate complete Vue 3 project with routing\n' +
        '/gen-auto <prompt>     - Auto-detect project type and generate\n' +
        '\n' +
        '## 📁 Project Management Commands\n' +
        '\n' +
        '/list | /ls           - List all generated projects\n' +
        '/clean | /rm          - Clean up all generated files\n' +
        '\n' +
        '## 📝 Examples\n' +
        '\n' +
        '/gen-html Create a portfolio website with dark theme\n' +
        '/gen-web Build a landing page with animations\n' +
        '/gen-vue Create a todo app with Vue 3 and routing\n' +
        '/gen-auto Make a blog with comments system'
    }]);
    return true;
  }

  private handleQuit(): boolean {
    // This will be handled by the main app
    return true;
  }

  private handleClear(): boolean {
    const { setMessages } = this.context;
    setMessages(() => [{ 
      id: `sys-${Date.now()}`, 
      role: 'system', 
      content: 'History cleared. Type `/q` to quit.' 
    }]);
    return true;
  }

  private handleModel(args: string): boolean {
    // Model handling logic would go here
    // For now, just return false to let the main app handle it
    return false;
  }

  private handleReset(): boolean {
    const { setMessages } = this.context;
    setMessages(() => [{ 
      id: `sys-${Date.now()}`, 
      role: 'system', 
      content: 'Conversation context reset. Type `/q` to quit.' 
    }]);
    return true;
  }

  private handleSave(args: string): boolean {
    const { messages, setMessages } = this.context;
    const name = args.trim() || `session-${Date.now()}`;
    try {
      const file = saveSessionToFile(messages, name);
      setMessages(prev => [...prev, { 
        id: `sys-${Date.now()}`, 
        role: 'system', 
        content: `Saved to: ${file}` 
      }]);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setMessages(prev => [...prev, { 
        id: `sys-${Date.now()}`, 
        role: 'system', 
        content: `Save error: ${message}` 
      }]);
    }
    return true;
  }

  private async handleCodeGen(args: string, type: CodeGenType, emoji: string): Promise<boolean> {
    const { setMessages, setIsThinking, modelName } = this.context;
    
    if (!args.trim()) {
      setMessages(prev => [...prev, { 
        id: `sys-${Date.now()}`, 
        role: 'system', 
        content: `Usage: /gen-${type.toLowerCase().replace('_', '-')} <prompt>` 
      }]);
      return true;
    }

    try {
      setIsThinking(true);
      const result = await generateCode(args, type, modelName);
      
      if (result.success) {
        setMessages(prev => [...prev, { 
          id: `sys-${Date.now()}`, 
          role: 'system', 
          content: `${emoji} Generated: ${result.outputPath}/index.html` 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          id: `sys-${Date.now()}`, 
          role: 'system', 
          content: `❌ Generation failed: ${result.error}` 
        }]);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setMessages(prev => [...prev, { 
        id: `sys-${Date.now()}`, 
        role: 'system', 
        content: `❌ Generation error: ${message}` 
      }]);
    } finally {
      setIsThinking(false);
    }
    
    return true;
  }

  private handleList(): boolean {
    const { setMessages } = this.context;
    try {
      const projects = listGeneratedProjects();
      if (projects.length === 0) {
        setMessages(prev => [...prev, { 
          id: `sys-${Date.now()}`, 
          role: 'system', 
          content: '📁 No generated projects found.' 
        }]);
      } else {
        const list = projects.map((p, i) => `${i + 1}. ${p}`).join('\n');
        setMessages(prev => [...prev, { 
          id: `sys-${Date.now()}`, 
          role: 'system', 
          content: `📁 Generated Projects:\n${list}` 
        }]);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setMessages(prev => [...prev, { 
        id: `sys-${Date.now()}`, 
        role: 'system', 
        content: `❌ List error: ${message}` 
      }]);
    }
    return true;
  }

  private handleClean(): boolean {
    const { setMessages } = this.context;
    try {
      const count = cleanGeneratedProjects();
      setMessages(prev => [...prev, { 
        id: `sys-${Date.now()}`, 
        role: 'system', 
        content: `🧹 Cleaned up ${count} projects.` 
      }]);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setMessages(prev => [...prev, { 
        id: `sys-${Date.now()}`, 
        role: 'system', 
        content: `❌ Clean error: ${message}` 
      }]);
    }
    return true;
  }
}
