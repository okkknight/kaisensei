import React, { useMemo } from "react";
import { DeepCourseShell } from "../course/DeepCourseShell.jsx";
import { StepInModule } from "../course/step-in/StepInModule.jsx";
import { createDeepCourseState } from "../state/deep-course-state.js";
import { createDeepCourseViewModel } from "../schema/deep-course-schema.js";
import {
  DEEP_MOCK_STEP_IN_LESSON,
  DEEP_MOCK_STEP_IN_PHOTO_URL,
} from "./deep-mock-data.js";
export function DeepStepInMockApp({ onExitToCamera }) {
  const viewModel = useMemo(
    () =>
      createDeepCourseViewModel({
        lesson: DEEP_MOCK_STEP_IN_LESSON,
        photoPreviewUrl: DEEP_MOCK_STEP_IN_PHOTO_URL,
      }),
    [],
  );

  const state = useMemo(
    () =>
      createDeepCourseState({
        level: DEEP_MOCK_STEP_IN_LESSON.level === "advanced" ? "Advanced" : "Normal",
        photoPreviewUrl: DEEP_MOCK_STEP_IN_PHOTO_URL,
        phase: "stepIn",
      }),
    [],
  );

  function handleExitToCamera() {
    if (typeof onExitToCamera === "function") {
      onExitToCamera();
      return;
    }

    window.location.assign(window.location.pathname || "/");
  }

  return (
    <StepInModule
      stepInVM={viewModel.stepInVM}
      state={state}
      photoPreviewUrl={DEEP_MOCK_STEP_IN_PHOTO_URL}
      initialPageIndex={1}
      onAdvance={() => {}}
      onBack={handleExitToCamera}
      onRestart={handleExitToCamera}
      onExitToCamera={handleExitToCamera}
    />
  );
}

export default DeepStepInMockApp;
