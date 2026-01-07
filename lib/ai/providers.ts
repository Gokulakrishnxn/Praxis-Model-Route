import { gateway } from "@ai-sdk/gateway";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  createDataStreamResponse,
  type LanguageModelV1,
} from "ai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { isTestEnvironment } from "../constants";
import { getProviderApiKey } from "../db/provider-api-key-queries";

const THINKING_SUFFIX_REGEX = /-thinking$/;

// Initialize Google API client if API key is available (fallback to env)
const googleApiKey = process.env.GOOGLE_API_KEY;
const googleGenAI = googleApiKey ? new GoogleGenerativeAI(googleApiKey) : null;

// OpenRouter API key (fallback to env)
const openRouterApiKey = process.env.OPENROUTER_API_KEY;

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : null;

export async function getLanguageModel(modelId: string, userId?: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  // Get user-specific API keys if userId is provided
  let userGoogleApiKey: string | null = null;
  let userOpenRouterApiKey: string | null = null;

  if (userId) {
    try {
      const googleKey = await getProviderApiKey(userId, "google-api");
      if (googleKey?.isEnabled && googleKey.apiKey) {
        userGoogleApiKey = googleKey.apiKey;
      }
      const openRouterKey = await getProviderApiKey(userId, "openrouter");
      if (openRouterKey?.isEnabled && openRouterKey.apiKey) {
        userOpenRouterApiKey = openRouterKey.apiKey;
      }
    } catch (error) {
      console.error("Error fetching user API keys:", error);
      // Fall back to environment variables
    }
  }

  // Handle Google API models (format: google-api/{model-name})
  if (modelId.startsWith("google-api/")) {
    const apiKey = userGoogleApiKey || googleApiKey;
    if (!apiKey) {
      throw new Error(
        "Google API key not configured. Please configure it in Settings or set GOOGLE_API_KEY in your .env.local file."
      );
    }
    const genAI = userGoogleApiKey
      ? new GoogleGenerativeAI(userGoogleApiKey)
      : googleGenAI;
    if (!genAI) {
      throw new Error("Failed to initialize Google API client");
    }
        const googleModelId = modelId.replace("google-api/", "");
        const model = genAI.getGenerativeModel({ model: googleModelId });
    
    // Create a custom language model wrapper for Google API
    return customProvider({
      languageModels: {
        [modelId]: {
          specificationVersion: "v1",
          provider: "google",
          defaultObjectGenerationMode: "json",
          defaultObjectGenerationStopSequences: [],
          providerMetadata: {},
          doStream: async ({ prompt, mode, ...options }) => {
            const result = await model.generateContentStream(prompt);
            const stream = new ReadableStream({
              async start(controller) {
                try {
                  for await (const chunk of result.stream) {
                    const text = chunk.text();
                    if (text) {
                      controller.enqueue(
                        new TextEncoder().encode(
                          JSON.stringify({ type: "text-delta", textDelta: text }) + "\n"
                        )
                      );
                    }
                  }
                  controller.close();
                } catch (error) {
                  controller.error(error);
                }
              },
            });
            return { stream, rawCall: { rawPrompt: prompt, rawSettings: {} } };
          },
        } as LanguageModelV1,
      },
    }).languageModel(modelId);
  }

      // Handle OpenRouter models (format: openrouter/{model-name})
      if (modelId.startsWith("openrouter/")) {
        const apiKey = userOpenRouterApiKey || openRouterApiKey;
        if (!apiKey) {
          throw new Error(
            "OpenRouter API key not configured. Please configure it in Settings or set OPENROUTER_API_KEY in your .env.local file."
          );
        }
    const openRouterModelId = modelId.replace("openrouter/", "");
    
    // Create a custom language model wrapper for OpenRouter
    return customProvider({
      languageModels: {
        [modelId]: {
          specificationVersion: "v1",
          provider: "openrouter",
          defaultObjectGenerationMode: "json",
          defaultObjectGenerationStopSequences: [],
          providerMetadata: {},
          doStream: async ({ prompt, mode, ...options }) => {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
                  headers: {
                    "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                "X-Title": "Praxis",
              },
              body: JSON.stringify({
                model: openRouterModelId,
                messages: typeof prompt === "string" 
                  ? [{ role: "user", content: prompt }]
                  : prompt,
                stream: true,
              }),
            });

            if (!response.ok) {
              throw new Error(`OpenRouter API error: ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            const stream = new ReadableStream({
              async start(controller) {
                try {
                  while (true) {
                    const { done, value } = await reader!.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n").filter((line) => line.trim() !== "");

                    for (const line of lines) {
                      if (line.startsWith("data: ")) {
                        const data = line.slice(6);
                        if (data === "[DONE]") continue;
                        
                        try {
                          const parsed = JSON.parse(data);
                          const content = parsed.choices?.[0]?.delta?.content;
                          if (content) {
                            controller.enqueue(
                              new TextEncoder().encode(
                                JSON.stringify({ type: "text-delta", textDelta: content }) + "\n"
                              )
                            );
                          }
                        } catch (e) {
                          // Skip invalid JSON
                        }
                      }
                    }
                  }
                  controller.close();
                } catch (error) {
                  controller.error(error);
                }
              },
            });

            return { stream, rawCall: { rawPrompt: prompt, rawSettings: {} } };
          },
        } as LanguageModelV1,
      },
    }).languageModel(modelId);
  }

  // Handle Model Hub models (format: modelhub/{huggingface-model-id})
  let actualModelId = modelId;
  if (modelId.startsWith("modelhub/")) {
    // Extract the Hugging Face model ID and use huggingface provider
    const huggingFaceModelId = modelId.replace("modelhub/", "");
    actualModelId = `huggingface/${huggingFaceModelId}`;
  }

  const isReasoningModel =
    actualModelId.includes("reasoning") || actualModelId.endsWith("-thinking");

  if (isReasoningModel) {
    const gatewayModelId = actualModelId.replace(THINKING_SUFFIX_REGEX, "");

    return wrapLanguageModel({
      model: gateway.languageModel(gatewayModelId),
      middleware: extractReasoningMiddleware({ tagName: "thinking" }),
    });
  }

  return gateway.languageModel(actualModelId);
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  return gateway.languageModel("anthropic/claude-haiku-4.5");
}

export function getArtifactModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("artifact-model");
  }
  return gateway.languageModel("anthropic/claude-haiku-4.5");
}
