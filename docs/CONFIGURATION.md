---
noteId: "9e7286e09e0b11f0a41d3b09a1eeeceb"
tags: []

---

# Khora Configuration Guide

## Overview

Khora uses OpenRouter as its AI provider, giving you access to multiple high-quality AI models including xAI Grok, Claude, GPT-4, Gemini, and Llama through a single unified API.

## Default Model

**Model**: `x-ai/grok-4-fast:free`  
**Provider**: xAI via OpenRouter  
**Cost**: Free  
**Best for**: Fast responses, general purpose, getting started

## Supported Models

See [MODELS.md](MODELS.md) for complete model comparison.

### Quick List
- `x-ai/grok-4-fast:free` ⭐ **DEFAULT** - Fast, free
- `x-ai/grok-beta` - Beta version
- `anthropic/claude-3.5-sonnet` - Best quality/cost
- `anthropic/claude-3-opus` - Highest quality
- `openai/gpt-4-turbo` - Latest GPT-4
- `openai/gpt-3.5-turbo` - Fast and cheap
- `google/gemini-2.0-flash-exp` - Latest experimental
- `meta-llama/llama-3-70b-instruct` - Open source

## Getting Started

### 1. Get an OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up (free)
3. Create an API key
4. Copy it (starts with `sk-or-v1-...`)

### 2. Set Your API Key

```bash
export KHORA_API_KEY="sk-or-v1-..."
```

Or:

```bash
export OPENROUTER_API_KEY="sk-or-v1-..."
```

**Make permanent** (add to `~/.zshrc` or `~/.bashrc`):

```bash
echo 'export KHORA_API_KEY="sk-or-v1-your-key"' >> ~/.zshrc
source ~/.zshrc
```

### 3. Start Khora

```bash
khora
```

## Configuration Commands

### Set Model

```bash
/set-model x-ai/grok-4-fast:free
```

See all available models:

```bash
/set-model
```

### View Configuration

```bash
/get-config
```

Shows:
- Provider (OpenRouter)
- Current model
- API key (masked)

### Interactive Model Picker

```bash
/model
```

Use ↑/↓ arrows, Enter to select, Esc to cancel.

## Configuration File

**Location**: `~/.khora/config.json`

```json
{
  "model": "x-ai/grok-4-fast:free",
  "apiKey": "sk-or-v1-...",
  "mcpServers": []
}
```

### Manual Editing

You can manually edit the config file:

```bash
nano ~/.khora/config.json
```

After editing, restart Khora or run `/get-config` to verify.

## Examples

### Using Default Free Model

```bash
khora
> /get-config

⚙️ Current Configuration:
Provider: OpenRouter
Model: x-ai/grok-4-fast:free
API Key: sk-or-v1...
```

### Switch to Claude

```bash
> /set-model anthropic/claude-3.5-sonnet
✅ Model set to: anthropic/claude-3.5-sonnet
```

### Switch Back to Free

```bash
> /set-model x-ai/grok-4-fast:free
✅ Model set to: x-ai/grok-4-fast:free
```

### Try Different Models

```bash
# Fast and free
/set-model x-ai/grok-4-fast:free

# Best quality
/set-model anthropic/claude-3-opus

# Cost effective
/set-model openai/gpt-3.5-turbo

# Latest experimental
/set-model google/gemini-2.0-flash-exp
```

## Troubleshooting

### "Missing API key" Error

**Solution**:
```bash
export KHORA_API_KEY="sk-or-v1-..."
```

Then restart Khora.

### 401 Authentication Error

**Causes**:
- API key not set
- Invalid API key format
- Extra spaces in environment variable

**Solution**:
1. Verify API key: `echo $KHORA_API_KEY`
2. Should start with `sk-or-v1-`
3. Re-export without spaces

### 404 Model Not Found

**Causes**:
- Model name typo (case-sensitive)
- Model not available on OpenRouter

**Solution**:
1. Check spelling: `/set-model`
2. View available models: [OpenRouter Models](https://openrouter.ai/models)
3. Try default: `/set-model x-ai/grok-4-fast:free`

### Config Changes Not Taking Effect

**Solution**:
- Restart Khora (config cache clears on start)
- Or manually clear cache in code

## Advanced Configuration

### Environment Variables

```bash
# Primary (recommended)
export KHORA_API_KEY="sk-or-v1-..."

# Alternative
export OPENROUTER_API_KEY="sk-or-v1-..."

# Both work, KHORA_API_KEY takes precedence
```

### Programmatic Configuration

```typescript
import { setModel, getModel, setApiKey } from './core/config.js';

// Set model
setModel('anthropic/claude-3.5-sonnet');

// Get current model
const model = getModel();

// Set API key
setApiKey('sk-or-v1-...');
```

### Custom Model Factory

```typescript
import { createOpenRouterModel } from './ai/modelFactory.js';

const model = createOpenRouterModel({
  modelName: 'anthropic/claude-3-opus',
  temperature: 0.5,    // More focused
  maxTokens: 4096,     // Limit response length
});
```

## Best Practices

1. **Start Free** - Use `x-ai/grok-4-fast:free` initially
2. **Monitor Usage** - Check OpenRouter dashboard
3. **Secure API Key** - Never commit to version control
4. **Use .env Files** - For project-specific keys
5. **Match Model to Task** - Don't use expensive models for simple tasks

## MCP Server Configuration

See [MCP_INTEGRATION.md](MCP_INTEGRATION.md) for complete guide.

**Quick example**:
```bash
/mcp-add {"name": "filesystem", "command": "npx", "args": ["@modelcontextprotocol/server-filesystem", "/path"], "enabled": true}
```

## Cost Management

### Free Tier Strategy
1. Start with `x-ai/grok-4-fast:free`
2. Use for learning and testing
3. Upgrade when needed

### Paid Model Strategy
1. Use `gpt-3.5-turbo` for high volume
2. Use `claude-3.5-sonnet` for quality
3. Reserve `claude-3-opus` for critical tasks

### Monitor Costs
- Check [OpenRouter Dashboard](https://openrouter.ai/dashboard)
- Set spending limits
- Review usage weekly

## Support

- **Khora Issues**: [GitHub](https://github.com/your-org/khora/issues)
- **OpenRouter Support**: [openrouter.ai/support](https://openrouter.ai/support)
- **Documentation**: [docs/](.)

## See Also

- [Model Reference](MODELS.md) - Detailed model comparison
- [Quick Start](QUICKSTART.md) - Get started fast
- [MCP Integration](MCP_INTEGRATION.md) - Advanced tool integration
- [API Reference](API.md) - Programming interface
