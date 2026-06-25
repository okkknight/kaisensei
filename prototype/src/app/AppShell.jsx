import React, { useMemo, useState } from "react";
import CameraEntry from "./CameraEntry.jsx";
import {
  COURSE_LEVEL_ADVANCED,
  COURSE_LEVEL_NORMAL,
  MODE_CAMERA,
  MODE_DEEP,
  MODE_QUICK,
} from "./modeRegistry.js";
import DeepCourseMockApp from "../deep/mock/DeepCourseMockApp.jsx";
import QuickModeApp from "../quick/QuickModeApp.jsx";
import DeepModeApp from "../deep/DeepModeApp.jsx";

export function AppShell() {
  const [mode, setMode] = useState(MODE_QUICK);
  const [level, setLevel] = useState(COURSE_LEVEL_ADVANCED);
  const [pendingCapture, setPendingCapture] = useState(null);
  const [route, setRoute] = useState(MODE_CAMERA);
  const [mockPhase, setMockPhase] = useState(() => {
    if (!import.meta.env.DEV || typeof window === "undefined") {
      return "";
    }

    const searchParams = new URLSearchParams(window.location.search);
    const nextMockPhase = searchParams.get("deepMockPhase") || searchParams.get("deepMock") || "";
    return nextMockPhase === "full" ? "overview" : nextMockPhase;
  });
  const [mockInteractIndex] = useState(() => {
    if (!import.meta.env.DEV || typeof window === "undefined") {
      return 0;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const rawIndex = searchParams.get("deepMockInteractIndex");
    const parsedIndex = Number.parseInt(rawIndex ?? "", 10);

    return Number.isFinite(parsedIndex) && parsedIndex >= 0 ? parsedIndex : 0;
  });

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

    if (mockPhase) {
      setMockPhase("");

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("deepMockPhase");
        url.searchParams.delete("deepMock");
        url.searchParams.delete("deepMockInteractIndex");
        window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
      }
    }
  }

  if (import.meta.env.DEV && mockPhase) {
    return <DeepCourseMockApp initialPhase={mockPhase} initialInteractIndex={mockInteractIndex} onExitToCamera={handleBackToCamera} />;
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
