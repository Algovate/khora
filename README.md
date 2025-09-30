# Khora ⚡

Fast AI-powered terminal assistant for code generation and chat with support for multiple AI providers.

## Installation

```bash
npm install -g khora
```

## Setup

### API Key

Set your OpenRouter API key:

```bash
export KHORA_API_KEY="sk-or-v1-..."
```

Or alternatively:

```bash
export OPENROUTER_API_KEY="sk-or-v1-..."
```

Get your API key at [OpenRouter.ai](https://openrouter.ai/)

### Configuration

Khora uses OpenRouter to access multiple AI models:
- **xAI Grok** - Grok 4 Fast Free (default)
- **Anthropic Claude** - Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Sonnet
- **OpenAI GPT** - GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
- **Google Gemini** - Gemini Pro, Gemini 2.0 Flash
- **Meta Llama** - Llama 3 70B

Configure your model:
```bash
# Set model (default is x-ai/grok-4-fast:free)
/set-model x-ai/grok-4-fast:free

# Or try GPT-4
/set-model openai/gpt-4-turbo

# Check current configuration
/get-config
```

See [Configuration Guide](docs/CONFIGURATION.md) for detailed setup instructions.

## Usage

```bash
khora
```

### Commands

#### Code Generation
- `/gen-html <prompt>` - Generate single HTML file with inline CSS/JS
- `/gen-web <prompt>` - Generate separate HTML, CSS, and JS files
- `/gen-vue <prompt>` - Generate complete Vue 3 project with routing
- `/gen-auto <prompt>` - Auto-detect project type and generate

#### Configuration
- `/set-model <model>` - Set the AI model to use (OpenRouter)
- `/get-config` - Show current configuration
- `/model` - Interactive model picker

#### General
- `/help` - Show help
- `/list` - List generated projects
- `/clear` - Clear chat history
- `/reset` - Reset conversation context
- `/save [name]` - Save conversation
- `/q` - Quit

## Examples

```bash
# Generate a portfolio website
/gen-html Create a modern portfolio with dark theme

# Generate a Vue todo app
/gen-vue Build a todo app with Vue 3 and routing

# List all generated projects
/list
```

## Development

```bash
npm install
npm run build
npm run dev
```

## License

ISC