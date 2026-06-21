import { useEffect, useMemo, useState } from "react";
import { DEEP_COPY } from "../copy.js";
import { DEEP_PHASE_ORDER } from "../course/module-registry.js";
import { createDeepCourseState, getNextDeepPhase, getPreviousDeepPhase } from "./deep-course-state.js";
import { createDeepCourseLesson } from "../schema/deep-course-schema.js";

export function useDeepModeFlow({ initialFile = null, initialLevel = "Normal", onExitToCamera } = {}) {
  const [phase, setPhase] = useState(initialFile ? "loading" : "overview");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const lesson = useMemo(() => createDeepCourseLesson(initialLevel), [initialLevel]);

  useEffect(() => {
    if (!initialFile) {
      setPhotoPreviewUrl("");
      setPhase("overview");
      return undefined;
    }

    const nextUrl = URL.createObjectURL(initialFile);
    setPhotoPreviewUrl(nextUrl);
    setPhase("loading");
    setLoadingMessageIndex(0);

    const messageTimer = window.setInterval(() => {
      setLoadingMessageIndex((current) => (current + 1) % DEEP_COPY.loading.length);
    }, 700);

    const enterOverviewTimer = window.setTimeout(() => {
      setPhase("overview");
      window.clearInterval(messageTimer);
    }, 1500);

    return () => {
      URL.revokeObjectURL(nextUrl);
      window.clearInterval(messageTimer);
      window.clearTimeout(enterOverviewTimer);
    };
  }, [initialFile]);

  const state = useMemo(() => {
    return createDeepCourseState({
      level: initialLevel,
      photoPreviewUrl,
      phase,
      loadingMessageIndex,
    });
  }, [initialLevel, loadingMessageIndex, photoPreviewUrl, phase]);

  function goNext() {
    setPhase((current) => getNextDeepPhase(current));
  }

  function goBack() {
    if (phase === "completion") {
      setPhase("overview");
      return;
    }

    if (phase === "overview" || phase === "loading") {
      onExitToCamera?.();
      return;
    }

    setPhase((current) => getPreviousDeepPhase(current));
  }

  return {
    phase,
    lesson,
    state,
    photoPreviewUrl,
    loadingMessage: DEEP_COPY.loading[loadingMessageIndex],
    goNext,
    goBack,
  };
}

export default useDeepModeFlow;
