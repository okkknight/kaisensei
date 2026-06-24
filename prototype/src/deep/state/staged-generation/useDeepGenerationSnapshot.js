import { useMemo } from "react";
import { createDeepCourseLessonSnapshot } from "./deep-generation-state.js";

export function useDeepGenerationSnapshot({ lesson = null, generation = null, level = "Normal" } = {}) {
  return useMemo(() => createDeepCourseLessonSnapshot({ lesson, generation, level }), [generation, level, lesson]);
}

export default useDeepGenerationSnapshot;
