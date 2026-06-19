import React from "react";
import "../styles.css";
import { EmptyQuickState } from "./lesson/EmptyQuickState.jsx";
import { ErrorScreen } from "./lesson/ErrorScreen.jsx";
import { LoadingScreen } from "./lesson/LoadingScreen.jsx";
import { QuickLessonScreen } from "./lesson/QuickLessonScreen.jsx";
import { useQuickLessonFlow } from "./lesson/useQuickLessonFlow.js";

export function App({ initialFile = null, initialLevel = "Normal", onExitToCamera } = {}) {
  const flow = useQuickLessonFlow({
    initialFile,
    initialLevel,
    onExitToCamera,
  });

  if (flow.screen === "loading") {
    return <LoadingScreen message={flow.loadingMessage} />;
  }

  if (flow.screen === "error") {
    return <ErrorScreen error={flow.errorState} onRetry={flow.handleRetry} onRetake={flow.handleRetakePhoto} />;
  }

  if (flow.screen === "lesson" && flow.lesson) {
    return (
      <QuickLessonScreen
        lesson={flow.lesson}
        level={flow.level}
        activeStep={flow.activeStep}
        onBack={flow.handleBack}
        onContinue={flow.handleContinue}
        onSpeak={flow.speak}
        speakingKey={flow.speakingKey}
        buildSelectedChunks={flow.buildSelectedChunks}
        useSelectedChunks={flow.useSelectedChunks}
        buildFeedback={flow.buildFeedback}
        useFeedback={flow.useFeedback}
        buildSolved={flow.buildIsSolved}
        useSolved={flow.useIsSolved}
        buildBank={flow.buildBank}
        useBank={flow.useBank}
        onBuildToggle={flow.handleBuildToggle}
        onBuildReset={flow.handleBuildReset}
        onUseToggle={flow.handleUseToggle}
        onUseReset={flow.handleUseReset}
        onBuildCheck={flow.handleBuildCheck}
        onUseCheck={flow.handleUseCheck}
        photoPreviewUrl={flow.photoPreviewUrl}
      />
    );
  }

  return <EmptyQuickState onRetake={flow.handleRetakePhoto} />;
}

export default App;
