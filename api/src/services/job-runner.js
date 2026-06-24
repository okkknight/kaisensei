import { traceLog } from "./trace-log.js";
import { LessonValidationError } from "../shared/ai/errors.js";
import { createDeepStageOrchestrator } from "../deep/services/staged-generation/deep-stage-orchestrator.js";

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

function buildRepairNotes(error) {
  if (error instanceof LessonValidationError) {
    const parts = ["Previous attempt failed validation.", error.message];
    const issues = error.details?.issues || error.details?.details?.issues;
    const nestedCode = error.details?.details?.code;

    if (Array.isArray(issues) && issues.length > 0) {
      parts.push(`Issues: ${issues.join("; ")}`);
    } else if (typeof error.details?.detail === "string" && error.details.detail) {
      parts.push(error.details.detail);
    } else if (typeof nestedCode === "string" && nestedCode && nestedCode !== error.code) {
      parts.push(`Code: ${nestedCode}`);
    } else if (typeof error.details?.code === "string" && error.details.code && error.details.code !== error.code) {
      parts.push(`Code: ${error.details.code}`);
    }

    return parts.join(" ");
  }

  const message = error instanceof Error ? error.message : String(error);
  return `Previous attempt failed. ${message}`;
}

function describeJobError(error) {
  if (error instanceof LessonValidationError) {
    return {
      name: error.name,
      code: error.code || error.details?.code || "lesson_validation_error",
      message: error.message,
      details: error.details || null,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name || "Error",
      code: error.code || "provider_runtime_error",
      message: error.message,
      details: error.details || null,
    };
  }

  return {
    name: typeof error,
    code: "provider_runtime_error",
    message: String(error),
    details: null,
  };
}

function resolveProvider({ provider, providers, mode }) {
  const providerMap = providers || (provider ? { quick: provider } : {});
  const requestedMode = String(mode || "quick").toLowerCase();
  return providerMap[requestedMode] || providerMap.quick || provider;
}

export function createLessonJobRunner({ jobStore, provider, providers }) {
  return {
    enqueue(jobId, payload) {
      setImmediate(async () => {
        const startedAt = Date.now();
        traceLog("runner", "job_started", {
          traceId: payload.traceId || "",
          jobId,
          level: payload.level,
          mode: payload.mode || "quick",
          queueMs: payload.jobCreatedAt ? Date.now() - new Date(payload.jobCreatedAt).getTime() : undefined,
        });

        jobStore.update(jobId, { status: "running", error: null });

        const activeProvider = resolveProvider({
          provider,
          providers,
          mode: payload.mode,
        });

        if (String(payload.mode || "quick").toLowerCase() === "deep" && typeof activeProvider.generateStage === "function") {
          const deepOrchestrator = createDeepStageOrchestrator({
            jobStore,
            provider: activeProvider,
          });

          try {
            traceLog("runner", "provider_start", {
              traceId: payload.traceId || "",
              jobId,
              mode: payload.mode || "quick",
            });

            await deepOrchestrator.run(jobId, payload);

            traceLog("runner", "provider_done", {
              traceId: payload.traceId || "",
              jobId,
              mode: payload.mode || "quick",
            });

            traceLog("runner", "job_succeeded", {
              traceId: payload.traceId || "",
              jobId,
              totalMs: Date.now() - startedAt,
              mode: payload.mode || "quick",
            });
            return;
          } catch (error) {
            traceLog("runner", "provider_error", {
              traceId: payload.traceId || "",
              jobId,
              mode: payload.mode || "quick",
              ...describeJobError(error),
            });

            traceLog("runner", "job_failed", {
              traceId: payload.traceId || "",
              jobId,
              totalMs: Date.now() - startedAt,
              ...describeJobError(error),
              mode: payload.mode || "quick",
            });

            jobStore.update(jobId, {
              status: "failed",
              lesson: null,
              error: toJobError(error),
            });
            return;
          }
        }

        let attempt = 0;
        let lastError = null;
        const maxAttempts = String(payload.mode || "quick").toLowerCase() === "deep" ? 3 : 2;

        while (attempt < maxAttempts) {
          attempt += 1;

          try {
            const providerStartedAt = Date.now();
            traceLog("runner", "provider_start", {
              traceId: payload.traceId || "",
              jobId,
              mode: payload.mode || "quick",
            });

            const lesson = await activeProvider.generateLesson(
              attempt === 1 ? payload : {
                ...payload,
                repairNotes: buildRepairNotes(lastError),
              },
            );

            traceLog("runner", "provider_done", {
              traceId: payload.traceId || "",
              jobId,
              providerMs: Date.now() - providerStartedAt,
              mode: payload.mode || "quick",
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
              mode: payload.mode || "quick",
            });

            return;
          } catch (error) {
            lastError = error;

            traceLog("runner", "provider_error", {
              traceId: payload.traceId || "",
              jobId,
              mode: payload.mode || "quick",
              attempt,
              maxAttempts,
              ...describeJobError(error),
            });

            if (attempt < maxAttempts) {
              traceLog("runner", "provider_retrying", {
                traceId: payload.traceId || "",
                jobId,
                mode: payload.mode || "quick",
                attempt,
                maxAttempts,
              });
              continue;
            }
          }
        }

        traceLog("runner", "job_failed", {
          traceId: payload.traceId || "",
          jobId,
          totalMs: Date.now() - startedAt,
          ...describeJobError(lastError),
          mode: payload.mode || "quick",
        });

        jobStore.update(jobId, {
          status: "failed",
          lesson: null,
          error: toJobError(lastError),
        });
      });
    },
  };
}
