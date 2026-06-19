import React from "react";
import QuickModeApp from "../quick/QuickModeApp.jsx";
import DeepModeApp from "../deep/DeepModeApp.jsx";

export function AppShell() {
  const activeMode = "quick";

  return activeMode === "deep" ? <DeepModeApp /> : <QuickModeApp />;
}

export default AppShell;
