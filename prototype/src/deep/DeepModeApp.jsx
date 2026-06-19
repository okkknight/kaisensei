import React from "react";
import { DeepCompletionScreen } from "./completion/DeepCompletionScreen.jsx";
import DeepOverviewScreen from "./overview/DeepOverviewScreen.jsx";
import DeepCourseShell from "./course/DeepCourseShell.jsx";
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

  if (flow.phase === "overview") {
    return <DeepOverviewScreen lesson={flow.lesson} photoPreviewUrl={flow.photoPreviewUrl} onStart={flow.goNext} onBack={flow.goBack} />;
  }

  if (flow.phase === "completion") {
    return <DeepCompletionScreen level={flow.state.level} onBack={flow.goBack} onExitToCamera={onExitToCamera} />;
  }

  const phaseContent = {
    notice: <NoticeModule />,
    interpret: <InterpretModule />,
    interact: <InteractModule />,
    stepIn: <StepInModule />,
  }[flow.phase];

  return (
    <DeepCourseShell lesson={flow.lesson} state={flow.state} onBack={flow.goBack} onAdvance={flow.goNext}>
      {phaseContent}
    </DeepCourseShell>
  );
}

export default DeepModeApp;
