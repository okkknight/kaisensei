import { useEffect, useMemo, useState } from "react";
import { DEEP_COPY } from "../copy.js";
import { createDeepCourseState, getNextDeepPhase, getPreviousDeepPhase } from "./deep-course-state.js";
import { createDeepCourseViewModel } from "../schema/deep-course-schema.js";
import { useDeepModeJobLifecycle } from "./useDeepModeJobLifecycle.js";
import { useDeepGenerationSnapshot } from "./staged-generation/useDeepGenerationSnapshot.js";

export function useDeepModeFlow({ initialFile = null, initialLevel = "Normal", onExitToCamera } = {}) {
  const job = useDeepModeJobLifecycle({
    initialFile,
    initialLevel,
    onExitToCamera,
  });
  const [phase, setPhase] = useState(initialFile ? "loading" : "overview");
  const lessonSnapshot = useDeepGenerationSnapshot({
    lesson: job.lesson,
    generation: job.generation,
    level: job.level,
  });

  useEffect(() => {
    if (job.screen === "loading" && !job.loadingRevealReady) {
      setPhase("loading");
      return;
    }

    if (job.loadingRevealReady && phase === "loading") {
      setPhase("overview");
    }
  }, [job.loadingRevealReady, job.screen, phase]);

  const viewModel = useMemo(
    () =>
      lessonSnapshot
        ? createDeepCourseViewModel({
            lesson: lessonSnapshot.lesson,
            photoPreviewUrl: job.photoPreviewUrl,
            lessonReadyStage: lessonSnapshot.readyStage,
          })
        : null,
    [job.photoPreviewUrl, lessonSnapshot]
  );

  const state = useMemo(() => {
    return createDeepCourseState({
      level: job.level,
      photoPreviewUrl: job.photoPreviewUrl,
      phase,
      loadingMessageIndex: job.loadingMessageIndex,
      lessonReadyStage: lessonSnapshot?.readyStage ?? null,
    });
  }, [job.level, job.loadingMessageIndex, job.photoPreviewUrl, lessonSnapshot?.readyStage, phase]);

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
    lesson: lessonSnapshot?.lesson ?? job.lesson,
    lessonReadyStage: lessonSnapshot?.readyStage ?? null,
    lessonSnapshot,
    generation: job.generation,
    viewModel,
    state,
    photoPreviewUrl: job.photoPreviewUrl,
    loadingMessage: job.loadingMessage,
    loadingProgress: job.loadingProgress,
    loadingProgressState: job.loadingProgressState,
    loadingRevealReady: job.loadingRevealReady,
    errorState: job.errorState,
    goNext,
    goBack,
    restartCourse,
    exitToCamera,
    retryFromError,
    retryFailedStage: job.handleRetryStage,
  };
}

export default useDeepModeFlow;
