import { LessonValidationError } from "./lesson-normalizer.js";

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
        jobStore.update(jobId, { status: "running", error: null });

        try {
          const lesson = await provider.generateLesson(payload);
          jobStore.update(jobId, {
            status: "succeeded",
            lesson,
            error: null,
          });
        } catch (error) {
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
