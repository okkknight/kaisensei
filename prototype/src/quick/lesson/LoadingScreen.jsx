import React from "react";
import { IconSparkles } from "@tabler/icons-react";

export function LoadingScreen({ message }) {
  return (
    <div className="screen loading-screen">
      <div className="loading-stage">
        <div className="loading-icon">
          <IconSparkles size={20} />
        </div>
        <h2>{message}</h2>
        <p>请稍等，马上开始。</p>
        <div className="loading-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
