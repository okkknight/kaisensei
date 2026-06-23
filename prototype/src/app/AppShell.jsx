import React, { useMemo, useState } from "react";
import CameraEntry from "./CameraEntry.jsx";
import {
  COURSE_LEVEL_ADVANCED,
  COURSE_LEVEL_NORMAL,
  MODE_CAMERA,
  MODE_DEEP,
  MODE_QUICK,
} from "./modeRegistry.js";
import QuickModeApp from "../quick/QuickModeApp.jsx";
import DeepModeApp from "../deep/DeepModeApp.jsx";

export function AppShell() {
  const [mode, setMode] = useState(MODE_QUICK);
  const [level, setLevel] = useState(COURSE_LEVEL_ADVANCED);
  const [pendingCapture, setPendingCapture] = useState(null);
  const [route, setRoute] = useState(MODE_CAMERA);

  const activeMode = useMemo(() => {
    if (route === MODE_CAMERA) {
      return MODE_CAMERA;
    }

    return mode;
  }, [mode, route]);

  function handleCapture(file, context) {
    setPendingCapture({ file, context });
    setMode(context.mode);
    setLevel(context.level);
    setRoute(context.mode);
  }

  function handleBackToCamera() {
    setPendingCapture(null);
    setRoute(MODE_CAMERA);
  }

  if (activeMode === MODE_QUICK) {
    return (
      <QuickModeApp
        initialFile={pendingCapture?.file ?? null}
        initialLevel={level}
        onExitToCamera={handleBackToCamera}
      />
    );
  }

  if (activeMode === MODE_DEEP) {
    return (
      <DeepModeApp
        initialFile={pendingCapture?.file ?? null}
        initialLevel={level}
        onExitToCamera={handleBackToCamera}
      />
    );
  }

  return (
    <CameraEntry
      mode={mode}
      level={level}
      onModeChange={setMode}
      onLevelChange={setLevel}
      onCapture={handleCapture}
    />
  );
}

export default AppShell;
