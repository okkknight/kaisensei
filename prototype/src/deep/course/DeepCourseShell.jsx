import React from "react";
import { IconArrowLeft, IconArrowRight, IconPhoto } from "@tabler/icons-react";
import { ModuleProgress } from "./ModuleProgress.jsx";
import { DEEP_PHASE_META } from "./module-registry.js";

export function DeepCourseShell({
  state,
  onBack,
  onAdvance,
  photoPreviewUrl,
  pageProgressCurrent = 0,
  pageProgressTotal = 0,
  footerActions,
  children,
}) {
  const currentPhaseMeta = DEEP_PHASE_META[state.phase] ?? DEEP_PHASE_META.notice;
  const showPageProgress = pageProgressTotal > 0;

  return (
    <div className="screen lesson-screen deep-course-screen">
      <div className="lesson-content deep-course-content">
        <div className="screen-header deep-course-header">
          <button className="back-button" type="button" aria-label="Back" onClick={onBack}>
            <IconArrowLeft size={18} />
          </button>
          <div className="screen-header-copy">
            <div className="screen-progress-copy">
              <span className="screen-progress-count">{state.moduleIndex + 1} / 4</span>
              <span className="screen-progress-label">{currentPhaseMeta.label}</span>
            </div>
          </div>
          <button className="deep-course-thumb" type="button" aria-label="Photo preview">
            {photoPreviewUrl ? <img src={photoPreviewUrl} alt="" /> : <IconPhoto size={14} />}
          </button>
        </div>

        <ModuleProgress activePhase={state.phase} completedPhases={state.completedPhases} />
        {showPageProgress ? (
          <div className="deep-page-progress">
            <strong>
              {pageProgressCurrent} / {pageProgressTotal}
            </strong>
          </div>
        ) : null}
        {children}
      </div>

      <div className="lesson-footer">
        {footerActions ?? (
          <button className="primary-button" type="button" onClick={onAdvance}>
            Continue
            <IconArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

export default DeepCourseShell;
