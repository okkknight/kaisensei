import React, { useEffect, useRef, useState } from "react";
import { createLessonJob, getLessonJob, LessonApiError } from "../lib/lesson-api.js";
import "../styles.css";
import { QUICK_COPY } from "./copy.js";
import { EmptyQuickState } from "./lesson/EmptyQuickState.jsx";
import { ErrorScreen } from "./lesson/ErrorScreen.jsx";
import { LoadingScreen } from "./lesson/LoadingScreen.jsx";
import { QuickLessonScreen } from "./lesson/QuickLessonScreen.jsx";
import { QUICK_STEP_ORDER } from "./lesson/lesson-state.js";
import { buildHint, joinChunkText, normalizeText, shuffleChunks } from "./lesson/lesson-helpers.js";

const loadingMessages = QUICK_COPY.loadingMessages;

function createTraceId() {
  return `flow_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function logClientTrace(event, data = {}) {
  console.info(
    `[kaisensei][client] ${JSON.stringify({
      at: new Date().toISOString(),
      event,
      ...data,
    })}`,
  );
}

function roundMs(value) {
  return Math.round(value);
}

export function App({ initialFile = null, initialLevel = "Normal", onExitToCamera } = {}) {
  const [level, setLevel] = useState(initialLevel);
  const [screen, setScreen] = useState(initialFile ? "loading" : "empty");
  const [lesson, setLesson] = useState(null);
  const [activeStep, setActiveStep] = useState("See");
  const [buildSelectedIds, setBuildSelectedIds] = useState([]);
  const [useSelectedIds, setUseSelectedIds] = useState([]);
  const [buildFeedback, setBuildFeedback] = useState({
    tone: "neutral",
    title: "Ready",
    body: "Tap chunks to build the sentence.",
  });
  const [useFeedback, setUseFeedback] = useState({
    tone: "neutral",
    title: "Ready",
    body: "Tap chunks to build your answer.",
  });
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [errorState, setErrorState] = useState(null);
  const [speakingKey, setSpeakingKey] = useState("");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");

  const selectedFileRef = useRef(null);
  const previewUrlRef = useRef("");
  const requestIdRef = useRef(0);
  const pollTimerRef = useRef(null);
  const loadingTimerRef = useRef(null);

  const buildSelectedChunks = lesson
    ? buildSelectedIds.map((id) => lesson.build.chunks.find((chunk) => chunk.id === id)).filter(Boolean)
    : [];
  const useSelectedChunks = lesson
    ? useSelectedIds.map((id) => lesson.use.answerChunks.find((chunk) => chunk.id === id)).filter(Boolean)
    : [];
  const buildBank = lesson ? shuffleChunks(lesson.build.chunks, `${lesson.build.targetSentence}:build`) : [];
  const useBank = lesson ? shuffleChunks(lesson.use.answerChunks, `${lesson.use.targetAnswer}:use`) : [];

  const buildIsSolved =
    Boolean(lesson) &&
    buildSelectedChunks.length === lesson.build.correctOrder.length &&
    normalizeText(joinChunkText(buildSelectedChunks)) === normalizeText(lesson.build.targetSentence);

  const useIsSolved =
    Boolean(lesson) &&
    useSelectedChunks.length === lesson.use.correctOrder.length &&
    normalizeText(joinChunkText(useSelectedChunks)) === normalizeText(lesson.use.targetAnswer);

  useEffect(() => {
    setBuildSelectedIds([]);
    setUseSelectedIds([]);
    setBuildFeedback({
      tone: "neutral",
      title: "Ready",
      body: "Tap chunks to build the sentence.",
    });
    setUseFeedback({
      tone: "neutral",
      title: "Ready",
      body: "Tap chunks to build your answer.",
    });
    setActiveStep("See");
  }, [lesson]);

  useEffect(() => {
    if (!initialFile) {
      return undefined;
    }

    selectedFileRef.current = initialFile;
    setPreviewFromFile(initialFile);
    setLevel(initialLevel);
    void generateLessonFromFile(initialFile, initialLevel, "entry");
    return undefined;
  }, [initialFile, initialLevel]);

  useEffect(
    () => () => {
      stopPolling();
      stopLoadingTicker();
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
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

        logClientTrace("poll_status", {
          traceId,
          jobId,
          status: job.status,
          pollMs: roundMs(performance.now() - pollStartedAt),
          elapsedMs: roundMs(performance.now() - flowStartedAt),
        });

        if (job.status === "queued" || job.status === "running") {
          await pollJob(jobId, requestId, traceId, flowStartedAt);
          return;
        }

        stopLoadingTicker();

        if (job.status === "succeeded") {
          logClientTrace("flow_done", {
            traceId,
            jobId,
            totalMs: roundMs(performance.now() - flowStartedAt),
          });
          setLesson(job.lesson);
          setLevel(job.lesson.level);
          setScreen("lesson");
          setActiveStep("See");
          setErrorState(null);
          return;
        }

        logClientTrace("flow_failed", {
          traceId,
          jobId,
          totalMs: roundMs(performance.now() - flowStartedAt),
          status: job.status,
        });
        showError(job.error?.message || "Try again.");
      } catch (error) {
        if (requestIdRef.current !== requestId) return;
        stopLoadingTicker();
        const message = error instanceof LessonApiError ? error.message : "Try again.";
        logClientTrace("poll_error", {
          traceId,
          jobId,
          elapsedMs: roundMs(performance.now() - flowStartedAt),
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
    const traceId = createTraceId();
    const flowStartedAt = performance.now();
    setErrorState(null);
    setScreen("loading");
    setLevel(nextLevel);
    startLoadingTicker();

    logClientTrace("flow_start", {
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
      logClientTrace("upload_start", {
        traceId,
        source,
        level: nextLevel,
        uploadBytes: file.size,
        uploadType: file.type,
      });

      const created = await createLessonJob({
        image: file,
        level: nextLevel,
        traceId,
      });

      if (requestIdRef.current !== requestId) return;

      logClientTrace("upload_done", {
        traceId,
        jobId: created.jobId,
        elapsedMs: roundMs(performance.now() - uploadStartedAt),
      });

      await pollJob(created.jobId, requestId, traceId, flowStartedAt);
    } catch (error) {
      if (requestIdRef.current !== requestId) return;
      stopLoadingTicker();
      const message = error instanceof LessonApiError ? error.message : "Try again.";
      logClientTrace("flow_failed", {
        traceId,
        source,
        level: nextLevel,
        message,
        totalMs: roundMs(performance.now() - flowStartedAt),
      });
      showError(message);
    }
  }

  function setPreviewFromFile(file) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const nextUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextUrl;
    setPhotoPreviewUrl(nextUrl);
  }

  function handleRetakePhoto() {
    cancelPendingWork();
    if (onExitToCamera) {
      onExitToCamera();
      return;
    }

    setPhotoPreviewUrl("");
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

  function handleBack(step) {
    const index = QUICK_STEP_ORDER.indexOf(step);
    if (index <= 0) {
      handleRetakePhoto();
      return;
    }

    setActiveStep(QUICK_STEP_ORDER[index - 1]);
  }

  function handleContinue() {
    const index = QUICK_STEP_ORDER.indexOf(activeStep);
    if (index < QUICK_STEP_ORDER.length - 1) {
      setActiveStep(QUICK_STEP_ORDER[index + 1]);
      return;
    }

    handleRetakePhoto();
  }

  function speak(text, key) {
    if (!window?.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.97;
    utterance.pitch = 1;
    setSpeakingKey(key);
    utterance.onend = () => {
      setSpeakingKey((current) => (current === key ? "" : current));
    };
    utterance.onerror = () => {
      setSpeakingKey((current) => (current === key ? "" : current));
    };
    window.speechSynthesis.speak(utterance);
  }

  function updateSelection(selectedIds, setSelectedIds, chunkId, targetIds, setFeedback, isBuild) {
    let nextSelected;
    if (selectedIds.includes(chunkId)) {
      nextSelected = selectedIds.filter((id) => id !== chunkId);
      setFeedback({
        tone: "neutral",
        title: "Editing...",
        body: "Tap Check when you are ready.",
      });
    } else {
      nextSelected = [...selectedIds, chunkId];
      if (nextSelected.length === targetIds.length) {
        setFeedback({
          tone: "neutral",
          title: "Almost there",
          body: "Tap Check to see if the order feels right.",
        });
      } else {
        setFeedback({
          tone: "neutral",
          title: "Keep going",
          body: isBuild ? "Tap more chunks to build the sentence." : "Tap more chunks to build your answer.",
        });
      }
    }

    setSelectedIds(nextSelected);
  }

  function checkSelection(selectedChunks, targetSentence, setFeedback, successCopy, failCopy) {
    const selectedText = normalizeText(joinChunkText(selectedChunks));
    const expectedText = normalizeText(targetSentence);
    const passed = selectedText.length > 0 && selectedText === expectedText;

    if (passed) {
      setFeedback({
        tone: "success",
        title: successCopy.title,
        body: successCopy.body,
      });
      return true;
    }

    setFeedback({
      tone: "error",
      title: failCopy.title,
      body: failCopy.body,
    });
    return false;
  }

  function handleBuildToggle(chunkId) {
    if (!lesson) return;
    updateSelection(
      buildSelectedIds,
      setBuildSelectedIds,
      chunkId,
      lesson.build.correctOrder,
      setBuildFeedback,
      true,
    );
  }

  function handleUseToggle(chunkId) {
    if (!lesson) return;
    updateSelection(
      useSelectedIds,
      setUseSelectedIds,
      chunkId,
      lesson.use.correctOrder,
      setUseFeedback,
      false,
    );
  }

  function handleBuildCheck() {
    if (!lesson) return;
    checkSelection(
      buildSelectedChunks,
      lesson.build.targetSentence,
      setBuildFeedback,
      { title: "Great job! 🎉", body: "You built the sentence." },
      { title: "Almost.", body: "Try again." },
    );
  }

  function handleUseCheck() {
    if (!lesson) return;
    checkSelection(
      useSelectedChunks,
      lesson.use.targetAnswer,
      setUseFeedback,
      { title: "Nice! 🎉", body: "Now you can use it in real life." },
      {
        title: "Close.",
        body: buildHint(lesson.use.answerChunks),
      },
    );
  }

  function renderScreen() {
    if (screen === "loading") {
      return <LoadingScreen message={loadingMessages[loadingMessageIndex]} />;
    }

    if (screen === "error") {
      return (
        <ErrorScreen
          error={errorState}
          onRetry={handleRetry}
          onRetake={handleRetakePhoto}
        />
      );
    }

    if (screen === "lesson" && lesson) {
      return (
        <QuickLessonScreen
          lesson={lesson}
          level={level}
          activeStep={activeStep}
          onBack={handleBack}
          onContinue={handleContinue}
          onSpeak={speak}
          speakingKey={speakingKey}
          buildSelectedChunks={buildSelectedChunks}
          useSelectedChunks={useSelectedChunks}
          buildFeedback={buildFeedback}
          useFeedback={useFeedback}
          buildSolved={buildIsSolved}
          useSolved={useIsSolved}
          buildBank={buildBank}
          useBank={useBank}
          onBuildToggle={handleBuildToggle}
          onBuildReset={() => {
            setBuildSelectedIds([]);
            setBuildFeedback({
              tone: "neutral",
              title: "Reset",
              body: "Start again from the chunks above.",
            });
          }}
          onUseToggle={handleUseToggle}
          onUseReset={() => {
            setUseSelectedIds([]);
            setUseFeedback({
              tone: "neutral",
              title: "Reset",
              body: "Try a different answer order.",
            });
          }}
          onBuildCheck={handleBuildCheck}
          onUseCheck={handleUseCheck}
          photoPreviewUrl={photoPreviewUrl}
        />
      );
    }

  return <EmptyQuickState onRetake={handleRetakePhoto} />;
  }

  return (
    <div className="app-shell">
      <main className="mobile-stage app-stage">
        <div className="mobile-shell">{renderScreen()}</div>
      </main>
    </div>
  );
}

export default App;
