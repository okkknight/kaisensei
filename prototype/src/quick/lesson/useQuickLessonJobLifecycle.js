import { useEffect, useRef, useState } from "react";
import { createLessonJob, getLessonJob, LessonApiError } from "../../lib/lesson-api.js";
import { QUICK_COPY } from "../copy.js";
import { createQuickLessonTraceId, logQuickLessonTrace, roundQuickLessonMs } from "./quick-lesson-trace.js";

const loadingMessages = QUICK_COPY.loadingMessages;

export function useQuickLessonJobLifecycle({
  initialFile = null,
  initialLevel = "Normal",
  onExitToCamera,
  setPreviewFromFile,
  clearPreview,
} = {}) {
  const [level, setLevel] = useState(initialLevel);
  const [screen, setScreen] = useState(initialFile ? "loading" : "empty");
  const [lesson, setLesson] = useState(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [errorState, setErrorState] = useState(null);

  const selectedFileRef = useRef(null);
  const requestIdRef = useRef(0);
  const pollTimerRef = useRef(null);
  const loadingTimerRef = useRef(null);

  useEffect(() => {
    if (!initialFile) {
      return undefined;
    }

    selectedFileRef.current = initialFile;
    setPreviewFromFile(initialFile);
    setLevel(initialLevel);
    void generateLessonFromFile(initialFile, initialLevel, "entry");
    return undefined;
  }, [initialFile, initialLevel, setPreviewFromFile]);

  useEffect(
    () => () => {
      stopPolling();
      stopLoadingTicker();
    },
    [],
  );

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

  function startLoadingTicker() {
    stopLoadingTicker();
    setLoadingMessageIndex(0);
    loadingTimerRef.current = window.setInterval(() => {
      setLoadingMessageIndex((current) => (current + 1) % loadingMessages.length);
    }, 850);
  }

  function cancelPendingWork() {
    requestIdRef.current += 1;
    stopPolling();
    stopLoadingTicker();
  }

  function showError(message) {
    setErrorState({
      title: "The lesson got lost on the way.",
      body: message || "Try again.",
    });
    setScreen("error");
  }

  async function pollJob(jobId, requestId, traceId, flowStartedAt) {
    pollTimerRef.current = window.setTimeout(async () => {
      try {
        const pollStartedAt = performance.now();
        const job = await getLessonJob(jobId);
        if (requestIdRef.current !== requestId) return;

        logQuickLessonTrace("poll_status", {
          traceId,
          jobId,
          status: job.status,
          pollMs: roundQuickLessonMs(performance.now() - pollStartedAt),
          elapsedMs: roundQuickLessonMs(performance.now() - flowStartedAt),
        });

        if (job.status === "queued" || job.status === "running") {
          await pollJob(jobId, requestId, traceId, flowStartedAt);
          return;
        }

        stopLoadingTicker();

        if (job.status === "succeeded") {
          logQuickLessonTrace("flow_done", {
            traceId,
            jobId,
            totalMs: roundQuickLessonMs(performance.now() - flowStartedAt),
          });
          setLesson(job.lesson);
          setLevel(job.lesson.level);
          setScreen("lesson");
          setErrorState(null);
          return;
        }

        logQuickLessonTrace("flow_failed", {
          traceId,
          jobId,
          totalMs: roundQuickLessonMs(performance.now() - flowStartedAt),
          status: job.status,
        });
        showError(job.error?.message || "Try again.");
      } catch (error) {
        if (requestIdRef.current !== requestId) return;
        stopLoadingTicker();
        const message = error instanceof LessonApiError ? error.message : "Try again.";
        logQuickLessonTrace("poll_error", {
          traceId,
          jobId,
          elapsedMs: roundQuickLessonMs(performance.now() - flowStartedAt),
          message,
        });
        showError(message);
      }
    }, 900);
  }

  async function generateLessonFromFile(file, nextLevel, source = "upload") {
    if (!file) return;

    cancelPendingWork();
    const requestId = requestIdRef.current;
    const traceId = createQuickLessonTraceId();
    const flowStartedAt = performance.now();
    setErrorState(null);
    setScreen("loading");
    setLevel(nextLevel);
    startLoadingTicker();

    logQuickLessonTrace("flow_start", {
      traceId,
      source,
      level: nextLevel,
      fileName: file.name,
      fileType: file.type,
      fileBytes: file.size,
    });

    try {
      selectedFileRef.current = file;

      const uploadStartedAt = performance.now();
      logQuickLessonTrace("upload_start", {
        traceId,
        source,
        level: nextLevel,
        uploadBytes: file.size,
        uploadType: file.type,
      });

      const created = await createLessonJob({
        image: file,
        level: nextLevel,
        mode: "quick",
        traceId,
      });

      if (requestIdRef.current !== requestId) return;

      logQuickLessonTrace("upload_done", {
        traceId,
        jobId: created.jobId,
        elapsedMs: roundQuickLessonMs(performance.now() - uploadStartedAt),
      });

      await pollJob(created.jobId, requestId, traceId, flowStartedAt);
    } catch (error) {
      if (requestIdRef.current !== requestId) return;
      stopLoadingTicker();
      const message = error instanceof LessonApiError ? error.message : "Try again.";
      logQuickLessonTrace("flow_failed", {
        traceId,
        source,
        level: nextLevel,
        message,
        totalMs: roundQuickLessonMs(performance.now() - flowStartedAt),
      });
      showError(message);
    }
  }

  function handleRetakePhoto() {
    cancelPendingWork();
    if (onExitToCamera) {
      onExitToCamera();
      return;
    }

    clearPreview?.();
    setLesson(null);
    setErrorState(null);
    setScreen("empty");
    selectedFileRef.current = null;
  }

  function handleRetry() {
    if (selectedFileRef.current) {
      void generateLessonFromFile(selectedFileRef.current, level, "retry");
      return;
    }

    if (onExitToCamera) {
      onExitToCamera();
    }
  }

  return {
    level,
    screen,
    lesson,
    errorState,
    loadingMessage: loadingMessages[loadingMessageIndex],
    handleRetakePhoto,
    handleRetry,
    generateLessonFromFile,
  };
}

export default useQuickLessonJobLifecycle;
