import { getImageApiKey } from './config.js';
import { 
  ImageGenerationOptions, 
  DashScopeTaskResponse, 
  DashScopeStatusResponse 
} from './types.js';
import { 
  DASHSCOPE_IMAGE_SYNTHESIS_ENDPOINT, 
  DASHSCOPE_TASK_ENDPOINT,
  DEFAULT_IMAGE_MODEL,
  DEFAULT_IMAGE_SIZE,
  DEFAULT_IMAGE_COUNT,
  MAX_POLL_ATTEMPTS,
  POLL_INTERVAL_MS
} from './constants.js';
import { sleep, generateRandomSeed } from './utils.js';

export async function generateImage(options: ImageGenerationOptions): Promise<Buffer> {
  const apiKey = getImageApiKey();
  if (!apiKey) {
    throw new Error('Missing image API key. Set KHORA_IMAGE_API_KEY or DASHSCOPE_API_KEY environment variable.');
  }

  const {
    prompt,
    model = DEFAULT_IMAGE_MODEL,
    size = DEFAULT_IMAGE_SIZE,
    n = DEFAULT_IMAGE_COUNT
  } = options;

  try {
    const taskId = await submitImageTask(apiKey, { prompt, model, size, n });
    const result = await pollTaskCompletion(apiKey, taskId);
    
    if (!result.output.results || result.output.results.length === 0) {
      throw new Error('No image generated');
    }
    
    const imageUrl = result.output.results[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL returned');
    }
    
    return await downloadImage(imageUrl);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Image generation failed: ${error.message}`);
    }
    throw new Error('Unknown error during image generation');
  }
}

/**
 * Submits an image generation task to DashScope API
 */
async function submitImageTask(
  apiKey: string, 
  options: { prompt: string; model: string; size: string; n: number }
): Promise<string> {
  const { prompt, model, size, n } = options;
  
  const response = await fetch(DASHSCOPE_IMAGE_SYNTHESIS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model,
      input: {
        prompt,
        negative_prompt: '',
        style: '<auto>'
      },
      parameters: {
        size,
        n,
        seed: generateRandomSeed(),
        steps: 20,
        scale: 7
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const taskData = await response.json() as DashScopeTaskResponse;
  
  if (!taskData.output?.task_id) {
    throw new Error('No task ID returned from API');
  }

  return taskData.output.task_id;
}

/**
 * Polls for task completion
 */
async function pollTaskCompletion(apiKey: string, taskId: string): Promise<DashScopeStatusResponse> {
  let attempts = 0;
  
  while (attempts < MAX_POLL_ATTEMPTS) {
    await sleep(POLL_INTERVAL_MS);
    
    const response = await fetch(DASHSCOPE_TASK_ENDPOINT(taskId), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as DashScopeStatusResponse;
    
    if (result.output?.task_status === 'SUCCEEDED') {
      if (!result.output.results || result.output.results.length === 0) {
        throw new Error('No image generated');
      }
      return result;
    } else if (result.output?.task_status === 'FAILED') {
      throw new Error(`Image generation failed: ${result.output.message || 'Unknown error'}`);
    }
    
    attempts++;
  }

  throw new Error(`Image generation timed out after ${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000} seconds`);
}

/**
 * Downloads an image from URL
 */
async function downloadImage(imageUrl: string): Promise<Buffer> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
