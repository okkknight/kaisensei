import { useEffect, useMemo, useState } from "react";
import { DEEP_COPY } from "../copy.js";
import { isDeepAnswerMatch } from "./deep-text.js";
import { toggleDeepChunkSelection } from "./deep-flow-utils.js";

function uniqueChunks(items = []) {
  return [...new Set((Array.isArray(items) ? items : []).filter(Boolean))];
}

function getHintMessage(kind, answer) {
  const firstChunk = Array.isArray(answer) ? answer[0] : "";

  if (!firstChunk) {
    return "Try a smaller chunk first.";
  }

  if (kind === "understand") {
    return `Start with "${firstChunk}".`;
  }

  if (kind === "focus") {
    return `Look for the blank that matches "${firstChunk}".`;
  }

  if (kind === "build") {
    return `Begin with "${firstChunk}".`;
  }

  return `Try "${firstChunk}" first.`;
}

function buildExercisePages(packs, moduleKey) {
  const packedExamples = (Array.isArray(packs) ? packs : []).map((pack) => ({
    pack,
    examples: [pack?.baseExample, ...(pack?.variations ?? [])].filter(Boolean),
  }));

  function makeUnderstandPage(pack, example) {
    return {
      id: `${pack.id}-${example.english}-understand`,
      kind: "understand",
      label: pack.coreExpression,
      stepLabel: "Step 1 of 3",
      instruction: moduleKey === "interact" ? DEEP_COPY.interactReorderInstruction : DEEP_COPY.reorderInstruction,
      englishSentence: example.english,
      speakText: example.english,
      englishHighlight: pack.coreExpression,
      chineseReference: example.chinese,
      bank: uniqueChunks([...(example.understand?.chunks ?? []), ...(example.understand?.distractors ?? [])]),
      answer: example.understand?.answer ?? [],
    };
  }

  function makeFocusPage(pack, example) {
    return {
      id: `${pack.id}-${example.english}-focus`,
      kind: "focus",
      label: pack.coreExpression,
      stepLabel: "Step 2 of 3",
      instruction: DEEP_COPY.focusInstruction,
      sentenceWithBlanks: example.focus?.sentenceWithBlanks ?? "",
      speakText: example.english,
      chineseReference: example.chinese,
      bank: uniqueChunks([...(example.focus?.choices ?? []), ...(example.focus?.distractors ?? [])]),
      answer: example.focus?.answer ?? [],
    };
  }

  function makeBuildPage(pack, example) {
    return {
      id: `${pack.id}-${example.english}-build`,
      kind: "build",
      label: pack.coreExpression,
      stepLabel: "Step 3 of 3",
      instruction: DEEP_COPY.buildInstruction,
      promptChinese: example.build?.promptChinese ?? "",
      chineseReference: example.chinese ?? "",
      bank: uniqueChunks([...(example.build?.chunks ?? []), ...(example.build?.distractors ?? [])]),
      answer: example.build?.answer ?? [],
    };
  }

  function makeQuickResponsePage(pack, example) {
    const response = example?.quickResponse ?? {};

    return {
      id: `${pack.id}-${example.english}-quick-response`,
      kind: "quickResponse",
      label: pack.coreExpression,
      stepLabel: "",
      question: response.question,
      speakText: response.question,
      questionChinese:
        moduleKey === "notice" ? DEEP_COPY.noticeQuickResponseChinese : DEEP_COPY.interpretQuickResponseChinese,
      bank: uniqueChunks([...(response.chunks ?? []), ...(response.distractors ?? [])]),
      answer: response.answer ?? [],
    };
  }

  if (moduleKey === "notice" || moduleKey === "interpret") {
    const pages = [];
    const maxExampleCount = Math.max(...packedExamples.map(({ examples }) => examples.length), 0);

    for (let exampleIndex = 0; exampleIndex < maxExampleCount; exampleIndex += 1) {
      packedExamples.forEach(({ pack, examples }) => {
        const example = examples[exampleIndex];
        if (example) {
          pages.push(makeUnderstandPage(pack, example));
        }
      });
      packedExamples.forEach(({ pack, examples }) => {
        const example = examples[exampleIndex];
        if (example) {
          pages.push(makeFocusPage(pack, example));
        }
      });
    }

    for (let exampleIndex = 0; exampleIndex < maxExampleCount; exampleIndex += 1) {
      packedExamples.forEach(({ pack, examples }) => {
        const example = examples[exampleIndex];
        if (example) {
          pages.push(makeBuildPage(pack, example));
        }
      });

      packedExamples.forEach(({ pack, examples }) => {
        const example = examples[exampleIndex];
        if (example) {
          pages.push(makeQuickResponsePage(pack, example));
        }
      });
    }

    return pages;
  }

  const pages = [];

  packedExamples.forEach(({ pack, examples }) => {
    examples.forEach((example) => {
      pages.push(makeUnderstandPage(pack, example));
      pages.push(makeFocusPage(pack, example));
      pages.push(makeBuildPage(pack, example));
    });

    // Interact / Step In do not use the example-level quick response flow.
  });

  return pages;
}

export function useDeepExerciseSequence({ packs = [], moduleKey = "notice" } = {}) {
  const safePacks = Array.isArray(packs) ? packs : [];
  const pages = useMemo(() => buildExercisePages(safePacks, moduleKey), [moduleKey, safePacks]);
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
  const progressCurrent = currentPage ? pageIndex + 1 : pages.length;
  const progressTotal = pages.length;
  const selectionLimit = currentPage?.kind === "focus" ? currentPage.answer.length : 0;
  const canAttempt = currentPage ? selectedChunks.length > 0 : false;

  function clearPendingAdvance() {
  }

  function resetSelection() {
    clearPendingAdvance();
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
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
      body: getHintMessage(currentPage.kind, currentPage.answer),
    });
  }

  function goNextPage() {
    clearPendingAdvance();
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
    setPageIndex((current) => current + 1);
  }

  function goPreviousPage() {
    clearPendingAdvance();

    if (pageIndex === 0) {
      return false;
    }

    setPageIndex((current) => current - 1);
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
    return true;
  }

  function check() {
    if (!currentPage || !canAttempt) {
      return;
    }

    if (isDeepAnswerMatch(selectedChunks, currentPage.answer)) {
      setFeedback({
        tone: "success",
        title: DEEP_COPY.correct,
        body: currentPage.kind === "quickResponse" ? "You handled the reply." : "You built the target expression.",
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
    milestoneItems: safePacks.map((pack) => ({
      title: pack?.coreExpression ?? "",
      body: pack?.meaningChinese ?? "",
    })),
    selectedChunks,
    feedback,
    progressCurrent,
    progressTotal,
    canAttempt,
    selectionLimit,
    toggleChunk,
    reset: resetSelection,
    hint,
    check,
    next: goNextPage,
    back: goPreviousPage,
  };
}

export { buildExercisePages };

export default useDeepExerciseSequence;
