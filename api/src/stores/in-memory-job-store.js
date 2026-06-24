import { randomUUID } from "node:crypto";
import { createDeepGenerationState, cloneDeepGenerationState } from "../deep/services/staged-generation/deep-generation-state.js";

function createJobId() {
  return `job_${randomUUID().replaceAll("-", "")}`;
}

function nowIso() {
  return new Date().toISOString();
}

export function createLessonJobStore() {
  const jobs = new Map();
  const jobArtifacts = new Map();

  return {
    create({ level, mode = "quick", traceId = "", imageBuffer = null, mimeType = "" }) {
      const job = {
        jobId: createJobId(),
        level,
        mode,
        traceId,
        status: "queued",
        createdAt: nowIso(),
        updatedAt: nowIso(),
        lesson: null,
        error: null,
        generation: createDeepGenerationState(),
      };

      jobs.set(job.jobId, job);
      jobArtifacts.set(job.jobId, {
        imageBuffer,
        mimeType,
      });
      return {
        ...job,
        generation: cloneDeepGenerationState(job.generation),
      };
    },

    get(jobId) {
      const job = jobs.get(jobId);
      if (!job) return null;

      return {
        ...job,
        generation: cloneDeepGenerationState(job.generation),
      };
    },

    getArtifacts(jobId) {
      const artifacts = jobArtifacts.get(jobId);
      if (!artifacts) return null;
      return {
        imageBuffer: artifacts.imageBuffer,
        mimeType: artifacts.mimeType,
      };
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
      return {
        ...updated,
        generation: cloneDeepGenerationState(updated.generation),
      };
    },
  };
}
