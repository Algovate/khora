import React, { useState, useEffect } from 'react';
import { Box, Text, useApp, useInput, useStdin } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { getApiKey, getMCPServers } from './config.js';
import { invokeChatModel, toLangChainMessages, extractTextFromContent } from './ai.js';
import { Message, CommandContext, CommandResult } from './types.js';
import { AVAILABLE_CHAT_MODELS, ChatModel } from './constants.js';
import Logo from './Logo.js';
import { WELCOME_TEXT } from './prompts.js';
import { CommandHandler } from './commands.js';
import { MCPManager } from './mcp.js';

// Utility function to generate unique IDs
function generateUniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function App(): React.ReactElement {
  const { exit } = useApp();
  const { isRawModeSupported } = useStdin();
  const [messages, setMessages] = useState<Message[]>([
    { id: 'sys-welcome', role: 'system', content: WELCOME_TEXT }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [modelName, setModelName] = useState<ChatModel>(AVAILABLE_CHAT_MODELS[0]);
  const [isPickingModel, setIsPickingModel] = useState(false);
  const [modelIndex, setModelIndex] = useState(0);
  const [mcpManager] = useState(() => {
    const manager = new MCPManager();
    // Initialize MCP servers from config
    const servers = getMCPServers();
    servers.forEach(server => {
      manager.addServer(server);
    });
    return manager;
  });

  // Initialize MCP connections on startup
  useEffect(() => {
    const initializeMCP = async () => {
      try {
        await mcpManager.connectAllServers();
      } catch (error) {
        console.error('Failed to initialize MCP servers:', error);
      }
    };

    initializeMCP();

    // Cleanup on unmount
    return () => {
      mcpManager.disconnectAllServers().catch(console.error);
    };
  }, [mcpManager]);

  // Check if raw mode is supported, if not show error
  if (!isRawModeSupported) {
    return (
      <Box flexDirection="column" padding={2}>
        <Logo />
        <Text color="red">
          Error: Raw mode is not supported in this terminal environment.
        </Text>
        <Text>
          Please run Khora in a proper terminal (not in a CI/CD pipeline or non-interactive environment).
        </Text>
        <Text color="cyan">
          Press any key to exit...
        </Text>
      </Box>
    );
  }

  useInput((input, key) => {
    if (isPickingModel) {
      if (key.upArrow) {
        setModelIndex(prev => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setModelIndex(prev => Math.min(AVAILABLE_CHAT_MODELS.length - 1, prev + 1));
      } else if (key.return) {
        setModelName(AVAILABLE_CHAT_MODELS[modelIndex] || AVAILABLE_CHAT_MODELS[0]);
        setIsPickingModel(false);
        const sysId = generateUniqueId('sys');
        setMessages(prev => [...prev, { id: sysId, role: 'system', content: `Model set to: ${AVAILABLE_CHAT_MODELS[modelIndex]}` }]);
      } else if (key.escape) {
        setIsPickingModel(false);
        const cancelId = generateUniqueId('sys');
        setMessages(prev => [...prev, { id: cancelId, role: 'system', content: 'Model selection cancelled.' }]);
      }
      return;
    }

    if (key.escape) {
      exit();
    }
  });

  const handleSubmit = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const userId = generateUniqueId('user');
    setMessages(prev => [...prev, { id: userId, role: 'user', content: trimmed }]);
    setInput('');

    // Handle slash commands
    if (trimmed.startsWith('/')) {
      const context: CommandContext = {
        messages,
        setMessages,
        setIsThinking,
        setInput,
        modelName
      };

      const handler = new CommandHandler(context, mcpManager);
      const handled = await handler.handleCommand(trimmed);

      if (handled) {
        // Handle special cases
        if (trimmed.startsWith('/model') && !trimmed.includes(' ')) {
          const currentIdx = Math.max(0, AVAILABLE_CHAT_MODELS.indexOf(modelName));
          setModelIndex(currentIdx);
          setIsPickingModel(true);
          const selectId = generateUniqueId('sys');
          setMessages(prev => [...prev, { id: selectId, role: 'system', content: 'Select a model with ↑/↓ and press Enter. Esc to cancel.' }]);
        } else if (trimmed.startsWith('/q') || trimmed.startsWith('/quit') || trimmed.startsWith('/exit')) {
          exit();
        }
        return;
      }
    }

    // Regular chat with AI
    try {
      setIsThinking(true);
      const tempUserId = generateUniqueId('user');
      const langChainMessages = toLangChainMessages(messages.concat({ id: tempUserId, role: 'user', content: trimmed }));
      const res = await invokeChatModel(langChainMessages, modelName);
      const text = extractTextFromContent(res?.content);
      const aiId = generateUniqueId('ai');
      setMessages(prev => [...prev, { id: aiId, role: 'assistant', content: text }]);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      const errorId = generateUniqueId('sys');
      setMessages(prev => [...prev, { id: errorId, role: 'system', content: `Error: ${message}` }]);
    } finally {
      setIsThinking(false);
    }
  };

  const apiKey = getApiKey();

  if (!apiKey) {
    return (
      <Box flexDirection="column">
        <Logo />
        <Text color="red">
          Missing API key. Set GOOGLE_API_KEY or KHORA_API_KEY in your environment.
        </Text>
        <Text>
          You can also run <Text color="cyan">khora login</Text> to set it interactively.
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height="100%" width="100%">
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        {messages.map(msg => (
          <Box key={msg.id} flexDirection="column" marginBottom={1}>
            <Text color={msg.role === 'user' ? 'cyan' : msg.role === 'system' ? 'yellow' : 'green'}>
              {msg.role === 'user' ? 'You' : msg.role === 'system' ? 'System' : 'AI'}:
            </Text>
            <Text>{msg.content}</Text>
          </Box>
        ))}

        {isThinking && (
          <Box flexDirection="row" alignItems="center">
            <Spinner type="dots" />
            <Text>Thinking...</Text>
          </Box>
        )}

        {isPickingModel && (
          <Box flexDirection="column" marginTop={1}>
            <Text color="yellow">Available models:</Text>
            {AVAILABLE_CHAT_MODELS.map((model, i) => (
              <Text key={model} color={i === modelIndex ? 'green' : 'white'}>
                {i === modelIndex ? '→ ' : '  '}{model}
              </Text>
            ))}
          </Box>
        )}
      </Box>

      <Box borderStyle="round" borderColor="gray" padding={1}>
        <TextInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          placeholder="Ask something... (/help for commands, /q to quit)"
        />
      </Box>
    </Box>
  );
}