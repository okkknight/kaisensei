import { traceLog } from "../services/trace-log.js";
import { lessonJobModes } from "../contracts/job.js";

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
  let mode = "quick";
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

    if (part.type === "field" && part.fieldname === "mode") {
      mode = String(part.value || "").trim() || "quick";
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
    mode,
    traceId,
    parseMs: Date.now() - startedAt,
  };
}

function isValidLevel(level) {
  return level === "Normal" || level === "Advanced";
}

function isValidMode(mode) {
  return lessonJobModes.includes(mode);
}

export function registerLessonJobRoutes(app, { jobStore, jobRunner }) {
  const prefixes = ["/v1", "/api/v1"];

  for (const prefix of prefixes) {
    app.post(`${prefix}/lesson-jobs`, async (request, reply) => {
      const requestStartedAt = Date.now();
      const { imageBuffer, mimeType, level, mode, traceId, parseMs } = await parseMultipartRequest(request);

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

      if (!isValidMode(mode)) {
        traceLog("route", "job_rejected_invalid_mode", {
          traceId,
          mode,
          parseMs,
        });
        return reply.status(400).send({
          error: {
            code: "invalid_mode",
            message: "Mode must be quick or deep.",
          },
        });
      }

      const job = jobStore.create({ level, mode, traceId });
      traceLog("route", "job_received", {
        traceId,
        jobId: job.jobId,
        level,
        mode,
        mimeType,
        imageBytes: imageBuffer.length,
        parseMs,
        totalMs: Date.now() - requestStartedAt,
      });

      jobRunner.enqueue(job.jobId, {
        imageBuffer,
        mimeType,
        level,
        mode,
        traceId,
        jobCreatedAt: job.createdAt,
      });

      return reply.status(202).send({
        jobId: job.jobId,
        status: job.status,
        traceId: job.traceId || traceId || "",
      });
    });

    app.get(`${prefix}/lesson-jobs/:jobId`, async (request, reply) => {
      const requestStartedAt = Date.now();
      const job = jobStore.get(request.params.jobId);

      if (!job) {
        traceLog("route", "job_poll_not_found", {
          jobId: request.params.jobId,
          totalMs: Date.now() - requestStartedAt,
        });
        return reply.status(404).send({
          error: {
            code: "job_not_found",
            message: "Job not found.",
          },
        });
      }

      traceLog("route", "job_polled", {
        traceId: job.traceId || "",
        jobId: job.jobId,
        status: job.status,
        mode: job.mode,
        totalMs: Date.now() - requestStartedAt,
      });

      return reply.send(job);
    });
  }
}
