import React, { useMemo, useState } from "react";
import { DeepLoadingScreen } from "../loading/DeepLoadingScreen.jsx";
import { DeepCompletionScreen } from "../completion/DeepCompletionScreen.jsx";
import DeepOverviewScreen from "../overview/DeepOverviewScreen.jsx";
import NoticeModule from "../course/notice/NoticeModule.jsx";
import InterpretModule from "../course/interpret/InterpretModule.jsx";
import InteractModule from "../course/interact/InteractModule.jsx";
import StepInModule from "../course/step-in/StepInModule.jsx";
import { createDeepCourseState } from "../state/deep-course-state.js";
import { createDeepCourseViewModel } from "../schema/deep-course-schema.js";
import { DEEP_MOCK_STEP_IN_LESSON, DEEP_MOCK_STEP_IN_PHOTO_URL } from "./deep-mock-data.js";

const VALID_MOCK_PHASES = new Set([
  "loading",
  "overview",
  "notice",
  "interpret",
  "interact",
  "stepIn",
  "completion",
]);

function createMockGeneration() {
  return {
    stageStates: {
      overview_notice: "ready",
      interpret: "ready",
      interact: "ready",
      step_in: "ready",
    },
    frozenLesson: {
      overview: true,
      notice: true,
      interpret: true,
      interact: true,
      stepIn: true,
    },
  };
}

export function DeepCourseMockApp({ initialPhase = "overview", initialInteractIndex = 0, onExitToCamera }) {
  const [phase, setPhase] = useState(VALID_MOCK_PHASES.has(initialPhase) ? initialPhase : "overview");

  const viewModel = useMemo(
    () =>
      createDeepCourseViewModel({
        lesson: DEEP_MOCK_STEP_IN_LESSON,
        photoPreviewUrl: DEEP_MOCK_STEP_IN_PHOTO_URL,
      }),
    [],
  );

  const generation = useMemo(() => createMockGeneration(), []);

  const state = useMemo(
    () =>
      createDeepCourseState({
        level: DEEP_MOCK_STEP_IN_LESSON.level === "advanced" ? "Advanced" : "Normal",
        photoPreviewUrl: DEEP_MOCK_STEP_IN_PHOTO_URL,
        phase,
      }),
    [phase],
  );

  function exitToCamera() {
    if (typeof onExitToCamera === "function") {
      onExitToCamera();
      return;
    }

    window.location.assign(window.location.pathname || "/");
  }

  function goNext() {
    setPhase((current) => {
      switch (current) {
        case "loading":
          return "overview";
        case "overview":
          return "notice";
        case "notice":
          return "interpret";
        case "interpret":
          return "interact";
        case "interact":
          return "stepIn";
        case "stepIn":
          return "completion";
        case "completion":
        default:
          return "completion";
      }
    });
  }

  function goBack() {
    if (phase === "overview" || phase === "loading") {
      exitToCamera();
      return;
    }

    if (phase === "completion") {
      setPhase("stepIn");
      return;
    }

    setPhase((current) => {
      switch (current) {
        case "notice":
          return "overview";
        case "interpret":
          return "notice";
        case "interact":
          return "interpret";
        case "stepIn":
          return "interact";
        default:
          return "overview";
      }
    });
  }

  if (phase === "loading") {
    return (
      <DeepLoadingScreen
        message="Loading mock lesson..."
        stageIndex={0}
        progressPercent={100}
        progressState="finishing"
      />
    );
  }

  if (phase === "overview") {
    return <DeepOverviewScreen overviewVM={viewModel.overviewVM} onStart={goNext} onBack={exitToCamera} />;
  }

  if (phase === "completion") {
    return (
      <DeepCompletionScreen
        completionVM={viewModel.completionVM}
        onBack={() => setPhase("overview")}
        onExitToCamera={exitToCamera}
      />
    );
  }

  if (phase === "notice") {
    return (
      <NoticeModule
        noticeVM={viewModel.noticeVM}
        state={state}
        photoPreviewUrl={DEEP_MOCK_STEP_IN_PHOTO_URL}
        generation={generation}
        onAdvance={goNext}
        onBack={goBack}
        onRetryStage={async () => true}
        onBackToCamera={exitToCamera}
      />
    );
  }

  if (phase === "interpret") {
    return (
      <InterpretModule
        interpretVM={viewModel.interpretVM}
        state={state}
        photoPreviewUrl={DEEP_MOCK_STEP_IN_PHOTO_URL}
        generation={generation}
        onAdvance={goNext}
        onBack={goBack}
        onRetryStage={async () => true}
        onBackToCamera={exitToCamera}
      />
    );
  }

  if (phase === "interact") {
    return (
      <InteractModule
        interactVM={viewModel.interactVM}
        state={state}
        photoPreviewUrl={DEEP_MOCK_STEP_IN_PHOTO_URL}
        generation={generation}
        initialPageIndex={initialInteractIndex}
        onAdvance={goNext}
        onBack={goBack}
        onRetryStage={async () => true}
        onBackToCamera={exitToCamera}
      />
    );
  }

  return (
    <StepInModule
      stepInVM={viewModel.stepInVM}
      state={state}
      photoPreviewUrl={DEEP_MOCK_STEP_IN_PHOTO_URL}
      onAdvance={goNext}
      onBack={goBack}
    />
  );
}

export default DeepCourseMockApp;
