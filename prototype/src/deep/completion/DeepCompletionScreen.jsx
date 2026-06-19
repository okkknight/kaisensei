import React from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import { DEEP_COPY } from "../copy.js";

export function DeepCompletionScreen({ level, onBack, onExitToCamera }) {
  return (
    <div className="screen lesson-screen">
      <div className="lesson-content">
        <div className="screen-header">
          <button className="back-button" type="button" aria-label="Back" onClick={onBack}>
            <IconArrowLeft size={18} />
          </button>
          <div className="screen-header-copy">
            <div className="screen-progress-copy">
              <span className="screen-progress-count">Completion</span>
              <span className="screen-progress-label">{level}</span>
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

export default DeepCompletionScreen;
