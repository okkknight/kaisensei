import React from "react";
import { IconArrowLeft, IconRotateClockwise, IconSparkles, IconStars } from "@tabler/icons-react";
import { DEEP_COPY } from "../copy.js";

function SummaryGroup({ title, items }) {
  return (
    <section className="deep-summary-group">
      <div className="deep-summary-group-head">
        <span>{title}</span>
        <strong>{items.length}</strong>
      </div>
      <div className="deep-summary-items">
        {items.map((item) => (
          <div key={item.title} className="deep-summary-item">
            <strong>{item.title}</strong>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DeepCompletionScreen({ lesson, photoPreviewUrl, onBack, onExitToCamera }) {
  const noticeItems = lesson?.modules?.notice?.expressionPacks?.map((pack) => ({
    title: pack.coreExpression,
    body: pack.meaningChinese,
  })) ?? [];
  const interpretItems = lesson?.modules?.interpret?.expressionPacks?.map((pack) => ({
    title: pack.coreExpression,
    body: pack.meaningChinese,
  })) ?? [];
  const interactItems = lesson?.modules?.interact?.taskPacks?.flatMap((pack) => [
    { title: pack.need.coreExpression, body: pack.need.meaningChinese },
    { title: pack.handle.coreExpression, body: pack.handle.meaningChinese },
  ]) ?? [];
  const stepInTurns = lesson?.modules?.stepIn?.dialogue?.turns ?? [];

  return (
    <div className="screen lesson-screen deep-completion-screen">
      <div className="lesson-content deep-completion-content">
        <div className="screen-header deep-completion-header">
          <button className="back-button" type="button" aria-label="Back" onClick={onBack}>
            <IconArrowLeft size={18} />
          </button>
          <div className="screen-header-copy">
            <div className="screen-progress-copy">
              <span className="screen-progress-count">Completion</span>
              <span className="screen-progress-label">Deep Mode</span>
            </div>
          </div>
        </div>

        <div className="deep-completion-card">
          <div className="deep-completion-hero">
            {photoPreviewUrl ? <img src={photoPreviewUrl} alt="Completed scene" className="deep-completion-photo" /> : <div className="deep-completion-photo deep-completion-photo-placeholder" />}
            <div className="deep-completion-badge">
              <IconSparkles size={18} />
            </div>
          </div>

          <div className="deep-completion-copy">
            <h2>{DEEP_COPY.finish}</h2>
            <p>Notice, Interpret, Interact, and Step In now fit one scene.</p>
          </div>

          <SummaryGroup title="Notice" items={noticeItems} />
          <SummaryGroup title="Interpret" items={interpretItems} />
          <SummaryGroup title="Interact" items={interactItems} />

          <section className="deep-summary-group">
            <div className="deep-summary-group-head">
              <span>Step In</span>
              <strong>{stepInTurns.length}</strong>
            </div>
            <div className="deep-dialogue-replay">
              {stepInTurns.map((turn, index) => (
                <div key={`${turn.speaker}-${index}`} className={`deep-dialogue-turn ${turn.speaker}`}>
                  <span>{turn.speaker === "system" ? "System" : "You"}</span>
                  <p>{turn.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="lesson-footer">
        <div className="lesson-footer-actions deep-completion-actions">
          <button className="secondary-button" type="button" onClick={onBack}>
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

export default DeepCompletionScreen;
