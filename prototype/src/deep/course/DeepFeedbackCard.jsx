import React from "react";

export function DeepFeedbackCard({ tone = "idle", title = "", body = "", idleBody = "" }) {
  if (tone === "idle") {
    return null;
  }

  return (
    <div className={`deep-feedback-card ${tone}`}>
      <strong>{title}</strong>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

export default DeepFeedbackCard;
