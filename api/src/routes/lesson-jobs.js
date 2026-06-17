async function readFileStream(fileStream) {
  const chunks = [];
  for await (const chunk of fileStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function parseMultipartRequest(request) {
  let imageBuffer = null;
  let mimeType = "application/octet-stream";
  let level = "Normal";

  for await (const part of request.parts()) {
    if (part.type === "file" && part.fieldname === "image") {
      imageBuffer = await readFileStream(part.file);
      mimeType = part.mimetype || mimeType;
      continue;
    }

    if (part.type === "field" && part.fieldname === "level") {
      level = String(part.value || "").trim() || "Normal";
    }
  }

  return { imageBuffer, mimeType, level };
}

function isValidLevel(level) {
  return level === "Normal" || level === "Advanced";
}

export function registerLessonJobRoutes(app, { jobStore, jobRunner }) {
  app.post("/v1/lesson-jobs", async (request, reply) => {
    const { imageBuffer, mimeType, level } = await parseMultipartRequest(request);

    if (!imageBuffer) {
      return reply.status(400).send({
        error: {
          code: "missing_image",
          message: "Please upload a photo.",
        },
      });
    }

    if (!isValidLevel(level)) {
      return reply.status(400).send({
        error: {
          code: "invalid_level",
          message: "Level must be Normal or Advanced.",
        },
      });
    }

    const job = jobStore.create({ level });
    jobRunner.enqueue(job.jobId, { imageBuffer, mimeType, level });

    return reply.status(202).send({
      jobId: job.jobId,
      status: job.status,
    });
  });

  app.get("/v1/lesson-jobs/:jobId", async (request, reply) => {
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
