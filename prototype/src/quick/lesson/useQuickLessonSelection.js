import { useEffect, useState } from "react";
import { QUICK_STEP_ORDER } from "./lesson-state.js";
import { buildHint, joinChunkText, normalizeText, shuffleChunks } from "./lesson-helpers.js";

export function useQuickLessonSelection({ lesson, onRetakePhoto } = {}) {
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

  function handleBack(step) {
    const index = QUICK_STEP_ORDER.indexOf(step);
    if (index <= 0) {
      onRetakePhoto?.();
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

    onRetakePhoto?.();
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

  return {
    activeStep,
    buildSelectedChunks,
    useSelectedChunks,
    buildFeedback,
    useFeedback,
    buildIsSolved,
    useIsSolved,
    buildBank,
    useBank,
    handleBack,
    handleContinue,
    handleBuildToggle,
    handleBuildReset: () => {
      setBuildSelectedIds([]);
      setBuildFeedback({
        tone: "neutral",
        title: "Reset",
        body: "Start again from the chunks above.",
      });
    },
    handleUseToggle,
    handleUseReset: () => {
      setUseSelectedIds([]);
      setUseFeedback({
        tone: "neutral",
        title: "Reset",
        body: "Try a different answer order.",
      });
    },
    handleBuildCheck,
    handleUseCheck,
  };
}

export default useQuickLessonSelection;
