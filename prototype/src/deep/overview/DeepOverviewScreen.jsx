import React from "react";
import { IconArrowRight } from "@tabler/icons-react";
import { DEEP_COPY } from "../copy.js";

export function DeepOverviewScreen({ lesson, photoPreviewUrl, onStart, onBack }) {
  const overview = lesson?.overview ?? {
    keywords: ["coffee", "table", "laptop"],
    sceneDescriptionChinese: "咖啡桌旁的安静工作场景",
    startPromptChinese: DEEP_COPY.overviewPrompt,
  };

  return (
    <div className="screen lesson-screen">
      <div className="lesson-content">
        <div className="screen-header">
          <button className="back-button" type="button" aria-label="Back" onClick={onBack}>
            ←
          </button>
          <div className="screen-header-copy">
            <div className="screen-progress-copy">
              <span className="screen-progress-count">Overview</span>
              <span className="screen-progress-label">Deep Mode</span>
            </div>
          </div>
        </div>

        <div className="deep-overview-card">
          {photoPreviewUrl ? <img src={photoPreviewUrl} alt="Selected scene preview" className="deep-overview-photo" /> : null}
          <div className="deep-overview-copy">
            <p className="deep-overview-keywords">{overview.keywords.join(" · ")}</p>
            <p className="deep-overview-scene">{overview.sceneDescriptionChinese}</p>
            <p className="deep-overview-prompt">{overview.startPromptChinese}</p>
          </div>
        </div>
      </div>

      <div className="lesson-footer">
        <button className="primary-button" type="button" onClick={onStart}>
          Start
          <IconArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default DeepOverviewScreen;
