import React from "react";
import { IconRotateClockwise, IconSparkles, IconStars } from "@tabler/icons-react";
import { DEEP_COPY } from "../copy.js";

function SummaryGroup({ title, items }) {
  return (
    <section className="deep-summary-group">
      <div className="deep-summary-group-head">
        <span>{title}</span>
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

export function DeepCompletionScreen({ completionVM, onBack, onExitToCamera }) {
  const noticeItems = completionVM?.noticeItems ?? [];
  const interpretItems = completionVM?.interpretItems ?? [];
  const interactItems = completionVM?.interactItems ?? [];

  return (
    <div className="screen lesson-screen deep-completion-screen">
      <div className="lesson-content deep-completion-content">
        <div className="deep-completion-card">
          <div className="deep-completion-hero">
            {completionVM?.photoPreviewUrl ? <img src={completionVM.photoPreviewUrl} alt="Completed scene" className="deep-completion-photo" /> : <div className="deep-completion-photo deep-completion-photo-placeholder" />}
            <div className="deep-completion-badge">
              <IconSparkles size={18} />
            </div>
          </div>

          <div className="deep-completion-copy">
            <h2>{DEEP_COPY.completionTitle}</h2>
            <p>{DEEP_COPY.completionDescription}</p>
            <span>{DEEP_COPY.completionChinese}</span>
          </div>

          <SummaryGroup title="Notice" items={noticeItems} />
          <SummaryGroup title="Interpret" items={interpretItems} />
          <SummaryGroup title="Interact" items={interactItems} />
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
