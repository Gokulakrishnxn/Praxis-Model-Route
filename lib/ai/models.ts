// Curated list of top models from Vercel AI Gateway
export const DEFAULT_CHAT_MODEL = "google-api/gemini-1.5-pro";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  // Google API (Direct - requires GOOGLE_API_KEY)
  {
    id: "google-api/gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google-api",
    description: "Google's most capable model - Direct API",
  },
  {
    id: "google-api/gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "google-api",
    description: "Fast and efficient Google model - Direct API",
  },
  {
    id: "google-api/gemini-pro",
    name: "Gemini Pro",
    provider: "google-api",
    description: "Google Gemini Pro - Direct API",
  },
  {
    id: "google-api/gemini-1.5-flash-8b",
    name: "Gemini 1.5 Flash 8B",
    provider: "google-api",
    description: "Lightweight and fast - Direct API",
  },
  // OpenRouter - Anthropic Models (requires OPENROUTER_API_KEY)
  {
    id: "openrouter/anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "openrouter",
    description: "Anthropic's balanced model via OpenRouter",
  },
  {
    id: "openrouter/anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    provider: "openrouter",
    description: "Anthropic's most capable model via OpenRouter",
  },
  {
    id: "openrouter/anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "openrouter",
    description: "Anthropic's fastest model via OpenRouter",
  },
  // OpenRouter - Google Models
  {
    id: "openrouter/google/gemini-pro-1.5",
    name: "Gemini Pro 1.5",
    provider: "openrouter",
    description: "Google Gemini via OpenRouter",
  },
  {
    id: "openrouter/google/gemini-flash-1.5",
    name: "Gemini Flash 1.5",
    provider: "openrouter",
    description: "Fast Google model via OpenRouter",
  },
  // OpenRouter - Meta Models
  {
    id: "openrouter/meta-llama/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B",
    provider: "openrouter",
    description: "Meta's powerful open model via OpenRouter",
  },
  {
    id: "openrouter/meta-llama/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B",
    provider: "openrouter",
    description: "Meta's efficient model via OpenRouter",
  },
  // OpenRouter - OpenAI Models
  {
    id: "openrouter/openai/gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openrouter",
    description: "OpenAI GPT-4 Turbo via OpenRouter",
  },
  {
    id: "openrouter/openai/gpt-4o",
    name: "GPT-4o",
    provider: "openrouter",
    description: "OpenAI GPT-4o via OpenRouter",
  },
  {
    id: "openrouter/openai/gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "openrouter",
    description: "OpenAI GPT-3.5 Turbo via OpenRouter",
  },
  // OpenRouter - Mistral Models
  {
    id: "openrouter/mistralai/mistral-large",
    name: "Mistral Large",
    provider: "openrouter",
    description: "Mistral's large model via OpenRouter",
  },
  {
    id: "openrouter/mistralai/mixtral-8x7b-instruct",
    name: "Mixtral 8x7B",
    provider: "openrouter",
    description: "Mistral's Mixtral model via OpenRouter",
  },
];

// Group models by provider for UI
export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
