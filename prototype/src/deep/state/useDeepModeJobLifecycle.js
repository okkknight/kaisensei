import { useEffect, useRef, useState } from "react";
import { createLessonJob, getLessonJob, LessonApiError } from "../../lib/lesson-api.js";
import { DEEP_COPY } from "../copy.js";

const loadingMessages = DEEP_COPY.loading;
const loadingTickMs = 850;
const pollDelayMs = 900;

export function useDeepModeJobLifecycle({
  initialFile = null,
  initialLevel = "Normal",
  onExitToCamera,
} = {}) {
  const [level, setLevel] = useState(initialLevel);
  const [screen, setScreen] = useState(initialFile ? "loading" : "empty");
  const [lesson, setLesson] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [errorState, setErrorState] = useState(null);

  const selectedFileRef = useRef(null);
  const previewUrlRef = useRef("");
  const requestIdRef = useRef(0);
  const pollTimerRef = useRef(null);
  const loadingTimerRef = useRef(null);

  function stopPolling() {
    if (pollTimerRef.current) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }

  function stopLoadingTicker() {
    if (loadingTimerRef.current) {
      window.clearInterval(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
  }

  function clearPreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }
    setPhotoPreviewUrl("");
  }

  function setPreviewFromFile(file) {
    clearPreview();
    const nextUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextUrl;
    setPhotoPreviewUrl(nextUrl);
  }

  function startLoadingTicker() {
    stopLoadingTicker();
    setLoadingMessageIndex(0);
    loadingTimerRef.current = window.setInterval(() => {
      setLoadingMessageIndex((current) => (current + 1) % loadingMessages.length);
    }, loadingTickMs);
  }

  function cancelPendingWork() {
    requestIdRef.current += 1;
    stopPolling();
    stopLoadingTicker();
  }

  function showError(message) {
    setErrorState({
      title: DEEP_COPY.errorTitle,
      body: message || DEEP_COPY.retryAction,
    });
    setScreen("error");
  }

  async function pollJob(jobId, requestId) {
    pollTimerRef.current = window.setTimeout(async () => {
      try {
        const job = await getLessonJob(jobId);
        if (requestIdRef.current !== requestId) return;

        if (job.status === "queued" || job.status === "running") {
          await pollJob(jobId, requestId);
          return;
        }

        stopLoadingTicker();

        if (job.status === "succeeded") {
          setLesson(job.lesson);
          setLevel(job.lesson.level);
          setScreen("lesson");
          setErrorState(null);
          return;
        }

        showError(job.error?.message || DEEP_COPY.retryAction);
      } catch (error) {
        if (requestIdRef.current !== requestId) return;
        stopLoadingTicker();
        const message = error instanceof LessonApiError ? error.message : DEEP_COPY.retryAction;
        showError(message);
      }
    }, pollDelayMs);
  }

  async function generateLessonFromFile(file, nextLevel) {
    if (!file) return;

    cancelPendingWork();
    const requestId = requestIdRef.current;
    setErrorState(null);
    setScreen("loading");
    setLesson(null);
    setLevel(nextLevel);
    setPreviewFromFile(file);
    selectedFileRef.current = file;
    startLoadingTicker();

    try {
      const created = await createLessonJob({
        image: file,
        level: nextLevel,
        mode: "deep",
      });

      if (requestIdRef.current !== requestId) return;

      await pollJob(created.jobId, requestId);
    } catch (error) {
      if (requestIdRef.current !== requestId) return;
      stopLoadingTicker();
      const message = error instanceof LessonApiError ? error.message : DEEP_COPY.retryAction;
      showError(message);
    }
  }

  useEffect(() => {
    if (!initialFile) {
      cancelPendingWork();
      selectedFileRef.current = null;
      setLesson(null);
      setErrorState(null);
      setScreen("empty");
      setLevel(initialLevel);
      clearPreview();
      return undefined;
    }

    selectedFileRef.current = initialFile;
    setLevel(initialLevel);
    void generateLessonFromFile(initialFile, initialLevel, "entry");
    return undefined;
  }, [initialFile, initialLevel]);

  useEffect(
    () => () => {
      cancelPendingWork();
      clearPreview();
    },
    [],
  );

  function handleRetakePhoto() {
    cancelPendingWork();
    selectedFileRef.current = null;
    setLesson(null);
    setErrorState(null);
    setScreen("empty");
    clearPreview();
    onExitToCamera?.();
  }

  function handleRetry() {
    if (selectedFileRef.current) {
      setScreen("loading");
      void generateLessonFromFile(selectedFileRef.current, level, "retry");
      return;
    }

    onExitToCamera?.();
  }

  return {
    level,
    screen,
    lesson,
    photoPreviewUrl,
    loadingMessage: loadingMessages[loadingMessageIndex],
    loadingMessageIndex,
    errorState,
    handleRetakePhoto,
    handleRetry,
    generateLessonFromFile,
  };
}

export default useDeepModeJobLifecycle;
