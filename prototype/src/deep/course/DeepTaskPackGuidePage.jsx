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
  taskTitle,
  scenePrompt,
  scenePromptChinese = "",
  needExpression,
  needMeaning,
  handleExpression,
  handleMeaning,
}) {
  return (
    <div className="deep-guide-page">
      <div className="deep-stage-card deep-guide-task-card">
        <strong>{taskTitle}</strong>
        <p>{scenePrompt}</p>
        {scenePromptChinese ? <small>{scenePromptChinese}</small> : null}
      </div>

      <div className="deep-stage-stack">
        <PreviewCard label="需要表达" title={needExpression} body={needMeaning} tone="soft" />
        <PreviewCard label="回应表达" title={handleExpression} body={handleMeaning} tone="soft" />
      </div>
    </div>
  );
}

export default DeepTaskPackGuidePage;
