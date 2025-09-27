# Khora ⚡

[![npm version](https://img.shields.io/npm/v/khora.svg)](https://www.npmjs.com/package/khora) [![npm downloads](https://img.shields.io/npm/dm/khora.svg)](https://www.npmjs.com/package/khora)

Fast, minimal AI in your terminal. A powerful CLI tool for AI-powered code generation and chat.

## ✨ Features

- 🤖 **AI Chat**: Interactive chat with Google Gemini models
- 🚀 **Code Generation**: Generate HTML, Web projects, and Vue applications
- 📁 **Project Management**: List and manage generated projects
- 💾 **Session Management**: Save and manage chat sessions
- ⚙️ **Model Selection**: Switch between different AI models
- 🎯 **Command Interface**: Simple slash commands for all features

## 🚀 Installation

### Global Installation (Recommended)

```bash
npm install -g khora
```

### Local Usage

```bash
npx khora
```

### Development Setup

```bash
git clone <repository-url>
cd khora
npm install
npm run build
npm run dev
```

## 🔧 Configuration

### API Keys Setup

Khora requires an API key for Google Gemini:

```bash
export GOOGLE_API_KEY="your-gemini-api-key"
# or
export KHORA_API_KEY="your-gemini-api-key"
```

### Configuration File

API keys can also be stored in `~/.khora/config.json`:

```json
{
  "apiKey": "your-gemini-api-key"
}
```

## 📖 Usage

### Basic Usage

```bash
khora
```

### Available Commands

Type `/help` in the interactive interface to see all available commands:

#### Basic Commands
- `/help` - Show help information
- `/q` or `/quit` - Exit the application
- `/clear` - Clear chat history
- `/model` - Open interactive model picker
- `/reset` - Reset conversation context
- `/save [name]` - Save conversation to file

#### 🚀 Code Generation Commands
- `/gen-html <prompt>` - Generate single HTML file with inline CSS/JS
- `/gen-web <prompt>` - Generate separate HTML, CSS, and JS files
- `/gen-vue <prompt>` - Generate complete Vue 3 project with routing
- `/gen-auto <prompt>` - Auto-detect project type and generate

#### 📁 Project Management Commands
- `/list` or `/ls` - List all generated projects
- `/clean` or `/rm` - Clean up all generated files

### Examples

#### Chat with AI

```
You: Hello! How can you help me?
Khora: I can help you with various tasks including...
```

#### Generate Code Projects

```
You: /gen-html Create a portfolio website with dark theme
System: 📄 Generated: generated/project-portfolio-2024-01-15T10-30-45-123Z/index.html

You: /gen-vue Create a todo app with Vue 3 and routing
System: ⚡ Generated: generated/project-todo-app-2024-01-15T10-30-45-123Z/index.html

You: /gen-auto Make a blog with comments system
System: 🎯 Generated: generated/project-blog-2024-01-15T10-30-45-123Z/index.html
```

#### Manage Projects

```
You: /list
System: 📁 Generated Projects:
1. project-portfolio-2024-01-15T10-30-45-123Z
2. project-todo-app-2024-01-15T10-30-45-123Z
3. project-blog-2024-01-15T10-30-45-123Z

You: /clean
System: 🧹 Cleaned up 3 projects.
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── App.tsx              # Main application component
│   ├── commandHandler.ts    # Command processing logic
│   ├── codeGenService.ts    # Code generation service
│   ├── config.ts            # Configuration management
│   ├── constants.ts         # Application constants
│   ├── graph.ts             # AI chat functionality
│   ├── Logo.tsx             # Application logo
│   ├── prompts.ts           # System prompts and help text
│   ├── types.ts             # TypeScript type definitions
│   └── utils.ts             # Utility functions
├── bin/
│   └── khora.tsx            # CLI entry point
└── ...
```

## 🛠️ Development

### Available Scripts

- `npm run build` - Build the project
- `npm run dev` - Run in development mode
- `npm run start` - Run the built application

### Architecture

The application is built with:

- **TypeScript** for type safety
- **React + Ink** for terminal UI
- **LangChain + LangGraph** for AI integration
- **Modular design** for maintainability

### Key Components

1. **App.tsx**: Main application with UI and state management
2. **commandHandler.ts**: Centralized command processing logic
3. **codeGenService.ts**: Code generation service with multiple project types
4. **graph.ts**: Google Gemini integration for chat functionality
5. **config.ts**: File system and configuration management
6. **prompts.ts**: System prompts for different code generation types
7. **types.ts**: Centralized type definitions
8. **constants.ts**: Application constants and configuration
9. **utils.ts**: Reusable utility functions

## 📁 File Storage

Khora automatically creates and manages the following directories:

- `~/.khora/config.json` - Configuration file
- `~/.khora/sessions/` - Saved chat sessions
- `generated/` - Generated code projects (in project root)

## 🎯 Code Generation Types

### HTML Single File
Generates a complete HTML page with inline CSS and JavaScript.

### Multi-File Web Project
Creates separate HTML, CSS, and JavaScript files for better organization.

### Vue 3 Project
Generates a complete Vue 3 application with routing and modern tooling.

### Auto-Detect
Intelligently determines the best project type based on the user's prompt.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

ISC License - see LICENSE file for details

## 🙏 Acknowledgments

- [Ink](https://github.com/vadimdemedes/ink) for terminal UI
- [LangChain](https://github.com/langchain-ai/langchain) for AI integration
- [LangGraph](https://github.com/langchain-ai/langgraph) for workflow orchestration
- [Google Gemini](https://ai.google.dev/) for AI text generation