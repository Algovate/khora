# Khora API Reference

## Configuration API

### `getModel(): string`

Get the currently configured model name.

**Returns**: Model name (default: `x-ai/grok-4-fast:free`)

**Example**:
```typescript
import { getModel } from './core/config.js';

const model = getModel();
console.log(model);  // "x-ai/grok-4-fast:free"
```

### `setModel(model: string): void`

Set the AI model to use.

**Parameters**:
- `model` - Model name from `AVAILABLE_CHAT_MODELS`

**Example**:
```typescript
import { setModel } from './core/config.js';

setModel('anthropic/claude-3.5-sonnet');
```

### `getApiKey(): string | undefined`

Get the OpenRouter API key.

**Returns**: API key or undefined

**Sources** (in order):
1. `KHORA_API_KEY` environment variable
2. `OPENROUTER_API_KEY` environment variable
3. Config file `~/.khora/config.json`

**Example**:
```typescript
import { getApiKey } from './core/config.js';

const key = getApiKey();
if (!key) {
  console.error('No API key found');
}
```

### `setApiKey(apiKey: string): void`

Store API key in config file.

**Parameters**:
- `apiKey` - OpenRouter API key

**Example**:
```typescript
import { setApiKey } from './core/config.js';

setApiKey('sk-or-v1-...');
```

### `readConfig(): AppConfig`

Read configuration from file (cached).

**Returns**: `AppConfig` object

### `writeConfig(config: AppConfig): void`

Write configuration to file and update cache.

**Parameters**:
- `config` - Complete configuration object

### `clearConfigCache(): void`

Clear the in-memory configuration cache.

**Use when**: Config file modified externally

## AI Model API

### `createModel(modelName?: string): ChatOpenAI`

Create a ChatOpenAI instance for the specified model.

**Parameters**:
- `modelName` (optional) - Model to use (default from config)

**Returns**: Configured ChatOpenAI instance

**Throws**: Error if API key missing

**Example**:
```typescript
import { createModel } from './ai/ai.js';
import { HumanMessage } from '@langchain/core/messages';

const model = createModel();
const response = await model.invoke([
  new HumanMessage('Hello!')
]);
```

### `createOpenRouterModel(config: ModelConfig): ChatOpenAI`

Create a ChatOpenAI instance with custom configuration.

**Parameters**:
```typescript
interface ModelConfig {
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
}
```

**Returns**: Configured ChatOpenAI instance

**Example**:
```typescript
import { createOpenRouterModel } from './ai/modelFactory.js';

const model = createOpenRouterModel({
  modelName: 'anthropic/claude-3-opus',
  temperature: 0.5,
  maxTokens: 4096,
});
```

### `invokeChatModel(messages: BaseMessage[], modelName?: string): Promise<BaseMessage>`

Simple chat invocation without MCP tools.

**Parameters**:
- `messages` - Array of LangChain messages
- `modelName` (optional) - Override default model

**Returns**: AI response message

**Example**:
```typescript
import { invokeChatModel } from './ai/ai.js';
import { HumanMessage } from '@langchain/core/messages';

const response = await invokeChatModel([
  new HumanMessage('What is TypeScript?')
]);
```

### `toLangChainMessages(messages): BaseMessage[]`

Convert simple message format to LangChain format.

**Parameters**:
```typescript
messages: Array<{
  role: string;
  content: string;
}>
```

**Returns**: Array of LangChain `BaseMessage`

## MCP API

### `chatWithMCPSimple(message, mcpManager, history): Promise<ChatResponse>`

Chat with MCP tool support.

**Parameters**:
- `message` - User message string
- `mcpManager` - MCPManager instance
- `history` - Previous chat messages

**Returns**:
```typescript
interface ChatResponse {
  content: string;
  toolCalls?: ToolCall[];
}
```

**Example**:
```typescript
import { chatWithMCPSimple } from './ai/langgraph-mcp.js';
import { MCPManager } from './mcp/mcp.js';

const mcpManager = new MCPManager();
const response = await chatWithMCPSimple(
  'List files in current directory',
  mcpManager,
  []
);
```

### `class LangGraphMCPChat`

Main chat class with MCP integration.

**Constructor**:
```typescript
constructor(mcpManager: MCPManager, modelName?: string)
```

**Methods**:
- `chat(message: string, history: ChatMessage[]): Promise<ChatResponse>`

**Example**:
```typescript
import { LangGraphMCPChat } from './ai/langgraph-mcp.js';
import { MCPManager } from './mcp/mcp.js';

const mcpManager = new MCPManager();
const chat = new LangGraphMCPChat(mcpManager);

const response = await chat.chat('Hello!', []);
```

## Constants

### `OPENROUTER_CONFIG`

OpenRouter configuration constants.

```typescript
{
  baseURL: 'https://openrouter.ai/api/v1',
  defaultModel: 'x-ai/grok-4-fast:free',
  temperature: 0.7,
  siteName: 'Khora',
  siteUrl: 'https://github.com/your-org/khora',
}
```

### `AVAILABLE_CHAT_MODELS`

Array of supported model names.

```typescript
const AVAILABLE_CHAT_MODELS = [
  'x-ai/grok-4-fast:free',
  'anthropic/claude-3.5-sonnet',
  // ... more models
] as const;
```

### `ERROR_MESSAGES`

Standard error messages.

```typescript
const ERROR_MESSAGES = {
  MISSING_API_KEY: 'Missing API key...',
  NO_HTML_BLOCK: 'No HTML code block found...',
  // ... more errors
}
```

## Types

### `AppConfig`

```typescript
type AppConfig = {
  apiKey?: string;
  model?: string;
  mcpServers?: MCPServerConfig[];
}
```

### `ModelConfig`

```typescript
interface ModelConfig {
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
}
```

### `ChatResponse`

```typescript
interface ChatResponse {
  content: string;
  toolCalls?: ToolCall[];
}
```

## Error Handling

### `KhoraError`

Base error class for all Khora errors.

```typescript
class KhoraError extends Error {
  constructor(message: string, code: string, context?: Record<string, any>)
}
```

### Error Types

- `ConfigError` - Configuration errors
- `APIKeyError` - API key issues
- `ModelError` - Model-related errors
- `MCPError` - MCP protocol errors

### `formatError(error: unknown): string`

Format any error for display.

**Example**:
```typescript
import { formatError } from './utils/errorHandler.js';

try {
  // ... operation
} catch (error) {
  console.error(formatError(error));
}
```

## Usage Examples

### Basic Chat

```typescript
import { createModel } from './ai/ai.js';
import { HumanMessage } from '@langchain/core/messages';

const model = createModel('x-ai/grok-4-fast:free');
const response = await model.invoke([
  new HumanMessage('Explain async/await')
]);
console.log(response.content);
```

### With Custom Config

```typescript
import { createOpenRouterModel } from './ai/modelFactory.js';

const model = createOpenRouterModel({
  modelName: 'anthropic/claude-3-opus',
  temperature: 0.3,  // More focused
  maxTokens: 2048,
});
```

### MCP Tool Integration

```typescript
import { LangGraphMCPChat } from './ai/langgraph-mcp.js';
import { MCPManager } from './mcp/mcp.js';

const mcpManager = new MCPManager();
await mcpManager.connectAllServers();

const chat = new LangGraphMCPChat(mcpManager);
const response = await chat.chat('List my files', []);

console.log(response.content);
if (response.toolCalls) {
  console.log('Tools used:', response.toolCalls.length);
}
```

## Best Practices

1. **Use Type-Safe APIs**: Import types for better IDE support
2. **Handle Errors**: Always catch and handle errors
3. **Cache Config**: Don't read config repeatedly
4. **Reuse Models**: Create model once, use multiple times
5. **Validate Input**: Check user input before processing

## Migration from Old Code

If you have old code using Google Gemini:

```typescript
// Old (Google Gemini)
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash',
  apiKey: process.env.GOOGLE_API_KEY
});

// New (OpenRouter)
import { createModel } from './ai/ai.js';

const model = createModel('google/gemini-pro');  // Gemini via OpenRouter
```

## See Also

- [Configuration Guide](docs/CONFIGURATION.md)
- [Model Reference](docs/MODELS.md)
- [Architecture](docs/ARCHITECTURE.md)
