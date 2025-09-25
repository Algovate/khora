import React, { useState } from 'react';
import { Box, Text, useApp, useInput, useStdin } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { getApiKey, saveSessionToFile, saveHtmlToFile, saveHtmlPackage } from './config.js';
import { createChatGraph, toLangChainMessages, extractTextFromContent, generateSingleHtmlPage } from './graph.js';
import Logo from './Logo.js';
import { WELCOME_TEXT, HELP_TEXT } from './prompts.js';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export default function App(): React.ReactElement {
  const { exit } = useApp();
  const { isRawModeSupported } = useStdin();
  const [messages, setMessages] = useState<Message[]>([
    { id: 'sys-1', role: 'system', content: WELCOME_TEXT }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [modelName, setModelName] = useState<string>('gemini-1.5-flash');
  const AVAILABLE_MODELS = [
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];
  const [isPickingModel, setIsPickingModel] = useState(false);
  const [modelIndex, setModelIndex] = useState<number>(0);

  if (!isRawModeSupported) {
    return (
      <Box flexDirection="column">
        <Logo />
        <Text color="magenta">System: Welcome to khora ⚡</Text>
        <Text color="yellow">Interactive input is unavailable in this environment.</Text>
        <Text>
          Set env var GOOGLE_API_KEY (or KHORA_API_KEY) and run in a TTY to log in.
        </Text>
      </Box>
    );
  }

  useInput((inputKey, key) => {
    if (isPickingModel) {
      if (key.escape) {
        setIsPickingModel(false);
        return;
      }
      if (key.upArrow) {
        setModelIndex(prev => (prev - 1 + AVAILABLE_MODELS.length) % AVAILABLE_MODELS.length);
        return;
      }
      if (key.downArrow) {
        setModelIndex(prev => (prev + 1) % AVAILABLE_MODELS.length);
        return;
      }
      if (key.return) {
        const next = AVAILABLE_MODELS[modelIndex] ?? modelName;
        setModelName(next);
        setMessages(prev => [...prev, { id: `sys-${Date.now()}`, role: 'system', content: `Model set to: ${next}` }]);
        setIsPickingModel(false);
        return;
      }
      return;
    }

    if (key.escape) {
      exit();
    }
  });

  async function handleSubmit(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;

    // Slash command handling: /q, /quit, /exit, /clear, /help, /model, /reset, /save, /html
    if (trimmed.startsWith('/')) {
      const cmd = trimmed.slice(1).toLowerCase();
      if (cmd === 'q' || cmd === 'quit' || cmd === 'exit') {
        exit();
        return;
      }
      if (cmd === 'clear' || cmd === 'cls') {
        setMessages([{ id: `sys-${Date.now()}`, role: 'system', content: 'History cleared. Type `/q` to quit.' }]);
        setInput('');
        return;
      }
      if (cmd === 'help' || cmd === 'h' || cmd === '?') {
        setMessages(prev => [...prev, { id: `sys-${Date.now()}`, role: 'system', content: HELP_TEXT }]);
        setInput('');
        return;
      }
      if (cmd === 'model' || cmd.startsWith('model')) {
        const parts = trimmed.split(/\s+/);
        if (parts.length < 2) {
          // Open interactive picker
          const currentIdx = Math.max(0, AVAILABLE_MODELS.indexOf(modelName));
          setModelIndex(currentIdx);
          setIsPickingModel(true);
          setMessages(prev => [...prev, { id: `sys-${Date.now()}`, role: 'system', content: 'Select a model with ↑/↓ and press Enter. Esc to cancel.' }]);
        } else {
          const next = parts[1] ?? modelName;
          setModelName(next);
          setMessages(prev => [...prev, { id: `sys-${Date.now()}`, role: 'system', content: `Model set to: ${next}` }]);
        }
        setInput('');
        return;
      }
      if (cmd === 'reset') {
        setMessages([{ id: `sys-${Date.now()}`, role: 'system', content: 'Context reset. Type `/help` for commands.' }]);
        setInput('');
        return;
      }
      if (cmd.startsWith('save')) {
        const parts = trimmed.split(/\s+/);
        const name = parts[1];
        const file = saveSessionToFile(messages, name);
        setMessages(prev => [...prev, { id: `sys-${Date.now()}`, role: 'system', content: `Saved to: ${file}` }]);
        setInput('');
        return;
      }
      if (cmd.startsWith('html')) {
        const query = trimmed.replace(/^\/(html|htmlsplit)\s*/, '');
        if (!query) {
          setMessages(prev => [...prev, { id: `sys-${Date.now()}`, role: 'system', content: 'Usage: /html <prompt> or /htmlsplit <prompt>' }]);
          setInput('');
          return;
        }
        try {
          setIsThinking(true);
          const html = await generateSingleHtmlPage(modelName, query);
          if (trimmed.startsWith('/htmlsplit')) {
            const pkg = saveHtmlPackage(html);
            setMessages(prev => [...prev, { id: `sys-${Date.now()}`, role: 'system', content: `HTML package saved: ${pkg.indexPath}` }]);
          } else {
            const file = saveHtmlToFile(html);
            setMessages(prev => [...prev, { id: `sys-${Date.now()}`, role: 'system', content: `HTML saved to: ${file}` }]);
          }
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          setMessages(prev => [...prev, { id: `sys-${Date.now()}`, role: 'system', content: `HTML generation error: ${message}` }]);
        } finally {
          setIsThinking(false);
        }
        setInput('');
        return;
      }
      // Unknown command feedback
      setMessages(prev => [...prev, { id: `sys-${Date.now()}`, role: 'system', content: `Unknown command: ${trimmed}` }]);
      setInput('');
      return;
    }

    const userMessage: Message = { id: `u-${Date.now()}`, role: 'user', content: value };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const graph = createChatGraph(modelName);
      const chatMsgs = toLangChainMessages([...messages, userMessage]);
      const out = await (graph as any).invoke({ messages: chatMsgs as any });
      const last = (out as any)?.messages?.slice(-1)[0];
      const text = extractTextFromContent(last?.content);
      const assistantMessage: Message = { id: `a-${Date.now()}`, role: 'assistant', content: text };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setMessages(prev => [
        ...prev,
        { id: `e-${Date.now()}` , role: 'system', content: `Gemini error: ${message}` }
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  const apiKey = getApiKey();

  if (!apiKey) {
    return (
      <Box flexDirection="column">
        <Logo />
        <Text color="magenta">System: Welcome to khora ⚡</Text>
        <Text color="yellow">No API key found.</Text>
        <Text>Set env var GOOGLE_API_KEY or KHORA_API_KEY and restart.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Logo />
      <Box flexDirection="column" marginBottom={1}>
        {isPickingModel && (
          <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
            <Text color="magenta">Model Picker</Text>
            {AVAILABLE_MODELS.map((m, idx) => {
              const label = `${idx === modelIndex ? '› ' : '  '}${m}${m === modelName ? '  (current)' : ''}`;
              return idx === modelIndex ? (
                <Text key={m} color="cyan">{label}</Text>
              ) : (
                <Text key={m}>{label}</Text>
              );
            })}
            <Text color="gray">Use ↑/↓ and Enter. Esc to cancel.</Text>
          </Box>
        )}
        {messages.map(m => (
          <Box key={m.id}>
            <Text color={m.role === 'user' ? 'cyan' : m.role === 'assistant' ? 'green' : 'magenta'}>
              {m.role === 'user' ? 'You' : m.role === 'assistant' ? 'Khora' : 'System'}:
            </Text>
            <Text> {m.content}</Text>
          </Box>
        ))}
        {isThinking && (
          <Box>
            <Text color="yellow">
              <Spinner type="dots" /> Thinking...
            </Text>
          </Box>
        )}
      </Box>

      <Box>
        <Text color="gray">› </Text>
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


