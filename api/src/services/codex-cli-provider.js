import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { normalizeLessonPayload, LessonValidationError } from "./lesson-normalizer.js";

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

function buildPrompt(level) {
  return [
    "You are kaisensei, a friendly photo-based English coach.",
    "",
    "The user will provide one photo.",
    "Your job is to turn the photo into a short English micro-lesson.",
    "",
    "The lesson must follow this path:",
    "See -> Learn -> Build -> Use.",
    "",
    "Return JSON only.",
    "Do not include markdown.",
    "Do not include extra commentary.",
    "",
    `Level: ${level}`,
    "",
    "Rules:",
    "- Focus on one useful sentence from the photo.",
    "- The sentence should be natural spoken English.",
    "- Prefer practical, high-frequency vocabulary and sentence patterns, but avoid babyish phrasing.",
    "- Do not list too many objects.",
    "- Teach chunks, not isolated words.",
    "- Build exercise should use chunks from the sentence.",
    "- Use step should ask one real-life question and provide a chunk-reordering answer exercise.",
    "- Keep the answer practical and reusable.",
    "- Keep Chinese explanations short.",
    "- Avoid grammar jargon.",
    "- If something is uncertain in the image, say what seems visible instead of guessing.",
    "",
    "Return this JSON shape:",
    "{",
    '  "level": "Normal" | "Advanced",',
    '  "see": {',
    '    "sentence": string,',
    '    "chinese": string,',
    '    "speakText": string',
    "  },",
    '  "learn": {',
    '    "chunks": [',
    "      {",
    '        "id": string,',
    '        "text": string,',
    '        "chinese": string',
    "      }",
    "    ],",
    '    "note": string',
    "  },",
    '  "build": {',
    '    "targetSentence": string,',
    '    "chunks": [',
    "      {",
    '        "id": string,',
    '        "text": string,',
    '        "chinese": string',
    "      }",
    "    ],",
    '    "correctOrder": string[]',
    "  },",
    '  "use": {',
    '    "situation": string,',
    '    "question": string,',
    '    "questionChinese": string,',
    '    "targetAnswer": string,',
    '    "answerChunks": [',
    "      {",
    '        "id": string,',
    '        "text": string,',
    '        "chinese": string',
    "      }",
    "    ],",
    '    "correctOrder": string[],',
    '    "speakText": string',
    "  }",
    "}",
  ].join("\n");
}

async function runCodexExec({ imagePath, prompt, cwd }) {
  const outputPath = join(cwd, "codex-last-message.txt");

  return await new Promise((resolve, reject) => {
    const child = spawn(
      "codex",
      [
        "exec",
        "--ephemeral",
        "--skip-git-repo-check",
        "--ignore-user-config",
        "--ignore-rules",
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

export function createCodexCliProvider() {
  return {
    async generateLesson({ imageBuffer, mimeType, level }) {
      const tempDir = await mkdtemp(join(tmpdir(), "kaisensei-api-"));
      const extension = mimeTypeToExtension(mimeType);
      const imagePath = join(tempDir, `image.${extension}`);
      await writeFile(imagePath, imageBuffer);

      try {
        const raw = await runCodexExec({
          imagePath,
          prompt: buildPrompt(level),
          cwd: tempDir,
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

        return normalizeLessonPayload(parsed);
      } finally {
        await rm(tempDir, { recursive: true, force: true }).catch(() => {});
      }
    },
  };
}
