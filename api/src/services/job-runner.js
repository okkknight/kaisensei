import { traceLog } from "./trace-log.js";
import { LessonValidationError } from "../shared/ai/errors.js";

function toJobError(error) {
  if (error instanceof LessonValidationError) {
    return {
      code: error.details?.code || error.code || "provider_parse_error",
      message: error.message,
    };
  }

  return {
    code: "provider_runtime_error",
    message: error instanceof Error ? error.message : "The lesson got lost on the way.",
  };
}

export function createLessonJobRunner({ jobStore, provider }) {
  return {
    enqueue(jobId, payload) {
      setImmediate(async () => {
        const startedAt = Date.now();
        traceLog("runner", "job_started", {
          traceId: payload.traceId || "",
          jobId,
          level: payload.level,
        });

        jobStore.update(jobId, { status: "running", error: null });

        try {
          const providerStartedAt = Date.now();
          traceLog("runner", "provider_start", {
            traceId: payload.traceId || "",
            jobId,
          });

          const lesson = await provider.generateLesson(payload);
          traceLog("runner", "provider_done", {
            traceId: payload.traceId || "",
            jobId,
            providerMs: Date.now() - providerStartedAt,
          });

          jobStore.update(jobId, {
            status: "succeeded",
            lesson,
            error: null,
          });

          traceLog("runner", "job_succeeded", {
            traceId: payload.traceId || "",
            jobId,
            totalMs: Date.now() - startedAt,
          });
        } catch (error) {
          traceLog("runner", "job_failed", {
            traceId: payload.traceId || "",
            jobId,
            totalMs: Date.now() - startedAt,
            error: error instanceof Error ? error.message : String(error),
          });

          jobStore.update(jobId, {
            status: "failed",
            lesson: null,
            error: toJobError(error),
          });
        }
      });
    },
  };
}
