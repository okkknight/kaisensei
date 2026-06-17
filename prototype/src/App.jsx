import React, { useEffect, useState } from "react";
import {
  IconArrowRight,
  IconBook2,
  IconCamera,
  IconCheck,
  IconCircleDashed,
  IconEye,
  IconPlayerPlayFilled,
  IconPuzzle2,
  IconRefresh,
  IconSparkles,
  IconUpload,
  IconX,
  IconMessage2,
  IconBolt,
  IconSettings,
  IconQuestionMark,
  IconArrowLeft,
  IconStarFilled,
} from "@tabler/icons-react";
import {
  mockLessons,
  photoUrl,
} from "./lesson-data";
import "./styles.css";

const stepSequence = ["camera", "see", "learn", "build", "use"];

const stepMeta = {
  camera: { label: "Camera", icon: IconCamera, number: 1 },
  see: { label: "See", icon: IconEye, number: 2 },
  learn: { label: "Learn", icon: IconBook2, number: 3 },
  build: { label: "Build", icon: IconPuzzle2, number: 4 },
  use: { label: "Use", icon: IconMessage2, number: 4 },
};

const toneMap = {
  purple: "tone-purple",
  yellow: "tone-yellow",
  pink: "tone-pink",
  blue: "tone-blue",
  green: "tone-green",
  mint: "tone-mint",
};

export function App() {
  const [level, setLevel] = useState("Normal");
  const lesson = mockLessons[level];
  const [journeyStep, setJourneyStep] = useState("camera");
  const [flashOn, setFlashOn] = useState(false);
  const [speakingKey, setSpeakingKey] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("Looking at your scene...");

  const [buildSelected, setBuildSelected] = useState(() => lesson.build.correctOrder);
  const [buildFeedback, setBuildFeedback] = useState({
    tone: "success",
    title: "Great job! 🎉",
    body: "You built the sentence.",
  });

  const [useSelected, setUseSelected] = useState(() => lesson.use.correctOrder);
  const [useFeedback, setUseFeedback] = useState({
    tone: "success",
    title: "Nice! 🎉",
    body: "Now you can use it in real life.",
  });

  useEffect(() => {
    setBuildSelected([]);
    setBuildFeedback({
      tone: "neutral",
      title: "Ready",
      body: "Tap chunks to build the sentence.",
    });
    setUseSelected([]);
    setUseFeedback({
      tone: "neutral",
      title: "Ready",
      body: "Tap chunks to build your answer.",
    });
    setJourneyStep("camera");
  }, [lesson]);

  useEffect(() => {
    if (journeyStep !== "loading") return undefined;

    const first = window.setTimeout(() => setLoadingMessage("Looking at your scene..."), 0);
    const second = window.setTimeout(() => setLoadingMessage("Building your mini lesson..."), 600);
    const third = window.setTimeout(() => setJourneyStep("see"), 1200);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
      window.clearTimeout(third);
    };
  }, [journeyStep]);

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

  function toggleChunk(selected, setSelected, chunkId, correctOrder, setFeedback, successText) {
    if (selected.includes(chunkId)) {
      setSelected(selected.filter((id) => id !== chunkId));
      setFeedback({
        tone: "neutral",
        title: "Editing...",
        body: "Tap Check when you are ready.",
      });
      return;
    }

    const next = [...selected, chunkId];
    setSelected(next);
    if (next.length === correctOrder.length) {
      setFeedback({
        tone: "neutral",
        title: "Almost there",
        body: "Tap Check to see if the order feels right.",
      });
    } else {
      setFeedback({
        tone: "neutral",
        title: "Keep going",
        body: "Tap more chunks to build your sentence.",
      });
    }
  }

  function checkOrder(selected, correctOrder, setFeedback, successCopy, failCopy) {
    const passed =
      selected.length === correctOrder.length &&
      selected.every((id, index) => id === correctOrder[index]);

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

  function resetExercise(kind) {
    if (kind === "build") {
      setBuildSelected([]);
      setBuildFeedback({
        tone: "neutral",
        title: "Reset",
        body: "Start again from the chunks above.",
      });
      return;
    }

    setUseSelected([]);
    setUseFeedback({
      tone: "neutral",
      title: "Reset",
      body: "Try a different answer order.",
    });
  }

  function handleCapture() {
    setBuildSelected([]);
    setBuildFeedback({
      tone: "neutral",
      title: "Ready",
      body: "Tap chunks to build the sentence.",
    });
    setUseSelected([]);
    setUseFeedback({
      tone: "neutral",
      title: "Ready",
      body: "Tap chunks to build your answer.",
    });
    setJourneyStep("loading");
  }

  function handleContinue(step) {
    const currentIndex = stepSequence.indexOf(step);
    const nextStep = stepSequence[Math.min(currentIndex + 1, stepSequence.length - 1)];
    setJourneyStep(nextStep);
  }

  function handleBack(step) {
    const currentIndex = stepSequence.indexOf(step);
    const previousStep = stepSequence[Math.max(currentIndex - 1, 0)];
    setJourneyStep(previousStep);
  }

  return (
    <div className="app-shell">
      <main className="mobile-stage app-stage">
        <div className="mobile-shell">
          {journeyStep === "camera" && (
            <CameraScreen
              level={level}
              setLevel={setLevel}
              flashOn={flashOn}
              setFlashOn={setFlashOn}
              onCapture={handleCapture}
              onBack={() => {}}
              mobile
            />
          )}
          {journeyStep === "loading" && <LoadingScreen message={loadingMessage} />}
          {journeyStep === "see" && (
            <SeeScreen
              lesson={lesson}
              level={level}
              onContinue={() => handleContinue("see")}
              onBack={() => handleBack("see")}
              onSpeak={speak}
              speakingKey={speakingKey}
              mobile
            />
          )}
          {journeyStep === "learn" && (
            <LearnScreen
              lesson={lesson}
              onContinue={() => handleContinue("learn")}
              onBack={() => handleBack("learn")}
              onSpeak={speak}
              speakingKey={speakingKey}
              mobile
            />
          )}
          {journeyStep === "build" && (
            <BuildScreen
              lesson={lesson}
              selected={buildSelected}
              bank={lesson.build.chunks}
              onToggle={(id) =>
                toggleChunk(
                  buildSelected,
                  setBuildSelected,
                  id,
                  lesson.build.correctOrder,
                  setBuildFeedback,
                )
              }
              onCheck={() =>
                checkOrder(
                  buildSelected,
                  lesson.build.correctOrder,
                  setBuildFeedback,
                  { title: "Great job! 🎉", body: "You built the sentence." },
                  {
                    title: "Not quite yet.",
                    body: "Try checking the order again and adjust a chunk or two.",
                  },
                )
              }
              onReset={() => resetExercise("build")}
              feedback={buildFeedback}
              onContinue={() => handleContinue("build")}
              onBack={() => handleBack("build")}
              onSpeak={speak}
              speakingKey={speakingKey}
              mobile
            />
          )}
          {journeyStep === "use" && (
            <UseScreen
              lesson={lesson}
              selected={useSelected}
              bank={lesson.use.answerChunks}
              onToggle={(id) =>
                toggleChunk(
                  useSelected,
                  setUseSelected,
                  id,
                  lesson.use.correctOrder,
                  setUseFeedback,
                )
              }
              onCheck={() =>
                checkOrder(
                  useSelected,
                  lesson.use.correctOrder,
                  setUseFeedback,
                  { title: "Nice! 🎉", body: "Now you can use it in real life." },
                  {
                    title: "Close.",
                    body: "Try starting with “I usually keep...” and keep the answer practical.",
                  },
                )
              }
              onReset={() => resetExercise("use")}
              feedback={useFeedback}
              onContinue={() => setJourneyStep("camera")}
              onBack={() => handleBack("use")}
              onSpeak={speak}
              speakingKey={speakingKey}
              mobile
            />
          )}
        </div>
      </main>
    </div>
  );
}

function CameraScreen({
  level,
  setLevel,
  flashOn,
  setFlashOn,
  onCapture,
  onBack,
  mobile = false,
}) {
  return (
    <div className={`screen camera-screen ${mobile ? "mobile" : ""}`}>
      <div className="screen-top">
        <button className="back-button camera-back" type="button" aria-label="Back" onClick={onBack}>
          <IconArrowLeft size={18} />
        </button>
        <div className="screen-tools">
          <button className={`tool-button ${flashOn ? "active" : ""}`} type="button" onClick={() => setFlashOn((value) => !value)} aria-label="Toggle flash">
            <IconBolt size={16} />
          </button>
          <button
            className="tool-button"
            type="button"
            aria-label="Settings"
            onClick={() => setCameraNote("Quick camera tools stay on this screen.")}
          >
            <IconSettings size={16} />
          </button>
          <button className="tool-button" type="button" aria-label="Upload" onClick={onCapture}>
            <IconUpload size={16} />
          </button>
        </div>
      </div>

      <div className="camera-preview">
        <div className="camera-grid" />
        <img src={photoUrl} alt="Desk with laptop and mug" className="camera-photo" />
      </div>

      <div className="camera-bottom">
        <div className="level-toggle">
          <button className={`level-pill ${level === "Normal" ? "selected" : ""}`} onClick={() => setLevel("Normal")} type="button">
            Normal
          </button>
          <button className={`level-pill ${level === "Advanced" ? "selected" : ""}`} onClick={() => setLevel("Advanced")} type="button">
            Advanced
          </button>
        </div>

        <button className="shutter-button" type="button" onClick={onCapture} aria-label="Take photo">
          <span />
        </button>

        <div className="camera-tray">
          <button className="tray-button" type="button">
            <IconUpload size={18} />
            <span>Gallery</span>
          </button>
          <button className="tray-button" type="button">
            <IconQuestionMark size={18} />
            <span>Tips</span>
          </button>
        </div>

      </div>
    </div>
  );
}

function SeeScreen({ lesson, level, onContinue, onBack, onSpeak, speakingKey, mobile = false }) {
  const highlight = lesson.level === "Advanced" ? "beside" : "next to";

  return (
    <div className={`screen lesson-screen ${mobile ? "mobile" : ""}`}>
      <div className="lesson-content">
        <ScreenHeader step="see" level={level} onBack={onBack} />

        <StepProgress current={1} />

        <div className="lesson-body lesson-body-see">
          <SentenceCard
            sentence={lesson.see.sentence}
            highlight={highlight}
            chinese={lesson.see.chinese}
            onSpeak={() => onSpeak(lesson.see.speakText, "see-sentence")}
            speaking={speakingKey === "see-sentence"}
          />

          <div className="scene-rail">
            <img src={photoUrl} alt="Desk preview" className="scene-thumb" />
          </div>
        </div>
      </div>

      <div className="lesson-footer">
        <ActionButton onClick={onContinue}>Continue <IconArrowRight size={18} /></ActionButton>
      </div>
    </div>
  );
}

function LearnScreen({ lesson, onContinue, onBack, onSpeak, speakingKey, mobile = false }) {
  return (
    <div className={`screen lesson-screen ${mobile ? "mobile" : ""}`}>
      <div className="lesson-content">
        <ScreenHeader step="learn" level={lesson.level} onBack={onBack} />

        <StepProgress current={2} />

        <div className="lesson-body lesson-body-learn">
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
        </div>
      </div>

      <div className="lesson-footer">
        <ActionButton onClick={onContinue}>Continue <IconArrowRight size={18} /></ActionButton>
      </div>
    </div>
  );
}

function BuildScreen({
  lesson,
  selected,
  bank,
  onToggle,
  onCheck,
  onReset,
  feedback,
  onContinue,
  onBack,
  onSpeak,
  speakingKey,
  mobile = false,
}) {
  const correct = selected.length === lesson.build.correctOrder.length &&
    selected.every((id, index) => id === lesson.build.correctOrder[index]);

  return (
    <div className={`screen lesson-screen ${mobile ? "mobile" : ""}`}>
      <div className="lesson-content">
        <ScreenHeader step="build" level={lesson.level} onBack={onBack} />

        <StepProgress current={3} />

        <div className="lesson-body lesson-body-build">
          <ReorderExercise
            title="Your sentence"
            bank={bank}
            selected={selected.map((id) => lesson.build.chunks.find((chunk) => chunk.id === id)).filter(Boolean)}
            onToggle={onToggle}
            onCheck={onCheck}
            onReset={onReset}
            feedback={feedback}
            showQuestion={false}
            correct={correct}
            speakText={lesson.see.speakText}
            onSpeak={() => onSpeak(lesson.see.speakText, "build-see")}
            speaking={speakingKey === "build-see"}
          />
        </div>
      </div>

      <div className="lesson-footer">
        <ActionButton disabled={!correct} onClick={onContinue}>
          Continue <IconArrowRight size={18} />
        </ActionButton>
      </div>
    </div>
  );
}

function UseScreen({
  lesson,
  selected,
  bank,
  onToggle,
  onCheck,
  onReset,
  feedback,
  onContinue,
  onBack,
  onSpeak,
  speakingKey,
  mobile = false,
}) {
  const correct = selected.length === lesson.use.correctOrder.length &&
    selected.every((id, index) => id === lesson.use.correctOrder[index]);

  return (
    <div className={`screen lesson-screen ${mobile ? "mobile" : ""}`}>
      <div className="lesson-content">
        <ScreenHeader step="use" level={lesson.level} onBack={onBack} />

        <StepProgress current={4} />

        <div className="lesson-body lesson-body-use">
          <QuestionCard question={lesson.use.question} />

          <ReorderExercise
            title="Your answer"
            bank={bank}
            selected={selected.map((id) => lesson.use.answerChunks.find((chunk) => chunk.id === id)).filter(Boolean)}
            onToggle={onToggle}
            onCheck={onCheck}
            onReset={onReset}
            feedback={feedback}
            showQuestion={true}
            correct={correct}
            speakText={lesson.use.speakText}
            onSpeak={() => onSpeak(lesson.use.speakText, "use-answer")}
            speaking={speakingKey === "use-answer"}
          />
        </div>
      </div>

      <div className="lesson-footer">
        <ActionButton disabled={!correct} onClick={onContinue}>
          Finish <IconStarFilled size={16} />
        </ActionButton>
      </div>
    </div>
  );
}

function ScreenHeader({ step, level, onBack }) {
  const MetaIcon = stepMeta[step].icon;
  return (
    <div className="screen-header">
      <button className="back-button" type="button" aria-label="Back" onClick={onBack}>
        <IconArrowLeft size={18} />
      </button>
      <div className="screen-header-copy">
        <div className="screen-progress-copy">
          <span className="screen-progress-count">{stepMeta[step].number} / 4</span>
          <span className="screen-progress-label">{stepMeta[step].label}</span>
        </div>
        <span className="level-chip">{level}</span>
      </div>
      <div className="screen-header-icon">
        <MetaIcon size={18} />
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
      <div className="step-progress-list">
        {["See", "Learn", "Build", "Use"].map((label, index) => (
          <div key={label} className={`step-pill ${current === index + 1 ? "active" : ""}`}>
            <span>{index + 1} / 4</span>
            <strong>{label}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingScreen({ message }) {
  return (
    <div className="screen loading-screen">
      <div className="loading-card">
        <div className="loading-icon">
          <IconSparkles size={20} />
        </div>
        <h2>{message}</h2>
        <p>Building your mini lesson...</p>
        <div className="loading-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

function SentenceCard({ sentence, highlight, chinese, onSpeak, speaking }) {
  const parts = sentence.split(highlight);
  return (
    <div className="sentence-card">
      <div className="sentence-card-top">
        <div className="sentence-favorite">
          <IconStarFilled size={14} />
        </div>
        <div className="sentence-text">
          {parts.length > 1 ? (
            <>
              {parts[0]}
              <span className="sentence-highlight">{highlight}</span>
              {parts[1]}
            </>
          ) : (
            sentence
          )}
        </div>
      </div>
      <p className="sentence-chinese">{chinese}</p>
      <div className="sentence-actions">
        <VoiceButton onClick={onSpeak} active={speaking} label="Play sentence" />
      </div>
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

function TipCard({ note }) {
  return (
    <div className="tip-card">
      <IconSparkles size={18} />
      <p>{note}</p>
    </div>
  );
}

function ChunkChip({ chunk, selected = false, onClick, compact = false, ghost = false }) {
  return (
    <button
      className={`chunk-chip ${toneMap[chunk.tone] || toneMap.purple} ${selected ? "selected" : ""} ${ghost ? "ghost-selected" : ""} ${compact ? "compact" : ""}`}
      type="button"
      onClick={onClick}
    >
      {chunk.text}
    </button>
  );
}

function QuestionCard({ question }) {
  return (
    <div className="question-card">
      <strong className="question-text">{question}</strong>
    </div>
  );
}

function ReorderExercise({
  title,
  bank,
  selected,
  onToggle,
  onCheck,
  onReset,
  feedback,
  showQuestion,
  correct,
  onSpeak,
  speaking,
  speakText,
}) {
  return (
    <div className="reorder-exercise">
      <div className="reorder-head">
        <div>
          <h3>{title}</h3>
        </div>
        <VoiceButton onClick={onSpeak} active={speaking} label={showQuestion ? "Play answer" : "Play sentence"} />
      </div>

      <div className="answer-section">
        <div className={`answer-stage ${selected.length === 0 ? "empty" : ""}`}>
          {selected.length > 0 ? (
            selected.map((chunk) => (
              <ChunkChip key={chunk.id} chunk={chunk} selected onClick={() => onToggle(chunk.id)} />
            ))
          ) : (
            <div className="empty-answer">
              <IconCircleDashed size={22} />
              <span>Tap chunks here to build your sentence.</span>
            </div>
          )}
        </div>

        <div className="available-row">
          {bank.map((chunk) => {
            const isSelected = selected.some((item) => item.id === chunk.id);

            return (
              <ChunkChip
                key={chunk.id}
                chunk={chunk}
                selected={isSelected}
                ghost={isSelected}
                onClick={() => onToggle(chunk.id)}
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
          Check
        </button>
      </div>

      <FeedbackCard tone={feedback.tone} title={feedback.title} body={feedback.body} />

      {showQuestion && correct && (
        <div className="playback-rail">
          <div className="playback-note">
            <IconPlayerPlayFilled size={16} />
            <span>{speakText}</span>
          </div>
        </div>
      )}
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

function ActionButton({ children, onClick, disabled = false }) {
  return (
    <button className={`action-button ${disabled ? "disabled" : ""}`} type="button" onClick={onClick} disabled={disabled}>
      <span>{children}</span>
    </button>
  );
}

function Button({ children, styleType = "primary" }) {
  return <button className={`button button-${styleType}`} type="button">{children}</button>;
}

function LevelPill({ children, selected }) {
  return <button className={`level-choice ${selected ? "selected" : ""}`} type="button">{children}</button>;
}

function PlayBadge() {
  return (
    <div className="play-badge">
      <IconPlayerPlayFilled size={20} />
    </div>
  );
}

function LibraryCard({ title, children }) {
  return (
    <div className="library-card">
      <h4>{title}</h4>
      {children}
    </div>
  );
}

function ProgressRow({ label, progress }) {
  return (
    <div className="progress-row">
      <div className="progress-row-head">
        <span>{label}</span>
      </div>
      <div className="progress-mini">
        <span style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}

function NoteCard({ title, note }) {
  return (
    <article className="note-card">
      <IconQuestionMark size={18} />
      <div>
        <strong>{title}</strong>
        <p>{note}</p>
      </div>
    </article>
  );
}

export default App;
