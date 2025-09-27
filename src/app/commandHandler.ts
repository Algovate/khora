import { generateCode, generateCodeWithProgress, CodeGenType, CodeGenProgress, listGeneratedProjects, cleanGeneratedProjects } from './codeGenService.js';
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

  // Utility function to generate unique IDs
  private generateUniqueId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
      id: this.generateUniqueId('sys'),
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
    const name = args.trim() || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    try {
      const file = saveSessionToFile(messages, name);
      setMessages(prev => [...prev, {
        id: this.generateUniqueId('sys'),
        role: 'system',
        content: `Saved to: ${file}`
      }]);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setMessages(prev => [...prev, {
        id: this.generateUniqueId('sys'),
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
        id: this.generateUniqueId('sys'),
        role: 'system',
        content: `Usage: /gen-${type.toLowerCase().replace('_', '-')} <prompt>`
      }]);
      return true;
    }

    // Create a progress message ID to update
    const progressId = this.generateUniqueId('progress');

    try {
      setIsThinking(true);

      let progressMessage = {
        id: progressId,
        role: 'system' as const,
        content: '🔄 Initializing code generation...'
      };

      setMessages(prev => [...prev, progressMessage]);

      const result = await generateCodeWithProgress(args, type, modelName, (progress: CodeGenProgress) => {
        const progressEmoji = this.getProgressEmoji(progress.stage);
        const progressBar = this.getProgressBar(progress.progress || 0);
        
        // Build detailed content
        const content = this.buildDetailedProgressContent(progress, progressEmoji, progressBar);
        
        const updatedMessage = {
          id: progressId,
          role: 'system' as const,
          content
        };
        
        setMessages(prev => 
          prev.map(msg => msg.id === progressId ? updatedMessage : msg)
        );
      });

      if (result.success) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === progressId
              ? { ...msg, content: `${emoji} Generated: ${result.outputPath}/index.html` }
              : msg
          )
        );
      } else {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === progressId
              ? { ...msg, content: `❌ Generation failed: ${result.error}` }
              : msg
          )
        );
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === progressId
            ? { ...msg, content: `❌ Generation error: ${message}` }
            : msg
        )
      );
    } finally {
      setIsThinking(false);
    }

    return true;
  }

  private getProgressEmoji(stage: CodeGenProgress['stage']): string {
    switch (stage) {
      case 'initializing': return '🔄';
      case 'generating': return '⚡';
      case 'saving': return '💾';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '🔄';
    }
  }

  private getProgressBar(progress: number): string {
    const filled = Math.round(progress / 10);
    const empty = 10 - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${progress}%`;
  }

  private getStageText(stage: CodeGenProgress['stage']): string {
    switch (stage) {
      case 'initializing':
        return '   └─ Preparing to generate your code...';
      case 'generating':
        return '   └─ AI is working on your request...';
      case 'saving':
        return '   └─ Saving files to disk...';
      case 'completed':
        return '   └─ All done! Your code is ready.';
      case 'error':
        return '   └─ Something went wrong.';
      default:
        return '   └─ Processing...';
    }
  }

  private buildDetailedProgressContent(progress: CodeGenProgress, emoji: string, progressBar: string): string {
    const lines = [];

    // Main progress line with emoji and bar
    lines.push(`${emoji} ${progress.message} ${progressBar}`);

    // Add step information if available
    if (progress.details) {
      const details = progress.details;
      
      // Show current step information (main focus)
      if (details.currentStep && details.totalSteps) {
        const stepProgress = details.stepProgress || 0;
        const stepIndicator = this.getStepIndicator(stepProgress + 1, details.totalSteps);
        lines.push(`   ${stepIndicator} ${details.currentStep}`);
      }
      
      // Show detected code sections (if any)
      if (details.codeSections && details.codeSections.length > 0) {
        const sections = details.codeSections.slice(-1); // Show only last section
        if (sections.length > 0) {
          lines.push(`   🔧 ${sections[0]}`);
        }
      }
      
      // Show generated files only at completion
      if (details.generatedFiles && details.generatedFiles.length > 0 && progress.stage === 'completed') {
        const files = details.generatedFiles.slice(0, 2);
        if (files.length > 0) {
          lines.push(`   📁 ${files.map(f => f.split('/').pop()).join(', ')}`);
        }
      }
    }

    return lines.join('\n');
  }

  private getStepIndicator(current: number, total: number): string {
    const filled = Math.round((current / total) * 4);
    const empty = 4 - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return `[${bar}] ${current}/${total}`;
  }

  private handleList(): boolean {
    const { setMessages } = this.context;
    try {
      const projects = listGeneratedProjects();
      if (projects.length === 0) {
        setMessages(prev => [...prev, {
          id: this.generateUniqueId('sys'),
          role: 'system',
          content: '📁 No generated projects found.'
        }]);
      } else {
        const list = projects.map((p, i) => `${i + 1}. ${p}`).join('\n');
        setMessages(prev => [...prev, {
          id: this.generateUniqueId('sys'),
          role: 'system',
          content: `📁 Generated Projects:\n${list}`
        }]);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setMessages(prev => [...prev, {
        id: this.generateUniqueId('sys'),
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
        id: this.generateUniqueId('sys'),
        role: 'system',
        content: `🧹 Cleaned up ${count} projects.`
      }]);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setMessages(prev => [...prev, {
        id: this.generateUniqueId('sys'),
        role: 'system',
        content: `❌ Clean error: ${message}`
      }]);
    }
    return true;
  }
}

