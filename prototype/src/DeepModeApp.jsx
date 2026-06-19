import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconCamera,
  IconEye,
  IconBook2,
  IconMessage2,
  IconPuzzle2,
  IconRefresh,
  IconSparkles,
  IconStarFilled,
  IconZoomScan,
  IconX,
  IconPhoto,
  IconAlertCircle,
  IconChevronRight,
  IconCircleDashed,
  IconMoodCheck,
  IconSparklesFilled,
} from "@tabler/icons-react";
import { deepModeCourse } from "./deep-mode/deepModeData.js";

const STORAGE_KEY = "kaisensei.deep-mode.session.v3";
const MODULES = [
  { id: "notice", label: "Notice", accent: "module-notice", icon: IconEye },
  { id: "interpret", label: "Interpret", accent: "module-interpret", icon: IconBook2 },
  { id: "interact", label: "Interact", accent: "module-interact", icon: IconMessage2 },
  { id: "stepIn", label: "Step In", accent: "module-step-in", icon: IconPuzzle2 },
];

const PHASE_COPY = {
  understand: {
    title: "Understand",
    subtitle: "Reorder the Chinese chunks.",
    action: "Check",
    label: "Your answer",
  },
  focus: {
    title: "Focus",
    subtitle: "Fill the blanks with the core expression.",
    action: "Check",
    label: "Fill the blanks",
  },
  build: {
    title: "Build",
    subtitle: "Rebuild the sentence with natural chunks.",
    action: "Check",
    label: "Build your answer",
  },
  quickResponse: {
    title: "Quick Response",
    subtitle: "Answer with chunks.",
    action: "Check",
    label: "Build your answer",
  },
};

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function idsMatch(selectedIds, answerIds) {
  if (selectedIds.length !== answerIds.length) {
    return false;
  }

  return selectedIds.every((id, index) => id === answerIds[index]);
}

function chunkMap(chunks = []) {
  return new Map(chunks.map((chunk) => [chunk.id, chunk]));
}

function getDialogueTurns(dialogue = {}) {
  return dialogue.steps || dialogue.turns || [];
}

function buildExerciseNode({
  id,
  moduleId,
  moduleLabel,
  titlePrefix,
  phase,
  stageLabel,
  coreExpression,
  meaningChinese,
  promptEnglish,
  promptChinese,
  exercise,
  feedback,
  hint,
}) {
  return {
    id,
    kind: "exercise",
    moduleId,
    moduleLabel,
    phase,
    stageLabel,
    title: `${titlePrefix || moduleLabel} – ${PHASE_COPY[phase].title}`,
    subtitle: PHASE_COPY[phase].subtitle,
    coreExpression,
    meaningChinese,
    promptEnglish,
    promptChinese,
    exercise,
    feedback,
    hint,
  };
}

function buildPackExerciseFlow({ moduleId, moduleLabel, pack }) {
  const nodes = [];

  const addExample = (example, exampleId, exampleIndex) => {
    nodes.push(
      buildExerciseNode({
        id: `${moduleId}-${pack.id}-${exampleId}-understand`,
        moduleId,
        moduleLabel,
        titlePrefix: moduleLabel,
        phase: "understand",
        stageLabel: moduleLabel,
        coreExpression: pack.coreExpression,
        meaningChinese: pack.meaningChinese,
        promptEnglish: example.english,
        promptChinese: example.chinese,
        exercise: example.understand,
        feedback: {
          success: {
            title: "Nice.",
            body: "You understood the sentence.",
          },
          error: {
            title: "Almost.",
            body: "Try the Chinese chunks again.",
          },
        },
        hint: `Start with "${example.understand.chunks[0]?.text || pack.coreExpression}".`,
      }),
    );

    nodes.push(
      buildExerciseNode({
        id: `${moduleId}-${pack.id}-${exampleId}-focus`,
        moduleId,
        moduleLabel,
        titlePrefix: moduleLabel,
        phase: "focus",
        stageLabel: moduleLabel,
        coreExpression: pack.coreExpression,
        meaningChinese: pack.meaningChinese,
        promptEnglish: example.focus.sentenceWithBlanks,
        promptChinese: example.chinese,
        exercise: example.focus,
        feedback: {
          success: {
            title: "Great.",
            body: "The core expression is in place.",
          },
          error: {
            title: "Not yet.",
            body: "Look at the missing core phrase again.",
          },
        },
        hint: `Fill the blank with "${pack.coreExpression}".`,
      }),
    );

    nodes.push(
      buildExerciseNode({
        id: `${moduleId}-${pack.id}-${exampleId}-build`,
        moduleId,
        moduleLabel,
        titlePrefix: moduleLabel,
        phase: "build",
        stageLabel: moduleLabel,
        coreExpression: pack.coreExpression,
        meaningChinese: pack.meaningChinese,
        promptEnglish: example.english,
        promptChinese: example.build.promptChinese,
        exercise: example.build,
        feedback: {
          success: {
            title: "Nice work.",
            body: "You built the sentence.",
          },
          error: {
            title: "Close.",
            body: "Try the chunk order again.",
          },
        },
        hint: `Keep "${pack.coreExpression}" together.`,
      }),
    );
  };

  addExample(pack.baseExample, "base", 0);
  pack.variations.forEach((example, index) => {
    addExample(example, `variation-${index}`, index + 1);
  });

  pack.quickResponses.forEach((response, responseIndex) => {
    nodes.push(
      buildExerciseNode({
        id: `${moduleId}-${pack.id}-quick-${responseIndex}`,
        moduleId,
        moduleLabel,
        titlePrefix: moduleLabel,
        phase: "quickResponse",
        stageLabel: moduleLabel,
        coreExpression: response.coreExpression,
        meaningChinese: response.meaningChinese,
        promptEnglish: response.question,
        promptChinese: response.questionChinese,
        exercise: response,
        feedback: {
          success: {
            title: "Good answer.",
            body: "That sounds natural.",
          },
          error: {
            title: "Almost.",
            body: "Try the answer order once more.",
          },
        },
        hint: `Start with "${response.chunks[0]?.text || response.coreExpression}".`,
      }),
    );
  });

  return nodes;
}

function buildRoleExerciseFlow({ moduleId, moduleLabel, roleLabel, rolePack }) {
  const nodes = [];

  const addExample = (example, exampleId) => {
    nodes.push(
      buildExerciseNode({
        id: `${moduleId}-${roleLabel.toLowerCase()}-${exampleId}-understand`,
        moduleId,
        moduleLabel,
        titlePrefix: roleLabel,
        phase: "understand",
        stageLabel: roleLabel,
        coreExpression: rolePack.coreExpression,
        meaningChinese: rolePack.meaningChinese,
        promptEnglish: example.english,
        promptChinese: example.chinese,
        exercise: example.understand,
        feedback: {
          success: {
            title: "Nice.",
            body: "You understood the meaning.",
          },
          error: {
            title: "Almost.",
            body: "Try the Chinese chunks again.",
          },
        },
        hint: `Start with "${example.understand.chunks[0]?.text || rolePack.coreExpression}".`,
      }),
    );

    nodes.push(
      buildExerciseNode({
        id: `${moduleId}-${roleLabel.toLowerCase()}-${exampleId}-focus`,
        moduleId,
        moduleLabel,
        titlePrefix: roleLabel,
        phase: "focus",
        stageLabel: roleLabel,
        coreExpression: rolePack.coreExpression,
        meaningChinese: rolePack.meaningChinese,
        promptEnglish: example.focus.sentenceWithBlanks,
        promptChinese: example.chinese,
        exercise: example.focus,
        feedback: {
          success: {
            title: "Great.",
            body: "The phrase fits.",
          },
          error: {
            title: "Not yet.",
            body: "Check the missing chunk again.",
          },
        },
        hint: `Use "${rolePack.coreExpression.split(" ")[0] || rolePack.coreExpression}".`,
      }),
    );

    nodes.push(
      buildExerciseNode({
        id: `${moduleId}-${roleLabel.toLowerCase()}-${exampleId}-build`,
        moduleId,
        moduleLabel,
        titlePrefix: roleLabel,
        phase: "build",
        stageLabel: roleLabel,
        coreExpression: rolePack.coreExpression,
        meaningChinese: rolePack.meaningChinese,
        promptEnglish: example.english,
        promptChinese: example.build.promptChinese,
        exercise: example.build,
        feedback: {
          success: {
            title: "Nice work.",
            body: "You built the reply.",
          },
          error: {
            title: "Close.",
            body: "Try the chunk order again.",
          },
        },
        hint: `Keep "${rolePack.coreExpression}" together.`,
      }),
    );
  };

  addExample(rolePack.baseExample, "base");
  rolePack.variations.forEach((example, index) => {
    addExample(example, `variation-${index}`);
  });

  return nodes;
}

function buildCoursePlan(course) {
  const noticePack = course.modules.notice.expressionPacks[0];
  const interpretPack = course.modules.interpret.expressionPacks[0];
  const interactPack = course.modules.interact.taskPacks[0];
  const stepInDialogue = course.modules.stepIn.dialogue;

  const nodes = [
    {
      id: "loading",
      kind: "loading",
    },
    {
      id: "overview",
      kind: "overview",
      photoSummary: course.photoSummary,
      overview: course.overview,
    },
    ...buildPackExerciseFlow({
      moduleId: "notice",
      moduleLabel: "Notice",
      pack: noticePack,
    }),
    {
      id: "notice-milestone",
      kind: "milestone",
      moduleId: "notice",
      moduleLabel: "Notice",
      title: course.modules.notice.milestone.title,
      description: course.modules.notice.milestone.description,
      capability: course.modules.notice.milestone.capability,
      cta: course.modules.notice.milestone.cta,
      coreExpressions: [noticePack.coreExpression],
    },
    ...buildPackExerciseFlow({
      moduleId: "interpret",
      moduleLabel: "Interpret",
      pack: interpretPack,
    }),
    {
      id: "interpret-milestone",
      kind: "milestone",
      moduleId: "interpret",
      moduleLabel: "Interpret",
      title: course.modules.interpret.milestone.title,
      description: course.modules.interpret.milestone.description,
      capability: course.modules.interpret.milestone.capability,
      cta: course.modules.interpret.milestone.cta,
      coreExpressions: [interpretPack.coreExpression],
    },
    {
      id: "interact-intro",
      kind: "taskIntro",
      moduleId: "interact",
      moduleLabel: "Interact",
      title: interactPack.taskTitle,
      subtitle: interactPack.scenePrompt,
      taskTitle: interactPack.taskTitle,
      scenePrompt: interactPack.scenePrompt,
      needExpression: interactPack.need.coreExpression,
      needMeaning: interactPack.need.meaningChinese,
      handleExpression: interactPack.handle.coreExpression,
      handleMeaning: interactPack.handle.meaningChinese,
    },
    ...buildRoleExerciseFlow({
      moduleId: "interact",
      moduleLabel: "Interact",
      roleLabel: "Need",
      rolePack: interactPack.need,
    }),
    ...buildRoleExerciseFlow({
      moduleId: "interact",
      moduleLabel: "Interact",
      roleLabel: "Handle",
      rolePack: interactPack.handle,
    }),
    {
      id: "interact-dialogue",
      kind: "dialogue",
      moduleId: "interact",
      moduleLabel: "Interact",
      title: "Dialogue Practice",
      subtitle: interactPack.scenePrompt,
      dialogue: interactPack.dialogues[0],
      mode: "interact",
    },
    {
      id: "interact-milestone",
      kind: "milestone",
      moduleId: "interact",
      moduleLabel: "Interact",
      title: course.modules.interact.milestone.title,
      description: course.modules.interact.milestone.description,
      capability: course.modules.interact.milestone.capability,
      cta: course.modules.interact.milestone.cta,
      coreExpressions: [interactPack.need.coreExpression, interactPack.handle.coreExpression],
    },
    {
      id: "stepIn-dialogue",
      kind: "dialogue",
      moduleId: "stepIn",
      moduleLabel: "Step In",
      title: "Step In",
      subtitle: stepInDialogue.scene,
      dialogue: stepInDialogue,
      mode: "stepIn",
    },
    {
      id: "completion",
      kind: "completion",
      title: course.modules.completion.title,
      description: course.modules.completion.description,
      reviewCta: course.modules.completion.reviewCta,
      retryCta: course.modules.completion.retryCta,
      moduleStatuses: course.modules.completion.moduleStatuses,
    },
  ];

  const moduleTotals = nodes.reduce((acc, node) => {
    if (!node.moduleId || node.kind === "loading" || node.kind === "overview" || node.kind === "completion") {
      return acc;
    }
    acc[node.moduleId] = (acc[node.moduleId] || 0) + 1;
    return acc;
  }, {});

  const moduleIndices = nodes.reduce((acc, node, index) => {
    if (!node.moduleId || node.kind === "loading" || node.kind === "overview" || node.kind === "completion") {
      return acc;
    }
    if (!acc[node.moduleId]) {
      acc[node.moduleId] = [];
    }
    acc[node.moduleId].push(index);
    return acc;
  }, {});

  return {
    course,
    noticePack,
    interpretPack,
    interactPack,
    stepInDialogue,
    nodes,
    moduleTotals,
    moduleIndices,
    learnedExpressions: [
      noticePack.coreExpression,
      interpretPack.coreExpression,
      interactPack.need.coreExpression,
      interactPack.handle.coreExpression,
    ],
  };
}

function defaultExerciseState() {
  return {
    selectedIds: [],
    attempts: 0,
    feedback: null,
    hint: null,
    locked: false,
    resolved: false,
  };
}

function defaultDialogueState() {
  return {
    turnIndex: 0,
    selectedIds: [],
    attempts: 0,
    bubbles: [],
    feedback: null,
    hint: null,
    locked: false,
    resolved: false,
  };
}

function loadSession(plan) {
  if (typeof window === "undefined") {
    return {
      activeIndex: 0,
      nodeStates: {},
      hydrated: false,
      version: 3,
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        activeIndex: 0,
        nodeStates: {},
        hydrated: false,
        version: 3,
      };
    }

    const parsed = JSON.parse(raw);
    if (parsed?.version !== 3) {
      return {
        activeIndex: 0,
        nodeStates: {},
        hydrated: false,
        version: 3,
      };
    }

    const maxIndex = Math.max(0, plan.nodes.length - 1);
    return {
      activeIndex: Math.min(parsed.activeIndex ?? 0, maxIndex),
      nodeStates: parsed.nodeStates || {},
      hydrated: true,
      version: 3,
    };
  } catch {
    return {
      activeIndex: 0,
      nodeStates: {},
      hydrated: false,
      version: 3,
    };
  }
}

function getNodeState(node, nodeStates) {
  const existing = nodeStates[node.id];
  if (existing) {
    return existing;
  }
  return node.kind === "dialogue" ? defaultDialogueState() : defaultExerciseState();
}

function getDialogueStateTurn(node, nodeStates) {
  if (node.kind !== "dialogue") {
    return null;
  }

  const state = getNodeState(node, nodeStates);
  return getDialogueTurns(node.dialogue)[state.turnIndex] || null;
}

function feedbackTone(kind) {
  if (kind === "success") return "success";
  if (kind === "error") return "error";
  return "info";
}

function CoreExpression({ text, meaning }) {
  return (
    <span className="core-expression" title={meaning || text}>
      {text}
    </span>
  );
}

function PhotoThumbnail({ src, alt, onClick }) {
  return (
    <button className="photo-thumb" type="button" onClick={onClick} aria-label="Preview photo">
      <img src={src} alt={alt} />
      <span className="photo-thumb__zoom">
        <IconZoomScan size={14} />
      </span>
    </button>
  );
}

function DeepProgressHeader({
  currentModuleId,
  moduleProgressLabel,
  onBack,
  onPhotoClick,
  photoSrc,
  completedModuleIds = [],
}) {
  return (
    <header className="deep-header">
      <button className="back-button" type="button" onClick={onBack} aria-label="Back">
        <IconArrowLeft size={17} />
      </button>
      <div className="deep-header__center">
        <div className="module-track">
          {MODULES.map((module) => {
            const status =
              currentModuleId === module.id
                ? "active"
                : completedModuleIds.includes(module.id)
                  ? "complete"
                  : "upcoming";

            return (
              <div key={module.id} className={`module-track__item module-track__item--${status}`}>
                <span className="module-track__dot" />
                <span className="module-track__label">{module.label}</span>
              </div>
            );
          })}
        </div>
        {moduleProgressLabel ? <div className="module-progress-label">{moduleProgressLabel}</div> : null}
      </div>
      <PhotoThumbnail src={photoSrc} alt="Selected photo preview" onClick={onPhotoClick} />
    </header>
  );
}

function ChunkChip({ chunk, selected, onClick, tone = "lavender", disabled = false }) {
  return (
    <button
      type="button"
      className={`chunk-chip chunk-chip--${tone} ${selected ? "is-selected" : ""} ${disabled ? "is-disabled" : ""}`}
      onClick={() => onClick(chunk)}
      disabled={disabled}
    >
      <span className="chunk-chip__text">{chunk.text}</span>
      {chunk.chinese ? <span className="chunk-chip__sub">{chunk.chinese}</span> : null}
    </button>
  );
}

function ChunkPool({ chunks, selectedIds, onSelect, tone = "lavender", label = "Choose chunks", disabled = false }) {
  const pool = chunks.filter((chunk) => !selectedIds.includes(chunk.id));
  return (
    <div className="chunk-panel chunk-panel--pool">
      <div className="chunk-panel__label">{label}</div>
      <div className="chunk-pool">
        {pool.map((chunk) => (
          <ChunkChip key={chunk.id} chunk={chunk} onClick={onSelect} tone={tone} disabled={disabled} />
        ))}
      </div>
    </div>
  );
}

function SelectedChunkArea({ chunks, onRemove, tone = "lavender", label = "Your answer", disabled = false }) {
  return (
    <div className="chunk-panel chunk-panel--selected">
      <div className="chunk-panel__label">{label}</div>
      <div className="selected-area">
        {chunks.length ? (
          chunks.map((chunk) => (
            <ChunkChip key={chunk.id} chunk={chunk} selected onClick={onRemove} tone={tone} disabled={disabled} />
          ))
        ) : (
          <div className="selected-area__empty">Tap chunks to build the answer.</div>
        )}
      </div>
    </div>
  );
}

function FeedbackState({ tone, title, body, hint = false }) {
  if (!title && !body) return null;
  return (
    <div className={`feedback-state feedback-state--${tone} ${hint ? "feedback-state--hint" : ""}`}>
      <div className="feedback-state__title">{title}</div>
      {body ? <div className="feedback-state__body">{body}</div> : null}
    </div>
  );
}

function BottomActionBar({
  onReset,
  onHint,
  onPrimary,
  primaryLabel,
  primaryDisabled,
  busy,
  primaryTone = "yellow",
}) {
  return (
    <div className="bottom-action-bar">
      <button className="bottom-action-bar__button" type="button" onClick={onReset} disabled={busy}>
        <IconRefresh size={14} />
        Reset
      </button>
      <button className="bottom-action-bar__button" type="button" onClick={onHint} disabled={busy}>
        <IconSparkles size={14} />
        Hint
      </button>
      <button
        className={`bottom-action-bar__button bottom-action-bar__button--primary bottom-action-bar__button--${primaryTone}`}
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled || busy}
      >
        {primaryLabel}
        <IconChevronRight size={14} />
      </button>
    </div>
  );
}

function ExerciseCard({
  node,
  selectedChunks,
  selectedIds,
  poolChunks,
  phase,
  ready,
  busy,
  feedback,
  onSelectChunk,
  onRemoveChunk,
  onReset,
  onHint,
  onPrimary,
}) {
  const phaseMeta = PHASE_COPY[phase];
  const sentence = node.promptEnglish || "";
  const answerLabel = phaseMeta.label;
  const tone = phase === "focus" ? "blue" : phase === "understand" ? "lavender" : "yellow";

  const renderSentence = () => {
    if (phase === "focus") {
      const parts = String(node.promptEnglish || "")
        .split("___")
        .map((part, index, items) => (
          <React.Fragment key={`${node.id}-focus-${index}`}>
            <span>{part}</span>
            {index < items.length - 1 ? <span className="blank-slot" /> : null}
          </React.Fragment>
        ));
      return <div className="exercise-sentence">{parts}</div>;
    }

    if (phase === "quickResponse") {
      return (
        <>
          <div className="exercise-question">{node.promptEnglish}</div>
          <div className="exercise-question__cn">{node.promptChinese}</div>
        </>
      );
    }

    return (
      <>
        <div className="exercise-sentence">
          {sentence.split(node.coreExpression).map((part, index, items) => (
            <React.Fragment key={`${node.id}-understand-${index}`}>
              <span>{part}</span>
              {index < items.length - 1 ? <CoreExpression text={node.coreExpression} meaning={node.meaningChinese} /> : null}
            </React.Fragment>
          ))}
        </div>
        <div className="exercise-question__cn">{node.promptChinese}</div>
      </>
    );
  };

  return (
    <div className={`exercise-card exercise-card--${phase} exercise-card--${tone}`}>
      <div className="exercise-card__top">
        <div className="exercise-card__stage">{node.stageLabel}</div>
        <div className="exercise-card__title">{node.title}</div>
        <div className="exercise-card__subtitle">{node.subtitle}</div>
      </div>

      <div className="exercise-card__body">
        {renderSentence()}
        {phase === "build" ? <div className="exercise-note">{node.promptChinese}</div> : null}
        <SelectedChunkArea chunks={selectedChunks} onRemove={onRemoveChunk} tone={tone} label={answerLabel} disabled={busy} />
        <ChunkPool chunks={poolChunks} selectedIds={selectedIds} onSelect={onSelectChunk} tone={tone} disabled={busy} />
      </div>

      <FeedbackState
        tone={feedback ? feedbackTone(feedback.kind) : "info"}
        title={feedback?.title}
        body={feedback?.body}
        hint={feedback?.kind === "hint"}
      />

      <BottomActionBar
        onReset={onReset}
        onHint={onHint}
        onPrimary={onPrimary}
        primaryLabel={phaseMeta.action}
        primaryDisabled={!ready}
        busy={busy}
        primaryTone={phase === "focus" ? "yellow" : "yellow"}
      />
    </div>
  );
}

function DialogueBubble({ speaker, text, kind = "system", pending = false }) {
  return (
    <div className={`dialogue-bubble dialogue-bubble--${kind} ${pending ? "is-pending" : ""}`}>
      <div className="dialogue-bubble__speaker">{speaker}</div>
      <div className="dialogue-bubble__text">{text}</div>
    </div>
  );
}

function DialogueComposer({
  node,
  currentTurn,
  selectionChunks,
  selectionIds,
  poolChunks,
  onSelectChunk,
  onRemoveChunk,
  onReset,
  onHint,
  onPrimary,
  ready,
  busy,
  feedback,
}) {
  const turnLabel = currentTurn?.sourceModule
    ? currentTurn.sourceModule === "notice"
      ? "Notice"
      : currentTurn.sourceModule === "interpret"
        ? "Interpret"
        : "Your turn"
    : currentTurn?.source === "need"
      ? "Need"
      : currentTurn?.source === "handle"
        ? "Handle"
        : "Your turn";

  return (
    <div className="dialogue-composer">
      <div className="dialogue-composer__top">
        <div className="dialogue-composer__stage">Dialogue Practice</div>
        <div className="dialogue-composer__title">{node.title}</div>
        <div className="dialogue-composer__subtitle">{node.subtitle}</div>
      </div>
      <div className="dialogue-composer__question">
        <div className="dialogue-composer__question-label">{turnLabel}</div>
        <div className="dialogue-composer__question-text">{currentTurn?.text}</div>
      </div>
      <SelectedChunkArea
        chunks={selectionChunks}
        onRemove={onRemoveChunk}
        tone="lavender"
        label="Build your answer"
        disabled={busy}
      />
      <ChunkPool
        chunks={poolChunks}
        selectedIds={selectionIds}
        onSelect={onSelectChunk}
        tone="lavender"
        label="Choose chunks"
        disabled={busy}
      />
      <FeedbackState
        tone={feedback ? feedbackTone(feedback.kind) : "info"}
        title={feedback?.title}
        body={feedback?.body}
        hint={feedback?.kind === "hint"}
      />
      <BottomActionBar
        onReset={onReset}
        onHint={onHint}
        onPrimary={onPrimary}
        primaryLabel="Send"
        primaryDisabled={!ready}
        busy={busy}
        primaryTone="yellow"
      />
    </div>
  );
}

function TaskPackIntro({ node, onContinue }) {
  return (
    <div className="intro-card">
      <div className="intro-card__stage">Task Pack Intro</div>
      <div className="intro-card__title">{node.taskTitle}</div>
      <div className="intro-card__subtitle">{node.scenePrompt}</div>
      <div className="intro-card__expression-list">
        <div className="intro-expression">
          <span className="intro-expression__label">Need</span>
          <span className="intro-expression__text">{node.needExpression}</span>
          <span className="intro-expression__cn">{node.needMeaning}</span>
        </div>
        <div className="intro-expression">
          <span className="intro-expression__label">Handle</span>
          <span className="intro-expression__text">{node.handleExpression}</span>
          <span className="intro-expression__cn">{node.handleMeaning}</span>
        </div>
      </div>
      <div className="intro-card__hint">
        <IconSparklesFilled size={14} />
        This pack keeps one real task and one natural reply.
      </div>
      <button type="button" className="intro-card__button" onClick={onContinue}>
        Start Practice
        <IconArrowRight size={15} />
      </button>
    </div>
  );
}

function MilestoneCard({ node, onContinue }) {
  return (
    <div className="milestone-card">
      <div className="milestone-card__orb">
        <IconMoodCheck size={28} />
      </div>
      <div className="milestone-card__title">{node.title}</div>
      <div className="milestone-card__body">{node.description}</div>
      <div className="milestone-card__capability">{node.capability}</div>
      <div className="milestone-card__expressions">
        {(node.coreExpressions || []).map((expression) => (
          <div key={expression} className="milestone-expression">
            <IconCheck size={14} />
            <span>{expression}</span>
          </div>
        ))}
      </div>
      <button type="button" className="milestone-card__button" onClick={onContinue}>
        {node.cta}
        <IconArrowRight size={15} />
      </button>
    </div>
  );
}

function CourseOverviewCard({ node, onStart }) {
  return (
    <button type="button" className="overview-card" onClick={onStart}>
      <div className="overview-card__photo">
        <img src="/deep-mode-default.jpg" alt="Selected photo" />
      </div>
      <div className="overview-card__body">
        <div className="overview-card__keywords">{(node.overview.keywords || []).join(" · ")}</div>
        <div className="overview-card__scene">{node.overview.sceneDescriptionChinese}</div>
        <div className="overview-card__prompt">{node.overview.startPromptChinese}</div>
      </div>
    </button>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-screen__orb">
        <IconStarFilled size={28} />
      </div>
      <div className="loading-screen__brand">kaisensei</div>
      <div className="loading-screen__mode">Deep Mode</div>
      <div className="loading-screen__copy">Reading the scene · Building the lesson · Preparing the challenge</div>
      <div className="loading-screen__list">
        <div className="loading-screen__item is-active">
          <span className="loading-screen__dot" />
          <span>Reading the scene...</span>
        </div>
        <div className="loading-screen__item">
          <span className="loading-screen__dot" />
          <span>Building your practice...</span>
        </div>
        <div className="loading-screen__item">
          <span className="loading-screen__dot" />
          <span>Preparing your challenge...</span>
        </div>
      </div>
      <div className="loading-screen__percent">67%</div>
    </div>
  );
}

function CompletionScreen({ node, plan, onReview, onRetry }) {
  return (
    <div className="completion-screen">
      <div className="completion-screen__photo">
        <img src="/deep-mode-default.jpg" alt="Selected photo" />
      </div>
      <div className="completion-screen__card">
        <div className="completion-screen__badge">
          <IconCheck size={18} />
        </div>
        <div className="completion-screen__title">{node.title}</div>
        <div className="completion-screen__body">{node.description}</div>
      </div>
      <div className="completion-screen__module-list">
        {(node.moduleStatuses || []).map((module) => (
          <div key={module.id} className="completion-module">
            <span className="completion-module__label">{module.label}</span>
            <span className="completion-module__detail">{module.detail}</span>
          </div>
        ))}
      </div>
      <div className="completion-screen__card">
        <div className="completion-screen__section-title">Core expressions you learned</div>
        <div className="completion-screen__expression-list">
          {plan.learnedExpressions.map((expression) => (
            <div key={expression} className="completion-expression">
              <IconCircleDashed size={14} />
              <span>{expression}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="completion-screen__card">
        <div className="completion-screen__section-title">Final dialogue summary</div>
        <div className="completion-screen__dialogue">
          {getDialogueTurns(plan.stepInDialogue).map((turn, index) => (
            <DialogueBubble
              key={`${turn.speaker}-${index}`}
              speaker={turn.speaker === "system" ? "Barista" : "You"}
              text={turn.text || turn.targetText}
              kind={turn.speaker === "system" ? "system" : "user"}
            />
          ))}
        </div>
      </div>
      <button type="button" className="completion-screen__primary" onClick={onReview}>
        {node.reviewCta}
        <IconRefresh size={15} />
      </button>
      <button type="button" className="completion-screen__secondary" onClick={onRetry}>
        <IconCamera size={15} />
        {node.retryCta}
      </button>
    </div>
  );
}

function renderNode(node, plan, session, actions) {
  const nodeState = getNodeState(node, session.nodeStates);
  const selectedChunks = (nodeState.selectedIds || [])
    .map((id) => actions.chunkLookup.get(id))
    .filter(Boolean);
  const selectedIds = nodeState.selectedIds || [];
  const dialogueTurn = node.kind === "dialogue" ? actions.currentDialogueTurn : null;
  const poolSource = node.kind === "dialogue" ? dialogueTurn?.exercise : node.exercise;
  const poolChunks = poolSource
    ? [...(poolSource.chunks || poolSource.choices || []), ...(poolSource.distractors || [])]
    : [];
  const ready =
    node.kind === "dialogue"
      ? selectedIds.length === (dialogueTurn?.exercise?.answerIds || []).length
      : node.kind === "exercise"
        ? selectedIds.length === (node.exercise?.answerIds || []).length
        : false;

  if (node.kind === "loading") {
    return <LoadingScreen />;
  }

  if (node.kind === "overview") {
    return (
      <div className="overview-screen">
        <div className="overview-screen__top">
          <div className="overview-screen__brand">kaisensei</div>
          <div className="overview-screen__badge">Deep Mode</div>
        </div>
        <div className="overview-screen__tagline">See more. Understand deeper. Speak naturally.</div>
        <div className="overview-screen__tagline-cn">看得更深，懂得更多，说得自然。</div>
        <CourseOverviewCard node={node} onStart={actions.onStartOverview} />
        <div className="overview-screen__copy">
          <div className="overview-screen__copy-line">One photo. One short course. One complete scene.</div>
          <div className="overview-screen__copy-line">Tap the card to enter the lesson.</div>
        </div>
      </div>
    );
  }

  if (node.kind === "taskIntro") {
    return <TaskPackIntro node={node} onContinue={actions.onPrimary} />;
  }

  if (node.kind === "milestone") {
    return <MilestoneCard node={node} onContinue={actions.onPrimary} />;
  }

  if (node.kind === "completion") {
    return <CompletionScreen node={node} plan={plan} onReview={actions.onReview} onRetry={actions.onRetry} />;
  }

  if (node.kind === "dialogue") {
    return (
      <DialogueScreen
        node={node}
        state={nodeState}
        currentDialogueTurn={actions.currentDialogueTurn}
        selectedChunks={selectedChunks}
        selectedIds={selectedIds}
        poolChunks={poolChunks}
        ready={ready}
        busy={nodeState.locked}
        feedback={nodeState.feedback}
        onSelectChunk={actions.onSelectChunk}
        onRemoveChunk={actions.onRemoveChunk}
        onReset={actions.onReset}
        onHint={actions.onHint}
        onPrimary={actions.onPrimary}
        onCompleteDialogue={actions.onCompleteDialogue}
      />
    );
  }

  return (
    <ExerciseCard
      node={node}
      selectedChunks={selectedChunks}
      selectedIds={selectedIds}
      poolChunks={poolChunks}
      phase={node.phase}
      ready={ready}
      busy={nodeState.locked}
      feedback={nodeState.feedback}
      onSelectChunk={actions.onSelectChunk}
      onRemoveChunk={actions.onRemoveChunk}
      onReset={actions.onReset}
      onHint={actions.onHint}
      onPrimary={actions.onPrimary}
    />
  );
}

function DialogueScreen({
  node,
  state,
  selectedChunks,
  selectedIds,
  poolChunks,
  ready,
  busy,
  feedback,
  currentDialogueTurn,
  onSelectChunk,
  onRemoveChunk,
  onReset,
  onHint,
  onPrimary,
  onCompleteDialogue,
}) {
  const turns = getDialogueTurns(node.dialogue);
  const currentTurn = turns[state.turnIndex];
  const systemPending = currentTurn?.speaker === "system";
  const streamBubbles = state.bubbles || [];
  const completed = state.turnIndex >= turns.length;

  useEffect(() => {
    if (!systemPending || completed) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      onCompleteDialogue(node.id, { type: "system", text: currentTurn.text });
    }, 700);

    return () => window.clearTimeout(timer);
  }, [completed, currentTurn, node.id, onCompleteDialogue, systemPending]);

  useEffect(() => {
    if (!completed || node.mode !== "interact") {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      onCompleteDialogue(node.id, { type: "next" });
    }, 900);

    return () => window.clearTimeout(timer);
  }, [completed, node.id, node.mode, onCompleteDialogue]);

  if (completed) {
    return (
      <div className="dialogue-screen">
        <div className="dialogue-screen__top">
          <div className="dialogue-screen__stage">{node.mode === "stepIn" ? "Step In" : "Dialogue Practice"}</div>
          <div className="dialogue-screen__title">{node.title}</div>
          <div className="dialogue-screen__subtitle">{node.subtitle}</div>
        </div>
        <div className="dialogue-screen__stream">
          {streamBubbles.map((bubble, index) => (
            <DialogueBubble
              key={`${bubble.kind}-${index}`}
              speaker={bubble.kind === "system" ? "Barista" : "You"}
              text={bubble.text}
              kind={bubble.kind}
            />
          ))}
        </div>
        <FeedbackState
          tone="success"
          title={node.mode === "stepIn" ? "Scene complete." : "Great conversation."}
          body={
            node.mode === "stepIn"
              ? "You used Notice, Interpret, Need, and Handle in one full conversation."
              : "You can ask, respond, and keep the conversation moving."
          }
        />
        <button className="dialogue-screen__continue" type="button" onClick={() => onCompleteDialogue(node.id, { type: "next" })}>
          {node.mode === "stepIn" ? "See Course Complete" : "Continue"}
          <IconArrowRight size={15} />
        </button>
      </div>
    );
  }

  const composerReady = selectedIds.length === (currentTurn?.exercise?.answerIds || []).length;

  return (
    <div className="dialogue-screen">
      <div className="dialogue-screen__top">
        <div className="dialogue-screen__stage">{node.mode === "stepIn" ? "Step In" : "Dialogue Practice"}</div>
        <div className="dialogue-screen__title">{node.title}</div>
        <div className="dialogue-screen__subtitle">{node.subtitle}</div>
      </div>
      <div className="dialogue-screen__stream">
        {streamBubbles.map((bubble, index) => (
          <DialogueBubble
            key={`${bubble.kind}-${index}`}
            speaker={bubble.kind === "system" ? "Barista" : "You"}
            text={bubble.text}
            kind={bubble.kind}
          />
        ))}
        {systemPending ? (
          <DialogueBubble speaker="Barista" text={currentTurn.text} kind="system" pending />
        ) : null}
      </div>
      {!systemPending ? (
        <DialogueComposer
          node={node}
          currentTurn={currentTurn}
          selectionChunks={selectedChunks}
          selectionIds={selectedIds}
          poolChunks={poolChunks}
          onSelectChunk={onSelectChunk}
          onRemoveChunk={onRemoveChunk}
          onReset={onReset}
          onHint={onHint}
          onPrimary={onPrimary}
          ready={composerReady}
          busy={busy}
          feedback={feedback}
        />
      ) : (
        <FeedbackState tone="info" title="Listening..." body="The reply is arriving." />
      )}
    </div>
  );
}

export function DeepModeApp() {
  const plan = useMemo(() => buildCoursePlan(deepModeCourse), []);
  const [session, setSession] = useState(() => loadSession(plan));
  const [activeIndex, setActiveIndex] = useState(session.activeIndex);
  const [transitionDirection, setTransitionDirection] = useState("forward");
  const [photoOpen, setPhotoOpen] = useState(false);
  const autoAdvanceRef = useRef(null);
  const loadingRef = useRef(null);

  const currentNode = plan.nodes[activeIndex] || plan.nodes[0];

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 3,
        activeIndex,
        nodeStates: session.nodeStates,
      }),
    );

    return undefined;
  }, [activeIndex, session.nodeStates]);

  useEffect(() => {
    if (currentNode.kind !== "loading" || (session.hydrated && session.activeIndex > 0)) {
      return undefined;
    }

    loadingRef.current = window.setTimeout(() => {
      goToIndex(plan.nodes.findIndex((node) => node.kind === "overview"), "forward");
      setSession((prev) => ({ ...prev, hydrated: true }));
    }, 1200);

    return () => {
      if (loadingRef.current) {
        window.clearTimeout(loadingRef.current);
      }
    };
  }, [currentNode.kind, plan.nodes, session.hydrated]);

  useEffect(() => {
    if (autoAdvanceRef.current) {
      window.clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
  }, [activeIndex]);

  function goToIndex(index, direction = "forward") {
    const safeIndex = Math.max(0, Math.min(index, plan.nodes.length - 1));
    setTransitionDirection(direction);
    setActiveIndex(safeIndex);
    setSession((prev) => ({ ...prev, activeIndex: safeIndex }));
  }

  function updateNodeState(nodeId, updater) {
    setSession((prev) => {
      const previous = prev.nodeStates[nodeId] || {};
      const next = typeof updater === "function" ? updater(previous) : { ...previous, ...updater };
      return {
        ...prev,
        nodeStates: {
          ...prev.nodeStates,
          [nodeId]: next,
        },
      };
    });
  }

  function currentModuleProgress(node = currentNode) {
    if (!node.moduleId || !plan.moduleIndices[node.moduleId]) {
      return "";
    }
    const indices = plan.moduleIndices[node.moduleId];
    const currentPosition = indices.indexOf(activeIndex);
    const total = plan.moduleTotals[node.moduleId] || 0;
    return total ? `${currentPosition + 1} / ${total}` : "";
  }

  function currentModuleId(node = currentNode) {
    return node.moduleId || null;
  }

  function getCompletedModules(node = currentNode) {
    const currentIndex = MODULES.findIndex((module) => module.id === node.moduleId);
    if (currentIndex < 0) {
      return [];
    }
    return MODULES.slice(0, currentIndex).map((module) => module.id);
  }

  function advance(direction = "forward", steps = 1) {
    goToIndex(activeIndex + steps, direction);
  }

  function retreat() {
    if (activeIndex <= plan.nodes.findIndex((node) => node.kind === "overview")) {
      return;
    }
    goToIndex(activeIndex - 1, "back");
  }

  function selectChunk(nodeId, chunk) {
    updateNodeState(nodeId, (state) => {
      const node = plan.nodes.find((item) => item.id === nodeId);
      const selectedIds = state.selectedIds || [];
      const answerLimit =
        node.kind === "dialogue"
          ? (getDialogueStateTurn(node, session.nodeStates)?.exercise?.answerIds || []).length
          : (node.exercise?.answerIds || []).length;

      if (selectedIds.includes(chunk.id)) {
        return state;
      }

      if (selectedIds.length >= answerLimit) {
        return state;
      }

      return {
        ...state,
        selectedIds: [...selectedIds, chunk.id],
        feedback: null,
      };
    });
  }

  function removeChunk(nodeId, chunk) {
    updateNodeState(nodeId, (state) => ({
      ...state,
      selectedIds: (state.selectedIds || []).filter((id) => id !== chunk.id),
      feedback: null,
    }));
  }

  function resetNode(nodeId) {
    const node = plan.nodes.find((item) => item.id === nodeId);
    updateNodeState(nodeId, node.kind === "dialogue" ? defaultDialogueState() : defaultExerciseState());
  }

  function hintNode(nodeId) {
    const node = plan.nodes.find((item) => item.id === nodeId);
    if (!node) return;
    const state = getNodeState(node, session.nodeStates);
    const answerIds =
      node.kind === "dialogue"
        ? getDialogueStateTurn(node, session.nodeStates)?.exercise?.answerIds || []
        : node.exercise?.answerIds || [];
    const firstAnswerId = answerIds[0];
    const selectedCount = state.selectedIds?.length || 0;
    const hintMessage =
      selectedCount === 0
        ? `Start with "${firstChunkText(node, firstAnswerId)}".`
        : node.phase === "focus"
          ? `Use "${node.coreExpression}".`
          : `Try removing the extra chunk and keep "${firstChunkText(node, firstAnswerId)}" first.`;

    updateNodeState(nodeId, (previous) => ({
      ...previous,
      hint: {
        kind: "hint",
        title: "Hint",
        body: hintMessage,
      },
    }));
  }

  function checkExercise(nodeId) {
    const node = plan.nodes.find((item) => item.id === nodeId);
    if (!node) return;
    const state = getNodeState(node, session.nodeStates);
    if (state.locked) return;

    const answerIds = node.exercise?.answerIds || [];
    if (!idsMatch(state.selectedIds || [], answerIds)) {
      const attempts = (state.attempts || 0) + 1;
      const secondHint =
        attempts >= 2
          ? {
              kind: "hint",
              title: "Try this",
              body:
                node.phase === "focus"
                  ? `The blank is "${node.coreExpression}".`
                  : `The first chunk should be "${firstChunkText(node, answerIds[0])}".`,
            }
          : null;

      updateNodeState(nodeId, {
        attempts,
        feedback: {
          kind: "error",
          title: node.feedback.error.title,
          body: secondHint ? `${node.feedback.error.body} ${secondHint.body}` : node.feedback.error.body,
        },
        hint: secondHint,
        locked: false,
      });
      return;
    }

    updateNodeState(nodeId, {
      attempts: (state.attempts || 0) + 1,
      feedback: {
        kind: "success",
        title: node.feedback.success.title,
        body: node.feedback.success.body,
      },
      locked: true,
      resolved: true,
    });

    autoAdvanceRef.current = window.setTimeout(() => {
      advance("forward", 1);
      updateNodeState(nodeId, {
        selectedIds: [],
        feedback: null,
        hint: null,
        locked: false,
        resolved: true,
      });
    }, 750);
  }

  function submitDialogue(nodeId) {
    const node = plan.nodes.find((item) => item.id === nodeId);
    if (!node) return;
    const state = getNodeState(node, session.nodeStates);
    if (state.locked) return;
    const turns = getDialogueTurns(node.dialogue);
    const turn = turns[state.turnIndex];
    if (!turn || turn.speaker !== "user") return;

    if (!idsMatch(state.selectedIds || [], turn.exercise?.answerIds || [])) {
      const attempts = (state.attempts || 0) + 1;
      const extraHint =
        attempts >= 2
          ? {
              kind: "hint",
              title: "Try this",
              body: `Start with "${firstChunkText({ exercise: turn.exercise }, turn.exercise?.answerIds?.[0])}".`,
            }
          : null;

      updateNodeState(nodeId, {
        attempts,
        feedback: {
          kind: "error",
          title: "Almost.",
          body: extraHint ? `Try the reply order again. ${extraHint.body}` : "Try the reply order again.",
        },
        hint: extraHint,
        locked: false,
      });
      return;
    }

    const newBubbles = [...(state.bubbles || []), { kind: "user", text: turn.targetText }];
    const nextTurnIndex = state.turnIndex + 1;
    updateNodeState(nodeId, {
      attempts: (state.attempts || 0) + 1,
      bubbles: newBubbles,
      selectedIds: [],
      feedback: {
        kind: "success",
        title: "Nice.",
        body: "Your line sounds natural.",
      },
      locked: true,
      resolved: nextTurnIndex >= turns.length,
      turnIndex: nextTurnIndex,
      hint: null,
    });
  }

  function advanceDialogueSystem(nodeId, bubble) {
    const node = plan.nodes.find((item) => item.id === nodeId);
    if (!node) return;
    const state = getNodeState(node, session.nodeStates);
    const turns = getDialogueTurns(node.dialogue);
    const currentTurn = turns[state.turnIndex];
    if (!currentTurn || currentTurn.speaker !== "system") return;

    const nextBubbles = [...(state.bubbles || []), { kind: "system", text: bubble.text }];
    updateNodeState(nodeId, {
      bubbles: nextBubbles,
      turnIndex: state.turnIndex + 1,
      locked: false,
      feedback: null,
      hint: null,
      selectedIds: [],
      resolved: state.turnIndex + 1 >= turns.length,
    });
  }

  function completeDialogue(nodeId, payload) {
    const node = plan.nodes.find((item) => item.id === nodeId);
    if (!node) return;
    const state = getNodeState(node, session.nodeStates);

    if (payload?.type === "system") {
      advanceDialogueSystem(nodeId, payload);
      return;
    }

    if (payload?.type === "next") {
      const nextIndex = activeIndex + 1;
      if (node.mode === "stepIn") {
        advance("forward", 1);
      } else {
        advance("forward", 1);
      }
      updateNodeState(nodeId, {
        locked: false,
        feedback: null,
        hint: null,
        resolved: true,
        selectedIds: [],
        turnIndex: state.turnIndex,
      });
    }
  }

  function onPrimary(node = currentNode) {
    if (node.kind === "exercise") {
      checkExercise(node.id);
      return;
    }
    if (node.kind === "dialogue") {
      submitDialogue(node.id);
      return;
    }
    if (node.kind === "taskIntro" || node.kind === "milestone") {
      advance("forward", 1);
    }
  }

  function onStartOverview() {
    goToIndex(plan.nodes.findIndex((node) => node.moduleId === "notice"), "forward");
  }

  function onReview() {
    goToIndex(plan.nodes.findIndex((node) => node.kind === "overview"), "back");
  }

  function onRetry() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setSession({
      activeIndex: 0,
      nodeStates: {},
      hydrated: false,
      version: 3,
    });
    goToIndex(0, "forward");
  }

  function backAction() {
    if (currentNode.kind === "overview") {
      onRetry();
      return;
    }
    const overviewIndex = plan.nodes.findIndex((node) => node.kind === "overview");
    if (activeIndex <= overviewIndex) {
      onRetry();
      return;
    }
    retreat();
  }

  const actions = {
    onStartOverview,
    onReview,
    onRetry,
    onSelectChunk: (chunk) => selectChunk(currentNode.id, chunk),
    onRemoveChunk: (chunk) => removeChunk(currentNode.id, chunk),
    onReset: () => resetNode(currentNode.id),
    onHint: () => hintNode(currentNode.id),
    onPrimary: () => onPrimary(currentNode),
    onCompleteDialogue: completeDialogue,
    chunkLookup: chunkMap(
      currentNode.kind === "dialogue"
        ? [
            ...((getDialogueStateTurn(currentNode, session.nodeStates)?.exercise?.chunks ||
              getDialogueStateTurn(currentNode, session.nodeStates)?.exercise?.choices ||
              []) ?? []),
            ...((getDialogueStateTurn(currentNode, session.nodeStates)?.exercise?.distractors || []) ?? []),
          ]
        : [
            ...((currentNode.exercise?.chunks || currentNode.exercise?.choices || []) ?? []),
            ...((currentNode.exercise?.distractors || []) ?? []),
          ],
    ),
    currentDialogueTurn: currentNode.kind === "dialogue" ? getDialogueStateTurn(currentNode, session.nodeStates) : null,
  };

  const moduleProgressLabel = currentModuleProgress(currentNode);
  const completedModules = getCompletedModules(currentNode);
  const screenKey = `${currentNode.id}-${transitionDirection}`;

  return (
    <div className="deepmode-app">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <div className="deepmode-shell">
        {currentNode.kind === "loading" ? null : currentNode.kind === "overview" ? null : currentNode.kind === "completion" ? null : (
          <DeepProgressHeader
            currentModuleId={currentModuleId(currentNode)}
            moduleProgressLabel={moduleProgressLabel}
            onBack={backAction}
            onPhotoClick={() => setPhotoOpen(true)}
            photoSrc="/deep-mode-default.jpg"
            completedModuleIds={completedModules}
          />
        )}

        <div className={`deepmode-stage deepmode-stage--${transitionDirection}`}>
          <div key={screenKey} className={`deepmode-screen deepmode-screen--${currentNode.kind}`}>
            {renderNode(currentNode, plan, session, actions)}
          </div>
        </div>
      </div>

      {photoOpen ? (
        <button type="button" className="photo-modal" onClick={() => setPhotoOpen(false)} aria-label="Close photo preview">
          <div className="photo-modal__panel" onClick={(event) => event.stopPropagation()}>
            <button className="photo-modal__close" type="button" onClick={() => setPhotoOpen(false)}>
              <IconX size={16} />
            </button>
            <img src="/deep-mode-default.jpg" alt="Selected photo preview" />
          </div>
        </button>
      ) : null}
    </div>
  );
}

function firstChunkText(node, answerId) {
  if (!node || !answerId) return "the first chunk";
  const exerciseChunks = node.exercise?.chunks || node.exercise?.choices || [];
  const chunk = exerciseChunks.find((item) => item.id === answerId);
  return chunk?.text || node.coreExpression || "the first chunk";
}
