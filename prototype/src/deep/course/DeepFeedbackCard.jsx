import React from "react";

export function DeepFeedbackCard({ tone = "idle", title = "", body = "" }) {
  if (tone === "idle") {
    return <div className="deep-feedback-card muted">Tap chunks, then check your answer.</div>;
  }

  return (
    <div className={`deep-feedback-card ${tone}`}>
      <strong>{title}</strong>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

export default DeepFeedbackCard;
