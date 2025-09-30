---
noteId: "7b1abed09e0911f0a41d3b09a1eeeceb"
tags: []

---


# MCP (Model Context Protocol) 集成

Khora 现在支持 MCP (Model Context Protocol)，允许您连接外部工具和数据源。

## 功能特性

- 🔌 支持多个 MCP 服务器连接
- 🛠️ 动态工具发现和调用
- ⚙️ 灵活的服务器配置管理
- 🔄 自动连接和断开管理
- 📋 实时状态监控
- 🤖 **AI 自动工具调用** - AI 可以在聊天中自动使用 MCP 工具
- 🔧 **智能工具集成** - 工具调用结果自动集成到 AI 回复中

## 可用命令

### MCP 管理命令

- `/mcp` - 显示 MCP 帮助信息
- `/mcp-list` - 列出配置的 MCP 服务器
- `/mcp-connect <name>` - 连接到指定的 MCP 服务器
- `/mcp-disconnect <name>` - 断开指定的 MCP 服务器
- `/mcp-tools` - 列出所有可用的 MCP 工具
- `/mcp-call <tool> [args]` - 调用指定的 MCP 工具
- `/mcp-add <config>` - 添加新的 MCP 服务器配置
- `/mcp-remove <name>` - 删除 MCP 服务器配置

## 配置示例

### 添加文件系统服务器

```bash
/mcp-add {"name": "filesystem", "command": "npx", "args": ["@modelcontextprotocol/server-filesystem", "/tmp"], "enabled": true}
```

### 添加数据库服务器

```bash
/mcp-add {"name": "database", "command": "npx", "args": ["@modelcontextprotocol/server-sqlite", "/path/to/database.db"], "enabled": true}
```

### 添加 Git 服务器

```bash
/mcp-add {"name": "git", "command": "npx", "args": ["@modelcontextprotocol/server-git", "/path/to/repo"], "enabled": true}
```

## 使用示例

### 1. 查看配置的服务器

```bash
/mcp-list
```

### 2. 连接到服务器

```bash
/mcp-connect filesystem
```

### 3. 查看可用工具

```bash
/mcp-tools
```

### 4. 调用工具

```bash
/mcp-call filesystem_read_file {"path": "/path/to/file.txt"}
```

### 5. 在聊天中使用 MCP 工具

AI 现在可以自动使用 MCP 工具来回答您的问题：

**示例对话：**
```
用户: 请读取 /tmp/test.txt 文件的内容

AI: 我来帮您读取文件内容。

{"tool": "read_text_file", "arguments": {"path": "/tmp/test.txt"}}

**Tool Result (read_text_file):**
这是文件的内容...

🔧 Used MCP tools:
- read_text_file
```

**更多示例：**
- "列出 /tmp 目录下的所有文件"
- "创建一个名为 test.txt 的文件，内容为 'Hello World'"
- "搜索包含 'test' 的文件"
- "获取 /tmp/test.txt 文件的详细信息"

## 配置文件

MCP 服务器配置保存在 `~/.khora/config.json` 中：

```json
{
  "apiKey": "your-api-key",
  "mcpServers": [
    {
      "name": "filesystem",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/tmp"],
      "enabled": true,
      "env": {}
    }
  ]
}
```

## 支持的 MCP 服务器

Khora 支持任何符合 MCP 标准的服务器，包括：

- **文件系统服务器** - 文件读写操作
- **数据库服务器** - SQL 查询执行
- **Git 服务器** - 版本控制操作
- **Web 服务器** - HTTP 请求
- **自定义服务器** - 您自己开发的 MCP 服务器

## 故障排除

### 连接失败

1. 检查服务器命令是否正确
2. 确认服务器已安装并可执行
3. 检查环境变量配置
4. 查看错误日志

### 工具调用失败

1. 确认服务器已连接
2. 检查工具名称是否正确
3. 验证参数格式
4. 查看工具文档

## 开发自定义 MCP 服务器

要开发自定义 MCP 服务器，请参考 [MCP 官方文档](https://modelcontextprotocol.io/)。

### 基本结构

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

const server = new Server({
  name: 'my-server',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
});

// 注册工具
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'my_tool',
        description: 'My custom tool',
        inputSchema: {
          type: 'object',
          properties: {
            param: { type: 'string' }
          }
        }
      }
    ]
  };
});

// 启动服务器
server.connect({
  reader: process.stdin,
  writer: process.stdout
});
```

## 安全注意事项

- 只连接可信的 MCP 服务器
- 定期审查服务器配置
- 使用最小权限原则
- 监控工具调用日志

## 性能优化

- 合理配置服务器数量
- 及时断开不使用的连接
- 使用连接池管理
- 监控资源使用情况
