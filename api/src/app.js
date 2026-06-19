import Fastify from "fastify";
import multipart from "@fastify/multipart";
import { createLessonJobStore } from "./stores/in-memory-job-store.js";
import { createCodexCliProvider } from "./quick/services/codex-cli-provider.js";
import { createGeminiApiProvider } from "./quick/services/gemini-api-provider.js";
import { createLessonJobRunner } from "./services/job-runner.js";
import { registerLessonJobRoutes } from "./routes/lesson-jobs.js";

function createConfiguredProvider() {
  const providerName = String(process.env.LESSON_PROVIDER || "codex").toLowerCase();

  if (providerName === "gemini") {
    return createGeminiApiProvider({
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL,
    });
  }

  return createCodexCliProvider({
    model: process.env.CODEX_MODEL,
  });
}

export function createApp({ jobStore, provider, jobRunner } = {}) {
  const app = Fastify({
    logger: false,
  });

  const resolvedJobStore = jobStore ?? createLessonJobStore();
  const resolvedProvider = provider ?? createConfiguredProvider();
  const resolvedJobRunner = jobRunner ?? createLessonJobRunner({
    jobStore: resolvedJobStore,
    provider: resolvedProvider,
  });

  app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });

  app.get("/healthz", async () => ({ ok: true }));
  app.get("/api/healthz", async () => ({ ok: true }));
  registerLessonJobRoutes(app, {
    jobStore: resolvedJobStore,
    jobRunner: resolvedJobRunner,
  });

  return app;
}
