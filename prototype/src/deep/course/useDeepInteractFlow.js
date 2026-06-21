import { useEffect, useMemo, useRef, useState } from "react";
import { DEEP_COPY } from "../copy.js";
import { isDeepAnswerMatch } from "./deep-text.js";
import { joinDeepChunks } from "./deep-flow-utils.js";

function uniqueChunks(items = []) {
  return [...new Set((Array.isArray(items) ? items : []).filter(Boolean))];
}

function buildInteractPages(taskPacks) {
  const pages = [];

  taskPacks.forEach((taskPack) => {
    pages.push({
      id: `${taskPack.id}-guide`,
      kind: "guide",
      title: taskPack.taskTitle,
      scene: taskPack.scenePrompt,
      sceneChinese: taskPack.sceneDescriptionChinese ?? "",
      needExpression: taskPack.need.coreExpression,
      needMeaning: taskPack.need.meaningChinese,
      handleExpression: taskPack.handle.coreExpression,
      handleMeaning: taskPack.handle.meaningChinese,
    });

    ["need", "handle"].forEach((sectionKey) => {
      const section = taskPack[sectionKey];
      const examples = [section?.baseExample, ...(section?.variations ?? [])].filter(Boolean);
      const stepPrefix = sectionKey === "need" ? "Need" : "Handle";

      examples.forEach((example) => {
        pages.push({
          id: `${taskPack.id}-${sectionKey}-${example.english}-understand`,
          kind: "exercise",
          pageType: "understand",
          title: section.coreExpression,
          stepLabel: "Step 1 of 3",
          instruction: DEEP_COPY.interactReorderInstruction,
          englishSentence: example.english,
          englishHighlight: section.coreExpression,
          chineseReference: example.chinese,
          bank: uniqueChunks([...(example.understand?.chunks ?? []), ...(example.understand?.distractors ?? [])]),
          answer: example.understand?.answer ?? [],
          moduleLabel: `${stepPrefix} · Understand`,
        });

        pages.push({
          id: `${taskPack.id}-${sectionKey}-${example.english}-focus`,
          kind: "exercise",
          pageType: "focus",
          title: section.coreExpression,
          stepLabel: "Step 2 of 3",
          instruction: DEEP_COPY.focusInstruction,
          sentenceWithBlanks: example.focus?.sentenceWithBlanks ?? "",
          chineseReference: example.chinese,
          bank: uniqueChunks([...(example.focus?.choices ?? []), ...(example.focus?.distractors ?? [])]),
          answer: example.focus?.answer ?? [],
          moduleLabel: `${stepPrefix} · Focus`,
        });

        pages.push({
          id: `${taskPack.id}-${sectionKey}-${example.english}-build`,
          kind: "exercise",
          pageType: "build",
          title: section.coreExpression,
          stepLabel: "Step 3 of 3",
          instruction: DEEP_COPY.buildInstruction,
          promptChinese: example.build?.promptChinese ?? "",
          bank: uniqueChunks([...(example.build?.chunks ?? []), ...(example.build?.distractors ?? [])]),
          answer: example.build?.answer ?? [],
          moduleLabel: `${stepPrefix} · Build`,
        });
      });
    });

    const dialogue = taskPack?.dialogues?.[0];

    pages.push({
      id: `${taskPack.id}-dialogue-need`,
      kind: "dialogue",
      userPrompt: DEEP_COPY.dialogueNeedPrompt,
      scene: dialogue?.scene ?? taskPack.scenePrompt,
      sceneChinese: dialogue?.sceneDescriptionChinese ?? taskPack.sceneDescriptionChinese ?? "",
      history: [
        {
          speaker: "system",
          label: "System",
          text: dialogue?.openingLine ?? DEEP_COPY.dialogueNeedOpening,
        },
      ],
      bank: uniqueChunks([...(dialogue?.need?.chunks ?? []), ...(dialogue?.need?.distractors ?? [])]),
      answer: dialogue?.need?.answer ?? [],
    });

    pages.push({
      id: `${taskPack.id}-dialogue-handle`,
      kind: "dialogue",
      userPrompt: DEEP_COPY.dialogueHandlePrompt,
      scene: dialogue?.scene ?? taskPack.scenePrompt,
      sceneChinese: dialogue?.sceneDescriptionChinese ?? taskPack.sceneDescriptionChinese ?? "",
      history: [
        {
          speaker: "user",
          label: "You",
          text: joinDeepChunks(dialogue?.need?.answer ?? []),
        },
        {
          speaker: "system",
          label: "System",
          text: dialogue?.systemReply ?? "",
        },
      ],
      bank: uniqueChunks([...(dialogue?.handle?.chunks ?? []), ...(dialogue?.handle?.distractors ?? [])]),
      answer: dialogue?.handle?.answer ?? [],
    });
  });

  return pages;
}

function getHintMessage(page) {
  const firstChunk = Array.isArray(page?.answer) ? page.answer[0] : "";

  if (!firstChunk) {
    return "Try a smaller chunk first.";
  }

  if (page.kind === "dialogue") {
    return `Try "${firstChunk}" first.`;
  }

  if (page.pageType === "focus") {
    return `Look for the blank that matches "${firstChunk}".`;
  }

  if (page.pageType === "build") {
    return `Begin with "${firstChunk}".`;
  }

  return `Start with "${firstChunk}".`;
}

export function useDeepInteractFlow(taskPacks = []) {
  const safeTaskPacks = Array.isArray(taskPacks) ? taskPacks : [];
  const pages = useMemo(() => buildInteractPages(safeTaskPacks), [safeTaskPacks]);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedChunks, setSelectedChunks] = useState([]);
  const [feedback, setFeedback] = useState({ tone: "idle", title: "", body: "" });
  const autoAdvanceTimerRef = useRef(null);

  useEffect(() => {
    setPageIndex(0);
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
  }, [pages]);

  useEffect(
    () => () => {
      if (autoAdvanceTimerRef.current) {
        window.clearTimeout(autoAdvanceTimerRef.current);
      }
    },
    []
  );

  const currentPage = pages[pageIndex] ?? null;
  const isMilestone = !currentPage;
  const progressPages = pages.filter((page) => page.kind !== "guide");
  const progressTotal = progressPages.length;
  const progressCurrent = currentPage && currentPage.kind !== "guide"
    ? progressPages.findIndex((page) => page.id === currentPage.id) + 1
    : 0;
  const isReadyToCheck = currentPage && currentPage.kind !== "guide"
    ? currentPage.answer.length > 0 && selectedChunks.length === currentPage.answer.length
    : false;

  function clearPendingAdvance() {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }

  function reset() {
    clearPendingAdvance();
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
  }

  function back() {
    clearPendingAdvance();

    if (pageIndex === 0) {
      return false;
    }

    setPageIndex((current) => current - 1);
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
    return true;
  }

  function toggleChunk(chunk) {
    clearPendingAdvance();
    setSelectedChunks((current) => {
      const exists = current.some((item) => item === chunk);
      return exists ? current.filter((item) => item !== chunk) : [...current, chunk];
    });
    setFeedback({ tone: "idle", title: "", body: "" });
  }

  function hint() {
    if (!currentPage) {
      return;
    }

    clearPendingAdvance();
    setFeedback({
      tone: "hinted",
      title: DEEP_COPY.hint,
      body: getHintMessage(currentPage),
    });
  }

  function next() {
    clearPendingAdvance();
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
    setPageIndex((current) => current + 1);
  }

  function check() {
    if (!currentPage || !isReadyToCheck) {
      return;
    }

    if (isDeepAnswerMatch(selectedChunks, currentPage.answer)) {
      setFeedback({
        tone: "success",
        title: DEEP_COPY.correct,
        body: currentPage.kind === "dialogue" ? "You replied naturally." : "You built the target expression.",
      });
      autoAdvanceTimerRef.current = window.setTimeout(() => {
        next();
      }, 650);
      return;
    }

    setFeedback({
      tone: "warning",
      title: DEEP_COPY.incorrect,
      body: "Try arranging the chunks in a more natural order.",
    });
  }

  return {
    currentPage,
    isMilestone,
    selectedChunks,
    feedback,
    progressCurrent,
    progressTotal,
    isReadyToCheck,
    reset,
    back,
    toggleChunk,
    hint,
    check,
    next,
    needItems: safeTaskPacks.map((taskPack) => ({
      title: taskPack?.need?.coreExpression ?? "",
      body: taskPack?.need?.meaningChinese ?? "",
    })),
    handleItems: safeTaskPacks.map((taskPack) => ({
      title: taskPack?.handle?.coreExpression ?? "",
      body: taskPack?.handle?.meaningChinese ?? "",
    })),
  };
}

export default useDeepInteractFlow;
