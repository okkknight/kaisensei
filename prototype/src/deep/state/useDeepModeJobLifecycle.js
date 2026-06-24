import { useEffect, useRef, useState } from "react";
import { createLessonJob, getLessonJob, retryLessonJob, LessonApiError } from "../../lib/lesson-api.js";
import { DEEP_COPY } from "../copy.js";
import { createDeepLessonTraceId, logDeepLessonTrace, roundDeepLessonMs } from "./deep-lesson-trace.js";
import { createDeepCourseLessonSnapshot } from "./staged-generation/deep-generation-state.js";

const loadingMessages = DEEP_COPY.loading;
const loadingTickMs = 850;
const loadingProgressTickMs = 120;
const loadingProgressMaxVisibleMs = 25000;
const loadingProgressMaxPercent = 97;
const loadingRevealDelayMs = 240;
const pollDelayMs = 900;

export function useDeepModeJobLifecycle({
  initialFile = null,
  initialLevel = "Normal",
  onExitToCamera,
} = {}) {
  const [level, setLevel] = useState(initialLevel);
  const [screen, setScreen] = useState(initialFile ? "loading" : "empty");
  const [lesson, setLesson] = useState(null);
  const [generation, setGeneration] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingProgressState, setLoadingProgressState] = useState("running");
  const [loadingRevealReady, setLoadingRevealReady] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [jobId, setJobId] = useState("");

  const selectedFileRef = useRef(null);
  const previewUrlRef = useRef("");
  const requestIdRef = useRef(0);
  const pollTimerRef = useRef(null);
  const loadingTimerRef = useRef(null);
  const loadingProgressTimerRef = useRef(null);
  const loadingRevealTimerRef = useRef(null);
  const flowStartedAtRef = useRef(0);
  const traceIdRef = useRef("");
  const firstSnapshotLoggedRef = useRef(false);
  const firstSnapshotReadyRef = useRef(false);

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

  function stopLoadingProgressTicker() {
    if (loadingProgressTimerRef.current) {
      window.clearInterval(loadingProgressTimerRef.current);
      loadingProgressTimerRef.current = null;
    }
  }

  function stopLoadingRevealTimer() {
    if (loadingRevealTimerRef.current) {
      window.clearTimeout(loadingRevealTimerRef.current);
      loadingRevealTimerRef.current = null;
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

  function startLoadingProgressTicker(flowStartedAt) {
    stopLoadingProgressTicker();
    setLoadingProgressState("running");
    const updateProgress = () => {
      if (firstSnapshotReadyRef.current) {
        return;
      }

      const elapsedMs = performance.now() - flowStartedAt;
      const visibleElapsedMs = Math.min(loadingProgressMaxVisibleMs, Math.max(0, elapsedMs));
      const nextProgress = Math.min(
        loadingProgressMaxPercent,
        Math.round((visibleElapsedMs / loadingProgressMaxVisibleMs) * loadingProgressMaxPercent),
      );

      setLoadingProgress(nextProgress);
      setLoadingProgressState(visibleElapsedMs >= loadingProgressMaxVisibleMs ? "stalled" : "running");
    };

    updateProgress();
    loadingProgressTimerRef.current = window.setInterval(updateProgress, loadingProgressTickMs);
  }

  function beginLoadingReveal() {
    if (firstSnapshotReadyRef.current) {
      return;
    }

    firstSnapshotReadyRef.current = true;
    stopLoadingProgressTicker();
    stopLoadingRevealTimer();
    setLoadingProgressState("finishing");
    setLoadingProgress(100);
    loadingRevealTimerRef.current = window.setTimeout(() => {
      setLoadingRevealReady(true);
      loadingRevealTimerRef.current = null;
    }, loadingRevealDelayMs);
  }

  function createTraceId() {
    return createDeepLessonTraceId();
  }

  function cancelPendingWork() {
    requestIdRef.current += 1;
    stopPolling();
    stopLoadingTicker();
    stopLoadingProgressTicker();
    stopLoadingRevealTimer();
  }

  function showError(message) {
    setErrorState({
      title: DEEP_COPY.errorTitle,
      body: message || DEEP_COPY.retryAction,
    });
    setScreen("error");
  }

  async function pollJob(jobId, requestId, traceId, flowStartedAt) {
    pollTimerRef.current = window.setTimeout(async () => {
      try {
        const pollStartedAt = performance.now();
        const job = await getLessonJob(jobId);
        if (requestIdRef.current !== requestId) return;
        const snapshot = createDeepCourseLessonSnapshot(job);

        if (snapshot && !firstSnapshotLoggedRef.current) {
          firstSnapshotLoggedRef.current = true;
          beginLoadingReveal();
          logDeepLessonTrace("first_snapshot_visible", {
            traceId,
            jobId,
            readyStage: snapshot.readyStage,
            isComplete: snapshot.isComplete,
            status: job.status,
            elapsedMs: roundDeepLessonMs(performance.now() - flowStartedAt),
          });
        }

        logDeepLessonTrace("poll_status", {
          traceId,
          jobId,
          status: job.status,
          pollMs: roundDeepLessonMs(performance.now() - pollStartedAt),
          elapsedMs: roundDeepLessonMs(performance.now() - flowStartedAt),
        });

        if (job.status === "queued" || job.status === "running") {
          setGeneration(job.generation ?? null);
          await pollJob(jobId, requestId, traceId, flowStartedAt);
          return;
        }

        stopLoadingTicker();
        stopLoadingProgressTicker();
        stopLoadingRevealTimer();

        if (job.status === "succeeded") {
          logDeepLessonTrace("flow_done", {
            traceId,
            jobId,
            totalMs: roundDeepLessonMs(performance.now() - flowStartedAt),
          });
          setGeneration(job.generation ?? null);
          setLesson(job.lesson);
          setLevel(job.lesson.level);
          setScreen("lesson");
          setErrorState(null);
          return;
        }

        if (job.status === "failed" && snapshot) {
          logDeepLessonTrace("flow_staged_failed", {
            traceId,
            jobId,
            totalMs: roundDeepLessonMs(performance.now() - flowStartedAt),
            failedStage: job.generation?.errorStage || "",
          });
          setGeneration(job.generation ?? null);
          setLevel(job.level);
          setScreen("lesson");
          setErrorState(null);
          return;
        }

        logDeepLessonTrace("flow_failed", {
          traceId,
          jobId,
          totalMs: roundDeepLessonMs(performance.now() - flowStartedAt),
          status: job.status,
        });
        showError(job.error?.message || DEEP_COPY.retryAction);
      } catch (error) {
        if (requestIdRef.current !== requestId) return;
        stopLoadingTicker();
        const message = error instanceof LessonApiError ? error.message : DEEP_COPY.retryAction;
        logDeepLessonTrace("poll_error", {
          traceId,
          jobId,
          elapsedMs: roundDeepLessonMs(performance.now() - flowStartedAt),
          message,
        });
        showError(message);
      }
    }, pollDelayMs);
  }

  async function generateLessonFromFile(file, nextLevel, source = "upload") {
    if (!file) return;

    cancelPendingWork();
    const requestId = requestIdRef.current;
    const traceId = createTraceId();
    const flowStartedAt = performance.now();
    traceIdRef.current = traceId;
    flowStartedAtRef.current = flowStartedAt;
    firstSnapshotLoggedRef.current = false;
    firstSnapshotReadyRef.current = false;
    setLoadingProgress(0);
    setLoadingProgressState("running");
    setLoadingRevealReady(false);
    setErrorState(null);
    setScreen("loading");
    setLesson(null);
    setGeneration(null);
    setLevel(nextLevel);
    setPreviewFromFile(file);
    selectedFileRef.current = file;
    setJobId("");
    startLoadingTicker();
    startLoadingProgressTicker(flowStartedAt);

    logDeepLessonTrace("flow_start", {
      traceId,
      source,
      level: nextLevel,
      fileName: file.name,
      fileType: file.type,
      fileBytes: file.size,
    });

    try {
      const uploadStartedAt = performance.now();
      logDeepLessonTrace("upload_start", {
        traceId,
        source,
        level: nextLevel,
        uploadBytes: file.size,
        uploadType: file.type,
      });

      const created = await createLessonJob({
        image: file,
        level: nextLevel,
        mode: "deep",
        traceId,
      });

      if (requestIdRef.current !== requestId) return;

      logDeepLessonTrace("upload_done", {
        traceId,
        jobId: created.jobId,
        elapsedMs: roundDeepLessonMs(performance.now() - uploadStartedAt),
      });

      setJobId(created.jobId);

      await pollJob(created.jobId, requestId, traceId, flowStartedAt);
    } catch (error) {
      if (requestIdRef.current !== requestId) return;
      stopLoadingTicker();
      stopLoadingProgressTicker();
      stopLoadingRevealTimer();
      const message = error instanceof LessonApiError ? error.message : DEEP_COPY.retryAction;
      logDeepLessonTrace("flow_failed", {
        traceId,
        source,
        level: nextLevel,
        message,
        totalMs: roundDeepLessonMs(performance.now() - flowStartedAt),
      });
      showError(message);
    }
  }

  useEffect(() => {
    if (!initialFile) {
      cancelPendingWork();
      selectedFileRef.current = null;
      setLesson(null);
      setGeneration(null);
      setJobId("");
      setErrorState(null);
      setScreen("empty");
      setLevel(initialLevel);
      setLoadingProgress(0);
      setLoadingProgressState("running");
      setLoadingRevealReady(false);
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
    setGeneration(null);
    setJobId("");
    setErrorState(null);
    setScreen("empty");
    setLoadingProgress(0);
    setLoadingProgressState("running");
    setLoadingRevealReady(false);
    clearPreview();
    onExitToCamera?.();
  }

  function handleRetry() {
    if (selectedFileRef.current) {
      setScreen("loading");
      setLoadingProgress(0);
      setLoadingProgressState("running");
      setLoadingRevealReady(false);
      void generateLessonFromFile(selectedFileRef.current, level, "retry");
      return;
    }

    onExitToCamera?.();
  }

  async function handleRetryStage() {
    if (!jobId) {
      return false;
    }

    setErrorState(null);

    try {
      const retryJob = await retryLessonJob(jobId);
      if (!retryJob) {
        return false;
      }

      firstSnapshotLoggedRef.current = false;
      firstSnapshotReadyRef.current = false;
      setLoadingProgress(0);
      setLoadingProgressState("running");
      setLoadingRevealReady(false);
      setGeneration(retryJob.generation ?? null);
      setScreen("lesson");
      await pollJob(jobId, requestIdRef.current, traceIdRef.current, flowStartedAtRef.current);
      return true;
    } catch (error) {
      const message = error instanceof LessonApiError ? error.message : DEEP_COPY.retryAction;
      logDeepLessonTrace("retry_stage_failed", {
        jobId,
        message,
      });
      return false;
    }
  }

  return {
    level,
    screen,
    lesson,
    generation,
    photoPreviewUrl,
    loadingMessage: loadingMessages[loadingMessageIndex],
    loadingMessageIndex,
    loadingProgress,
    loadingProgressState,
    loadingRevealReady,
    errorState,
    handleRetakePhoto,
    handleRetry,
    handleRetryStage,
    generateLessonFromFile,
  };
}

export default useDeepModeJobLifecycle;
