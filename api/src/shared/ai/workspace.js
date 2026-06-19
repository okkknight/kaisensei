import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function mimeTypeToExtension(mimeType) {
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

export async function createImageWorkspace({ imageBuffer, mimeType, prefix = "kaisensei-ai-" }) {
  const tempDir = await mkdtemp(join(tmpdir(), prefix));
  const imagePath = join(tempDir, `image.${mimeTypeToExtension(mimeType)}`);

  await writeFile(imagePath, imageBuffer);

  return {
    tempDir,
    imagePath,
    async cleanup() {
      await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    },
  };
}
