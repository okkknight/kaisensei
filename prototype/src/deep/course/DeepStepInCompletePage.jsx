import React from "react";
import { IconRotateClockwise, IconStars } from "@tabler/icons-react";
import { DEEP_COPY } from "../copy.js";

export function DeepStepInCompletePage({ replayTurns = [], onRestart, onExitToCamera }) {
  return (
    <div className="deep-stepin-complete">
      <div className="deep-stepin-complete-card">
        <div className="deep-completion-copy">
          <h2>{DEEP_COPY.completionTitle}</h2>
          <p>{DEEP_COPY.completionDescription}</p>
          <span>{DEEP_COPY.completionChinese}</span>
        </div>

        {replayTurns.length > 0 && (
          <section className="deep-summary-group">
            <div className="deep-summary-group-head">
              <span>{DEEP_COPY.stepInReplayTitle}</span>
            </div>
            <div className="deep-dialogue-replay">
              {replayTurns.map((turn, index) => (
                <div key={`${turn.speaker}-${index}`} className={`deep-dialogue-turn ${turn.speaker}`}>
                  <span>{turn.label}</span>
                  <p>{turn.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="lesson-footer-actions deep-completion-actions">
          <button className="secondary-button" type="button" onClick={onRestart}>
            <IconRotateClockwise size={17} />
            {DEEP_COPY.repeatPractice}
          </button>
          <button className="primary-button" type="button" onClick={onExitToCamera}>
            {DEEP_COPY.backToCamera}
            <IconStars size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeepStepInCompletePage;
