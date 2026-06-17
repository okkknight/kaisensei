import React, { useEffect, useRef, useState } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBook2,
  IconCamera,
  IconCameraRotate,
  IconCheck,
  IconCircleDashed,
  IconEye,
  IconMessage2,
  IconPlayerPlayFilled,
  IconPuzzle2,
  IconRefresh,
  IconSettings,
  IconSparkles,
  IconUpload,
  IconX,
  IconStarFilled,
} from "@tabler/icons-react";
import { createLessonJob, getLessonJob, LessonApiError } from "./lib/lesson-api.js";
import "./styles.css";

const stepOrder = ["See", "Learn", "Build", "Use"];
const stepMeta = {
  See: { label: "See", icon: IconEye },
  Learn: { label: "Learn", icon: IconBook2 },
  Build: { label: "Build", icon: IconPuzzle2 },
  Use: { label: "Use", icon: IconMessage2 },
};

const loadingMessages = ["正在查看你的场景…", "正在生成这节迷你课程…"];

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function joinChunkText(chunks) {
  return chunks.map((chunk) => chunk.text).join(" ");
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function shuffleChunks(items, seed) {
  const output = [...items];
  let state = hashString(seed) || 1;

  for (let index = output.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }

  return output;
}

function buildHint(targetChunks) {
  const first = targetChunks[0]?.text || "the first chunk";
  return `Almost. Try starting with "${first}"...`;
}

export function App() {
  const [level, setLevel] = useState("Normal");
  const [screen, setScreen] = useState("camera");
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
  const [cameraStatus, setCameraStatus] = useState("starting");
  const [cameraError, setCameraError] = useState("");
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const fileInputRef = useRef(null);
  const selectedFileRef = useRef(null);
  const previewUrlRef = useRef("");
  const cameraVideoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const cameraRequestIdRef = useRef(0);
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
          setActiveStep("See");
          setErrorState(null);
          return;
        }

        showError(job.error?.message || "Try again.");
      } catch (error) {
        if (requestIdRef.current !== requestId) return;
        stopLoadingTicker();
        const message =
          error instanceof LessonApiError ? error.message : "Try again.";
        showError(message);
      }
    }, 900);
  }

  async function generateLessonFromFile(file, nextLevel) {
    if (!file) return;

    cancelPendingWork();
    const requestId = requestIdRef.current;
    setErrorState(null);
    setScreen("loading");
    setLevel(nextLevel);
    startLoadingTicker();

    try {
      const created = await createLessonJob({
        image: file,
        level: nextLevel,
      });

      if (requestIdRef.current !== requestId) return;
      await pollJob(created.jobId, requestId);
    } catch (error) {
      if (requestIdRef.current !== requestId) return;
      stopLoadingTicker();
      const message =
        error instanceof LessonApiError ? error.message : "Try again.";
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

  function stopCameraStream() {
    const stream = cameraStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }

    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }
  }

  async function attachCameraStream(stream, requestId) {
    if (cameraRequestIdRef.current !== requestId || screen !== "camera") {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    cameraStreamRef.current = stream;

    const video = cameraVideoRef.current;
    if (video) {
      video.srcObject = stream;
      try {
        await video.play();
      } catch {
        // Autoplay can be delayed on some browsers; the stream is still live.
      }
    }

    if (cameraRequestIdRef.current === requestId) {
      setCameraStatus("ready");
      setCameraError("");
    }
  }

  async function startCamera(requestId) {
    stopCameraStream();
    setCameraStatus("starting");
    setCameraError("");

    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.getUserMedia) {
      setCameraStatus("error");
      setCameraError("当前摄像头不可用");
      return;
    }

    const preferredConstraints = {
      audio: false,
      video: {
        facingMode: { ideal: cameraFacingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

    try {
      let stream;
      try {
        stream = await mediaDevices.getUserMedia(preferredConstraints);
      } catch (error) {
        stream = await mediaDevices.getUserMedia({ audio: false, video: true });
      }

      await attachCameraStream(stream, requestId);
    } catch (error) {
      if (cameraRequestIdRef.current !== requestId) return;
      setCameraStatus("error");
      setCameraError("当前摄像头不可用");
    }
  }

  async function captureFromCamera() {
    const video = cameraVideoRef.current;
    if (!video || cameraStatus !== "ready" || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraStatus((current) => (current === "error" ? current : "starting"));
      setCameraError("当前摄像头不可用");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("当前摄像头不可用");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) {
      setCameraError("当前摄像头不可用");
      return;
    }

    const file = new File([blob], `kaisensei-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    stopCameraStream();
    handleFileChosen(file);
  }

  function handleFileChosen(file) {
    if (!file) return;
    selectedFileRef.current = file;
    setPreviewFromFile(file);
    void generateLessonFromFile(file, level);
  }

  function openPicker() {
    fileInputRef.current?.click();
  }

  function handleCapturePhoto() {
    void captureFromCamera();
  }

  function handleOpenSettings() {
    setSettingsOpen(true);
  }

  function handleRotateCamera() {
    setCameraFacingMode((current) => (current === "environment" ? "user" : "environment"));
  }

  function handleFileInputChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    handleFileChosen(file);
  }

  function handleLevelChange(nextLevel) {
    setLevel(nextLevel);
    setSettingsOpen(false);
    if (selectedFileRef.current) {
      void generateLessonFromFile(selectedFileRef.current, nextLevel);
    }
  }

  function handleRetakePhoto() {
    cancelPendingWork();
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    selectedFileRef.current = null;
    setPhotoPreviewUrl("");
    setLesson(null);
    setErrorState(null);
    setCameraError("");
    setCameraStatus("starting");
    setSettingsOpen(false);
    setScreen("camera");
  }

  function handleRetry() {
    if (selectedFileRef.current) {
      void generateLessonFromFile(selectedFileRef.current, level);
      return;
    }

    openPicker();
  }

  function handleBack(step) {
    const index = stepOrder.indexOf(step);
    if (index <= 0) {
      setScreen("camera");
      setLesson(null);
      setActiveStep("See");
      return;
    }

    setActiveStep(stepOrder[index - 1]);
  }

  function handleContinue() {
    const index = stepOrder.indexOf(activeStep);
    if (index < stepOrder.length - 1) {
      setActiveStep(stepOrder[index + 1]);
      return;
    }

    setLesson(null);
    setErrorState(null);
    setScreen("camera");
    setActiveStep("See");
  }

  useEffect(() => {
    if (screen !== "camera") {
      cameraRequestIdRef.current += 1;
      stopCameraStream();
      setSettingsOpen(false);
      return undefined;
    }

    const requestId = cameraRequestIdRef.current + 1;
    cameraRequestIdRef.current = requestId;
    void startCamera(requestId);

    return () => {
      cameraRequestIdRef.current += 1;
      stopCameraStream();
    };
  }, [screen, cameraFacingMode]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setSettingsOpen(false);
      }
    }

    if (settingsOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [settingsOpen]);

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
          onBrowse={openPicker}
        />
      );
    }

    if (screen === "lesson" && lesson) {
      return (
        <LessonScreen
          lesson={lesson}
          level={level}
          activeStep={activeStep}
          photoPreviewUrl={photoPreviewUrl}
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
        />
      );
    }

    return (
      <CameraScreen
        level={level}
        onLevelChange={handleLevelChange}
        onCapture={handleCapturePhoto}
        onUpload={openPicker}
        onSettings={handleOpenSettings}
        onRotate={handleRotateCamera}
        cameraStatus={cameraStatus}
        cameraError={cameraError}
        cameraVideoRef={cameraVideoRef}
        settingsOpen={settingsOpen}
        onCloseSettings={() => setSettingsOpen(false)}
      />
    );
  }

  return (
    <div className="app-shell">
      <main className="mobile-stage app-stage">
        <div className="mobile-shell">
          <input
            ref={fileInputRef}
            className="photo-file-input"
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
          />
          {renderScreen()}
        </div>
      </main>
    </div>
  );
}

function CameraScreen({
  level,
  onLevelChange,
  onCapture,
  onSettings,
  onRotate,
  onUpload,
  cameraStatus,
  cameraError,
  cameraVideoRef,
  settingsOpen,
  onCloseSettings,
}) {
  const isCameraReady = cameraStatus === "ready";
  const isCameraUnavailable = cameraStatus === "error";
  const unavailableMessage = cameraError || "当前摄像头不可用";

  return (
    <div className="screen camera-screen">
      <div className="screen-top camera-top">
        <div className="camera-brand">
          <span className="mobile-brand">kaisensei</span>
        </div>
        <button className="camera-settings-button" type="button" aria-label="Settings" onClick={onSettings}>
          <IconSettings size={16} />
        </button>
      </div>

      <div className={`camera-preview ${isCameraUnavailable ? "camera-preview-offline" : ""}`}>
        {isCameraUnavailable ? (
          <div className="camera-offline">
            <CameraScene />
            <div className="camera-offline-overlay" aria-hidden="true" />
            <p>{unavailableMessage}</p>
          </div>
        ) : (
          <>
            <CameraScene />
            <video
              ref={cameraVideoRef}
              className={`camera-photo ${isCameraReady ? "is-live" : "is-muted"}`}
              autoPlay
              muted
              playsInline
              aria-label="Live camera preview"
            />
            <div className="camera-grid" aria-hidden="true" />
          </>
        )}
      </div>

      <div className="camera-bottom">
        <div className="camera-mode-toggle" aria-label="Lesson mode">
          <button
            className={`level-pill ${level === "Normal" ? "selected" : ""}`}
            type="button"
            onClick={() => onLevelChange("Normal")}
          >
            快速
          </button>
          <button
            className={`level-pill ${level === "Advanced" ? "selected" : ""}`}
            type="button"
            onClick={() => onLevelChange("Advanced")}
          >
            深度
          </button>
        </div>

        <div className="camera-action-row" aria-label="Camera actions">
          <button className="camera-side-button" type="button" onClick={onUpload} aria-label="Upload photo">
            <IconUpload size={18} />
          </button>
          <button className="shutter-button" type="button" onClick={onCapture} aria-label="Take photo" disabled={!isCameraReady}>
            <span />
          </button>
          <button className="camera-side-button" type="button" onClick={onRotate} aria-label="Rotate camera">
            <IconCameraRotate size={18} />
          </button>
        </div>
      </div>

      {settingsOpen ? (
        <div className="camera-modal-backdrop" role="presentation" onClick={onCloseSettings}>
          <div className="camera-modal" role="dialog" aria-modal="true" aria-label="Camera settings" onClick={(event) => event.stopPropagation()}>
            <div className="camera-modal-header">
              <div>
                <h2>模式设置</h2>
              </div>
              <button className="camera-modal-close" type="button" aria-label="Close settings" onClick={onCloseSettings}>
                <IconX size={16} />
              </button>
            </div>

            <div className="camera-mode-list">
              <button
                className={`camera-mode-card ${level === "Normal" ? "selected" : ""}`}
                type="button"
                onClick={() => onLevelChange("Normal")}
              >
                <div className="camera-mode-card-head">
                  <strong>Normal</strong>
                  {level === "Normal" ? <span>已选</span> : null}
                </div>
              </button>

              <button
                className={`camera-mode-card ${level === "Advanced" ? "selected" : ""}`}
                type="button"
                onClick={() => onLevelChange("Advanced")}
              >
                <div className="camera-mode-card-head">
                  <strong>Advanced</strong>
                  {level === "Advanced" ? <span>已选</span> : null}
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CameraScene() {
  return (
    <div className="camera-scene" aria-hidden="true">
      <div className="camera-scene-stars" />
      <div className="camera-scene-meteor camera-scene-meteor-one" />
      <div className="camera-scene-meteor camera-scene-meteor-two" />
      <div className="camera-scene-glow camera-scene-glow-left" />
      <div className="camera-scene-glow camera-scene-glow-right" />
    </div>
  );
}

function LessonScreen({
  lesson,
  level,
  activeStep,
  onBack,
  onContinue,
  onSpeak,
  speakingKey,
  buildSelectedChunks,
  useSelectedChunks,
  buildFeedback,
  useFeedback,
  buildSolved,
  useSolved,
  onBuildToggle,
  onBuildReset,
  onUseToggle,
  onUseReset,
  onBuildCheck,
  onUseCheck,
  photoPreviewUrl,
  buildBank,
  useBank,
}) {
  const currentStepNumber = stepOrder.indexOf(activeStep) + 1;
  const currentMeta = stepMeta[activeStep];
  const MetaIcon = currentMeta.icon;

  const footerDisabled =
    activeStep === "Build" ? !buildSolved : activeStep === "Use" ? !useSolved : false;
  const footerLabel = activeStep === "Use" ? "Finish" : "Continue";

  return (
    <div className="screen lesson-screen">
      <div className="lesson-content">
        <div className="screen-header">
          <button className="back-button" type="button" aria-label="Back" onClick={() => onBack(activeStep)}>
            <IconArrowLeft size={18} />
          </button>
          <div className="screen-header-copy">
            <div className="screen-progress-copy">
              <span className="screen-progress-count">{currentStepNumber} / 4</span>
              <span className="screen-progress-label">{currentMeta.label}</span>
            </div>
          </div>
        </div>

        <StepProgress current={currentStepNumber} />

        <div className="step-icon-row" aria-hidden="true">
          <button className="step-icon-button" type="button" tabIndex={-1}>
            <MetaIcon size={18} />
          </button>
        </div>

        {activeStep === "See" && (
          <SeeStep lesson={lesson} photoPreviewUrl={photoPreviewUrl} onSpeak={onSpeak} speakingKey={speakingKey} onContinue={onContinue} />
        )}
        {activeStep === "Learn" && (
          <LearnStep lesson={lesson} onContinue={onContinue} onSpeak={onSpeak} speakingKey={speakingKey} />
        )}
        {activeStep === "Build" && (
          <BuildStep
            lesson={lesson}
            selectedChunks={buildSelectedChunks}
            bank={buildBank}
            feedback={buildFeedback}
            onToggleChunk={onBuildToggle}
            onReset={onBuildReset}
            onCheck={onBuildCheck}
            onSpeak={onSpeak}
            speakingKey={speakingKey}
          />
        )}
        {activeStep === "Use" && (
          <UseStep
            lesson={lesson}
            selectedChunks={useSelectedChunks}
            bank={useBank}
            feedback={useFeedback}
            onToggleChunk={onUseToggle}
            onReset={onUseReset}
            onCheck={onUseCheck}
            onSpeak={onSpeak}
            speakingKey={speakingKey}
          />
        )}
      </div>

      <div className="lesson-footer">
        <ActionButton disabled={footerDisabled} onClick={onContinue}>
          {footerLabel}
          {activeStep === "Use" ? <IconStarFilled size={16} /> : <IconArrowRight size={18} />}
        </ActionButton>
      </div>
    </div>
  );
}

function StepProgress({ current }) {
  return (
    <div className="step-progress">
      <div className="step-progress-bar">
        <span style={{ width: `${(current / 4) * 100}%` }} />
      </div>
    </div>
  );
}

function SeeStep({ lesson, photoPreviewUrl, onSpeak, speakingKey }) {
  return (
    <div className="lesson-body lesson-body-see">
      <div className="sentence-card">
        <div className="sentence-card-top">
          <div className="sentence-favorite">
            <IconStarFilled size={14} />
          </div>
          <div className="sentence-text">{lesson.see.sentence}</div>
        </div>
        <p className="sentence-chinese">{lesson.see.chinese}</p>
        <div className="sentence-actions">
          <VoiceButton onClick={() => onSpeak(lesson.see.speakText, "see-sentence")} active={speakingKey === "see-sentence"} label="Play sentence" />
        </div>
      </div>

      <div className="scene-rail">
        {photoPreviewUrl ? (
          <img src={photoPreviewUrl} alt="Selected photo preview" className="scene-thumb" />
        ) : (
          <div className="scene-thumb scene-thumb-preview">
            <CameraScene />
          </div>
        )}
      </div>
    </div>
  );
}

function LearnStep({ lesson, onContinue, onSpeak, speakingKey }) {
  return (
    <div className="lesson-body lesson-body-learn">
      <div className="section-title">
        <h2>Learn the useful chunks.</h2>
        <p>Use these building blocks in other sentences too.</p>
      </div>

      <div className="chunk-list">
        {lesson.learn.chunks.map((chunk) => (
          <ChunkCard
            key={chunk.id}
            chunk={chunk}
            onSpeak={() => onSpeak(chunk.text, `learn-${chunk.id}`)}
            speaking={speakingKey === `learn-${chunk.id}`}
          />
        ))}
      </div>

      <TipCard note={lesson.learn.note} />
    </div>
  );
}

function BuildStep({ lesson, selectedChunks, bank, feedback, onToggleChunk, onReset, onCheck }) {
  return (
    <div className="lesson-body lesson-body-build">
      <ReorderExercise
        title="Build"
        subtitle="Put the chunks in order."
        promptLabel="Your sentence"
        bank={bank}
        selectedChunks={selectedChunks}
        onToggleChunk={onToggleChunk}
        onReset={onReset}
        onCheck={onCheck}
        feedback={feedback}
        showQuestion={false}
        primaryActionLabel="Check"
        onSpeak={null}
        speaking={false}
        showVoiceButton={false}
      />
    </div>
  );
}

function UseStep({ lesson, selectedChunks, bank, feedback, onToggleChunk, onReset, onCheck, onSpeak, speakingKey }) {
  return (
    <div className="lesson-body lesson-body-use">
      <QuestionCard lesson={lesson} onSpeak={onSpeak} speaking={speakingKey === "use-answer"} />
      <ReorderExercise
        title="Your answer"
        subtitle="Answer the question with the chunks."
        promptLabel="Answer"
        bank={bank}
        selectedChunks={selectedChunks}
        onToggleChunk={onToggleChunk}
        onReset={onReset}
        onCheck={onCheck}
        feedback={feedback}
        showQuestion={true}
        primaryActionLabel="Check"
        onSpeak={null}
        speaking={false}
        showVoiceButton={false}
      />
    </div>
  );
}

function QuestionCard({ lesson, onSpeak, speaking }) {
  return (
    <div className="question-card">
      <div className="question-head">
        <span className="question-badge">Q</span>
        <span>Situation</span>
      </div>
      <strong className="question-text">{lesson.use.question}</strong>
      <p className="question-chinese">{lesson.use.questionChinese}</p>
      <p className="question-situation">{lesson.use.situation}</p>
      <div className="sentence-actions">
        <VoiceButton onClick={() => onSpeak(lesson.use.speakText, "use-answer")} active={speaking} label="Play answer" />
      </div>
    </div>
  );
}

function ReorderExercise({
  title,
  subtitle,
  promptLabel,
  bank,
  selectedChunks,
  onToggleChunk,
  onReset,
  onCheck,
  feedback,
  showQuestion,
  primaryActionLabel,
  onSpeak,
  speaking,
  showVoiceButton = false,
}) {
  return (
    <div className="reorder-exercise">
      <div className="reorder-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        {showVoiceButton ? (
          <VoiceButton onClick={onSpeak} active={speaking} label="Play answer" />
        ) : (
          <span className="reorder-prompt">{promptLabel}</span>
        )}
      </div>

      <div className="answer-section">
        <div className={`answer-stage ${selectedChunks.length === 0 ? "empty" : ""}`}>
          {selectedChunks.length > 0 ? (
            selectedChunks.map((chunk) => (
              <ChunkChip key={chunk.id} chunk={chunk} selected onClick={() => onToggleChunk(chunk.id)} />
            ))
          ) : (
            <div className="empty-answer">
              <IconCircleDashed size={22} />
              <span>Tap chunks here to build your answer.</span>
            </div>
          )}
        </div>

        <div className="available-row">
          {bank.map((chunk) => {
            const isSelected = selectedChunks.some((item) => item.id === chunk.id);
            return (
              <ChunkChip
                key={chunk.id}
                chunk={chunk}
                selected={isSelected}
                ghost={isSelected}
                onClick={() => onToggleChunk(chunk.id)}
              />
            );
          })}
        </div>
      </div>

      <div className="exercise-actions">
        <button className="secondary-button" type="button" onClick={onReset}>
          <IconRefresh size={17} />
          Reset
        </button>
        <button className="primary-button" type="button" onClick={onCheck}>
          <IconCheck size={18} />
          {primaryActionLabel}
        </button>
      </div>

      <FeedbackCard tone={feedback.tone} title={feedback.title} body={feedback.body} />

      {showQuestion && feedback.tone === "success" && (
        <div className="playback-rail">
          <div className="playback-note">
            <IconPlayerPlayFilled size={16} />
            <span>{joinChunkText(selectedChunks)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ChunkCard({ chunk, onSpeak, speaking }) {
  return (
    <article className="chunk-card">
      <div className={`chunk-card-accent ${toneMap[chunk.tone] || toneMap.purple}`} />
      <div className="chunk-card-main">
        <div>
          <strong>{chunk.text}</strong>
          <p>{chunk.chinese}</p>
        </div>
        <VoiceButton compact onClick={onSpeak} active={speaking} />
      </div>
    </article>
  );
}

function ChunkChip({ chunk, selected = false, ghost = false, onClick }) {
  return (
    <button
      className={`chunk-chip ${toneMap[chunk.tone] || toneMap.purple} ${selected ? "selected" : ""} ${ghost ? "ghost-selected" : ""}`}
      type="button"
      onClick={onClick}
    >
      {chunk.text}
    </button>
  );
}

function TipCard({ note }) {
  return (
    <div className="tip-card">
      <IconSparkles size={18} />
      <p>{note}</p>
    </div>
  );
}

function FeedbackCard({ tone, title, body }) {
  return (
    <div className={`feedback-card ${tone}`}>
      <div className="feedback-icon">
        {tone === "success" ? <IconCheck size={18} /> : tone === "error" ? <IconX size={18} /> : <IconSparkles size={18} />}
      </div>
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
    </div>
  );
}

function VoiceButton({ onClick, active = false, label = "Play", compact = false }) {
  return (
    <button className={`voice-button ${active ? "active" : ""} ${compact ? "compact" : ""}`} type="button" onClick={onClick}>
      <IconPlayerPlayFilled size={compact ? 14 : 16} />
      {!compact && <span>{label}</span>}
    </button>
  );
}

function LoadingScreen({ message }) {
  return (
    <div className="screen loading-screen">
      <div className="loading-stage">
        <div className="loading-icon">
          <IconSparkles size={20} />
        </div>
        <h2>{message}</h2>
        <p>请稍等，马上开始。</p>
        <div className="loading-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({ error, onRetry, onRetake, onBrowse }) {
  return (
    <div className="screen loading-screen error-screen">
      <div className="loading-card">
        <div className="loading-icon error-icon">
          <IconX size={20} />
        </div>
        <h2>{error?.title || "The lesson got lost on the way."}</h2>
        <p>{error?.body || "Try again."}</p>
        <div className="button-stack">
          <button className="action-button" type="button" onClick={onRetry}>
            <IconRefresh size={18} />
            Try again
          </button>
          <button className="secondary-button" type="button" onClick={onRetake}>
            <IconCamera size={18} />
            Retake photo
          </button>
          <button className="secondary-button" type="button" onClick={onBrowse}>
            <IconUpload size={18} />
            Choose another photo
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ children, onClick, disabled = false }) {
  return (
    <button className={`action-button ${disabled ? "disabled" : ""}`} type="button" onClick={onClick} disabled={disabled}>
      <span>{children}</span>
    </button>
  );
}

const toneMap = {
  purple: "tone-purple",
  yellow: "tone-yellow",
  pink: "tone-pink",
  blue: "tone-blue",
  green: "tone-green",
  mint: "tone-mint",
};

export default App;
