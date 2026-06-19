import React, { useEffect, useMemo, useState } from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import { DEEP_COPY } from "./copy.js";
import { DEEP_COURSE_SCHEMA } from "./schema/deep-course-schema.js";
import { createDeepCourseState } from "./state/deep-course-state.js";
import DeepOverviewScreen from "./overview/DeepOverviewScreen.jsx";
import DeepCourseShell from "./course/DeepCourseShell.jsx";
import NoticeModule from "./course/notice/NoticeModule.jsx";
import InterpretModule from "./course/interpret/InterpretModule.jsx";
import InteractModule from "./course/interact/InteractModule.jsx";
import StepInModule from "./course/step-in/StepInModule.jsx";

const phaseOrder = ["overview", "notice", "interpret", "interact", "stepIn", "completion"];

export function DeepModeApp({ initialFile = null, initialLevel = "Normal", onExitToCamera }) {
  const [phase, setPhase] = useState("overview");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");

  const state = useMemo(() => {
    const completedPhases = phaseOrder.filter((item) => phaseOrder.indexOf(item) < phaseOrder.indexOf(phase) && item !== "overview");

    return {
      ...createDeepCourseState({
        level: initialLevel,
        photoPreviewUrl,
      }),
      phase,
      completedPhases,
    };
  }, [initialLevel, photoPreviewUrl, phase]);

  const lesson = useMemo(
    () => ({
      ...DEEP_COURSE_SCHEMA,
      level: initialLevel,
      modules: DEEP_COURSE_SCHEMA.modules,
    }),
    [initialLevel],
  );

  useEffect(() => {
    if (!initialFile) {
      setPhotoPreviewUrl("");
      return undefined;
    }

    const nextUrl = URL.createObjectURL(initialFile);
    setPhotoPreviewUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [initialFile]);

  function goNext() {
    const currentIndex = phaseOrder.indexOf(phase);
    const nextPhase = phaseOrder[Math.min(currentIndex + 1, phaseOrder.length - 1)];
    setPhase(nextPhase);
  }

  function goBack() {
    if (phase === "overview") {
      onExitToCamera?.();
      return;
    }

    const currentIndex = phaseOrder.indexOf(phase);
    const previousPhase = phaseOrder[Math.max(currentIndex - 1, 0)];
    setPhase(previousPhase);
  }

  if (phase === "overview") {
    return <DeepOverviewScreen lesson={lesson} photoPreviewUrl={photoPreviewUrl} onStart={goNext} onBack={goBack} />;
  }

  if (phase === "completion") {
    return (
      <div className="screen lesson-screen">
        <div className="lesson-content">
          <div className="screen-header">
            <button className="back-button" type="button" aria-label="Back" onClick={goBack}>
              <IconArrowLeft size={18} />
            </button>
            <div className="screen-header-copy">
              <div className="screen-progress-copy">
                <span className="screen-progress-count">Completion</span>
                <span className="screen-progress-label">{state.level}</span>
              </div>
            </div>
          </div>

          <div className="deep-completion-card">
            <strong>{DEEP_COPY.finish}</strong>
            <p>Deep Mode scaffold is ready for the next implementation step.</p>
          </div>
        </div>

        <div className="lesson-footer">
          <button className="primary-button" type="button" onClick={onExitToCamera}>
            Back to camera
          </button>
        </div>
      </div>
    );
  }

  const phaseContent = {
    notice: <NoticeModule />,
    interpret: <InterpretModule />,
    interact: <InteractModule />,
    stepIn: <StepInModule />,
  }[phase];

  return (
    <DeepCourseShell lesson={lesson} state={state} onBack={goBack} onAdvance={goNext}>
      {phaseContent}
    </DeepCourseShell>
  );
}

export default DeepModeApp;
