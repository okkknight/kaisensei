import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { normalizeLessonPayload, LessonValidationError } from "./lesson-normalizer.js";
import { traceLog } from "./trace-log.js";
import { buildPrompt } from "./lesson-prompt.js";

function mimeTypeToExtension(mimeType) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "bin";
  }
}

async function runCodexExec({ imagePath, prompt, cwd, model }) {
  const outputPath = join(cwd, "codex-last-message.txt");
  const codexBinary = process.env.CODEX_BINARY || "codex";
  const codexModel = model || process.env.CODEX_MODEL || "gpt-5.4-mini";

  return await new Promise((resolve, reject) => {
    const child = spawn(
      codexBinary,
      [
        "exec",
        "--ephemeral",
        "--skip-git-repo-check",
        "--ignore-user-config",
        "--ignore-rules",
        "--model",
        codexModel,
        "--json",
        "--output-last-message",
        outputPath,
        "-C",
        cwd,
        "-i",
        imagePath,
        "-",
      ],
      {
        cwd,
        env: {
          ...process.env,
        },
        stdio: ["pipe", "pipe", "pipe"],
      },
    );

    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", async (code) => {
      try {
        if (code !== 0) {
          reject(new LessonValidationError("The lesson got lost on the way.", {
            code: "provider_runtime_error",
            detail: stderr.trim() || `codex exec exited with code ${code}`,
          }));
          return;
        }

        const raw = await readFile(outputPath, "utf8");
        resolve(raw.trim());
      } catch (error) {
        reject(error);
      } finally {
        await rm(outputPath, { force: true }).catch(() => {});
      }
    });

    child.stdin.end(prompt);
  });
}

export function createCodexCliProvider({ model } = {}) {
  return {
    async generateLesson({ imageBuffer, mimeType, level, traceId }) {
      const startedAt = Date.now();
      const tempDir = await mkdtemp(join(tmpdir(), "kaisensei-api-"));
      const extension = mimeTypeToExtension(mimeType);
      const imagePath = join(tempDir, `image.${extension}`);

      traceLog("provider", "lesson_prepare", {
        traceId: traceId || "",
        level,
        mimeType,
        imageBytes: imageBuffer.length,
      });

      const writeStartedAt = Date.now();
      await writeFile(imagePath, imageBuffer);
      traceLog("provider", "image_written", {
        traceId: traceId || "",
        ms: Date.now() - writeStartedAt,
        imageBytes: imageBuffer.length,
      });

      try {
        const codexStartedAt = Date.now();
        traceLog("provider", "codex_start", {
          traceId: traceId || "",
          level,
          imageBytes: imageBuffer.length,
        });

        const raw = await runCodexExec({
          imagePath,
          prompt: buildPrompt(level),
          cwd: tempDir,
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
        await rm(tempDir, { recursive: true, force: true }).catch(() => {});
      }
    },
  };
}
