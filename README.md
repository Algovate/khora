# Khora ⚡

Fast AI-powered terminal assistant for code generation and chat.

## Installation

```bash
npm install -g khora
```

## Setup

Set your Google Gemini API key:

```bash
export GOOGLE_API_KEY="your-api-key"
```

## Usage

```bash
khora
```

### Commands

- `/help` - Show help
- `/gen-html <prompt>` - Generate HTML file
- `/gen-web <prompt>` - Generate web project (HTML/CSS/JS)
- `/gen-vue <prompt>` - Generate Vue 3 project
- `/list` - List generated projects
- `/clear` - Clear chat history
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