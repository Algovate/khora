import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { getApiKey } from './config.js';

export function createModel(modelName: string = 'gemini-2.5-flash'): ChatGoogleGenerativeAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Missing API key. Set GOOGLE_API_KEY or run login.');
  }
  return new ChatGoogleGenerativeAI({ model: modelName, apiKey });
}

export async function invokeChatModel(messages: BaseMessage[], modelName?: string): Promise<BaseMessage> {
  const model = createModel(modelName);
  return await model.invoke(messages);
}

export function toLangChainMessages(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]): BaseMessage[] {
  const out: BaseMessage[] = [];
  let systemUsed = false;
  for (const m of messages) {
    if (m.role === 'system') {
      if (!systemUsed) {
        out.push(new SystemMessage(m.content));
        systemUsed = true;
      } else {
        // Some models require the system message to be first; coerce later system messages
        out.push(new AIMessage(m.content));
      }
      continue;
    }
    if (m.role === 'assistant') {
      out.push(new AIMessage(m.content));
      continue;
    }
    out.push(new HumanMessage(m.content));
  }
  return out;
}

export function extractTextFromContent(content: unknown): string {
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
