import React from "react";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { ModuleProgress } from "./ModuleProgress.jsx";

export function DeepCourseShell({
  lesson,
  state,
  onBack,
  onAdvance,
  children,
}) {
  const currentModule = lesson?.modules?.[state.phase] ?? null;

  return (
    <div className="screen lesson-screen">
      <div className="lesson-content">
        <div className="screen-header">
          <button className="back-button" type="button" aria-label="Back" onClick={onBack}>
            <IconArrowLeft size={18} />
          </button>
          <div className="screen-header-copy">
            <div className="screen-progress-copy">
              <span className="screen-progress-count">{state.phase}</span>
              <span className="screen-progress-label">{state.level}</span>
            </div>
          </div>
        </div>

        <ModuleProgress activePhase={state.phase} completedPhases={state.completedPhases} />

        <div className="deep-module-panel">
          <h2>{currentModule?.title || "Deep Mode"}</h2>
          <p>{currentModule?.goal || "A deep lesson scaffold."}</p>
          {children}
        </div>
      </div>

      <div className="lesson-footer">
        <button className="primary-button" type="button" onClick={onAdvance}>
          Continue
          <IconArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default DeepCourseShell;
