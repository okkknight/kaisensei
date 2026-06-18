import { traceLog } from "../services/trace-log.js";

async function readFileStream(fileStream) {
  const chunks = [];
  for await (const chunk of fileStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function parseMultipartRequest(request) {
  const startedAt = Date.now();
  let imageBuffer = null;
  let mimeType = "application/octet-stream";
  let level = "Normal";
  let traceId = "";

  for await (const part of request.parts()) {
    if (part.type === "file" && part.fieldname === "image") {
      imageBuffer = await readFileStream(part.file);
      mimeType = part.mimetype || mimeType;
      continue;
    }

    if (part.type === "field" && part.fieldname === "level") {
      level = String(part.value || "").trim() || "Normal";
      continue;
    }

    if (part.type === "field" && part.fieldname === "traceId") {
      traceId = String(part.value || "").trim();
    }
  }

  return {
    imageBuffer,
    mimeType,
    level,
    traceId,
    parseMs: Date.now() - startedAt,
  };
}

function isValidLevel(level) {
  return level === "Normal" || level === "Advanced";
}

export function registerLessonJobRoutes(app, { jobStore, jobRunner }) {
  const prefixes = ["/v1", "/api/v1"];

  for (const prefix of prefixes) {
    app.post(`${prefix}/lesson-jobs`, async (request, reply) => {
      const requestStartedAt = Date.now();
      const { imageBuffer, mimeType, level, traceId, parseMs } = await parseMultipartRequest(request);

      if (!imageBuffer) {
        traceLog("route", "job_rejected_missing_image", {
          traceId,
          level,
          parseMs,
        });
        return reply.status(400).send({
          error: {
            code: "missing_image",
            message: "Please upload a photo.",
          },
        });
      }

      if (!isValidLevel(level)) {
        traceLog("route", "job_rejected_invalid_level", {
          traceId,
          level,
          parseMs,
        });
        return reply.status(400).send({
          error: {
            code: "invalid_level",
            message: "Level must be Normal or Advanced.",
          },
        });
      }

      const job = jobStore.create({ level });
      traceLog("route", "job_received", {
        traceId,
        jobId: job.jobId,
        level,
        mimeType,
        imageBytes: imageBuffer.length,
        parseMs,
        totalMs: Date.now() - requestStartedAt,
      });

      jobRunner.enqueue(job.jobId, { imageBuffer, mimeType, level, traceId });

      return reply.status(202).send({
        jobId: job.jobId,
        status: job.status,
      });
    });

    app.get(`${prefix}/lesson-jobs/:jobId`, async (request, reply) => {
      const job = jobStore.get(request.params.jobId);

      if (!job) {
        return reply.status(404).send({
          error: {
            code: "job_not_found",
            message: "Job not found.",
          },
        });
      }

      return reply.send(job);
    });
  }
}
