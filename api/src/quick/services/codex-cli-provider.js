import { normalizeLessonPayload } from "./lesson-normalizer.js";
import { buildPrompt } from "./lesson-prompt.js";
import { createImageWorkspace } from "../../shared/ai/workspace.js";
import { runCliPrompt } from "../../shared/ai/cli.js";
import { traceLog } from "../../services/trace-log.js";
import { LessonValidationError } from "../../shared/ai/errors.js";

export function createCodexCliProvider({ model } = {}) {
  return {
    async generateLesson({ imageBuffer, mimeType, level, traceId }) {
      const startedAt = Date.now();
      const workspace = await createImageWorkspace({
        imageBuffer,
        mimeType,
        prefix: "kaisensei-api-",
      });

      traceLog("provider", "lesson_prepare", {
        traceId: traceId || "",
        level,
        mimeType,
        imageBytes: imageBuffer.length,
      });

      try {
        const codexStartedAt = Date.now();
        traceLog("provider", "codex_start", {
          traceId: traceId || "",
          level,
          imageBytes: imageBuffer.length,
        });

        const raw = await runCliPrompt({
          imagePath: workspace.imagePath,
          prompt: buildPrompt(level),
          cwd: workspace.tempDir,
          model,
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

        const parseStartedAt = Date.now();
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          throw new LessonValidationError("The lesson got lost on the way.", {
            code: "provider_parse_error",
          });
        }
        traceLog("provider", "json_parsed", {
          traceId: traceId || "",
          ms: Date.now() - parseStartedAt,
        });

        const normalizeStartedAt = Date.now();
        const lesson = normalizeLessonPayload(parsed);
        traceLog("provider", "lesson_normalized", {
          traceId: traceId || "",
          ms: Date.now() - normalizeStartedAt,
        });

        traceLog("provider", "lesson_ready", {
          traceId: traceId || "",
          totalMs: Date.now() - startedAt,
        });

        return lesson;
      } finally {
        await workspace.cleanup();
      }
    },
  };
}
