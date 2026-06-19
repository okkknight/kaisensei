import { useQuickLessonInteractions } from "./useQuickLessonInteractions.js";
import { useQuickLessonLifecycle } from "./useQuickLessonLifecycle.js";

export function useQuickLessonFlow({ initialFile = null, initialLevel = "Normal", onExitToCamera } = {}) {
  const session = useQuickLessonLifecycle({
    initialFile,
    initialLevel,
    onExitToCamera,
  });
  const interactions = useQuickLessonInteractions({
    lesson: session.lesson,
    onRetakePhoto: session.handleRetakePhoto,
  });

  return {
    level: session.level,
    screen: session.screen,
    lesson: session.lesson,
    activeStep: interactions.activeStep,
    buildSelectedChunks: interactions.buildSelectedChunks,
    useSelectedChunks: interactions.useSelectedChunks,
    buildFeedback: interactions.buildFeedback,
    useFeedback: interactions.useFeedback,
    buildIsSolved: interactions.buildIsSolved,
    useIsSolved: interactions.useIsSolved,
    buildBank: interactions.buildBank,
    useBank: interactions.useBank,
    speakingKey: interactions.speakingKey,
    photoPreviewUrl: session.photoPreviewUrl,
    errorState: session.errorState,
    loadingMessage: session.loadingMessage,
    handleRetakePhoto: session.handleRetakePhoto,
    handleRetry: session.handleRetry,
    handleBack: interactions.handleBack,
    handleContinue: interactions.handleContinue,
    speak: interactions.speak,
    handleBuildToggle: interactions.handleBuildToggle,
    handleBuildReset: interactions.handleBuildReset,
    handleUseToggle: interactions.handleUseToggle,
    handleUseReset: interactions.handleUseReset,
    handleBuildCheck: interactions.handleBuildCheck,
    handleUseCheck: interactions.handleUseCheck,
  };
}

export default useQuickLessonFlow;
