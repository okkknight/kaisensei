export const lessonJobStatuses = ["queued", "running", "succeeded", "failed"];
export const lessonJobModes = ["quick", "deep"];
export const lessonJobGenerationStages = ["overview_notice", "interpret", "interact", "step_in"];
export const lessonJobGenerationStatuses = ["pending", "running", "ready", "failed"];
export const lessonJobGenerationActiveStages = [...lessonJobGenerationStages, "complete"];
