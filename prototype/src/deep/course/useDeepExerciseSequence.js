import { useEffect, useMemo, useRef, useState } from "react";
import { DEEP_COPY } from "../copy.js";
import { isDeepAnswerMatch } from "./deep-text.js";

const stageOrder = ["understand", "focus", "build", "quickResponse", "milestone"];

function getExerciseStageLabel(stage) {
  if (stage === "understand") return "Understand";
  if (stage === "focus") return "Focus";
  if (stage === "build") return "Build";
  if (stage === "quickResponse") return "Quick Response";
  return "Milestone";
}

function getPackStageData(pack, stage) {
  if (stage === "understand") {
    return {
      title: pack.coreExpression,
      subtitle: pack.meaningChinese,
      prompt: pack.baseExample.english,
      hint: pack.baseExample.chinese,
      bank: pack.baseExample.understand.chunks,
      answer: pack.baseExample.understand.answer,
      distractors: pack.baseExample.understand.distractors || [],
    };
  }

  if (stage === "focus") {
    return {
      title: pack.coreExpression,
      subtitle: pack.meaningChinese,
      prompt: pack.baseExample.focus.sentenceWithBlanks,
      hint: pack.baseExample.chinese,
      bank: pack.baseExample.focus.choices,
      answer: pack.baseExample.focus.answer,
      distractors: pack.baseExample.focus.distractors || [],
    };
  }

  if (stage === "build") {
    return {
      title: pack.coreExpression,
      subtitle: pack.meaningChinese,
      prompt: pack.baseExample.build.promptChinese,
      hint: pack.baseExample.chinese,
      bank: pack.baseExample.build.chunks,
      answer: pack.baseExample.build.answer,
      distractors: pack.baseExample.build.distractors || [],
    };
  }

  const quickResponse = pack.quickResponses[0];
  return {
    title: pack.coreExpression,
    subtitle: pack.meaningChinese,
    prompt: quickResponse.question,
    hint: "",
    bank: quickResponse.chunks,
    answer: quickResponse.answer,
    distractors: quickResponse.distractors || [],
  };
}

function getHintMessage(stage, answer) {
  const firstChunk = Array.isArray(answer) ? answer[0] : "";

  if (!firstChunk) {
    return "Try a smaller chunk first.";
  }

  if (stage === "understand") {
    return `Start with "${firstChunk}".`;
  }

  if (stage === "focus") {
    return `Look for the blank that matches "${firstChunk}".`;
  }

  if (stage === "build") {
    return `Begin with "${firstChunk}".`;
  }

  return `Try "${firstChunk}" first.`;
}

export function useDeepExerciseSequence(packs = []) {
  const safePacks = Array.isArray(packs) && packs.length > 0 ? packs : [];
  const [progress, setProgress] = useState({ packIndex: 0, stage: "understand" });
  const [exampleIndex, setExampleIndex] = useState(0);
  const [quickResponseIndex, setQuickResponseIndex] = useState(0);
  const [selectedChunks, setSelectedChunks] = useState([]);
  const [feedback, setFeedback] = useState({
    tone: "idle",
    title: "",
    body: "",
  });
  const autoAdvanceTimerRef = useRef(null);

  const currentPack = safePacks[progress.packIndex] ?? null;
  const currentExamples = useMemo(() => {
    if (!currentPack) {
      return [];
    }

    return [currentPack.baseExample, ...(currentPack.variations ?? [])].filter(Boolean);
  }, [currentPack]);
  const currentExample = currentExamples[exampleIndex] ?? null;
  const currentQuickResponses = currentPack?.quickResponses ?? [];
  const currentQuickResponse = currentQuickResponses[quickResponseIndex] ?? currentQuickResponses[0] ?? null;
  const currentStageData = useMemo(() => {
    if (!currentPack) {
      return {
        title: "",
        subtitle: "",
        prompt: "",
        hint: "",
        bank: [],
        answer: [],
        distractors: [],
      };
    }

    if (progress.stage === "quickResponse") {
      return getPackStageData(
        {
          coreExpression: currentPack.coreExpression,
          meaningChinese: currentPack.meaningChinese,
          quickResponses: [currentQuickResponse].filter(Boolean),
        },
        progress.stage
      );
    }

    if (currentExample) {
      return getPackStageData(
        {
          coreExpression: currentPack.coreExpression,
          meaningChinese: currentPack.meaningChinese,
          baseExample: currentExample,
          quickResponses: currentPack.quickResponses,
        },
        progress.stage
      );
    }

    return {
      title: "",
      subtitle: "",
      prompt: "",
      hint: "",
      bank: [],
      answer: [],
      distractors: [],
    };
  }, [currentExample, currentPack, currentQuickResponse, progress.stage]);

  const bank = currentStageData?.bank ?? [];
  const answer = currentStageData?.answer ?? [];
  const solved = progress.stage === "milestone";
  const currentStageLabel = getExerciseStageLabel(progress.stage);
  const stepLabel = progress.stage === "understand"
    ? "Step 1 of 3"
    : progress.stage === "focus"
      ? "Step 2 of 3"
      : progress.stage === "build"
        ? "Step 3 of 3"
        : "";

  function reset() {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
  }

  function hint() {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setFeedback({
      tone: "hinted",
      title: DEEP_COPY.hint,
      body: getHintMessage(progress.stage, answer),
    });
  }

  function toggleChunk(chunk) {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setSelectedChunks((current) => {
      const exists = current.some((item) => item === chunk);
      if (exists) {
        return current.filter((item) => item !== chunk);
      }

      return [...current, chunk];
    });
    setFeedback({ tone: "idle", title: "", body: "" });
  }

  function advance() {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });

    if (progress.stage === "understand") {
      setProgress((current) => ({ ...current, stage: "focus" }));
      return;
    }

    if (progress.stage === "focus") {
      setProgress((current) => ({ ...current, stage: "build" }));
      return;
    }

    if (progress.stage === "build") {
      if (exampleIndex + 1 < currentExamples.length) {
        setExampleIndex((index) => index + 1);
        setProgress((current) => ({ ...current, stage: "understand" }));
        return;
      }

      setQuickResponseIndex(0);
      setProgress((current) => ({ ...current, stage: "quickResponse" }));
      return;
    }

    if (progress.stage === "quickResponse") {
      if (quickResponseIndex + 1 < currentQuickResponses.length) {
        setQuickResponseIndex((index) => index + 1);
        return;
      }

      if (progress.packIndex + 1 < safePacks.length) {
        setExampleIndex(0);
        setQuickResponseIndex(0);
        setProgress((current) => ({ packIndex: current.packIndex + 1, stage: "understand" }));
        return;
      }

      setProgress((current) => ({ ...current, stage: "milestone" }));
      return;
    }

    setProgress((current) => ({ ...current, stage: "milestone" }));
  }

  function check() {
    if (selectedChunks.length === 0) {
      return;
    }

    if (isDeepAnswerMatch(selectedChunks, answer)) {
      setFeedback({
        tone: "success",
        title: DEEP_COPY.correct,
        body: currentStageLabel === "Quick Response" ? "You handled the reply." : "You built the target expression.",
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

  return {
    packIndex: progress.packIndex,
    currentPack,
    currentStageData,
    currentStageLabel,
    stepLabel,
    stage: progress.stage,
    bank,
    answer,
    selectedChunks,
    feedback,
    solved,
    reset,
    hint,
    toggleChunk,
    check,
    advance,
  };
}
