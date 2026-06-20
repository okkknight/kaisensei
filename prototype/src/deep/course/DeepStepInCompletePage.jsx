import React from "react";
import { DEEP_COPY } from "../copy.js";

function SummarySection({ title, items }) {
  return (
    <section className="deep-summary-group">
      <div className="deep-summary-group-head">
        <span>{title}</span>
        <strong>{items.length}</strong>
      </div>
      <div className="deep-summary-items">
        {items.map((item) => (
          <div key={`${title}-${item.title}`} className="deep-summary-item">
            <strong>{item.title}</strong>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DeepStepInCompletePage({ title, summaryItems = [], replayTurns = [] }) {
  return (
    <div className="deep-stepin-complete">
      <div className="deep-completion-card">
        <div className="deep-completion-copy">
          <h2>{title}</h2>
          <p>{DEEP_COPY.stepInSummary}</p>
        </div>

        <SummarySection title="Core expressions" items={summaryItems} />

        <section className="deep-summary-group">
          <div className="deep-summary-group-head">
            <span>Replay</span>
            <strong>{replayTurns.length}</strong>
          </div>
          <div className="deep-dialogue-replay">
            {replayTurns.map((turn, index) => (
              <div key={`${turn.speaker}-${index}-${turn.text}`} className={`deep-dialogue-turn ${turn.speaker}`}>
                <span>{turn.label}</span>
                <p>{turn.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DeepStepInCompletePage;
