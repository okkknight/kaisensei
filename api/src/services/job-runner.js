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
        });

        jobStore.update(jobId, { status: "running", error: null });

        const activeProvider = resolveProvider({
          provider,
          providers,
          mode: payload.mode,
        });

        let attempt = 0;
        let lastError = null;

        while (attempt < 2) {
          attempt += 1;

          try {
            const providerStartedAt = Date.now();
            traceLog("runner", "provider_start", {
              traceId: payload.traceId || "",
              jobId,
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

            return;
          } catch (error) {
            lastError = error;

            if (attempt < 2) {
              continue;
            }
          }
        }

        traceLog("runner", "job_failed", {
          traceId: payload.traceId || "",
          jobId,
          totalMs: Date.now() - startedAt,
          error: lastError instanceof Error ? lastError.message : String(lastError),
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
