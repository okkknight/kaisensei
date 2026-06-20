import { useMemo, useState } from "react";
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
    title: quickResponse.question,
    subtitle: pack.meaningChinese,
    prompt: quickResponse.question,
    hint: pack.meaningChinese,
    bank: quickResponse.chunks,
    answer: quickResponse.answer,
    distractors: quickResponse.distractors || [],
  };
}

export function useDeepExerciseSequence(packs = []) {
  const safePacks = Array.isArray(packs) && packs.length > 0 ? packs : [];
  const [progress, setProgress] = useState({ packIndex: 0, stage: "understand" });
  const [selectedChunks, setSelectedChunks] = useState([]);
  const [feedback, setFeedback] = useState({
    tone: "idle",
    title: "",
    body: "",
  });

  const currentPack = safePacks[progress.packIndex] ?? null;
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

    return getPackStageData(currentPack, progress.stage);
  }, [currentPack, progress.stage]);

  const bank = currentStageData?.bank ?? [];
  const answer = currentStageData?.answer ?? [];
  const solved = progress.stage === "milestone";
  const currentStageLabel = getExerciseStageLabel(progress.stage);

  function reset() {
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
  }

  function toggleChunk(chunk) {
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
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });

    setProgress((current) => {
      if (current.stage === "understand") return { ...current, stage: "focus" };
      if (current.stage === "focus") return { ...current, stage: "build" };
      if (current.stage === "build") return { ...current, stage: "quickResponse" };
      if (current.stage === "quickResponse") {
        if (current.packIndex + 1 < safePacks.length) {
          return { packIndex: current.packIndex + 1, stage: "understand" };
        }
        return { ...current, stage: "milestone" };
      }
      return { ...current, stage: "milestone" };
    });
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
      return;
    }

    setFeedback({
      tone: "warning",
      title: DEEP_COPY.incorrect,
      body: "Try arranging the chunks in a more natural order.",
    });
  }

  return {
    packIndex: progress.packIndex,
    currentPack,
    currentStageData,
    currentStageLabel,
    stage: progress.stage,
    bank,
    answer,
    selectedChunks,
    feedback,
    solved,
    reset,
    toggleChunk,
    check,
    advance,
  };
}
