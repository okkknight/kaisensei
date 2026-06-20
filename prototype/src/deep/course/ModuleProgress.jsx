import React from "react";
import { DEEP_MODULE_ORDER, DEEP_PHASE_META } from "./module-registry.js";

export function ModuleProgress({ activePhase = "notice", completedPhases = [] }) {
  return (
    <div className="deep-progress">
      <div className="deep-progress-bar" aria-hidden="true">
        {DEEP_MODULE_ORDER.map((phase) => {
          const isActive = phase === activePhase;
          const isCompleted = completedPhases.includes(phase);

          return <span key={phase} className={`deep-progress-step ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`} />;
        })}
      </div>
      <div className="deep-progress-labels">
        {DEEP_MODULE_ORDER.map((phase) => (
          <span key={phase} className={phase === activePhase ? "active" : completedPhases.includes(phase) ? "completed" : ""}>
            {DEEP_PHASE_META[phase].label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ModuleProgress;
