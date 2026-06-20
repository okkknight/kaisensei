import { createImageWorkspace } from "../../shared/ai/workspace.js";
import { runCliPrompt } from "../../shared/ai/cli.js";
import { traceLog } from "../../services/trace-log.js";
import { LessonValidationError } from "../../shared/ai/errors.js";
import { deepCourseDefaultConfig, deepCourseDefaultFixedCopy } from "../config/course.js";
import { buildDeepCoursePrompt } from "./course-prompt.js";
import { normalizeDeepCoursePayload } from "./course-normalizer.js";

function extractJsonText(raw) {
  const startIndex = raw.search(/[\[{]/);
  if (startIndex < 0) {
    return "";
  }

  const openChar = raw[startIndex];
  const closeChar = openChar === "[" ? "]" : "}";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = startIndex; index < raw.length; index += 1) {
    const char = raw[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === openChar) {
      depth += 1;
      continue;
    }

    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return raw.slice(startIndex, index + 1);
      }
    }
  }

  return raw.slice(startIndex).trim();
}

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
          prompt: buildDeepCoursePrompt({
            level,
            repairNotes,
            config: deepCourseDefaultConfig,
            fixedCopy: deepCourseDefaultFixedCopy,
          }),
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

        const jsonText = extractJsonText(raw);
        let parsed;
        try {
          parsed = JSON.parse(jsonText);
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
