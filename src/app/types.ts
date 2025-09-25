export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type SessionMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type AppConfig = {
  apiKey?: string;
  imageApiKey?: string;
};

export type ImageGenerationOptions = {
  prompt: string;
  model?: string;
  size?: '1024*1024' | '1024*768' | '768*1024' | '512*512';
  n?: number;
};

export type SavedHtmlPackage = {
  directory: string;
  indexPath: string;
  cssPath: string | undefined;
  jsPath: string | undefined;
};

export type DashScopeTaskResponse = {
  output: {
    task_id: string;
  };
};

export type DashScopeStatusResponse = {
  output: {
    task_status: 'SUCCEEDED' | 'FAILED' | 'PENDING' | 'RUNNING';
    results?: Array<{
      url: string;
    }>;
    message?: string;
  };
};
