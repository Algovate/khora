# Khora ⚡

[![npm version](https://img.shields.io/npm/v/khora.svg)](https://www.npmjs.com/package/khora) [![npm downloads](https://img.shields.io/npm/dm/khora.svg)](https://www.npmjs.com/package/khora)

Fast, minimal AI in your terminal. A powerful CLI tool for AI-powered text generation and image creation.

## ✨ Features

- 🤖 **AI Chat**: Interactive chat with Google Gemini models
- 🎨 **Image Generation**: Create images using DashScope AI models
- 📝 **HTML Generation**: Generate and save HTML pages
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
npm run start
```

## 🔧 Configuration

### API Keys Setup

Khora requires API keys for AI services:

1. **Text Generation (Google Gemini)**:

   ```bash
   export GOOGLE_API_KEY="your-gemini-api-key"
   # or
   export KHORA_API_KEY="your-gemini-api-key"
   ```

2. **Image Generation (DashScope)**:

   ```bash
   export DASHSCOPE_API_KEY="your-dashscope-api-key"
   # or
   export KHORA_IMAGE_API_KEY="your-dashscope-api-key"
   ```

### Configuration File

API keys can also be stored in `~/.khora/config.json`:

```json
{
  "apiKey": "your-gemini-api-key",
  "imageApiKey": "your-dashscope-api-key"
}
```

## 📖 Usage

### Basic Usage

```bash
khora
```

### Available Commands

Type `/help` in the interactive interface to see all available commands:

- `/help` - Show help information
- `/q` or `/quit` - Exit the application
- `/clear` - Clear chat history
- `/model` - Open interactive model picker
- `/reset` - Reset conversation context
- `/save [name]` - Save conversation to file
- `/html <prompt>` - Generate HTML page
- `/htmlsplit <prompt>` - Generate HTML package (separate CSS/JS)
- `/image <prompt>` - Generate image

### Examples

#### Chat with AI

```
You: Hello! How can you help me?
Khora: I can help you with various tasks including...
```

#### Generate Images

```
You: /image a beautiful sunset over mountains
System: Image saved to: ~/.khora/images/image-2024-01-15T10-30-45-123Z.png
```

#### Create HTML Pages

```
You: /html create a landing page for a tech startup
System: HTML saved to: ~/.khora/pages/page-2024-01-15T10-30-45-123Z.html
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── App.tsx          # Main application component
│   ├── config.ts        # Configuration management
│   ├── constants.ts     # Application constants
│   ├── graph.ts         # AI chat functionality
│   ├── imageService.ts  # Image generation service
│   ├── types.ts         # TypeScript type definitions
│   ├── utils.ts         # Utility functions
│   └── prompts.ts       # System prompts and help text
├── bin/
│   └── khora.tsx        # CLI entry point
└── ...
```

## 🛠️ Development

### Available Scripts

- `npm run build` - Build the project
- `npm run dev` - Run in development mode
- `npm run start` - Run the built application
- `npm run lint` - Run linter

### Architecture

The application is built with:

- **TypeScript** for type safety
- **React + Ink** for terminal UI
- **LangChain** for AI integration
- **Modular design** for maintainability

### Key Components

1. **App.tsx**: Main application with command handling
2. **imageService.ts**: DashScope API integration for image generation
3. **graph.ts**: Google Gemini integration for text generation
4. **config.ts**: File system and configuration management
5. **types.ts**: Centralized type definitions
6. **constants.ts**: Application constants and configuration
7. **utils.ts**: Reusable utility functions

## 📁 File Storage

Khora automatically creates and manages the following directories:

- `~/.khora/config.json` - Configuration file
- `~/.khora/sessions/` - Saved chat sessions
- `~/.khora/pages/` - Generated HTML files
- `~/.khora/images/` - Generated images

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
- [Google Gemini](https://ai.google.dev/) for text generation
- [DashScope](https://dashscope.aliyun.com/) for image generation
