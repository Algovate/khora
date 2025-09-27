---
noteId: "aa961e909b9611f095e0d72f6d8375ed"
tags: []

---

# Khora 架构文档

## 项目结构

```
src/
├── ai/                    # AI 相关模块
│   ├── ai.ts             # 基础 AI 功能
│   └── langgraph-mcp.ts  # LangGraph MCP 集成
├── core/                  # 核心功能模块
│   ├── commands.ts       # 命令处理
│   ├── config.ts         # 配置管理
│   ├── constants.ts      # 常量定义
│   ├── generator.ts      # 代码生成
│   └── prompts.ts        # 提示词模板
├── mcp/                   # MCP 协议模块
│   └── mcp.ts            # MCP 客户端管理
├── types/                 # 类型定义
│   ├── types.ts          # 基础类型
│   └── generation.ts     # 代码生成类型
├── ui/                    # 用户界面模块
│   ├── App.tsx           # 主应用组件
│   └── Logo.tsx          # Logo 组件
├── utils/                 # 工具函数
│   ├── codeDetection.ts  # 代码检测
│   ├── fileOperations.ts # 文件操作
│   ├── progress.ts       # 进度显示
│   ├── validation.ts     # 验证工具
│   └── utils.ts          # 通用工具
└── bin/                   # 可执行文件
    └── khora.tsx         # 主入口
```

## 模块职责

### AI 模块 (`src/ai/`)
- **ai.ts**: 基础 AI 模型调用功能
- **langgraph-mcp.ts**: LangGraph 集成的 MCP 工具调用

### 核心模块 (`src/core/`)
- **commands.ts**: 处理所有命令行指令
- **config.ts**: 管理应用配置和会话
- **constants.ts**: 定义应用常量
- **generator.ts**: 代码生成核心逻辑
- **prompts.ts**: AI 提示词模板

### MCP 模块 (`src/mcp/`)
- **mcp.ts**: MCP 客户端管理和工具调用

### 类型模块 (`src/types/`)
- **types.ts**: 基础类型定义
- **generation.ts**: 代码生成相关类型

### UI 模块 (`src/ui/`)
- **App.tsx**: 主应用界面
- **Logo.tsx**: 应用 Logo 组件

### 工具模块 (`src/utils/`)
- **codeDetection.ts**: 代码语言检测
- **fileOperations.ts**: 文件操作工具
- **progress.ts**: 进度显示工具
- **validation.ts**: 数据验证工具
- **utils.ts**: 通用工具函数

## 设计原则

### 1. 模块化
- 每个模块职责单一
- 模块间依赖清晰
- 易于测试和维护

### 2. 类型安全
- 完整的 TypeScript 类型定义
- 严格的类型检查
- 良好的 IDE 支持

### 3. 可扩展性
- 插件化的 MCP 工具系统
- 模块化的命令处理
- 可配置的 AI 模型

### 4. 错误处理
- 统一的错误处理机制
- 优雅的降级处理
- 详细的错误日志

## 数据流

### 1. 用户输入处理
```
用户输入 → App.tsx → CommandHandler → 具体命令处理
```

### 2. AI 聊天处理
```
用户消息 → LangGraphMCPChat → AI 模型 → 工具调用 → 结果返回
```

### 3. MCP 工具调用
```
AI 请求 → ToolCallDetector → JsonParser → MCPManager → 工具执行
```

## 配置管理

### 配置文件
- `config.json`: 应用配置
- `sessions/`: 会话存储目录

### 环境变量
- `GOOGLE_API_KEY`: Google AI API 密钥

## 扩展指南

### 添加新的 MCP 工具
1. 在 `src/mcp/mcp.ts` 中注册服务器
2. 工具会自动被 LangGraph 集成

### 添加新的命令
1. 在 `src/core/commands.ts` 中添加命令处理
2. 更新帮助文档

### 添加新的 AI 功能
1. 在 `src/ai/` 中创建新模块
2. 在 `src/ui/App.tsx` 中集成

## 性能考虑

### 1. 模块懒加载
- 按需加载大型模块
- 减少启动时间

### 2. 缓存策略
- 配置缓存
- 会话缓存
- 工具结果缓存

### 3. 内存管理
- 及时清理资源
- 避免内存泄漏

## 测试策略

### 1. 单元测试
- 每个工具类独立测试
- 模拟外部依赖

### 2. 集成测试
- 测试完整工作流
- 端到端测试

### 3. 性能测试
- 工具调用性能
- 内存使用监控
