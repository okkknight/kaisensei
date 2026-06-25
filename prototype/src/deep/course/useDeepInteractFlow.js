import { useEffect, useMemo, useRef, useState } from "react";
import { DEEP_COPY } from "../copy.js";
import { isDeepAnswerMatch } from "./deep-text.js";
import { buildShuffledChunkBank, joinDeepChunks, toggleDeepChunkSelection } from "./deep-flow-utils.js";

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
      sceneChinese: taskPack.scenePromptChinese ?? "",
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
              englishHighlight: section.coreExpression,
              chineseReference: example.chinese,
              bank: buildShuffledChunkBank(
                [...(example.understand?.chunks ?? []), ...(example.understand?.distractors ?? [])],
                `${taskPack.id}:${sectionKey}:${example.english}:understand`
              ),
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
              bank: buildShuffledChunkBank(
                [...(example.focus?.choices ?? []), ...(example.focus?.distractors ?? [])],
                `${taskPack.id}:${sectionKey}:${example.english}:focus`
              ),
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
              bank: buildShuffledChunkBank(
                [...(example.build?.chunks ?? []), ...(example.build?.distractors ?? [])],
                `${taskPack.id}:${sectionKey}:${example.english}:build`
              ),
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
      dialogueRole: "need",
      userPrompt: "先说你的需要",
      showHistory: false,
      scene: dialogue?.scene ?? taskPack.scenePrompt,
      sceneChinese: dialogue?.scenePromptChinese ?? taskPack.scenePromptChinese ?? "",
      systemReply: dialogue?.systemReply ?? "",
      history: [
        {
          speaker: "system",
          label: "System",
          text: dialogue?.openingLine ?? DEEP_COPY.dialogueNeedOpening,
        },
      ],
      bank: buildShuffledChunkBank(
        [...(dialogue?.need?.chunks ?? []), ...(dialogue?.need?.distractors ?? [])],
        `${taskPack.id}:dialogue:need`
      ),
      answer: dialogue?.need?.answer ?? [],
    });

    pages.push({
      id: `${taskPack.id}-dialogue-handle`,
      kind: "dialogue",
      dialogueRole: "handle",
      userPrompt: "自然接一句",
      scene: dialogue?.scene ?? taskPack.scenePrompt,
      sceneChinese: dialogue?.scenePromptChinese ?? taskPack.scenePromptChinese ?? "",
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
      bank: buildShuffledChunkBank(
        [...(dialogue?.handle?.chunks ?? []), ...(dialogue?.handle?.distractors ?? [])],
        `${taskPack.id}:dialogue:handle`
      ),
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

export function useDeepInteractFlow(taskPacks = [], initialPageIndex = 0) {
  const safeTaskPacks = Array.isArray(taskPacks) ? taskPacks : [];
  const pages = useMemo(() => buildInteractPages(safeTaskPacks), [safeTaskPacks]);
  const [pageIndex, setPageIndex] = useState(() => Math.max(0, initialPageIndex));
  const [selectedChunks, setSelectedChunks] = useState([]);
  const [feedback, setFeedback] = useState({ tone: "idle", title: "", body: "" });
  const [liveTurns, setLiveTurns] = useState([]);
  const timersRef = useRef([]);

  useEffect(() => {
    const maxIndex = Math.max(0, pages.length - 1);
    setPageIndex(Math.min(Math.max(0, initialPageIndex), maxIndex));
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
    setLiveTurns([]);
  }, [pages, initialPageIndex]);

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => {
        window.clearTimeout(timer);
      });
      timersRef.current = [];
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
  const selectionLimit = currentPage?.kind === "exercise" && currentPage.pageType === "focus" ? currentPage.answer.length : 0;
  const canAttempt = currentPage && currentPage.kind !== "guide" ? selectedChunks.length > 0 : false;
  const isPlaybackActive = liveTurns.length > 0;

  function clearPendingAdvance() {
    timersRef.current.forEach((timer) => {
      window.clearTimeout(timer);
    });
    timersRef.current = [];
  }

  function reset() {
    clearPendingAdvance();
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
    setLiveTurns([]);
  }

  function back() {
    clearPendingAdvance();

    if (pageIndex === 0) {
      return false;
    }

    setPageIndex((current) => current - 1);
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
    setLiveTurns([]);
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
    setLiveTurns([]);
    setPageIndex((current) => current + 1);
  }

  function check() {
    if (!currentPage || !canAttempt) {
      return;
    }

    if (isDeepAnswerMatch(selectedChunks, currentPage.answer)) {
      const answerText = joinDeepChunks(selectedChunks);

      if (currentPage.kind === "dialogue") {
        clearPendingAdvance();
        setSelectedChunks([]);
        setFeedback({ tone: "idle", title: "", body: "" });

        if (currentPage.dialogueRole === "need") {
          const userTurn = {
            speaker: "user",
            label: "You",
            text: answerText,
            checked: true,
          };

          setLiveTurns([
            userTurn,
            {
              speaker: "system",
              label: "System",
              text: "",
              isTyping: true,
            },
          ]);

          const typingTimer = window.setTimeout(() => {
            setLiveTurns([
              userTurn,
              {
                speaker: "system",
                label: "System",
                text: currentPage.systemReply || "",
              },
            ]);
          }, 1000);

          const advanceTimer = window.setTimeout(() => {
            next();
          }, 1800);

          timersRef.current = [typingTimer, advanceTimer];
          return;
        }

        setLiveTurns([
          {
            speaker: "user",
            label: "You",
            text: answerText,
            checked: true,
          },
        ]);

        const advanceTimer = window.setTimeout(() => {
          next();
        }, 650);

        timersRef.current = [advanceTimer];
        return;
      }

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
    liveTurns,
    isPlaybackActive,
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
