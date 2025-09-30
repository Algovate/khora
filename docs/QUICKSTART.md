---
noteId: "b6938c709e0a11f0a41d3b09a1eeeceb"
tags: []

---

# Khora Quick Start Guide

Get up and running with Khora in 5 minutes!

## Step 1: Install

```bash
npm install -g khora
```

## Step 2: Get API Key

1. Go to [OpenRouter.ai](https://openrouter.ai/)
2. Sign up (free)
3. Create an API key
4. Copy it (starts with `sk-or-v1-...`)

## Step 3: Set API Key

```bash
export KHORA_API_KEY="sk-or-v1-your-key-here"
```

**Make it permanent** (add to `~/.zshrc` or `~/.bashrc`):

```bash
echo 'export KHORA_API_KEY="sk-or-v1-your-key-here"' >> ~/.zshrc
source ~/.zshrc
```

## Step 4: Run Khora

```bash
khora
```

You should see:

```
 Welcome to khora ⚡  Type `/help` for commands, `/q` to quit.
```

## Step 5: Try It Out!

### Generate a Website

```bash
> /gen-html Create a portfolio website with dark theme
```

Khora will generate a complete HTML file with CSS and JavaScript!

### Chat with AI

```bash
> How do I center a div in CSS?
```

### Check Your Setup

```bash
> /get-config
```

Should show:
```
⚙️ Current Configuration:
Provider: OpenRouter
Model: x-ai/grok-4-fast:free
API Key: sk-or-v1...
```

## Common Commands

| Command | What it does |
|---------|-------------|
| `/help` | Show all commands |
| `/gen-html <prompt>` | Generate single HTML file |
| `/gen-web <prompt>` | Generate multi-file web project |
| `/set-model <name>` | Change AI model |
| `/get-config` | View configuration |
| `/q` | Quit |

## Next Steps

- Read [Configuration Guide](CONFIGURATION.md) for advanced setup
- Try different models with `/set-model`
- Explore MCP integration in [MCP_INTEGRATION.md](../MCP_INTEGRATION.md)
- Check [ARCHITECTURE.md](ARCHITECTURE.md) to understand the codebase

## Need Help?

- Type `/help` in Khora
- Check [GitHub Issues](https://github.com/your-org/khora/issues)
- Read full documentation in `/docs`

## Free Tier

The default model `x-ai/grok-4-fast:free` is **completely free**! 

Perfect for:
- Learning and experimenting
- Personal projects
- Testing Khora's capabilities

Upgrade to paid models when you need:
- Higher quality (Claude Opus)
- No rate limits
- Production use

Happy coding! 🚀
