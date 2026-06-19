import { useQuickLessonJobLifecycle } from "./useQuickLessonJobLifecycle.js";
import { useQuickLessonPreview } from "./useQuickLessonPreview.js";

export function useQuickLessonLifecycle({ initialFile = null, initialLevel = "Normal", onExitToCamera } = {}) {
  const preview = useQuickLessonPreview();
  const job = useQuickLessonJobLifecycle({
    initialFile,
    initialLevel,
    onExitToCamera,
    setPreviewFromFile: preview.setPreviewFromFile,
    clearPreview: preview.clearPreview,
  });

  return {
    level: job.level,
    screen: job.screen,
    lesson: job.lesson,
    errorState: job.errorState,
    photoPreviewUrl: preview.photoPreviewUrl,
    loadingMessage: job.loadingMessage,
    handleRetakePhoto: job.handleRetakePhoto,
    handleRetry: job.handleRetry,
    generateLessonFromFile: job.generateLessonFromFile,
  };
}

export default useQuickLessonLifecycle;
