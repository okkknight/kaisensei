import React from "react";
import { IconCamera, IconRefresh, IconUpload, IconX } from "@tabler/icons-react";

export function ErrorScreen({ error, onRetry, onRetake }) {
  return (
    <div className="screen loading-screen error-screen">
      <div className="loading-card">
        <div className="loading-icon error-icon">
          <IconX size={20} />
        </div>
        <h2>{error?.title || "The lesson got lost on the way."}</h2>
        <p>{error?.body || "Try again."}</p>
        <div className="button-stack">
          <button className="action-button" type="button" onClick={onRetry}>
            <IconRefresh size={18} />
            Try again
          </button>
          <button className="secondary-button" type="button" onClick={onRetake}>
            <IconCamera size={18} />
            Retake photo
          </button>
          <button className="secondary-button" type="button" onClick={onRetake}>
            <IconUpload size={18} />
            Choose another photo
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorScreen;
