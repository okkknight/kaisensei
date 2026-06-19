import React from "react";
import { IconCheck, IconSparkles, IconX } from "@tabler/icons-react";

export function FeedbackCard({ tone, title, body }) {
  return (
    <div className={`feedback-card ${tone}`}>
      <div className="feedback-icon">
        {tone === "success" ? <IconCheck size={18} /> : tone === "error" ? <IconX size={18} /> : <IconSparkles size={18} />}
      </div>
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
    </div>
  );
}

export default FeedbackCard;
