import React, { useEffect, useRef, useState } from "react";
import {
  IconCameraRotate,
  IconSettings,
  IconSparkles,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { compressUploadImage } from "../shared/media/image.js";
import {
  COURSE_LEVEL_ADVANCED,
  COURSE_LEVEL_NORMAL,
  MODE_DEEP,
  MODE_QUICK,
} from "./modeRegistry.js";

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

export function CameraEntry({
  mode,
  level,
  onModeChange,
  onLevelChange,
  onCapture,
}) {
  const fileInputRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const cameraRequestIdRef = useRef(0);
  const [cameraStatus, setCameraStatus] = useState("starting");
  const [cameraError, setCameraError] = useState("");
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isCameraReady = cameraStatus === "ready";
  const isCameraUnavailable = cameraStatus === "error";
  const unavailableMessage = cameraError || "当前摄像头不可用";

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

  useEffect(() => {
    if (!fileInputRef.current) {
      return undefined;
    }

    return () => {
      stopCameraStream();
    };
  }, []);

  useEffect(() => {
    if (!cameraVideoRef.current) {
      return undefined;
    }

    if (mode !== MODE_QUICK && mode !== MODE_DEEP) {
      return undefined;
    }

    if (settingsOpen) {
      return undefined;
    }

    const requestId = cameraRequestIdRef.current + 1;
    cameraRequestIdRef.current = requestId;
    void startCamera(requestId);

    return () => {
      cameraRequestIdRef.current += 1;
      stopCameraStream();
    };
  }, [cameraFacingMode, mode, settingsOpen]);

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
    if (cameraRequestIdRef.current !== requestId) {
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
        // Autoplay may be blocked on some browsers; the live stream is still attached.
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
      } catch {
        stream = await mediaDevices.getUserMedia({ audio: false, video: true });
      }

      await attachCameraStream(stream, requestId);
    } catch {
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
    void submitFile(file, "camera");
  }

  async function submitFile(file, source = "upload") {
    if (!file) return;

    const nextFile = await compressUploadImage(file);
    onCapture?.(nextFile, {
      mode,
      level,
      source,
    });
  }

  function openPicker() {
    fileInputRef.current?.click();
  }

  function handleFileInputChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    void submitFile(file, "upload");
  }

  function handleRotateCamera() {
    setCameraFacingMode((current) => (current === "environment" ? "user" : "environment"));
  }

  function handleCloseSettings() {
    setSettingsOpen(false);
  }

  return (
    <div className="screen camera-screen">
      <input ref={fileInputRef} className="photo-file-input" type="file" accept="image/*" onChange={handleFileInputChange} />

      <div className="screen-top camera-top">
        <div className="camera-brand">
          <span className="mobile-brand">kaisensei</span>
        </div>
        <button className="camera-settings-button" type="button" aria-label="Settings" onClick={() => setSettingsOpen(true)}>
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
        <div className="camera-watermark">
          <IconSparkles size={12} />
          <span>拍下真实一刻，学会自然英语表达</span>
        </div>
      </div>

      <div className="camera-bottom">
        <div className="camera-mode-toggle" aria-label="Course mode">
          <button
            className={`level-pill ${mode === MODE_QUICK ? "selected" : ""}`}
            type="button"
            onClick={() => onModeChange?.(MODE_QUICK)}
          >
            快速
          </button>
          <button
            className={`level-pill ${mode === MODE_DEEP ? "selected" : ""}`}
            type="button"
            onClick={() => onModeChange?.(MODE_DEEP)}
          >
            深度
          </button>
        </div>

        <div className="camera-action-row" aria-label="Camera actions">
          <button className="camera-side-button" type="button" onClick={openPicker} aria-label="Upload photo">
            <IconUpload size={18} />
          </button>
          <button className="shutter-button" type="button" onClick={captureFromCamera} aria-label="Take photo" disabled={!isCameraReady}>
            <span />
          </button>
          <button className="camera-side-button" type="button" onClick={handleRotateCamera} aria-label="Rotate camera">
            <IconCameraRotate size={18} />
          </button>
        </div>
      </div>

      {settingsOpen ? (
        <div className="camera-modal-backdrop" role="presentation" onClick={handleCloseSettings}>
          <div className="camera-modal" role="dialog" aria-modal="true" aria-label="Camera settings" onClick={(event) => event.stopPropagation()}>
            <div className="camera-modal-header">
              <h2>模式设置</h2>
              <button className="camera-modal-close" type="button" aria-label="Close settings" onClick={handleCloseSettings}>
                <IconX size={16} />
              </button>
            </div>

            <div className="camera-mode-list">
              <button
                className={`camera-mode-card ${level === COURSE_LEVEL_NORMAL ? "selected" : ""}`}
                type="button"
                onClick={() => onLevelChange?.(COURSE_LEVEL_NORMAL)}
              >
                <div className="camera-mode-card-head">
                  <strong>{COURSE_LEVEL_NORMAL}</strong>
                  {level === COURSE_LEVEL_NORMAL ? <span>已选</span> : null}
                </div>
              </button>

              <button
                className={`camera-mode-card ${level === COURSE_LEVEL_ADVANCED ? "selected" : ""}`}
                type="button"
                onClick={() => onLevelChange?.(COURSE_LEVEL_ADVANCED)}
              >
                <div className="camera-mode-card-head">
                  <strong>{COURSE_LEVEL_ADVANCED}</strong>
                  {level === COURSE_LEVEL_ADVANCED ? <span>已选</span> : null}
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default CameraEntry;
