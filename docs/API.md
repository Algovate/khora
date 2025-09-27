---
noteId: "b5cf0b509b9611f095e0d72f6d8375ed"
tags: []

---

# Khora API 文档

## 核心 API

### AI 模块

#### `createModel(modelName?: string): ChatGoogleGenerativeAI`
创建 Google AI 模型实例。

**参数:**
- `modelName`: 模型名称，默认为 'gemini-2.5-flash'

**返回:**
- `ChatGoogleGenerativeAI` 实例

#### `invokeChatModel(messages: BaseMessage[], modelName?: string): Promise<BaseMessage>`
调用 AI 模型进行聊天。

**参数:**
- `messages`: LangChain 消息数组
- `modelName`: 可选的模型名称

**返回:**
- Promise<BaseMessage> AI 响应

#### `toLangChainMessages(messages: ChatMessage[]): BaseMessage[]`
转换消息格式为 LangChain 格式。

**参数:**
- `messages`: 应用消息数组

**返回:**
- LangChain 消息数组

### LangGraph MCP 模块

#### `LangGraphMCPChat`
主要的 MCP 聊天类。

**构造函数:**
```typescript
constructor(mcpManager: MCPManager, modelName?: string)
```

**方法:**
- `chat(message: string, history: ChatMessage[]): Promise<ChatResponse>`

#### `chatWithMCPSimple(message: string, mcpManager: MCPManager, history: ChatMessage[]): Promise<ChatResponse>`
简化的 MCP 聊天接口。

**参数:**
- `message`: 用户消息
- `mcpManager`: MCP 管理器
- `history`: 聊天历史

**返回:**
- Promise<ChatResponse> 聊天响应

### MCP 模块

#### `MCPManager`
MCP 客户端管理器。

**方法:**
- `addServer(server: MCPServer)`: 添加 MCP 服务器
- `removeServer(name: string)`: 移除 MCP 服务器
- `connectServer(name: string)`: 连接 MCP 服务器
- `disconnectServer(name: string)`: 断开 MCP 服务器
- `getTools()`: 获取可用工具
- `callTool(toolName: string, arguments: any)`: 调用工具

### 配置模块

#### `getApiKey(): string | undefined`
获取 Google API 密钥。

#### `setApiKey(apiKey: string): void`
设置 Google API 密钥。

#### `getMCPServers(): MCPServerConfig[]`
获取 MCP 服务器配置。

#### `setMCPServers(servers: MCPServerConfig[]): void`
设置 MCP 服务器配置。

### 命令模块

#### `CommandHandler`
命令处理器。

**构造函数:**
```typescript
constructor(context: CommandContext, mcpManager?: MCPManager)
```

**方法:**
- `handleCommand(command: string): Promise<boolean>`

## 类型定义

### 基础类型

```typescript
interface ChatMessage {
  role: string;
  content: string;
}

interface ChatResponse {
  content: string;
  toolCalls?: ToolCall[];
}

interface ToolCall {
  tool: string;
  arguments: Record<string, any>;
}
```

### MCP 类型

```typescript
interface MCPServer {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  enabled: boolean;
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema?: any;
}
```

### 配置类型

```typescript
interface AppConfig {
  apiKey?: string;
  mcpServers?: MCPServerConfig[];
}

interface MCPServerConfig {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  enabled: boolean;
}
```

## 使用示例

### 基础聊天

```typescript
import { invokeChatModel, toLangChainMessages } from './ai/ai.js';

const messages = toLangChainMessages([
  { role: 'user', content: 'Hello!' }
]);

const response = await invokeChatModel(messages);
console.log(response.content);
```

### MCP 工具聊天

```typescript
import { chatWithMCPSimple } from './ai/langgraph-mcp.js';
import { MCPManager } from './mcp/mcp.js';

const mcpManager = new MCPManager();
await mcpManager.connectAllServers();

const response = await chatWithMCPSimple(
  '列出当前目录的文件',
  mcpManager,
  []
);

console.log(response.content);
if (response.toolCalls) {
  console.log('使用的工具:', response.toolCalls);
}
```

### 命令处理

```typescript
import { CommandHandler } from './core/commands.js';

const context = {
  messages: [],
  setMessages: (fn) => {},
  setIsThinking: (fn) => {},
  setInput: (fn) => {},
  modelName: 'gemini-2.5-flash'
};

const handler = new CommandHandler(context, mcpManager);
const handled = await handler.handleCommand('/help');
```

## 错误处理

### 常见错误类型

1. **API 密钥错误**: `Missing API key`
2. **MCP 连接错误**: `Failed to connect to MCP server`
3. **工具调用错误**: `Tool execution failed`
4. **配置错误**: `Invalid configuration`

### 错误处理最佳实践

```typescript
try {
  const response = await chatWithMCPSimple(message, mcpManager, history);
  // 处理成功响应
} catch (error) {
  if (error.message.includes('Missing API key')) {
    // 处理 API 密钥错误
  } else if (error.message.includes('MCP')) {
    // 处理 MCP 错误
  } else {
    // 处理其他错误
  }
}
```

## 性能优化

### 1. 模型缓存
```typescript
const model = createModel('gemini-2.5-flash');
// 重用模型实例
```

### 2. 工具结果缓存
```typescript
// 在 MCPManager 中实现缓存
const cachedResult = cache.get(toolName, arguments);
if (cachedResult) {
  return cachedResult;
}
```

### 3. 异步处理
```typescript
// 并行处理多个工具调用
const results = await Promise.all(
  toolCalls.map(call => mcpManager.callTool(call.tool, call.arguments))
);
```
