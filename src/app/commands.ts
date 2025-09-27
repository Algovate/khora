import { generateCode, generateCodeWithProgress, CodeGenProgress, listGeneratedProjects, cleanGeneratedProjects } from './generator.js';
import { CodeGenType } from './constants.js';
import { saveSessionToFile, getMCPServers, addMCPServer, removeMCPServer, setMCPServers } from './config.js';
import { CommandContext, CommandResult } from './types.js';
import { MCPManager } from './mcp.js';


export class CommandHandler {
  private context: CommandContext;
  private mcpManager: MCPManager;

  constructor(context: CommandContext, mcpManager?: MCPManager) {
    this.context = context;
    this.mcpManager = mcpManager || new MCPManager();
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

      case 'mcp':
        return await this.handleMCP(args);

      case 'mcp-connect':
        return await this.handleMCPConnect(args);

      case 'mcp-disconnect':
        return await this.handleMCPDisconnect(args);

      case 'mcp-list':
        return this.handleMCPList();

      case 'mcp-tools':
        return this.handleMCPTools();

      case 'mcp-call':
        return await this.handleMCPCall(args);

      case 'mcp-add':
        return this.handleMCPAdd(args);

      case 'mcp-remove':
        return this.handleMCPRemove(args);

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
        '## 🔌 MCP (Model Context Protocol) Commands\n' +
        '\n' +
        '/mcp                  - Show MCP help\n' +
        '/mcp-list             - List configured MCP servers\n' +
        '/mcp-connect <name>   - Connect to MCP server\n' +
        '/mcp-disconnect <name> - Disconnect from MCP server\n' +
        '/mcp-tools            - List available MCP tools\n' +
        '/mcp-call <tool> [args] - Call MCP tool\n' +
        '/mcp-add <config>     - Add MCP server configuration\n' +
        '/mcp-remove <name>    - Remove MCP server configuration\n' +
        '\n' +
        '## 📝 Examples\n' +
        '\n' +
        '/gen-html Create a portfolio website with dark theme\n' +
        '/gen-web Build a landing page with animations\n' +
        '/gen-vue Create a todo app with Vue 3 and routing\n' +
        '/gen-auto Make a blog with comments system\n' +
        '/mcp-call filesystem_read_file {"path": "/path/to/file"}'
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
    // Use the new progress utility
    const clampedProgress = Math.max(0, Math.min(100, progress));
    const filled = Math.round(clampedProgress / 10);
    const empty = 10 - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${clampedProgress}%`;
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
    // Ensure current and total are valid positive numbers
    const safeCurrent = Math.max(0, current);
    const safeTotal = Math.max(1, total); // Avoid division by zero
    const filled = Math.max(0, Math.min(4, Math.round((safeCurrent / safeTotal) * 4)));
    const empty = 4 - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return `[${bar}] ${safeCurrent}/${safeTotal}`;
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

  // MCP Command Handlers

  private async handleMCP(args: string): Promise<boolean> {
    const { setMessages } = this.context;
    setMessages(prev => [...prev, {
      id: this.generateUniqueId('sys'),
      role: 'system',
      content: '🔌 MCP (Model Context Protocol) Commands:\n\n' +
        '/mcp-list             - List configured MCP servers\n' +
        '/mcp-connect <name>   - Connect to MCP server\n' +
        '/mcp-disconnect <name> - Disconnect from MCP server\n' +
        '/mcp-tools            - List available MCP tools\n' +
        '/mcp-call <tool> [args] - Call MCP tool\n' +
        '/mcp-add <config>     - Add MCP server configuration\n' +
        '/mcp-remove <name>    - Remove MCP server configuration\n\n' +
        'Examples:\n' +
        '/mcp-call filesystem_read_file {"path": "/path/to/file"}\n' +
        '/mcp-add {"name": "filesystem", "command": "npx", "args": ["@modelcontextprotocol/server-filesystem", "/tmp"], "enabled": true}'
    }]);
    return true;
  }

  private async handleMCPConnect(args: string): Promise<boolean> {
    const { setMessages } = this.context;
    const serverName = args.trim();
    
    if (!serverName) {
      setMessages(prev => [...prev, {
        id: this.generateUniqueId('sys'),
        role: 'system',
        content: 'Usage: /mcp-connect <server-name>'
      }]);
      return true;
    }

    try {
      const success = await this.mcpManager.connectServer(serverName);
      if (success) {
        setMessages(prev => [...prev, {
          id: this.generateUniqueId('sys'),
          role: 'system',
          content: `✅ Connected to MCP server: ${serverName}`
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: this.generateUniqueId('sys'),
          role: 'system',
          content: `❌ Failed to connect to MCP server: ${serverName}`
        }]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessages(prev => [...prev, {
        id: this.generateUniqueId('sys'),
        role: 'system',
        content: `❌ Connection error: ${message}`
      }]);
    }
    return true;
  }

  private async handleMCPDisconnect(args: string): Promise<boolean> {
    const { setMessages } = this.context;
    const serverName = args.trim();
    
    if (!serverName) {
      setMessages(prev => [...prev, {
        id: this.generateUniqueId('sys'),
        role: 'system',
        content: 'Usage: /mcp-disconnect <server-name>'
      }]);
      return true;
    }

    try {
      await this.mcpManager.disconnectServer(serverName);
      setMessages(prev => [...prev, {
        id: this.generateUniqueId('sys'),
        role: 'system',
        content: `🔌 Disconnected from MCP server: ${serverName}`
      }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessages(prev => [...prev, {
        id: this.generateUniqueId('sys'),
        role: 'system',
        content: `❌ Disconnection error: ${message}`
      }]);
    }
    return true;
  }

  private handleMCPList(): boolean {
    const { setMessages } = this.context;
    try {
      const servers = getMCPServers();
      const status = this.mcpManager.getServerStatus();
      
      if (servers.length === 0) {
        setMessages(prev => [...prev, {
          id: this.generateUniqueId('sys'),
          role: 'system',
          content: '📋 No MCP servers configured. Use /mcp-add to add one.'
        }]);
      } else {
        const list = servers.map(server => {
          const serverStatus = status[server.name] || { connected: false, tools: 0 };
          const statusIcon = serverStatus.connected ? '🟢' : '🔴';
          const toolsInfo = serverStatus.tools > 0 ? ` (${serverStatus.tools} tools)` : '';
          return `${statusIcon} ${server.name}${toolsInfo} - ${server.command} ${server.args?.join(' ') || ''}`;
        }).join('\n');
        
        setMessages(prev => [...prev, {
          id: this.generateUniqueId('sys'),
          role: 'system',
          content: `📋 MCP Servers:\n${list}`
        }]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessages(prev => [...prev, {
        id: this.generateUniqueId('sys'),
        role: 'system',
        content: `❌ List error: ${message}`
      }]);
    }
    return true;
  }

  private handleMCPTools(): boolean {
    const { setMessages } = this.context;
    try {
      const tools = this.mcpManager.getTools();
      
      if (tools.length === 0) {
        setMessages(prev => [...prev, {
          id: this.generateUniqueId('sys'),
          role: 'system',
          content: '🔧 No MCP tools available. Connect to MCP servers first.'
        }]);
      } else {
        const list = tools.map(tool => 
          `🔧 ${tool.name} (${tool.server})\n   ${tool.description}`
        ).join('\n\n');
        
        setMessages(prev => [...prev, {
          id: this.generateUniqueId('sys'),
          role: 'system',
          content: `🔧 Available MCP Tools:\n\n${list}`
        }]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessages(prev => [...prev, {
        id: this.generateUniqueId('sys'),
        role: 'system',
        content: `❌ Tools error: ${message}`
      }]);
    }
    return true;
  }

  private async handleMCPCall(args: string): Promise<boolean> {
    const { setMessages } = this.context;
    const parts = args.trim().split(/\s+/);
    
    if (parts.length < 1) {
      setMessages(prev => [...prev, {
        id: this.generateUniqueId('sys'),
        role: 'system',
        content: 'Usage: /mcp-call <tool-name> [arguments-json]'
      }]);
      return true;
    }

    const toolName = parts[0]!;
    let arguments_: any = {};
    
    if (parts.length > 1) {
      try {
        const argsJson = parts.slice(1).join(' ');
        arguments_ = JSON.parse(argsJson);
      } catch (error) {
        setMessages(prev => [...prev, {
          id: this.generateUniqueId('sys'),
          role: 'system',
          content: `❌ Invalid JSON arguments: ${parts.slice(1).join(' ')}`
        }]);
        return true;
      }
    }

    try {
      const result = await this.mcpManager.callTool(toolName, arguments_);
      
      if (result.success) {
        const content = typeof result.content === 'string' 
          ? result.content 
          : JSON.stringify(result.content, null, 2);
        
        setMessages(prev => [...prev, {
          id: this.generateUniqueId('sys'),
          role: 'system',
          content: `✅ Tool '${toolName}' result:\n${content}`
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: this.generateUniqueId('sys'),
          role: 'system',
          content: `❌ Tool '${toolName}' error: ${result.error}`
        }]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessages(prev => [...prev, {
        id: this.generateUniqueId('sys'),
        role: 'system',
        content: `❌ Tool call error: ${message}`
      }]);
    }
    return true;
  }

  private handleMCPAdd(args: string): boolean {
    const { setMessages } = this.context;
    
    if (!args.trim()) {
      setMessages(prev => [...prev, {
        id: this.generateUniqueId('sys'),
        role: 'system',
        content: 'Usage: /mcp-add <config-json>\n\nExample:\n/mcp-add {"name": "filesystem", "command": "npx", "args": ["@modelcontextprotocol/server-filesystem", "/tmp"], "enabled": true}'
      }]);
      return true;
    }

    try {
      const config = JSON.parse(args);
      
      // Validate required fields
      if (!config.name || !config.command) {
        setMessages(prev => [...prev, {
          id: this.generateUniqueId('sys'),
          role: 'system',
          content: '❌ Config must include "name" and "command" fields'
        }]);
        return true;
      }

      // Set defaults
      config.enabled = config.enabled !== false;
      config.args = config.args || [];
      config.env = config.env || {};

      addMCPServer(config);
      
      setMessages(prev => [...prev, {
        id: this.generateUniqueId('sys'),
        role: 'system',
        content: `✅ Added MCP server: ${config.name}`
      }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessages(prev => [...prev, {
        id: this.generateUniqueId('sys'),
        role: 'system',
        content: `❌ Invalid config JSON: ${message}`
      }]);
    }
    return true;
  }

  private handleMCPRemove(args: string): boolean {
    const { setMessages } = this.context;
    const serverName = args.trim();
    
    if (!serverName) {
      setMessages(prev => [...prev, {
        id: this.generateUniqueId('sys'),
        role: 'system',
        content: 'Usage: /mcp-remove <server-name>'
      }]);
      return true;
    }

    try {
      removeMCPServer(serverName);
      setMessages(prev => [...prev, {
        id: this.generateUniqueId('sys'),
        role: 'system',
        content: `🗑️ Removed MCP server: ${serverName}`
      }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessages(prev => [...prev, {
        id: this.generateUniqueId('sys'),
        role: 'system',
        content: `❌ Remove error: ${message}`
      }]);
    }
    return true;
  }
}

