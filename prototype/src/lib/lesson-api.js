const API_BASE = import.meta.env.VITE_KAISENSEI_API_BASE ?? "";

export class LessonApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = "LessonApiError";
    this.status = status;
    this.details = details;
  }
}

function resolveUrl(path) {
  return `${API_BASE}${path}`;
}

async function readErrorMessage(response) {
  try {
    const payload = await response.json();
    return payload?.error?.message || payload?.message || response.statusText || "The lesson got lost on the way.";
  } catch {
    return response.statusText || "The lesson got lost on the way.";
  }
}

export async function createLessonJob({ image, level, signal }) {
  const formData = new FormData();
  formData.append("image", image, image.name || "photo.jpg");
  formData.append("level", level);

  const response = await fetch(resolveUrl("/v1/lesson-jobs"), {
    method: "POST",
    body: formData,
    signal,
  });

  if (!response.ok) {
    throw new LessonApiError(await readErrorMessage(response), response.status);
  }

  return response.json();
}

export async function getLessonJob(jobId, signal) {
  const response = await fetch(resolveUrl(`/v1/lesson-jobs/${jobId}`), {
    signal,
  });

  if (!response.ok) {
    throw new LessonApiError(await readErrorMessage(response), response.status);
  }

  return response.json();
}
