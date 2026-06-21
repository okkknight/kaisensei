import React from "react";

export function DeepFeedbackCard({ tone = "idle", title = "", body = "", idleBody = "" }) {
  if (tone === "idle") {
    if (!idleBody) {
      return null;
    }

    return (
      <div className="deep-feedback-card muted">
        <p>{idleBody}</p>
      </div>
    );
  }

  return (
    <div className={`deep-feedback-card ${tone}`}>
      <strong>{title}</strong>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

export default DeepFeedbackCard;
