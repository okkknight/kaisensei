import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { normalizeLessonPayload, LessonValidationError } from "./lesson-normalizer.js";
import { traceLog } from "./trace-log.js";

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

export function buildPrompt(level) {
  const levelRules =
    level === "Advanced"
      ? [
          "Advanced tone:",
          "- Aim for a more polished, natural sentence that still feels immediately useful in everyday life.",
          "- Use higher-level but common vocabulary and collocations, especially wording often heard in IELTS, TOEFL, work, study, or travel contexts.",
          "- Keep the sentence to one line and one main idea, but let it feel a little more mature and expressive than Normal.",
          "- Target about 16-22 words.",
          "- You may include a light extra detail or a smoother clause, but do not make it sound academic, literary, or essay-like.",
          "- The goal is a clear upgrade, not rare vocabulary for its own sake.",
        ]
      : [
          "Normal tone:",
          "- Aim for a clear, direct, everyday sentence that feels easy to say out loud.",
          "- Keep the sentence short and natural, usually about 12-16 words.",
          "- Prefer the most obvious, practical wording for the scene.",
          "- Avoid extra decoration, stacked clauses, or fancy phrasing.",
        ];

  return [
    "You are kaisensei, a friendly photo-based English coach.",
    "",
    "The user will provide one photo.",
    "Your job is to turn the photo into one short English micro-lesson that follows a single learning path.",
    "",
    "The lesson must follow this path:",
    "See -> Learn -> Build -> Use.",
    "",
    "Return JSON only.",
    "Do not include markdown.",
    "Do not include extra commentary.",
    "Do not add extra keys beyond the required JSON shape.",
    "",
    `Level: ${level}`,
    "",
    "Rules:",
    "- Focus on one useful idea from the photo and avoid listing many objects.",
    "- See must be a single natural sentence only.",
    ...levelRules,
    "- Do not add extra clauses or extra sentences just to inflate the length.",
    "- Make the See sentence sound like a real person would naturally say it after noticing the scene.",
    "- Prefer everyday spoken English with useful vocabulary and phrasing.",
    "- Advanced should still sound practical and real, not academic or abstract.",
    "- For See and Build, describe the visible scene from an observer's perspective.",
    "- Prefer third-person or objective phrasing for See and Build.",
    "- Avoid first-person and second-person pronouns in See and Build unless they are clearly visible in the photo as text or speech.",
    "- If a person is visible, describe what they are doing or what is happening around them, not what the viewer is doing.",
    "- Prefer practical, high-frequency vocabulary and sentence patterns, but avoid babyish phrasing.",
    "- Learn should select 3-5 high-value chunks, usually 3-4 for simple scenes and 4-5 for richer scenes.",
    "- Learn chunks should be cut naturally from the sentence, centering on high-frequency words, phrases, collocations, and fixed expressions.",
    "- Do not mechanically slice the sentence clause by clause or into equal-looking pieces.",
    "- Prefer chunks that sound like real spoken units a learner might reuse, even if that means merging obvious neighbors into one phrase.",
    "- Teach reusable phrases, useful collocations, and teaching-worthy chunks.",
    "- Do not split one idea into too many tiny chunks.",
    "- Chunks should feel like building blocks, not isolated vocabulary drill items.",
    "- Build.targetSentence should match the See sentence exactly.",
    "- Build exercise should rebuild the sentence with natural-language chunks that are re-segmented for sentence assembly, not copied one-for-one from Learn.",
    "- Build chunks should follow natural phrasing boundaries such as subject, verb, object, adverb, and prepositional phrase boundaries, and may differ in size and boundaries from Learn chunks.",
    "- Keep fixed collocations intact when they sound natural as one unit.",
    "- Build should be slightly more challenging than Learn by using a different and more sentence-like segmentation, not the same card boundaries.",
    "- Avoid chunk sets where every card is just a clause fragment; each Build chunk should still feel like a natural phrase or phrase cluster.",
    "- Build should feel like real sentence construction, with chunk boundaries chosen for grammar and flow rather than for memorizing the same cards again.",
    "- Use must feel like a real conversation, not a generic prompt.",
    "- Use step should present a specific person in a specific setting speaking to the user.",
    "- In Use.situation, name the speaker relationship or setting, such as a coworker, friend, classmate, barista, teacher, roommate, or interviewer.",
    "- In Use.question, write a natural line of spoken English that someone in that situation would actually say.",
    "- Do not mention picture, photo, image, or scene in Use.question.",
    "- Do not ask things like 'What are the people doing in this picture?' or 'How would you describe the scene?'.",
    "- Ask about a concrete response the user could realistically give in that conversation.",
    "- Prefer conversational follow-ups such as a reaction, opinion, confirmation, or a simple personal answer.",
    "- Good shapes include: 'Did you have a good time there?', 'Is that your coffee mug?', or 'How was the trip?'.",
    "- Use may use first-person or second-person phrasing because it practices how the user would answer in real life.",
    "- The Use answer should stay grounded in the same visible scene, but it can be slightly more conversational than See.",
    "- Use.targetAnswer must naturally reuse 1-2 chunks or collocations from Learn.chunks, but not all of them.",
    "- The reused Learn chunks should fit the reply naturally and should not make the answer sound copied from See.",
    "- Use.targetAnswer should add at least one new idea, reaction, opinion, or personal detail so it feels like a real reply instead of a paraphrase.",
    "- Keep the answer practical and reusable.",
    "- Keep Chinese explanations short.",
    "- Avoid grammar jargon.",
    "- If something is uncertain in the image, say what seems visible instead of guessing.",
    "- If the scene is very simple, choose a simple sentence rather than forcing sophistication.",
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
  const codexBinary = process.env.CODEX_BINARY || "codex";

  return await new Promise((resolve, reject) => {
    const child = spawn(
      codexBinary,
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
