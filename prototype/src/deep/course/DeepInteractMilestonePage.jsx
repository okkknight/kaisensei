import React from "react";
import { IconSparkles } from "@tabler/icons-react";
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

export function DeepInteractMilestonePage({ taskPacks = [] }) {
  const taskItems = taskPacks.map((taskPack) => ({
    title: taskPack.taskTitle,
    body: taskPack.scenePrompt,
  }));
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
          <div className="deep-interact-milestone-badge">
            <IconSparkles size={18} />
          </div>
        </div>

        <div className="deep-completion-copy">
          <h2>Interact</h2>
          <p>{DEEP_COPY.interactSummary}</p>
        </div>

        <SummarySection title="Task Packs" items={taskItems} />
        <SummarySection title="Need" items={needItems} />
        <SummarySection title="Handle" items={handleItems} />
      </div>
    </div>
  );
}

export default DeepInteractMilestonePage;

