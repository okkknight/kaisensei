import { randomUUID } from "node:crypto";

function createJobId() {
  return `job_${randomUUID().replaceAll("-", "")}`;
}

function nowIso() {
  return new Date().toISOString();
}

export function createLessonJobStore() {
  const jobs = new Map();

  return {
    create({ level }) {
      const job = {
        jobId: createJobId(),
        level,
        status: "queued",
        createdAt: nowIso(),
        updatedAt: nowIso(),
        lesson: null,
        error: null,
      };

      jobs.set(job.jobId, job);
      return { ...job };
    },

    get(jobId) {
      const job = jobs.get(jobId);
      return job ? { ...job } : null;
    },

    update(jobId, patch) {
      const current = jobs.get(jobId);
      if (!current) return null;

      const updated = {
        ...current,
        ...patch,
        updatedAt: nowIso(),
      };

      jobs.set(jobId, updated);
      return { ...updated };
    },
  };
}
