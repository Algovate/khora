import { StateGraph, MessagesAnnotation, END } from '@langchain/langgraph';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { HTML_SYSTEM_PROMPT } from './prompts.js';
import { getApiKey } from './config.js';

function createModel(modelName: string = 'gemini-1.5-flash'): ChatGoogleGenerativeAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Missing API key. Set GOOGLE_API_KEY or run login.');
  }
  return new ChatGoogleGenerativeAI({ model: modelName, apiKey });
}

export function createChatGraph(modelName?: string) {
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

export async function generateSingleHtmlPage(modelName: string, prompt: string): Promise<string> {
  const graph = createChatGraph(modelName);
  const sys = new SystemMessage(HTML_SYSTEM_PROMPT);
  const res = await graph.invoke({ messages: [sys, new HumanMessage(prompt)] });
  const last = (res as any)?.messages?.slice(-1)[0];
  const html = extractTextFromContent(last?.content);
  return html.trim();
}