import React from "react";
import { DeepLoadingScreen } from "./loading/DeepLoadingScreen.jsx";
import { DeepCompletionScreen } from "./completion/DeepCompletionScreen.jsx";
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

  if (flow.phase === "loading") {
    return <DeepLoadingScreen message={flow.loadingMessage} progress={flow.state.loadingMessageIndex === 0 ? 30 : flow.state.loadingMessageIndex === 1 ? 60 : 90} />;
  }

  if (flow.phase === "overview") {
    return <DeepOverviewScreen lesson={flow.lesson} photoPreviewUrl={flow.photoPreviewUrl} onStart={flow.goNext} onBack={flow.goBack} />;
  }

  if (flow.phase === "completion") {
    return <DeepCompletionScreen lesson={flow.lesson} photoPreviewUrl={flow.photoPreviewUrl} onBack={flow.goBack} onExitToCamera={onExitToCamera} />;
  }

  const phaseContent = {
    notice: <NoticeModule lesson={flow.lesson} state={flow.state} photoPreviewUrl={flow.photoPreviewUrl} onAdvance={flow.goNext} onBack={flow.goBack} />,
    interpret: <InterpretModule lesson={flow.lesson} state={flow.state} photoPreviewUrl={flow.photoPreviewUrl} onAdvance={flow.goNext} onBack={flow.goBack} />,
    interact: <InteractModule lesson={flow.lesson} state={flow.state} photoPreviewUrl={flow.photoPreviewUrl} onAdvance={flow.goNext} onBack={flow.goBack} />,
    stepIn: <StepInModule lesson={flow.lesson} state={flow.state} photoPreviewUrl={flow.photoPreviewUrl} onAdvance={flow.goNext} onBack={flow.goBack} />,
  }[flow.phase];

  return phaseContent;
}

export default DeepModeApp;
