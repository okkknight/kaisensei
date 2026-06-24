import React from "react";
import { DeepCourseShell } from "./DeepCourseShell.jsx";
import { DEEP_COPY } from "../copy.js";

export function DeepStageWaitingPage({ state, photoPreviewUrl, onBack, onRetry, onBackToCamera, isFailed = false }) {
  return (
    <DeepCourseShell
      state={state}
      photoPreviewUrl={photoPreviewUrl}
      onBack={onBack}
      onAdvance={undefined}
      footerActions={
        isFailed ? (
          <div className="lesson-footer-actions">
            <button className="secondary-button" type="button" onClick={onRetry}>
              {DEEP_COPY.retryAction}
            </button>
            <button className="primary-button" type="button" onClick={onBackToCamera}>
              {DEEP_COPY.backToCamera}
            </button>
          </div>
        ) : null
      }
    >
      <div className="deep-stage-waiting-page">
        <div className="deep-stage-waiting-card">
          <strong>{DEEP_COPY.nextStageWaiting}</strong>
        </div>
      </div>
    </DeepCourseShell>
  );
}

export default DeepStageWaitingPage;
