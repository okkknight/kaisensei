import React from "react";
import { IconSparkles } from "@tabler/icons-react";
import { DEEP_COPY } from "../copy.js";

export function DeepLoadingScreen({
  message = DEEP_COPY.loading[0],
  stageIndex = 0,
  progressPercent = 0,
  progressState = "running",
}) {
  const safeStageIndex = Math.min(DEEP_COPY.loading.length - 1, Math.max(0, stageIndex));
  const loadingState = DEEP_COPY.loading[safeStageIndex];
  const safeProgressPercent = Math.min(100, Math.max(0, progressPercent));

  return (
    <div className="screen loading-screen deep-loading-screen">
      <div className="deep-loading-stage">
        <div className="deep-loading-brand">
          <div className="loading-icon deep-loading-icon">
            <IconSparkles size={26} />
          </div>
          <div>
            <h2>kaisensei</h2>
            <p>Deep Mode</p>
          </div>
        </div>

        <div className="deep-loading-copy">
          <p>{message?.primary ?? loadingState.primary}</p>
          <span>{message?.secondary ?? loadingState.secondary}</span>
          <div className="loading-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div
          className={`deep-loading-progress ${progressState === "stalled" ? "is-stalled" : ""} ${progressState === "finishing" ? "is-finishing" : ""}`}
          aria-label="Loading progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(safeProgressPercent)}
          role="progressbar"
        >
          <div className="deep-loading-progress-rail">
            <div className="deep-loading-progress-fill" style={{ width: `${safeProgressPercent}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeepLoadingScreen;
