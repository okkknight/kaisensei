import React from "react";
import { DEEP_MODULES } from "./module-registry.js";

export function ModuleProgress({ activePhase = "notice", completedPhases = [] }) {
  return (
    <div className="deep-progress">
      {DEEP_MODULES.map((module) => {
        const isActive = module.key === activePhase;
        const isCompleted = completedPhases.includes(module.key);

        return (
          <span
            key={module.key}
            className={`deep-progress-step ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
          >
            {module.label}
          </span>
        );
      })}
    </div>
  );
}

export default ModuleProgress;
