export const WELCOME_TEXT = 'Welcome to khora ⚡  Type `/help` for commands, `/q` to quit.';

export const HELP_TEXT = [
  'Commands:',
  '  /help            Show this help',
  '  /q | /quit       Exit',
  '  /clear           Clear history',
  '  /model           Open interactive model picker',
  '  /reset           Reset the conversation context',
  '  /save [name]     Save conversation to ~/.khora/sessions/[name].json',
  '  /html <prompt>   Generate a single-page HTML and save to ~/.khora/pages',
  '  /htmlsplit <p>   Generate HTML, split CSS/JS to files, save as a package',
  '  /image <prompt>  Generate an image and save to ~/.khora/images',
  '',
  'Tips:',
  '  Set GOOGLE_API_KEY or KHORA_API_KEY in your environment.',
  '  Set KHORA_IMAGE_API_KEY or DASHSCOPE_API_KEY for image generation.',
  '  Ask anything to chat with the model.',
].join('\n');

export const HTML_SYSTEM_PROMPT = [
  'You are a helpful assistant that outputs a single self-contained HTML5 page.',
  'Return only valid HTML (<!DOCTYPE html> ... </html>).',
  'Include minimal inline CSS.',
].join(' ');


