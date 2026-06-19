import { createCodexCliProvider } from "../quick/services/codex-cli-provider.js";
import { createGeminiApiProvider } from "../quick/services/gemini-api-provider.js";
import { createDeepCodexCliProvider } from "../deep/services/deep-codex-cli-provider.js";
import { createDeepGeminiApiProvider } from "../deep/services/deep-gemini-api-provider.js";

export function createProviderRegistry() {
  const providerName = String(process.env.LESSON_PROVIDER || "codex").toLowerCase();

  if (providerName === "gemini") {
    return {
      quick: createGeminiApiProvider({
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL,
      }),
      deep: createDeepGeminiApiProvider({
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL,
      }),
    };
  }

  return {
    quick: createCodexCliProvider({
      model: process.env.CODEX_MODEL,
    }),
    deep: createDeepCodexCliProvider({
      model: process.env.CODEX_MODEL,
    }),
  };
}
