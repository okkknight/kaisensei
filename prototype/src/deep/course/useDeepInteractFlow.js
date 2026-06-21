import { useEffect, useMemo, useState } from "react";
import { DEEP_COPY } from "../copy.js";
import { isDeepAnswerMatch } from "./deep-text.js";
import { joinDeepChunks, toggleDeepChunkSelection } from "./deep-flow-utils.js";

function uniqueChunks(items = []) {
  return [...new Set((Array.isArray(items) ? items : []).filter(Boolean))];
}

function buildInteractPages(taskPacks) {
  const pages = [];

  taskPacks.forEach((taskPack) => {
    const sections = {
      need: taskPack.need,
      handle: taskPack.handle,
    };
    const exampleLists = {
      need: [taskPack.need?.baseExample, ...(taskPack.need?.variations ?? [])].filter(Boolean),
      handle: [taskPack.handle?.baseExample, ...(taskPack.handle?.variations ?? [])].filter(Boolean),
    };
    const maxExampleCount = Math.max(exampleLists.need.length, exampleLists.handle.length);

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

    ["understand", "focus", "build"].forEach((pageType, phaseIndex) => {
      for (let exampleIndex = 0; exampleIndex < maxExampleCount; exampleIndex += 1) {
        ["need", "handle"].forEach((sectionKey) => {
          const section = sections[sectionKey];
          const example = exampleLists[sectionKey][exampleIndex];

          if (!section || !example) {
            return;
          }

          const stepPrefix = sectionKey === "need" ? "Need" : "Handle";

          if (pageType === "understand") {
            pages.push({
              id: `${taskPack.id}-${sectionKey}-${example.english}-understand`,
              kind: "exercise",
              pageType,
              title: section.coreExpression,
              stepLabel: `Step ${phaseIndex + 1} of 3`,
              instruction: DEEP_COPY.interactReorderInstruction,
              englishSentence: example.english,
              englishHighlight: example.understand?.highlight ?? section.coreExpression,
              chineseReference: example.chinese,
              bank: uniqueChunks([...(example.understand?.chunks ?? []), ...(example.understand?.distractors ?? [])]),
              answer: example.understand?.answer ?? [],
              moduleLabel: `${stepPrefix} · Understand`,
            });
          }

          if (pageType === "focus") {
            pages.push({
              id: `${taskPack.id}-${sectionKey}-${example.english}-focus`,
              kind: "exercise",
              pageType,
              title: section.coreExpression,
              stepLabel: `Step ${phaseIndex + 1} of 3`,
              instruction: DEEP_COPY.focusInstruction,
              sentenceWithBlanks: example.focus?.sentenceWithBlanks ?? "",
              chineseReference: example.chinese,
              bank: uniqueChunks([...(example.focus?.choices ?? []), ...(example.focus?.distractors ?? [])]),
              answer: example.focus?.answer ?? [],
              moduleLabel: `${stepPrefix} · Focus`,
            });
          }

          if (pageType === "build") {
            pages.push({
              id: `${taskPack.id}-${sectionKey}-${example.english}-build`,
              kind: "exercise",
              pageType,
              title: section.coreExpression,
              stepLabel: `Step ${phaseIndex + 1} of 3`,
              instruction: DEEP_COPY.buildInstruction,
              promptChinese: example.build?.promptChinese ?? "",
              chineseReference: example.chinese ?? "",
              bank: uniqueChunks([...(example.build?.chunks ?? []), ...(example.build?.distractors ?? [])]),
              answer: example.build?.answer ?? [],
              moduleLabel: `${stepPrefix} · Build`,
            });
          }
        });
      }
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

  useEffect(() => {
    setPageIndex(0);
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
  }, [pages]);

  const currentPage = pages[pageIndex] ?? null;
  const isMilestone = !currentPage;
  const progressPages = pages.filter((page) => page.kind !== "guide");
  const progressTotal = progressPages.length;
  const progressCurrent = currentPage && currentPage.kind !== "guide"
    ? progressPages.findIndex((page) => page.id === currentPage.id) + 1
    : 0;
  const selectionLimit = currentPage?.kind === "exercise" && currentPage.pageType === "focus" ? currentPage.answer.length : 0;
  const canAttempt = currentPage && currentPage.kind !== "guide" ? selectedChunks.length > 0 : false;

  function clearPendingAdvance() {
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
    setSelectedChunks((current) => toggleDeepChunkSelection(current, chunk, selectionLimit));
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
    if (!currentPage || !canAttempt) {
      return;
    }

    if (isDeepAnswerMatch(selectedChunks, currentPage.answer)) {
      setFeedback({
        tone: "success",
        title: DEEP_COPY.correct,
        body: currentPage.kind === "dialogue" ? "You replied naturally." : "You built the target expression.",
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
    currentPage,
    isMilestone,
    selectedChunks,
    feedback,
    progressCurrent,
    progressTotal,
    canAttempt,
    selectionLimit,
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

export { buildInteractPages };

export default useDeepInteractFlow;
