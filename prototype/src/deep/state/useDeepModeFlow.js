import { useEffect, useMemo, useState } from "react";
import { DEEP_COPY } from "../copy.js";
import { DEEP_PHASE_ORDER } from "../course/module-registry.js";
import { createDeepCourseState, getNextDeepPhase, getPreviousDeepPhase } from "./deep-course-state.js";
import { createDeepCourseLesson, createDeepCourseViewModel } from "../schema/deep-course-schema.js";

export function useDeepModeFlow({ initialFile = null, initialLevel = "Normal", onExitToCamera } = {}) {
  const [phase, setPhase] = useState(initialFile ? "loading" : "overview");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [errorState, setErrorState] = useState(null);

  const lesson = useMemo(() => createDeepCourseLesson(initialLevel), [initialLevel]);
  const viewModel = useMemo(
    () => createDeepCourseViewModel({ lesson, photoPreviewUrl }),
    [lesson, photoPreviewUrl]
  );

  useEffect(() => {
    if (!initialFile) {
      setPhotoPreviewUrl("");
      setPhase("overview");
      setErrorState(null);
      return undefined;
    }

    const nextUrl = URL.createObjectURL(initialFile);
    setPhotoPreviewUrl(nextUrl);
    setPhase("loading");
    setLoadingMessageIndex(0);
    setErrorState(null);

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
      const confirmedExit = window.confirm(DEEP_COPY.backConfirm);

      if (!confirmedExit) {
        return;
      }

      onExitToCamera?.();
      return;
    }

    const confirmedBack = window.confirm(DEEP_COPY.backConfirm);

    if (!confirmedBack) {
      return;
    }

    setPhase((current) => getPreviousDeepPhase(current));
  }

  function restartCourse() {
    setErrorState(null);
    setPhase("overview");
  }

  function exitToCamera() {
    onExitToCamera?.();
  }

  function retryFromError() {
    setErrorState(null);
    setPhase(initialFile ? "loading" : "overview");
  }

  return {
    phase,
    lesson,
    viewModel,
    state,
    photoPreviewUrl,
    loadingMessage: DEEP_COPY.loading[loadingMessageIndex],
    errorState,
    goNext,
    goBack,
    restartCourse,
    exitToCamera,
    retryFromError,
  };
}

export default useDeepModeFlow;
