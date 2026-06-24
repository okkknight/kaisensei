import { LessonValidationError } from "../../../shared/ai/errors.js";
import { normalizeDeepCoursePayload } from "../course-normalizer.js";
import { deepCourseDefaultConfig } from "../../config/course.js";
import { lessonJobGenerationStages } from "../../../contracts/job.js";
import { cloneDeepGenerationState, getDeepGenerationNextStage, setDeepGenerationStageState } from "./deep-generation-state.js";
import { createDeepStageContext, mergeDeepStageResult } from "./deep-stage-context.js";

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

function createFinalLesson({ frozenLesson, level, config }) {
  return normalizeDeepCoursePayload(
    {
      mode: "deep",
      level,
      overview: frozenLesson.overview,
      modules: {
        notice: frozenLesson.notice,
        interpret: frozenLesson.interpret,
        interact: frozenLesson.interact,
        stepIn: frozenLesson.stepIn,
      },
    },
    config,
  );
}

export function createDeepStageOrchestrator({ jobStore, provider, config = deepCourseDefaultConfig } = {}) {
  if (!jobStore) {
    throw new Error("jobStore is required for deep stage orchestration");
  }

  if (!provider || typeof provider.generateStage !== "function") {
    throw new Error("Deep stage provider must implement generateStage");
  }

  return {
    async run(jobId, payload) {
      let job = jobStore.get(jobId);
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      let generation = cloneDeepGenerationState(job.generation);
      let frozenLesson = generation.frozenLesson || {};

      for (const stage of lessonJobGenerationStages) {
        generation = setDeepGenerationStageState(generation, stage, "running", {
          activeStage: stage,
          errorStage: null,
          errorMessage: null,
        });
        jobStore.update(jobId, { generation: cloneDeepGenerationState(generation) });

        let attempt = 0;
        let lastError = null;
        let stageResult = null;
        const maxAttempts = 3;

        while (attempt < maxAttempts) {
          attempt += 1;

          try {
            stageResult = await provider.generateStage({
              stage,
              imageBuffer: payload.imageBuffer,
              mimeType: payload.mimeType,
              level: payload.level,
              traceId: payload.traceId,
              repairNotes: attempt === 1 ? payload.repairNotes : buildRepairNotes(lastError),
              background: createDeepStageContext({
                stage,
                level: payload.level,
                frozenLesson,
                imageBuffer: payload.imageBuffer,
                mimeType: payload.mimeType,
                traceId: payload.traceId,
              }).background,
            });
            break;
          } catch (error) {
            lastError = error;
            if (attempt < maxAttempts) {
              continue;
            }
          }
        }

        if (!stageResult) {
          generation = setDeepGenerationStageState(generation, stage, "failed", {
            activeStage: stage,
            errorStage: stage,
            errorMessage: lastError instanceof Error ? lastError.message : String(lastError),
          });
          jobStore.update(jobId, { generation: cloneDeepGenerationState(generation) });
          throw lastError;
        }

        frozenLesson = mergeDeepStageResult(frozenLesson, stage, stageResult);
        generation = setDeepGenerationStageState(generation, stage, "ready", {
          activeStage: getDeepGenerationNextStage(stage),
          frozenLesson,
        });
        jobStore.update(jobId, { generation: cloneDeepGenerationState(generation) });
      }

      const finalLesson = createFinalLesson({
        frozenLesson,
        level: String(payload.level || "Normal").toLowerCase() === "advanced" ? "advanced" : "normal",
        config,
      });
      generation = setDeepGenerationStageState(generation, "step_in", "ready", {
        activeStage: "complete",
        frozenLesson: {
          ...frozenLesson,
          overview: finalLesson.overview,
          notice: finalLesson.modules.notice,
          interpret: finalLesson.modules.interpret,
          interact: finalLesson.modules.interact,
          stepIn: finalLesson.modules.stepIn,
        },
        errorStage: null,
        errorMessage: null,
      });
      jobStore.update(jobId, {
        generation: cloneDeepGenerationState(generation),
        lesson: finalLesson,
        status: "succeeded",
        error: null,
      });

      return finalLesson;
    },
  };
}
