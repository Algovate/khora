import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { getApiKey } from '../core/config.js';

// 创建 AI 模型
export function createModel(modelName: string = 'gemini-2.5-flash'): ChatGoogleGenerativeAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Missing API key. Set GOOGLE_API_KEY or run login.');
  }
  return new ChatGoogleGenerativeAI({ model: modelName, apiKey });
}

// 基础聊天模型调用（无 MCP 工具）
export async function invokeChatModel(messages: BaseMessage[], modelName?: string): Promise<BaseMessage> {
  const model = createModel(modelName);
  return await model.invoke(messages);
}

// 转换消息格式
export function toLangChainMessages(messages: Array<{ role: string; content: string }>): BaseMessage[] {
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

// 提取文本内容
export function extractTextFromContent(content: any): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n');
  }

  return String(content);
}