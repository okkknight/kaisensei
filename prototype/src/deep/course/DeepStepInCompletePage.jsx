import React from "react";
import { DEEP_COPY } from "../copy.js";

export function DeepStepInCompletePage() {
  return (
    <div className="deep-stepin-complete">
      <div className="deep-stepin-complete-card">
        <div className="deep-completion-copy">
          <h2>{DEEP_COPY.completionTitle}</h2>
          <p>{DEEP_COPY.completionDescription}</p>
          <span>{DEEP_COPY.completionChinese}</span>
        </div>
      </div>
    </div>
  );
}

export default DeepStepInCompletePage;
