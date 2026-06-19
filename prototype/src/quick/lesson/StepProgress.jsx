import React from "react";

export function StepProgress({ current }) {
  return (
    <div className="step-progress">
      <div className="step-progress-bar">
        <span style={{ width: `${(current / 4) * 100}%` }} />
      </div>
    </div>
  );
}

export default StepProgress;
