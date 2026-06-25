import React from "react";
import { IconSparkles } from "@tabler/icons-react";
import { DEEP_COPY } from "../copy.js";

function SummarySection({ title, items }) {
  return (
    <section className="deep-summary-group">
      <div className="deep-summary-group-head">
        <span>{title}</span>
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

export function DeepInteractMilestonePage({ taskPacks = [], photoPreviewUrl = "" }) {
  const needItems = taskPacks.map((taskPack) => ({
    title: taskPack.need.coreExpression,
    body: taskPack.need.meaningChinese,
  }));
  const handleItems = taskPacks.map((taskPack) => ({
    title: taskPack.handle.coreExpression,
    body: taskPack.handle.meaningChinese,
  }));

  return (
    <div className="deep-interact-milestone">
      <div className="deep-completion-card">
        <div className="deep-completion-hero deep-interact-milestone-hero">
          {photoPreviewUrl ? (
            <img src={photoPreviewUrl} alt="Interact stage scene preview" className="deep-completion-photo" />
          ) : (
            <div className="deep-completion-photo deep-completion-photo-placeholder" />
          )}
          <div className="deep-interact-milestone-badge">
            <IconSparkles size={18} />
          </div>
        </div>

        <div className="deep-completion-copy">
          <h2>Excellent!</h2>
          <p>You completed the Interact stage.</p>
          <span>你已完成 Interact 阶段！</span>
        </div>

        <SummarySection title={DEEP_COPY.needExpressionsTitle} items={needItems} />
        <SummarySection title={DEEP_COPY.handleExpressionsTitle} items={handleItems} />

        <section className="deep-summary-group">
          <div className="deep-summary-group-head">
            <span>{DEEP_COPY.capabilitySummaryTitle}</span>
          </div>
          <div className="deep-summary-items">
            <div className="deep-summary-item">
              <strong>Speak and respond naturally.</strong>
              <p>{DEEP_COPY.interactSummary}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DeepInteractMilestonePage;
