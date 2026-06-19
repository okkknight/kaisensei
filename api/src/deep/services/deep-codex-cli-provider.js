import { createImageWorkspace } from "../../shared/ai/workspace.js";
import { runCliPrompt } from "../../shared/ai/cli.js";
import { traceLog } from "../../services/trace-log.js";
import { LessonValidationError } from "../../shared/ai/errors.js";
import { buildDeepCoursePrompt } from "./course-prompt.js";
import { normalizeDeepCoursePayload } from "./course-normalizer.js";

export function createDeepCodexCliProvider({ model, runCliPrompt: runCliPromptImpl = runCliPrompt, binary } = {}) {
  return {
    async generateLesson({ imageBuffer, mimeType, level, traceId, repairNotes }) {
      const startedAt = Date.now();
      const workspace = await createImageWorkspace({
        imageBuffer,
        mimeType,
        prefix: "kaisensei-deep-",
      });

      traceLog("provider", "lesson_prepare", {
        traceId: traceId || "",
        level,
        mimeType,
        imageBytes: imageBuffer.length,
        mode: "deep",
      });

      try {
        const codexStartedAt = Date.now();
        traceLog("provider", "codex_start", {
          traceId: traceId || "",
          level,
          imageBytes: imageBuffer.length,
          mode: "deep",
        });

        const raw = await runCliPromptImpl({
          binary,
          model,
          imagePath: workspace.imagePath,
          prompt: buildDeepCoursePrompt({ level, repairNotes }),
          cwd: workspace.tempDir,
        });

        traceLog("provider", "codex_done", {
          traceId: traceId || "",
          ms: Date.now() - codexStartedAt,
          rawBytes: raw.length,
        });

        if (!raw) {
          throw new LessonValidationError("The lesson got lost on the way.", {
            code: "provider_empty_output",
          });
        }

        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          throw new LessonValidationError("The lesson got lost on the way.", {
            code: "provider_parse_error",
          });
        }

        const lesson = normalizeDeepCoursePayload(parsed);

        traceLog("provider", "lesson_ready", {
          traceId: traceId || "",
          totalMs: Date.now() - startedAt,
          mode: "deep",
        });

        return lesson;
      } finally {
        await workspace.cleanup();
      }
    },
  };
}
