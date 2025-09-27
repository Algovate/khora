import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';

export interface MCPServer {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  enabled: boolean;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  server: string;
}

export interface MCPCallResult {
  success: boolean;
  content?: any;
  error?: string;
  isError?: boolean;
}

export class MCPManager extends EventEmitter {
  private clients: Map<string, Client> = new Map();
  private servers: Map<string, MCPServer> = new Map();
  private tools: Map<string, MCPTool> = new Map();

  constructor() {
    super();
  }

  /**
   * Add an MCP server configuration
   */
  addServer(server: MCPServer): void {
    this.servers.set(server.name, server);
  }

  /**
   * Remove an MCP server
   */
  removeServer(name: string): void {
    this.servers.delete(name);
    this.disconnectServer(name);
  }

  /**
   * Get all configured servers
   */
  getServers(): MCPServer[] {
    return Array.from(this.servers.values());
  }

  /**
   * Get all available tools
   */
  getTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Connect to an MCP server
   */
  async connectServer(name: string): Promise<boolean> {
    const server = this.servers.get(name);
    if (!server || !server.enabled) {
      return false;
    }

    try {
      // Create transport and client
      const transport = new StdioClientTransport({
        command: server.command,
        args: server.args || [],
        env: { ...process.env, ...server.env } as Record<string, string>
      });

      const client = new Client({
        name: 'khora-mcp-client',
        version: '1.0.0'
      }, {
        capabilities: {
          tools: {}
        }
      });

      await client.connect(transport);
      this.clients.set(name, client);

      // List available tools
      await this.refreshTools(name);

      this.emit('serverConnected', name);
      return true;
    } catch (error) {
      console.error(`Failed to connect to MCP server ${name}:`, error);
      this.disconnectServer(name);
      return false;
    }
  }

  /**
   * Disconnect from an MCP server
   */
  async disconnectServer(name: string): Promise<void> {
    const client = this.clients.get(name);
    if (client) {
      try {
        await client.close();
      } catch (error) {
        console.error(`Error closing client for ${name}:`, error);
      }
      this.clients.delete(name);
    }

    // Remove tools from this server
    for (const [toolName, tool] of this.tools.entries()) {
      if (tool.server === name) {
        this.tools.delete(toolName);
      }
    }

    this.emit('serverDisconnected', name);
  }

  /**
   * Refresh tools from a server
   */
  private async refreshTools(serverName: string): Promise<void> {
    const client = this.clients.get(serverName);
    if (!client) return;

    try {
      const result = await client.listTools({});

      if (result.tools) {
        for (const tool of result.tools) {
          this.tools.set(tool.name, {
            name: tool.name,
            description: tool.description || '',
            inputSchema: tool.inputSchema,
            server: serverName
          });
        }
      }
    } catch (error) {
      console.error(`Failed to list tools from ${serverName}:`, error);
    }
  }

  /**
   * Call a tool on an MCP server
   */
  async callTool(toolName: string, arguments_: any = {}): Promise<MCPCallResult> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return {
        success: false,
        error: `Tool '${toolName}' not found`
      };
    }

    const client = this.clients.get(tool.server);
    if (!client) {
      return {
        success: false,
        error: `Server '${tool.server}' not connected`
      };
    }

    try {
      const result = await client.callTool({
        name: toolName,
        arguments: arguments_
      });

      if (result.isError) {
        return {
          success: false,
          error: Array.isArray(result.content) && result.content[0]?.text
            ? result.content[0].text
            : 'Unknown error',
          isError: true
        };
      }

      return {
        success: true,
        content: result.content
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Connect to all enabled servers
   */
  async connectAllServers(): Promise<void> {
    const promises = Array.from(this.servers.entries())
      .filter(([_, server]) => server.enabled)
      .map(([name, _]) => this.connectServer(name));

    await Promise.allSettled(promises);
  }

  /**
   * Disconnect from all servers
   */
  async disconnectAllServers(): Promise<void> {
    const promises = Array.from(this.clients.keys()).map(name => this.disconnectServer(name));
    await Promise.allSettled(promises);
  }

  /**
   * Check if a server is connected
   */
  isServerConnected(name: string): boolean {
    return this.clients.has(name);
  }

  /**
   * Get server status
   */
  getServerStatus(): Record<string, { connected: boolean; tools: number }> {
    const status: Record<string, { connected: boolean; tools: number }> = {};

    for (const [name, server] of this.servers.entries()) {
      const connected = this.isServerConnected(name);
      const tools = Array.from(this.tools.values()).filter(tool => tool.server === name).length;
      status[name] = { connected, tools };
    }

    return status;
  }
}
