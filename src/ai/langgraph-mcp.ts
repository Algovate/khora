import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { MCPManager } from '../mcp/mcp.js';
import { createOpenRouterModel } from './modelFactory.js';

// 类型定义
export interface ChatResponse {
  content: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  tool: string;
  arguments: Record<string, any>;
}

export interface ChatMessage {
  role: string;
  content: string;
}

// 工具调用检测器
class ToolCallDetector {
  private static readonly TOOL_INDICATORS = ['{"tool"', '"tool":'];

  static hasToolCalls(text: string): boolean {
    return this.TOOL_INDICATORS.some(indicator => text.includes(indicator));
  }

  static extractToolCalls(text: string): string[] {
    const lines = text.split('\n');
    const toolCalls: string[] = [];

    for (const line of lines) {
      if (line.includes('"tool"') && line.includes('"arguments"')) {
        const jsonStart = line.indexOf('{');
        if (jsonStart !== -1) {
          const jsonPart = line.substring(jsonStart);
          toolCalls.push(jsonPart);
        }
      }
    }

    return toolCalls;
  }
}

// JSON 解析器
class JsonParser {
  static parseToolCall(jsonString: string): ToolCall | null {
    try {
      let cleanJson = jsonString.trim();

      // 尝试直接解析
      try {
        return JSON.parse(cleanJson);
      } catch (e) {
        // 修复常见的 JSON 问题
        cleanJson = cleanJson.replace(/,(\s*[}\]])/g, '$1');
        if (!cleanJson.endsWith('}')) {
          cleanJson += '}';
        }
        return JSON.parse(cleanJson);
      }
    } catch (error) {
      console.error('Failed to parse tool call JSON:', error, 'Input:', jsonString);
      return null;
    }
  }
}

// 工具结果处理器
class ToolResultProcessor {
  static processResult(content: any): string {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      const textContent = content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');
      return textContent || JSON.stringify(content, null, 2);
    }

    return JSON.stringify(content, null, 2);
  }
}

// 消息转换器
class MessageConverter {
  static toLangChainMessages(messages: ChatMessage[]): (HumanMessage | AIMessage | SystemMessage)[] {
    return messages.map(msg => {
      switch (msg.role) {
        case 'user':
          return new HumanMessage(msg.content);
        case 'assistant':
          return new AIMessage(msg.content);
        case 'system':
          return new SystemMessage(msg.content);
        default:
          return new HumanMessage(msg.content);
      }
    });
  }
}

// 系统消息构建器
class SystemMessageBuilder {
  static buildWithMCPTools(tools: any[]): SystemMessage {
    const toolDescriptions = tools.map(tool =>
      `- ${tool.name}: ${tool.description}`
    ).join('\n');

    return new SystemMessage(`
You have access to the following MCP tools:
${toolDescriptions}

When you need to use a tool, respond with a JSON object in this format:
{"tool": "tool_name", "arguments": {...}}

Important guidelines:
- Always use the exact tool names as listed above
- For file paths, use the allowed directories (check with list_allowed_directories first)
- If you need to use multiple tools, make separate tool calls
- Always provide helpful context before and after tool calls
- If a tool call fails, explain what went wrong and suggest alternatives
- Be conversational and explain what you're doing with the tools
    `);
  }
}

// 主要的 LangGraph MCP 聊天类
export class LangGraphMCPChat {
  private model: ChatOpenAI;
  private mcpManager: MCPManager;

  constructor(mcpManager: MCPManager, modelName?: string) {
    this.model = createOpenRouterModel(modelName ? { modelName } : {});
    this.mcpManager = mcpManager;
  }

  async chat(message: string, history: ChatMessage[] = []): Promise<ChatResponse> {
    try {
      // 转换消息格式
      const langchainMessages = MessageConverter.toLangChainMessages(history);
      langchainMessages.push(new HumanMessage(message));

      // 处理系统消息
      this.addOrUpdateSystemMessage(langchainMessages);

      // 调用 AI 模型
      const response = await this.model.invoke(langchainMessages);
      const responseText = response.content as string;

      // 处理工具调用
      return await this.processToolCalls(responseText);
    } catch (error) {
      console.error('LangGraph chat error:', error);
      throw error;
    }
  }

  private addOrUpdateSystemMessage(messages: (HumanMessage | AIMessage | SystemMessage)[]): void {
    const tools = this.mcpManager.getTools();
    const systemMessage = SystemMessageBuilder.buildWithMCPTools(tools);

    // 移除所有现有的系统消息
    const filteredMessages = messages.filter(msg => !(msg instanceof SystemMessage));

    // 将系统消息放在最前面
    filteredMessages.unshift(systemMessage);

    // 清空原数组并重新填充
    messages.length = 0;
    messages.push(...filteredMessages);
  }

  private async processToolCalls(responseText: string): Promise<ChatResponse> {
    const toolCalls: ToolCall[] = [];
    let finalResponse = responseText;

    if (!ToolCallDetector.hasToolCalls(responseText)) {
      return { content: finalResponse };
    }

    try {
      const jsonMatches = ToolCallDetector.extractToolCalls(responseText);

      for (const match of jsonMatches) {
        const toolCall = JsonParser.parseToolCall(match);

        if (toolCall && toolCall.tool && toolCall.arguments !== undefined) {
          toolCalls.push(toolCall);

          // 执行工具调用
          const result = await this.mcpManager.callTool(toolCall.tool, toolCall.arguments);

          if (result.success) {
            const toolResult = ToolResultProcessor.processResult(result.content);
            finalResponse = finalResponse.replace(match,
              `\n\n**Tool Result (${toolCall.tool}):**\n${toolResult}\n\n`
            );
          } else {
            finalResponse = finalResponse.replace(match,
              `\n\n**Tool Error (${toolCall.tool}):** ${result.error}\n\n`
            );
          }
        }
      }
    } catch (error) {
      console.error('Error processing MCP tool calls:', error);
    }

    return {
      content: finalResponse,
      ...(toolCalls.length > 0 && { toolCalls })
    };
  }
}

// 简化的导出函数
export async function chatWithMCPSimple(
  message: string,
  mcpManager: MCPManager,
  history: ChatMessage[] = []
): Promise<ChatResponse> {
  const chat = new LangGraphMCPChat(mcpManager);
  return await chat.chat(message, history);
}
