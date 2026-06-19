import { readFile, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { AIProviderError } from "./errors.js";

export async function runCliPrompt({
  binary = process.env.CODEX_BINARY || "codex",
  model = process.env.CODEX_MODEL || "gpt-5.4-mini",
  cwd,
  imagePath,
  prompt,
}) {
  const outputPath = join(cwd, "codex-last-message.txt");

  return await new Promise((resolve, reject) => {
    const child = spawn(
      binary,
      [
        "exec",
        "--ephemeral",
        "--skip-git-repo-check",
        "--ignore-user-config",
        "--ignore-rules",
        "--model",
        model,
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
          reject(
            new AIProviderError("The lesson got lost on the way.", {
              code: "provider_runtime_error",
              detail: stderr.trim() || `codex exec exited with code ${code}`,
            }),
          );
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
