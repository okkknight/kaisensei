import React from "react";
import { DeepLoadingScreen } from "./loading/DeepLoadingScreen.jsx";
import { DeepCompletionScreen } from "./completion/DeepCompletionScreen.jsx";
import { DeepErrorScreen } from "./error/DeepErrorScreen.jsx";
import DeepOverviewScreen from "./overview/DeepOverviewScreen.jsx";
import NoticeModule from "./course/notice/NoticeModule.jsx";
import InterpretModule from "./course/interpret/InterpretModule.jsx";
import InteractModule from "./course/interact/InteractModule.jsx";
import StepInModule from "./course/step-in/StepInModule.jsx";
import { useDeepModeFlow } from "./state/useDeepModeFlow.js";

export function DeepModeApp({ initialFile = null, initialLevel = "Normal", onExitToCamera }) {
  const flow = useDeepModeFlow({
    initialFile,
    initialLevel,
    onExitToCamera,
  });

  if (flow.errorState) {
    return <DeepErrorScreen onRetry={flow.retryFromError} onBackToCamera={flow.exitToCamera} />;
  }

  const showOverview = flow.phase === "overview";

  if (flow.phase === "loading") {
    return (
      <DeepLoadingScreen
        message={flow.loadingMessage}
        stageIndex={flow.state.loadingMessageIndex}
        progressPercent={flow.loadingProgress}
        progressState={flow.loadingProgressState}
      />
    );
  }

  if (!flow.viewModel) {
    return <DeepErrorScreen onRetry={flow.retryFromError} onBackToCamera={flow.exitToCamera} />;
  }

  if (showOverview) {
    return <DeepOverviewScreen overviewVM={flow.viewModel.overviewVM} onStart={flow.goNext} onBack={flow.goBack} />;
  }

  if (flow.phase === "completion") {
    return (
      <DeepCompletionScreen
        completionVM={flow.viewModel.completionVM}
        onBack={flow.restartCourse}
        onExitToCamera={flow.exitToCamera}
      />
    );
  }

  const phaseContent = {
    notice: (
      <NoticeModule
        noticeVM={flow.viewModel.noticeVM}
        state={flow.state}
        photoPreviewUrl={flow.photoPreviewUrl}
        generation={flow.generation}
        onAdvance={flow.goNext}
        onBack={flow.goBack}
        onRetryStage={flow.retryFailedStage}
        onBackToCamera={flow.exitToCamera}
      />
    ),
    interpret: (
      <InterpretModule
        interpretVM={flow.viewModel.interpretVM}
        state={flow.state}
        photoPreviewUrl={flow.photoPreviewUrl}
        generation={flow.generation}
        onAdvance={flow.goNext}
        onBack={flow.goBack}
        onRetryStage={flow.retryFailedStage}
        onBackToCamera={flow.exitToCamera}
      />
    ),
    interact: (
      <InteractModule
        interactVM={flow.viewModel.interactVM}
        state={flow.state}
        photoPreviewUrl={flow.photoPreviewUrl}
        generation={flow.generation}
        onAdvance={flow.goNext}
        onBack={flow.goBack}
        onRetryStage={flow.retryFailedStage}
        onBackToCamera={flow.exitToCamera}
      />
    ),
    stepIn: <StepInModule stepInVM={flow.viewModel.stepInVM} state={flow.state} photoPreviewUrl={flow.photoPreviewUrl} onAdvance={flow.goNext} onBack={flow.goBack} onRestart={flow.restartCourse} onExitToCamera={flow.exitToCamera} />,
  }[flow.phase];

  return phaseContent;
}

export default DeepModeApp;
