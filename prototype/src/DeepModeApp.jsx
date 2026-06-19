import React, { useMemo, useState } from "react";
import {
  IconArrowRight,
  IconCamera,
  IconCheck,
  IconFlame,
  IconPuzzle2,
  IconRefresh,
  IconSettings,
  IconSparkles,
  IconStarFilled,
  IconBook2,
  IconEye,
  IconMessage2,
} from "@tabler/icons-react";
import { deepModeCourse, deepModeSequences } from "./deep-mode/deepModeData.js";

const moduleOrder = [
  { id: "notice", label: "Notice", accent: "module-notice" },
  { id: "interpret", label: "Interpret", accent: "module-interpret" },
  { id: "interact", label: "Interact", accent: "module-interact" },
  { id: "stepIn", label: "Step In", accent: "module-step-in" },
];

const designNotes = [
  {
    title: "Progress System",
    body: "4-step mastery flow with clear stage focus.",
  },
  {
    title: "Chunk Learning",
    body: "Reorder, fill, and build to internalize language.",
  },
  {
    title: "Real-world Context",
    body: "One authentic photo. One meaningful story.",
  },
  {
    title: "Calm & Focused",
    body: "Deep learning with a clean, distraction-free UI.",
  },
];

function cx(...values) {
  return values.filter(Boolean).join(" ");
}

function stop(event) {
  event.stopPropagation();
}

function renderSentence(sentence, highlight) {
  if (!highlight || !sentence.includes(highlight)) {
    return sentence;
  }

  const parts = sentence.split(highlight);
  const nodes = [];

  parts.forEach((part, index) => {
    if (part) {
      nodes.push(<span key={`text-${index}`}>{part}</span>);
    }
    if (index < parts.length - 1) {
      nodes.push(
        <span key={`highlight-${index}`} className="sentence-highlight">
          {highlight}
        </span>,
      );
    }
  });

  return nodes;
}

function ModuleTabs({ active }) {
  return (
    <div className="module-tabs" aria-hidden="true">
      {moduleOrder.map((module) => (
        <span key={module.id} className={cx("module-tab", module.accent, active === module.id && "is-active")}>
          {module.label}
        </span>
      ))}
    </div>
  );
}

function FrameHeader({ module, progress, thumb = true }) {
  return (
    <div className="frame-header">
      <div className="frame-header__meta">
        <ModuleTabs active={module} />
        {progress ? <span className="frame-progress">{progress}</span> : null}
      </div>
      {thumb ? (
        <div className="frame-thumb">
          <img src="/deep-mode-default.jpg" alt="" />
        </div>
      ) : null}
    </div>
  );
}

function ActionBar({ kind = "check" }) {
  return (
    <div className="action-bar">
      <button className="action-action action-action--ghost" type="button" onClick={stop}>
        <IconRefresh size={14} />
        Reset
      </button>
      <button className="action-action action-action--ghost" type="button" onClick={stop}>
        <IconSparkles size={14} />
        Hint
      </button>
      {kind === "send" ? (
        <button className="action-action action-action--primary" type="button" onClick={stop}>
          Send
          <IconArrowRight size={14} />
        </button>
      ) : (
        <button className="action-action action-action--primary" type="button" onClick={stop}>
          Check
        </button>
      )}
    </div>
  );
}

function Chip({ text, chinese, tone = "lavender", selected = false, compact = false }) {
  return (
    <span className={cx("chip", `chip--${tone}`, selected && "is-selected", compact && "is-compact")}>
      <span className="chip__en">{text}</span>
      {chinese ? <span className="chip__cn">{chinese}</span> : null}
    </span>
  );
}

function ChunkCloud({ chunks, tone = "lavender", compact = false }) {
  return (
    <div className={cx("chunk-cloud", compact && "chunk-cloud--compact")}>
      {chunks.map((chunk) => (
        <Chip key={chunk.id} text={chunk.text} chinese={chunk.chinese} tone={tone} compact={compact} />
      ))}
    </div>
  );
}

function Bubble({ speaker, text, tone = "system" }) {
  return (
    <div className={cx("bubble", tone === "user" ? "bubble--user" : "bubble--system")}>
      <div className="bubble__speaker">{speaker}</div>
      <div className="bubble__text">{text}</div>
    </div>
  );
}

function LoadingFrame() {
  return (
    <div className="phone-screen phone-screen--loading">
      <div className="loading-orb">
        <IconStarFilled size={30} />
      </div>
      <h3>kaisensei</h3>
      <p className="loading-kicker">Deep Mode</p>
      <p className="loading-subtitle">阅读场景 · 组织表达 · 进入对话</p>
      <div className="loading-steps">
        <div className="loading-step is-active">
          <span className="loading-dot" />
          <span>Reading the scene...</span>
        </div>
        <div className="loading-step">
          <span className="loading-dot" />
          <span>Building your practice...</span>
        </div>
        <div className="loading-step">
          <span className="loading-dot" />
          <span>Preparing your challenge...</span>
        </div>
      </div>
      <div className="loading-percent">67%</div>
    </div>
  );
}

function OverviewFrame({ onStart, onRetake }) {
  return (
    <div className="phone-screen phone-screen--overview">
      <div className="overview-top">
        <span className="overview-streak">
          <IconFlame size={14} />
          7
        </span>
        <span className="overview-brand">kaisensei</span>
        <button className="icon-button" type="button" onClick={stop} aria-label="Settings">
          <IconSettings size={16} />
        </button>
      </div>

      <div className="overview-photo">
        <img src="/deep-mode-default.jpg" alt="A desk with a coffee mug and a laptop" />
      </div>

      <div className="overview-card overview-card--soft">
        <div className="overview-tags">
          <span>coffee</span>
          <span>table</span>
          <span>laptop</span>
        </div>
        <h3>窗边咖啡馆时光</h3>
        <p>{deepModeCourse.photoSummary}</p>
      </div>

      <div className="overview-card overview-card--cta">
        <p>Ready to explore this scene?</p>
        <button
          className="cta-button"
          type="button"
          onClick={(event) => {
            stop(event);
            onStart();
          }}
        >
          Start Deep Mode
          <IconArrowRight size={16} />
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={(event) => {
            stop(event);
            onRetake();
          }}
        >
          <IconCamera size={15} />
          Try another photo
        </button>
      </div>
    </div>
  );
}

function ExerciseFrame({ frame }) {
  const entry = frame.entry;
  const mode = frame.mode;
  const highlighted = entry.coreExpression;
  const exercise = entry.exercise;
  const sentence = frame.prompt || entry.promptEnglish || entry.promptChinese || "";
  const promptChinese = frame.promptChinese || entry.promptChinese || "";

  return (
    <div className="phone-screen phone-screen--lesson">
      <FrameHeader module={frame.module} progress={frame.progress} />
      <div className="lesson-kicker">{frame.kicker}</div>
      <div className="lesson-title">{frame.title}</div>
      <p className="lesson-subtitle">{frame.subtitle}</p>

      {mode === "understand" ? (
        <>
          <div className="sentence-card sentence-card--soft">
            <div className="sentence-line">{renderSentence(sentence, highlighted)}</div>
          </div>
          <p className="lesson-note">{promptChinese}</p>
          <ChunkCloud chunks={exercise.chunks} tone="lavender" />
          <div className="feedback-card">
            <strong>Hint</strong>
            <span>Start with the most concrete chunk.</span>
          </div>
        </>
      ) : null}

      {mode === "focus" ? (
        <>
          <div className="sentence-card">
            <div className="sentence-line">
              {sentence.split("___").map((part, index, list) => (
                <React.Fragment key={index}>
                  <span>{part}</span>
                  {index < list.length - 1 ? <span className="blank-slot" /> : null}
                </React.Fragment>
              ))}
            </div>
          </div>
          <p className="lesson-note">Fill in the blanks with the core expression.</p>
          <ChunkCloud chunks={[...exercise.choices, ...exercise.distractors]} tone="lavender" compact />
          <div className="feedback-card">
            <strong>Almost.</strong>
            <span>Try putting the core phrase back together.</span>
          </div>
        </>
      ) : null}

      {mode === "build" ? (
        <>
          <div className="build-target">
            <span className="build-target__label">Build the sentence.</span>
            <div className="build-target__box">
              {exercise.chunks.map((chunk) => (
                <Chip key={chunk.id} text={chunk.text} chinese={chunk.chinese} tone="yellow" selected />
              ))}
            </div>
          </div>
          <p className="lesson-note">{promptChinese}</p>
          <ChunkCloud chunks={[...exercise.chunks, ...exercise.distractors]} tone="yellow" />
          <div className="feedback-card feedback-card--success">
            <strong>Nice work.</strong>
            <span>You built the sentence.</span>
          </div>
        </>
      ) : null}

      {mode === "quick" ? (
        <>
          <div className="quick-question">
            <span className="quick-question__label">Quick Response</span>
            <div className="quick-question__text">{exercise.question || entry.promptEnglish}</div>
            <div className="quick-question__cn">{exercise.questionChinese || promptChinese}</div>
          </div>
          <div className="answer-board">
            <div className="answer-board__label">Build your answer</div>
            <div className="answer-board__box">
              <span className="answer-board__ghost">在此拖拽或点击拼组</span>
            </div>
          </div>
          <ChunkCloud chunks={[...exercise.chunks, ...exercise.distractors]} tone="lavender" compact />
          <div className="feedback-card">
            <strong>Good answer.</strong>
            <span>That sounds natural.</span>
          </div>
        </>
      ) : null}

      <ActionBar />
    </div>
  );
}

function MilestoneFrame({ frame }) {
  const expressions = frame.module === "notice"
    ? deepModeCourse.modules.notice.expressionPacks.map((pack) => pack.coreExpression)
    : frame.module === "interpret"
      ? deepModeCourse.modules.interpret.expressionPacks.map((pack) => pack.coreExpression)
      : deepModeCourse.modules.interact.taskPacks.flatMap((pack) => [pack.need.coreExpression, pack.handle.coreExpression]);

  return (
    <div className="phone-screen phone-screen--milestone">
      <div className="milestone-orb">
        <IconStarFilled size={26} />
      </div>
      <h3>{frame.title}</h3>
      <p>{frame.subtitle}</p>
      <div className="milestone-card">
        <div className="milestone-card__title">Core expressions you noticed</div>
        <div className="milestone-list">
          {expressions.map((expression) => (
            <div key={expression} className="milestone-item">
              <IconCheck size={14} />
              <span>{expression}</span>
            </div>
          ))}
        </div>
      </div>
      <button className="cta-button" type="button" onClick={stop}>
        {frame.cta || "Continue"}
        <IconArrowRight size={16} />
      </button>
    </div>
  );
}

function TaskIntroFrame({ frame }) {
  const pack = deepModeCourse.modules.interact.taskPacks[0];

  return (
    <div className="phone-screen phone-screen--lesson">
      <FrameHeader module="interact" progress={frame.progress} />
      <div className="lesson-kicker">Task Pack</div>
      <div className="lesson-title">{pack.taskTitle}</div>
      <p className="lesson-subtitle">{pack.scenePrompt}</p>
      <div className="task-pack-panel">
        <div className="expression-card">
          <span className="expression-card__label">Need Expression</span>
          <strong>{pack.need.coreExpression}</strong>
          <span>{pack.need.meaningChinese}</span>
        </div>
        <div className="expression-card">
          <span className="expression-card__label">Handle Expression</span>
          <strong>{pack.handle.coreExpression}</strong>
          <span>{pack.handle.meaningChinese}</span>
        </div>
      </div>
      <button className="cta-button" type="button" onClick={stop}>
        Start Practice
        <IconArrowRight size={16} />
      </button>
    </div>
  );
}

function DialogueFrame({ frame }) {
  const pack = deepModeCourse.modules.interact.taskPacks[0];
  const dialogue = pack.dialogues[0];
  const isHandle = frame.variant === "handle";
  const responseStep = dialogue.steps[isHandle ? 3 : 1];
  const precedingSteps = dialogue.steps.slice(0, isHandle ? 4 : 2);

  return (
    <div className="phone-screen phone-screen--dialogue">
      <FrameHeader module="interact" progress={frame.progress} />
      <div className="lesson-kicker">Dialogue Practice</div>
      <div className="lesson-title">{isHandle ? "Handle Expression" : "Need Expression"}</div>
      <p className="lesson-subtitle">{dialogue.scene}</p>

      <div className="dialogue-stream">
        {precedingSteps.map((step, index) => {
          if (step.speaker === "system") {
            return <Bubble key={`${step.speaker}-${index}`} speaker="Barista" text={step.text} tone="system" />;
          }

          return (
            <div key={`${step.speaker}-${index}`} className="dialogue-user">
              <div className="dialogue-user__prompt">{isHandle ? "Your turn: build the Handle" : "Your turn: build the Need"}</div>
              <div className="dialogue-user__answer">{step.targetText}</div>
            </div>
          );
        })}
        <div className="dialogue-composer">
          <div className="dialogue-composer__label">Build your answer</div>
          <div className="dialogue-composer__box">Choose chunks from below</div>
          <ChunkCloud chunks={[...responseStep.exercise.chunks, ...responseStep.exercise.distractors]} tone="lavender" compact />
        </div>
      </div>

      <ActionBar kind="send" />
    </div>
  );
}

function StepInFrame() {
  const dialogue = deepModeCourse.modules.stepIn.dialogue;

  return (
    <div className="phone-screen phone-screen--step-in">
      <FrameHeader module="stepIn" progress="15 / 14" />
      <div className="lesson-kicker">Challenge</div>
      <div className="lesson-title">You’re having a full conversation.</div>
      <p className="lesson-subtitle">{dialogue.scene}</p>
      <div className="step-in-stream">
        {dialogue.turns.map((turn, index) =>
          turn.speaker === "system" ? (
            <Bubble key={`system-${index}`} speaker="Barista" text={turn.text} tone="system" />
          ) : (
            <div key={`user-${index}`} className="dialogue-user dialogue-user--final">
              <div className="dialogue-user__prompt">Your answer</div>
              <div className="dialogue-user__answer">{turn.targetText}</div>
            </div>
          ),
        )}
      </div>
      <button className="cta-button" type="button" onClick={stop}>
        Continue to Finish
        <IconArrowRight size={16} />
      </button>
    </div>
  );
}

function CompletionFrame() {
  const completion = deepModeCourse.modules.completion;
  const journey = [
    { icon: IconEye, label: "Notice", detail: "看见位置" },
    { icon: IconBook2, label: "Interpret", detail: "温和推断" },
    { icon: IconMessage2, label: "Interact", detail: "自然应答" },
    { icon: IconSparkles, label: "Step In", detail: "完整表达" },
  ];

  return (
    <div className="phone-screen phone-screen--completion">
      <div className="completion-photo">
        <img src="/deep-mode-default.jpg" alt="A desk with a coffee mug and a laptop" />
      </div>
      <div className="completion-card">
        <div className="completion-badge">
          <IconCheck size={18} />
        </div>
        <h3>{completion.title}</h3>
        <p>{completion.description}</p>
      </div>

      <div className="journey-card">
        <div className="journey-card__title">Your Journey</div>
        <div className="journey-row">
          {journey.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="journey-item">
                <div className="journey-item__icon">
                  <Icon size={16} />
                </div>
                <div className="journey-item__label">{item.label}</div>
                <div className="journey-item__detail">{item.detail}</div>
              </div>
            );
          })}
        </div>
      </div>

      <button className="cta-button" type="button" onClick={stop}>
        Review This Scene
        <IconRefresh size={16} />
      </button>
      <button className="secondary-button secondary-button--full" type="button" onClick={stop}>
        <IconCamera size={15} />
        Try Another Photo
      </button>
    </div>
  );
}

function NotesPanel() {
  return (
    <div className="notes-panel">
      <div className="notes-panel__title">Design Notes</div>
      <div className="notes-list">
        {designNotes.map((note) => (
          <div key={note.title} className="notes-item">
            <div className="notes-item__icon">
              <IconSparkles size={14} />
            </div>
            <div>
              <div className="notes-item__title">{note.title}</div>
              <div className="notes-item__body">{note.body}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="notes-watermark" aria-hidden="true" />
    </div>
  );
}

function buildFrames() {
  const notice = deepModeSequences.notice;
  const interpret = deepModeSequences.interpret;

  return [
    {
      id: "loading",
      number: 1,
      title: "Deep Loading",
      kind: "loading",
    },
    {
      id: "overview",
      number: 2,
      title: "Course Overview",
      kind: "overview",
    },
    {
      id: "notice-understand",
      number: 3,
      title: "Notice – Understand",
      kind: "exercise",
      module: "notice",
      progress: "4 / 14",
      kicker: "Notice",
      subtitle: "Reorder to understand the sentence.",
      prompt: notice[0].promptEnglish,
      promptChinese: notice[0].promptChinese,
      entry: notice[0],
      mode: "understand",
    },
    {
      id: "notice-focus",
      number: 4,
      title: "Notice – Focus",
      kind: "exercise",
      module: "notice",
      progress: "5 / 14",
      kicker: "Notice",
      subtitle: "Fill in the blanks with the core expression.",
      prompt: notice[1].promptEnglish,
      promptChinese: notice[1].promptChinese,
      entry: notice[1],
      mode: "focus",
    },
    {
      id: "notice-build",
      number: 5,
      title: "Notice – Build",
      kind: "exercise",
      module: "notice",
      progress: "5 / 14",
      kicker: "Notice",
      subtitle: "Build the sentence.",
      prompt: notice[2].promptEnglish,
      promptChinese: notice[2].promptChinese,
      entry: notice[2],
      mode: "build",
    },
    {
      id: "notice-quick",
      number: 6,
      title: "Notice – Quick Response",
      kind: "exercise",
      module: "notice",
      progress: "7 / 14",
      kicker: "Notice",
      subtitle: "Answer with the same chunks.",
      prompt: notice[3].question,
      promptChinese: notice[3].questionChinese,
      entry: notice[3],
      mode: "quick",
    },
    {
      id: "notice-milestone",
      number: 7,
      title: "Notice Milestone",
      kind: "milestone",
      module: "notice",
      subtitle: deepModeCourse.modules.notice.milestone.description,
      cta: deepModeCourse.modules.notice.milestone.cta,
    },
    {
      id: "interpret-understand",
      number: 8,
      title: "Interpret – Understand",
      kind: "exercise",
      module: "interpret",
      progress: "8 / 14",
      kicker: "Interpret",
      subtitle: "Understand the inference.",
      prompt: interpret[0].promptEnglish,
      promptChinese: interpret[0].promptChinese,
      entry: interpret[0],
      mode: "understand",
    },
    {
      id: "interpret-quick",
      number: 9,
      title: "Interpret – Quick Response",
      kind: "exercise",
      module: "interpret",
      progress: "9 / 14",
      kicker: "Interpret",
      subtitle: "What might be happening right now?",
      prompt: interpret[3].question,
      promptChinese: interpret[3].questionChinese,
      entry: interpret[3],
      mode: "quick",
    },
    {
      id: "interact-intro",
      number: 10,
      title: "Interact – Task Pack Intro",
      kind: "task-intro",
      module: "interact",
      progress: "10 / 14",
    },
    {
      id: "interact-need",
      number: 11,
      title: "Interact – Need Practice",
      kind: "dialogue",
      module: "interact",
      progress: "11 / 14",
      variant: "need",
    },
    {
      id: "interact-dialogue-1",
      number: 12,
      title: "Interact – Dialogue Practice (1)",
      kind: "dialogue",
      module: "interact",
      progress: "12 / 14",
      variant: "need",
    },
    {
      id: "interact-dialogue-2",
      number: 13,
      title: "Interact – Dialogue Practice (2)",
      kind: "dialogue",
      module: "interact",
      progress: "13 / 14",
      variant: "handle",
    },
    {
      id: "interact-milestone",
      number: 14,
      title: "Interact Milestone",
      kind: "milestone",
      module: "interact",
      subtitle: deepModeCourse.modules.interact.milestone.description,
      cta: deepModeCourse.modules.interact.milestone.cta,
    },
    {
      id: "step-in",
      number: 15,
      title: "Step In – Final Challenge",
      kind: "step-in",
      module: "stepIn",
    },
    {
      id: "completion",
      number: 16,
      title: "Course Complete",
      kind: "completion",
      wide: true,
    },
    {
      id: "notes",
      title: "Design Notes",
      kind: "notes",
      wide: true,
      notes: true,
    },
  ];
}

function renderFrame(frame, selectFrame) {
  switch (frame.kind) {
    case "loading":
      return <LoadingFrame />;
    case "overview":
      return (
        <OverviewFrame
          onStart={() => selectFrame("notice-understand")}
          onRetake={() => selectFrame("loading")}
        />
      );
    case "exercise":
      return <ExerciseFrame frame={frame} />;
    case "milestone":
      return <MilestoneFrame frame={frame} />;
    case "task-intro":
      return <TaskIntroFrame frame={frame} />;
    case "dialogue":
      return <DialogueFrame frame={frame} />;
    case "step-in":
      return <StepInFrame />;
    case "completion":
      return (
        <div className="completion-frame-wrap">
          <CompletionFrame />
        </div>
      );
    case "notes":
      return <NotesPanel />;
    default:
      return null;
  }
}

export function DeepModeApp() {
  const frames = useMemo(() => buildFrames(), []);
  const [activeFrameId, setActiveFrameId] = useState("overview");

  const activeFrame = frames.find((frame) => frame.id === activeFrameId) || frames[1];

  return (
    <div className="deepmode-app">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <div className="deepmode-shell">
        <header className="deepmode-header">
          <div className="brand-block">
            <div className="brand-row">
              <span className="brand-mark">kaisensei</span>
              <span className="mode-pill">Deep Mode</span>
            </div>
            <p className="brand-tagline">See more. Understand deeper. Speak naturally.</p>
            <p className="brand-tagline brand-tagline--cn">看得更深，懂得更多，说得自然。</p>
          </div>

          <div className="legend-row">
            {moduleOrder.map((module) => (
              <div key={module.id} className="legend-item">
                <span className={cx("legend-dot", module.accent)} />
                <span>{module.label}</span>
              </div>
            ))}
          </div>
        </header>

        <section className="hero-strip">
          <div>
            <div className="hero-strip__label">Storyboard</div>
            <h1>One scene, four layers of learning.</h1>
            <p>
              The reference board stays calm and focused. Click any card to highlight it and keep the flow easy
              to scan.
            </p>
          </div>
          <div className="hero-strip__chip">
            <IconSparkles size={15} />
            Selected: {activeFrame.title}
          </div>
        </section>

        <main className="storyboard-grid">
          {frames.map((frame) => (
            <section
              key={frame.id}
              role="button"
              tabIndex={0}
              aria-pressed={activeFrameId === frame.id}
              className={cx(
                "story-card",
                frame.kind && `story-card--${frame.kind}`,
                frame.wide && "story-card--wide",
                activeFrameId === frame.id && "is-active",
              )}
              onClick={() => setActiveFrameId(frame.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveFrameId(frame.id);
                }
              }}
            >
              {frame.number ? <div className="story-card__number">{frame.number}</div> : null}
              <div className="story-card__label">{frame.title}</div>
              <div className="story-card__body">{renderFrame(frame, setActiveFrameId)}</div>
            </section>
          ))}
        </main>

        <footer className="deepmode-footer">
          <div className="footer-badge">
            <IconEye size={15} />
            Notice
          </div>
          <div className="footer-badge">
            <IconBook2 size={15} />
            Interpret
          </div>
          <div className="footer-badge">
            <IconMessage2 size={15} />
            Interact
          </div>
          <div className="footer-badge footer-badge--gold">
            <IconPuzzle2 size={15} />
            Step In
          </div>
        </footer>
      </div>
    </div>
  );
}
