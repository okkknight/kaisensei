import React from "react";
import { IconSparkles } from "@tabler/icons-react";
import { DEEP_COPY } from "../copy.js";

export function DeepLoadingScreen({ message = DEEP_COPY.loading[0], stageIndex = 0 }) {
  const safeStageIndex = Math.min(DEEP_COPY.loading.length - 1, Math.max(0, stageIndex));
  const loadingState = DEEP_COPY.loading[safeStageIndex];
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

        <div className="deep-loading-track">
          {DEEP_COPY.loadingStages.map((stage, index) => {
            const isActive = index === safeStageIndex;
            return (
              <div key={stage.title} className={`deep-loading-step ${isActive ? "active" : ""}`}>
                <div className="deep-loading-step-rail">
                  <span />
                </div>
                <div className="deep-loading-step-copy">
                  <strong>{stage.title}</strong>
                  <p>{stage.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="deep-loading-copy">
          <p>{loadingState.primary}</p>
          <span>{loadingState.secondary}</span>
          <div className="loading-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeepLoadingScreen;
