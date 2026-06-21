import { useEffect, useMemo, useRef, useState } from "react";
import { DEEP_COPY } from "../copy.js";
import { isDeepAnswerMatch } from "./deep-text.js";
import { getExampleVariants, joinDeepChunks } from "./deep-flow-utils.js";

const INTERACT_STAGES = [
  "guide",
  "needUnderstand",
  "needFocus",
  "needBuild",
  "handleUnderstand",
  "handleFocus",
  "handleBuild",
  "dialogueNeed",
  "dialogueHandle",
  "milestone",
];

function getStageLabel(stage) {
  if (stage === "guide") return "Task Pack";
  if (stage === "needUnderstand") return "Need · Understand";
  if (stage === "needFocus") return "Need · Focus";
  if (stage === "needBuild") return "Need · Build";
  if (stage === "handleUnderstand") return "Handle · Understand";
  if (stage === "handleFocus") return "Handle · Focus";
  if (stage === "handleBuild") return "Handle · Build";
  if (stage === "dialogueNeed") return "Dialogue Practice · Need";
  if (stage === "dialogueHandle") return "Dialogue Practice · Handle";
  return "Milestone";
}

function getSectionKey(stage) {
  if (stage.startsWith("need")) return "need";
  if (stage.startsWith("handle")) return "handle";
  return "";
}

function getExercisePhase(stage) {
  if (stage.endsWith("Understand")) return "understand";
  if (stage.endsWith("Focus")) return "focus";
  if (stage.endsWith("Build")) return "build";
  return "understand";
}

function getExerciseData(example, stage, title, subtitle) {
  const phase = getExercisePhase(stage);

  if (!example) {
    return {
      title,
      subtitle,
      prompt: "",
      hint: "",
      bank: [],
      answer: [],
    };
  }

  if (phase === "understand") {
    return {
      title,
      subtitle,
      prompt: example.english,
      hint: example.chinese,
      bank: example.understand?.chunks ?? [],
      answer: example.understand?.answer ?? [],
    };
  }

  if (phase === "focus") {
    return {
      title,
      subtitle,
      prompt: example.focus?.sentenceWithBlanks ?? "",
      hint: example.chinese,
      bank: example.focus?.choices ?? [],
      answer: example.focus?.answer ?? [],
    };
  }

  return {
    title,
    subtitle,
    prompt: example.build?.promptChinese ?? "",
    hint: example.chinese,
    bank: example.build?.chunks ?? [],
    answer: example.build?.answer ?? [],
  };
}

function getHintMessage(stage, answer) {
  const firstChunk = Array.isArray(answer) ? answer[0] : "";

  if (!firstChunk) {
    return "Try a smaller chunk first.";
  }

  if (stage === "needUnderstand" || stage === "handleUnderstand") {
    return `Start with "${firstChunk}".`;
  }

  if (stage === "needFocus" || stage === "handleFocus") {
    return `Look for the blank that matches "${firstChunk}".`;
  }

  if (stage === "needBuild" || stage === "handleBuild") {
    return `Begin with "${firstChunk}".`;
  }

  if (stage === "dialogueNeed" || stage === "dialogueHandle") {
    return `Try "${firstChunk}" first.`;
  }

  return `Start with "${firstChunk}".`;
}

export function useDeepInteractFlow(taskPacks = []) {
  const safeTaskPacks = Array.isArray(taskPacks) ? taskPacks : [];
  const [taskIndex, setTaskIndex] = useState(0);
  const [stage, setStage] = useState("guide");
  const [needExampleIndex, setNeedExampleIndex] = useState(0);
  const [handleExampleIndex, setHandleExampleIndex] = useState(0);
  const [selectedChunks, setSelectedChunks] = useState([]);
  const [feedback, setFeedback] = useState({ tone: "idle", title: "", body: "" });
  const [dialogueHistory, setDialogueHistory] = useState([]);
  const autoAdvanceTimerRef = useRef(null);

  const taskPack = safeTaskPacks[taskIndex] ?? null;
  const needExamples = useMemo(() => getExampleVariants(taskPack?.need), [taskPack]);
  const handleExamples = useMemo(() => getExampleVariants(taskPack?.handle), [taskPack]);
  const needExample = needExamples[needExampleIndex] ?? null;
  const handleExample = handleExamples[handleExampleIndex] ?? null;
  const dialogue = taskPack?.dialogues?.[0] ?? null;
  const isNeedStage = stage.startsWith("need");
  const isHandleStage = stage.startsWith("handle");
  const isExerciseStage = isNeedStage || isHandleStage;
  const stageLabel = getStageLabel(stage);
  const stepLabel = stage === "needUnderstand"
    ? "Step 1 of 3"
    : stage === "needFocus"
      ? "Step 2 of 3"
      : stage === "needBuild"
        ? "Step 3 of 3"
        : stage === "handleUnderstand"
          ? "Step 1 of 3"
          : stage === "handleFocus"
            ? "Step 2 of 3"
            : stage === "handleBuild"
              ? "Step 3 of 3"
              : "";

  const exerciseData = useMemo(() => {
    if (!isExerciseStage) {
      return null;
    }

    const example = isNeedStage ? needExample : handleExample;
    const title = isNeedStage ? taskPack?.need?.coreExpression ?? "Need" : taskPack?.handle?.coreExpression ?? "Handle";
    const subtitle = isNeedStage ? taskPack?.need?.meaningChinese ?? "" : taskPack?.handle?.meaningChinese ?? "";

    return getExerciseData(example, stage, title, subtitle);
  }, [handleExample, isExerciseStage, isNeedStage, needExample, stage, taskPack]);

  const dialogueData = useMemo(() => {
    if (stage !== "dialogueNeed" && stage !== "dialogueHandle") {
      return null;
    }

    if (!dialogue) {
      return {
        title: taskPack?.taskTitle ?? "Interact",
        subtitle: taskPack?.scenePrompt ?? "",
        scene: taskPack?.scenePrompt ?? "",
        prompt: stage === "dialogueNeed" ? DEEP_COPY.dialogueNeedPrompt : DEEP_COPY.dialogueHandlePrompt,
        hint: "",
        bank: [],
        answer: [],
      };
    }

    if (stage === "dialogueNeed") {
      return {
        title: taskPack?.taskTitle ?? "Interact",
        subtitle: taskPack?.scenePrompt ?? "",
        scene: dialogue.scene,
        prompt: DEEP_COPY.dialogueNeedPrompt,
        hint: taskPack?.need?.meaningChinese ?? "",
        bank: [...(dialogue.need?.chunks ?? []), ...(dialogue.need?.distractors ?? [])],
        answer: dialogue.need?.answer ?? [],
      };
    }

    return {
      title: taskPack?.taskTitle ?? "Interact",
      subtitle: taskPack?.scenePrompt ?? "",
      scene: dialogue.scene,
      prompt: DEEP_COPY.dialogueHandlePrompt,
      hint: taskPack?.handle?.meaningChinese ?? "",
      bank: [...(dialogue.handle?.chunks ?? []), ...(dialogue.handle?.distractors ?? [])],
      answer: dialogue.handle?.answer ?? [],
    };
  }, [dialogue, stage, taskPack]);

  const bank = exerciseData?.bank ?? dialogueData?.bank ?? [];
  const answer = exerciseData?.answer ?? dialogueData?.answer ?? [];
  const title = exerciseData?.title ?? dialogueData?.title ?? "Interact";
  const subtitle = exerciseData?.subtitle ?? dialogueData?.subtitle ?? "";
  const prompt = exerciseData?.prompt ?? dialogueData?.prompt ?? "";
  const hint = exerciseData?.hint ?? dialogueData?.hint ?? "";
  const scene = dialogueData?.scene ?? taskPack?.scenePrompt ?? "";
  const introCards = useMemo(() => {
    if (stage === "dialogueNeed" || stage === "dialogueHandle") {
      return [
        {
          label: "Task",
          title: taskPack?.taskTitle ?? "Interact",
          body: taskPack?.scenePrompt ?? "",
          caption: taskPack?.need?.coreExpression && taskPack?.handle?.coreExpression
            ? `${taskPack.need.coreExpression} · ${taskPack.handle.coreExpression}`
            : "",
        },
      ];
    }

    return [];
  }, [stage, taskPack]);

  function clearSelection() {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
  }

  function reset() {
    clearSelection();
    if (stage === "dialogueHandle" || stage === "dialogueNeed") {
      return;
    }
  }

  function revealHint() {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setFeedback({
      tone: "hinted",
      title: DEEP_COPY.hint,
      body: getHintMessage(stage, answer),
    });
  }

  function toggleChunk(chunk) {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setSelectedChunks((current) => {
      const exists = current.some((item) => item === chunk);
      return exists ? current.filter((item) => item !== chunk) : [...current, chunk];
    });
    setFeedback({ tone: "idle", title: "", body: "" });
  }

  function startPractice() {
    clearSelection();
    setStage("needUnderstand");
  }

  function check() {
    if (selectedChunks.length === 0) {
      return;
    }

    if (isDeepAnswerMatch(selectedChunks, answer)) {
      setFeedback({
        tone: "success",
        title: DEEP_COPY.correct,
        body:
          stage === "dialogueNeed"
            ? "You asked for what you needed."
            : stage === "dialogueHandle"
              ? "You replied naturally."
              : "You built the target expression.",
      });
      autoAdvanceTimerRef.current = window.setTimeout(() => {
        advance();
      }, 650);
      return;
    }

    setFeedback({
      tone: "warning",
      title: DEEP_COPY.incorrect,
      body: "Try arranging the chunks in a more natural order.",
    });
  }

  useEffect(
    () => () => {
      if (autoAdvanceTimerRef.current) {
        window.clearTimeout(autoAdvanceTimerRef.current);
      }
    },
    []
  );

  function advance() {
    clearSelection();

    if (stage === "guide") {
      setStage("needUnderstand");
      return;
    }

    if (stage === "needUnderstand") {
      setStage("needFocus");
      return;
    }

    if (stage === "needFocus") {
      setStage("needBuild");
      return;
    }

    if (stage === "needBuild") {
      if (needExampleIndex + 1 < needExamples.length) {
        setNeedExampleIndex((current) => current + 1);
        setStage("needUnderstand");
        return;
      }

      setHandleExampleIndex(0);
      setStage("handleUnderstand");
      return;
    }

    if (stage === "handleUnderstand") {
      setStage("handleFocus");
      return;
    }

    if (stage === "handleFocus") {
      setStage("handleBuild");
      return;
    }

    if (stage === "handleBuild") {
      if (handleExampleIndex + 1 < handleExamples.length) {
        setHandleExampleIndex((current) => current + 1);
        setStage("handleUnderstand");
        return;
      }

      setDialogueHistory([]);
      setStage("dialogueNeed");
      return;
    }

    if (stage === "dialogueNeed") {
      if (!dialogue) {
        setStage("dialogueHandle");
        return;
      }

      setDialogueHistory([
        { speaker: "user", text: joinDeepChunks(dialogue.need?.answer ?? []) },
        { speaker: "system", text: dialogue.systemReply ?? "" },
      ]);
      setStage("dialogueHandle");
      return;
    }

    if (stage === "dialogueHandle") {
      if (taskIndex + 1 < safeTaskPacks.length) {
        setTaskIndex((current) => current + 1);
        setNeedExampleIndex(0);
        setHandleExampleIndex(0);
        setDialogueHistory([]);
        setStage("guide");
        return;
      }

      setStage("milestone");
    }
  }

  function getFooterMode() {
    if (stage === "guide") {
      return "start";
    }

    return feedback.tone === "success" ? "continue" : "check";
  }

  return {
    stage,
    stageLabel,
    stepLabel,
    taskIndex,
    taskPack,
    taskTotal: safeTaskPacks.length,
    exerciseData,
    dialogueData,
    introCards,
    dialogueHistory,
    bank,
    answer,
    title,
    subtitle,
    prompt,
    hint,
    scene,
    selectedChunks,
    feedback,
    footerMode: getFooterMode(),
    startPractice,
    toggleChunk,
    reset,
    hint: revealHint,
    check,
    advance,
    setStage,
    safeTaskPacks,
  };
}

export default useDeepInteractFlow;
