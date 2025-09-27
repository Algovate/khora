---
noteId: "c1cd6af09b9611f095e0d72f6d8375ed"
tags: []

---

# 开发指南

## 开发环境设置

### 1. 安装依赖
```bash
npm install
```

### 2. 设置环境变量
```bash
export GOOGLE_API_KEY="your-api-key"
```

### 3. 编译项目
```bash
npm run build
```

### 4. 运行应用
```bash
npm start
```

## 开发工作流

### 1. 代码结构
- 遵循模块化设计原则
- 保持单一职责
- 使用 TypeScript 严格模式

### 2. 代码风格
- 使用 ESLint 和 Prettier
- 遵循命名约定
- 添加适当的注释

### 3. 测试策略
- 单元测试覆盖核心功能
- 集成测试验证工作流
- 性能测试确保响应时间

## 添加新功能

### 1. 添加新的 MCP 工具

#### 步骤 1: 配置 MCP 服务器
```typescript
// 在 config.json 中添加
{
  "mcpServers": [
    {
      "name": "new-tool",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-new-tool"],
      "enabled": true
    }
  ]
}
```

#### 步骤 2: 测试工具连接
```bash
npm run dev
# 在应用中测试: /mcp-list
```

#### 步骤 3: 在聊天中使用
```typescript
// 工具会自动被 LangGraph 集成
// 用户可以直接在聊天中使用
```

### 2. 添加新的命令

#### 步骤 1: 在 commands.ts 中添加处理逻辑
```typescript
case '/new-command':
  return await this.handleNewCommand(parts);
```

#### 步骤 2: 实现命令处理函数
```typescript
private async handleNewCommand(parts: string[]): Promise<boolean> {
  // 实现命令逻辑
  return true;
}
```

#### 步骤 3: 更新帮助文档
```typescript
// 在 /help 命令中添加新命令说明
```

### 3. 添加新的 AI 功能

#### 步骤 1: 创建新的 AI 模块
```typescript
// src/ai/new-feature.ts
export class NewAIFeature {
  // 实现功能
}
```

#### 步骤 2: 在 App.tsx 中集成
```typescript
import { NewAIFeature } from '../ai/new-feature.js';
```

#### 步骤 3: 添加配置选项
```typescript
// 在 constants.ts 中添加配置
export const NEW_FEATURE_CONFIG = {
  // 配置选项
};
```

## 调试技巧

### 1. 启用调试日志
```typescript
// 在相关模块中添加
console.log('Debug info:', data);
```

### 2. 使用断点
- 在 VS Code 中设置断点
- 使用 `debugger` 语句

### 3. 检查 MCP 连接
```bash
# 检查 MCP 服务器状态
/mcp-list

# 测试工具调用
/mcp-call tool_name {"arg": "value"}
```

### 4. 验证 AI 响应
```typescript
// 在 LangGraphMCPChat 中添加日志
console.log('AI Response:', response);
console.log('Tool Calls:', toolCalls);
```

## 性能优化

### 1. 减少不必要的重新渲染
```typescript
// 使用 React.memo 包装组件
const MemoizedComponent = React.memo(Component);
```

### 2. 优化工具调用
```typescript
// 批量处理工具调用
const results = await Promise.all(toolCalls.map(call => 
  mcpManager.callTool(call.tool, call.arguments)
));
```

### 3. 缓存配置
```typescript
// 缓存 MCP 工具列表
const tools = useMemo(() => mcpManager.getTools(), [mcpManager]);
```

## 错误处理

### 1. 统一错误处理
```typescript
try {
  // 操作
} catch (error) {
  console.error('Operation failed:', error);
  // 优雅降级
}
```

### 2. 用户友好的错误消息
```typescript
const errorMessage = error instanceof Error 
  ? error.message 
  : 'An unexpected error occurred';
```

### 3. 错误恢复
```typescript
// 实现重试机制
const retry = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};
```

## 测试

### 1. 单元测试
```typescript
// tests/unit/ai.test.ts
import { createModel } from '../src/ai/ai.js';

describe('AI Module', () => {
  test('should create model', () => {
    const model = createModel('gemini-2.5-flash');
    expect(model).toBeDefined();
  });
});
```

### 2. 集成测试
```typescript
// tests/integration/mcp.test.ts
import { MCPManager } from '../src/mcp/mcp.js';

describe('MCP Integration', () => {
  test('should connect to server', async () => {
    const manager = new MCPManager();
    await manager.connectServer('filesystem');
    expect(manager.getServerStatus()).toBeDefined();
  });
});
```

### 3. 运行测试
```bash
npm test
```

## 部署

### 1. 构建生产版本
```bash
npm run build
```

### 2. 检查构建结果
```bash
ls -la dist/
```

### 3. 测试生产版本
```bash
node dist/bin/khora.js
```

## 贡献指南

### 1. 代码提交
- 使用清晰的提交信息
- 遵循约定式提交规范
- 确保所有测试通过

### 2. 代码审查
- 检查代码质量
- 验证功能正确性
- 确保文档更新

### 3. 发布流程
- 更新版本号
- 更新 CHANGELOG
- 创建发布标签

## 常见问题

### Q: MCP 服务器连接失败
A: 检查服务器配置和网络连接，确保服务器可执行。

### Q: AI 响应慢
A: 检查网络连接和 API 密钥，考虑使用缓存。

### Q: 工具调用失败
A: 检查工具参数格式和服务器状态。

### Q: 编译错误
A: 检查 TypeScript 类型定义和导入路径。
