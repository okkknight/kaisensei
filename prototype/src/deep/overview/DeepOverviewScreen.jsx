import React from "react";
import { IconArrowRight, IconSettings } from "@tabler/icons-react";
import { DEEP_COPY } from "../copy.js";

export function DeepOverviewScreen({ lesson, photoPreviewUrl, onStart, onBack }) {
  const overview = lesson?.overview ?? {
    keywords: ["coffee", "table", "laptop"],
    sceneDescriptionChinese: "安静的桌面工作场景",
    startPromptChinese: DEEP_COPY.overviewPrompt,
  };

  return (
    <div className="screen lesson-screen deep-overview-screen">
      <div className="lesson-content deep-overview-content">
        <div className="screen-header deep-overview-header">
          <button className="back-button" type="button" aria-label="Back" onClick={onBack}>
            ←
          </button>
          <div className="screen-header-copy">
            <div className="screen-progress-copy">
              <span className="screen-progress-count">Overview</span>
              <span className="screen-progress-label">Deep Mode</span>
            </div>
          </div>
          <button className="camera-settings-button deep-overview-settings" type="button" aria-label="Settings">
            <IconSettings size={16} />
          </button>
        </div>

        <button className="deep-overview-card" type="button" onClick={onStart}>
          <div className="deep-overview-media">
            {photoPreviewUrl ? (
              <img src={photoPreviewUrl} alt="Selected scene preview" className="deep-overview-photo" />
            ) : (
              <div className="deep-overview-photo deep-overview-photo-placeholder" />
            )}
          </div>

          <div className="deep-overview-copy">
            <div className="deep-overview-keywords">{overview.keywords.join(" · ")}</div>
            <div className="deep-overview-scene">{overview.sceneDescriptionChinese}</div>
            <div className="deep-overview-prompt">{overview.startPromptChinese}</div>
          </div>
        </button>
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
