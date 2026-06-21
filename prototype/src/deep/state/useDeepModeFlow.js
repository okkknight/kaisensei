import { useEffect, useMemo, useState } from "react";
import { DEEP_COPY } from "../copy.js";
import { createDeepCourseState, getNextDeepPhase, getPreviousDeepPhase } from "./deep-course-state.js";
import { createDeepCourseViewModel } from "../schema/deep-course-schema.js";
import { useDeepModeJobLifecycle } from "./useDeepModeJobLifecycle.js";

export function useDeepModeFlow({ initialFile = null, initialLevel = "Normal", onExitToCamera } = {}) {
  const job = useDeepModeJobLifecycle({
    initialFile,
    initialLevel,
    onExitToCamera,
  });
  const [phase, setPhase] = useState(initialFile ? "loading" : "overview");

  useEffect(() => {
    if (job.screen === "loading") {
      setPhase("loading");
      return;
    }

    if (job.lesson && phase === "loading") {
      setPhase("overview");
    }
  }, [job.lesson, job.screen, phase]);

  const viewModel = useMemo(
    () => (job.lesson ? createDeepCourseViewModel({ lesson: job.lesson, photoPreviewUrl: job.photoPreviewUrl }) : null),
    [job.lesson, job.photoPreviewUrl]
  );

  const state = useMemo(() => {
    return createDeepCourseState({
      level: job.level,
      photoPreviewUrl: job.photoPreviewUrl,
      phase,
      loadingMessageIndex: job.loadingMessageIndex,
    });
  }, [job.level, job.loadingMessageIndex, job.photoPreviewUrl, phase]);

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

      job.handleRetakePhoto();
      return;
    }

    const confirmedBack = window.confirm(DEEP_COPY.backConfirm);

    if (!confirmedBack) {
      return;
    }

    setPhase((current) => getPreviousDeepPhase(current));
  }

  function restartCourse() {
    setPhase("overview");
  }

  function exitToCamera() {
    job.handleRetakePhoto();
  }

  function retryFromError() {
    setPhase("loading");
    job.handleRetry();
  }

  return {
    phase,
    lesson: job.lesson,
    viewModel,
    state,
    photoPreviewUrl: job.photoPreviewUrl,
    loadingMessage: job.loadingMessage,
    errorState: job.errorState,
    goNext,
    goBack,
    restartCourse,
    exitToCamera,
    retryFromError,
  };
}

export default useDeepModeFlow;
