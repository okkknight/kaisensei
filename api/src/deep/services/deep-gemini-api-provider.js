import { traceLog } from "../../services/trace-log.js";
import { LessonValidationError } from "../../shared/ai/errors.js";
import { normalizeDeepCoursePayload } from "./course-normalizer.js";
import { buildDeepCoursePrompt } from "./course-prompt.js";

function mimeTypeToGeminiName(mimeType) {
  switch (mimeType) {
    case "image/jpeg":
      return "image/jpeg";
    case "image/png":
      return "image/png";
    case "image/webp":
      return "image/webp";
    default:
      return mimeType || "application/octet-stream";
  }
}

function extractTextFromResponse(payload) {
  const candidates = Array.isArray(payload?.candidates) ? payload.candidates : [];
  for (const candidate of candidates) {
    const content = candidate?.content;
    const parts = Array.isArray(content?.parts) ? content.parts : [];
    const text = parts
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("")
      .trim();
    if (text) {
      return text;
    }
  }

  return "";
}

function toRuntimeError(message, detail) {
  return new LessonValidationError(message, {
    code: "provider_runtime_error",
    detail,
  });
}

export function createDeepGeminiApiProvider({
  apiKey = process.env.GEMINI_API_KEY || "",
  model = process.env.GEMINI_MODEL || "gemini-2.5-flash",
  fetchImpl = fetch,
} = {}) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required when LESSON_PROVIDER=gemini");
  }

  return {
    async generateLesson({ imageBuffer, mimeType, level, traceId, repairNotes }) {
      const startedAt = Date.now();
      const prompt = buildDeepCoursePrompt({ level, repairNotes });
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const imagePart = {
        inline_data: {
          mime_type: mimeTypeToGeminiName(mimeType),
          data: imageBuffer.toString("base64"),
        },
      };

      traceLog("provider", "lesson_prepare", {
        traceId: traceId || "",
        level,
        mimeType,
        imageBytes: imageBuffer.length,
        model,
        mode: "deep",
      });

      try {
        const requestStartedAt = Date.now();
        traceLog("provider", "gemini_start", {
          traceId: traceId || "",
          level,
          model,
          imageBytes: imageBuffer.length,
          mode: "deep",
        });

        const response = await fetchImpl(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  imagePart,
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.35,
              responseMimeType: "application/json",
            },
          }),
        });

        const responseText = await response.text();
        traceLog("provider", "gemini_done", {
          traceId: traceId || "",
          ms: Date.now() - requestStartedAt,
          status: response.status,
          rawBytes: responseText.length,
        });

        if (!response.ok) {
          throw toRuntimeError("The lesson got lost on the way.", responseText || `Gemini request failed with status ${response.status}`);
        }

        let parsedResponse;
        try {
          parsedResponse = JSON.parse(responseText);
        } catch {
          throw toRuntimeError("The lesson got lost on the way.", "Gemini response was not valid JSON");
        }

        const raw = extractTextFromResponse(parsedResponse);
        if (!raw) {
          throw toRuntimeError("The lesson got lost on the way.", "Gemini response did not include any text");
        }

        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          throw toRuntimeError("The lesson got lost on the way.", "Gemini output was not valid JSON");
        }

        const lesson = normalizeDeepCoursePayload(parsed);

        traceLog("provider", "lesson_ready", {
          traceId: traceId || "",
          totalMs: Date.now() - startedAt,
          mode: "deep",
        });

        return lesson;
      } catch (error) {
        if (error instanceof LessonValidationError) {
          throw error;
        }

        throw toRuntimeError("The lesson got lost on the way.", error instanceof Error ? error.message : String(error));
      }
    },
  };
}
