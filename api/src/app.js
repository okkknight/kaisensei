import Fastify from "fastify";
import multipart from "@fastify/multipart";
import { createLessonJobStore } from "./stores/in-memory-job-store.js";
import { createCodexCliProvider } from "./services/codex-cli-provider.js";
import { createLessonJobRunner } from "./services/job-runner.js";
import { registerLessonJobRoutes } from "./routes/lesson-jobs.js";

export function createApp({ jobStore, provider, jobRunner } = {}) {
  const app = Fastify({
    logger: false,
  });

  const resolvedJobStore = jobStore ?? createLessonJobStore();
  const resolvedProvider = provider ?? createCodexCliProvider();
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
  registerLessonJobRoutes(app, {
    jobStore: resolvedJobStore,
    jobRunner: resolvedJobRunner,
  });

  return app;
}
