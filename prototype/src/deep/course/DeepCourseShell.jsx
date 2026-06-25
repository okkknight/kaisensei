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
  dock = null,
  footerNotice = null,
  footerActions,
  children,
}) {
  const currentPhaseMeta = DEEP_PHASE_META[state.phase] ?? DEEP_PHASE_META.notice;
  const showPageProgress = pageProgressTotal > 0;
  const screenClassName = `screen lesson-screen deep-course-screen${dock ? " deep-course-screen-docked" : ""}${footerNotice ? " has-footer-notice" : ""}`;

  if (dock) {
    return (
      <div className={screenClassName}>
        <div className="deep-course-body">
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

          <div className="deep-course-dock">{dock}</div>
        </div>

        <div className="lesson-footer deep-course-footer">
          {footerNotice ? <div className="lesson-footer-feedback-slot">{footerNotice}</div> : null}
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

  return (
    <div className={screenClassName}>
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
        {footerNotice ? <div className="lesson-footer-feedback-slot">{footerNotice}</div> : null}
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
