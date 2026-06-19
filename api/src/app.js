import Fastify from "fastify";
import multipart from "@fastify/multipart";
import { createLessonJobStore } from "./stores/in-memory-job-store.js";
import { createLessonJobRunner } from "./services/job-runner.js";
import { registerLessonJobRoutes } from "./routes/lesson-jobs.js";
import { createProviderRegistry } from "./services/provider-registry.js";

export function createApp({ jobStore, provider, providers, jobRunner } = {}) {
  const app = Fastify({
    logger: false,
  });

  const resolvedJobStore = jobStore ?? createLessonJobStore();
  const resolvedProviders = providers ?? (provider ? { quick: provider } : (jobRunner ? null : createProviderRegistry()));
  const resolvedProvider = provider ?? resolvedProviders?.quick ?? null;
  const resolvedJobRunner = jobRunner ?? createLessonJobRunner({
    jobStore: resolvedJobStore,
    provider: resolvedProvider,
    providers: resolvedProviders || undefined,
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
