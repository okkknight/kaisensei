import React from "react";
import { IconCamera, IconSparkles } from "@tabler/icons-react";

export function EmptyQuickState({ onRetake }) {
  return (
    <div className="screen loading-screen">
      <div className="loading-stage">
        <div className="loading-icon">
          <IconSparkles size={20} />
        </div>
        <h2>Quick Mode is waiting for a photo.</h2>
        <p>Go back to the camera entry and capture or upload one scene.</p>
        <div className="button-stack">
          <button className="action-button" type="button" onClick={onRetake}>
            <IconCamera size={18} />
            Back to camera
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmptyQuickState;
