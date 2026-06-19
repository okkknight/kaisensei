import { useQuickLessonSelection } from "./useQuickLessonSelection.js";
import { useQuickLessonSpeech } from "./useQuickLessonSpeech.js";

export function useQuickLessonInteractions({ lesson, onRetakePhoto } = {}) {
  const selection = useQuickLessonSelection({ lesson, onRetakePhoto });
  const speech = useQuickLessonSpeech();

  return {
    activeStep: selection.activeStep,
    buildSelectedChunks: selection.buildSelectedChunks,
    useSelectedChunks: selection.useSelectedChunks,
    buildFeedback: selection.buildFeedback,
    useFeedback: selection.useFeedback,
    buildIsSolved: selection.buildIsSolved,
    useIsSolved: selection.useIsSolved,
    buildBank: selection.buildBank,
    useBank: selection.useBank,
    speakingKey: speech.speakingKey,
    handleBack: selection.handleBack,
    handleContinue: selection.handleContinue,
    speak: speech.speak,
    handleBuildToggle: selection.handleBuildToggle,
    handleBuildReset: selection.handleBuildReset,
    handleUseToggle: selection.handleUseToggle,
    handleUseReset: selection.handleUseReset,
    handleBuildCheck: selection.handleBuildCheck,
    handleUseCheck: selection.handleUseCheck,
  };
}

export default useQuickLessonInteractions;
