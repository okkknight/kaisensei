import React from "react";
import { IconRefresh, IconArrowLeft } from "@tabler/icons-react";
import { DEEP_COPY } from "../copy.js";

export function DeepErrorScreen({ onRetry, onBackToCamera }) {
  return (
    <div className="screen lesson-screen deep-error-screen">
      <div className="lesson-content deep-error-content">
        <div className="deep-completion-card deep-error-card">
          <div className="deep-completion-copy">
            <h2>{DEEP_COPY.errorTitle}</h2>
            <p>{DEEP_COPY.errorBody}</p>
            <span>{DEEP_COPY.errorChinese}</span>
          </div>
        </div>
      </div>

      <div className="lesson-footer">
        <div className="lesson-footer-actions deep-completion-actions">
          <button className="secondary-button" type="button" onClick={onRetry}>
            <IconRefresh size={17} />
            {DEEP_COPY.retryAction}
          </button>
          <button className="primary-button" type="button" onClick={onBackToCamera}>
            {DEEP_COPY.backToCamera}
            <IconArrowLeft size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeepErrorScreen;
