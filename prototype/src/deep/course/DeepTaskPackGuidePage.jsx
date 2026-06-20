import React from "react";

function PreviewCard({ label, title, body, tone = "default" }) {
  return (
    <div className={`deep-stage-card ${tone === "soft" ? "deep-stage-card-soft" : ""}`}>
      <span>{label}</span>
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}

export function DeepTaskPackGuidePage({
  taskIndex,
  taskTotal,
  taskTitle,
  scenePrompt,
  needExpression,
  needMeaning,
  handleExpression,
  handleMeaning,
  lead,
}) {
  return (
    <div className="deep-guide-page">
      <div className="deep-exercise-head">
        <span className="deep-exercise-stage">Interact</span>
        <h2>{taskTitle}</h2>
        <p>{lead}</p>
      </div>

      <div className="deep-stage-card deep-guide-task-card">
        <span>Task Pack</span>
        <strong>{taskTotal > 1 ? `Task ${taskIndex + 1} / ${taskTotal}` : "Task Pack"}</strong>
        <p>{scenePrompt}</p>
      </div>

      <div className="deep-stage-stack">
        <PreviewCard label="Need Expression" title={needExpression} body={needMeaning} tone="soft" />
        <PreviewCard label="Handle Expression" title={handleExpression} body={handleMeaning} tone="soft" />
      </div>
    </div>
  );
}

export default DeepTaskPackGuidePage;

