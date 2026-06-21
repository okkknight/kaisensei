import { useEffect, useMemo, useRef, useState } from "react";
import { DEEP_COPY } from "../copy.js";
import { isDeepAnswerMatch } from "./deep-text.js";

function uniqueChunks(items = []) {
  return [...new Set((Array.isArray(items) ? items : []).filter(Boolean))];
}

function buildStepInPages({ title, goal, scene, turns }) {
  const safeTurns = Array.isArray(turns) ? turns : [];
  const userTurns = safeTurns
    .map((turn, index) => ({ ...turn, turnIndex: index }))
    .filter((turn) => turn.speaker === "user");

  const pages = [
    {
      id: "step-in-guide",
      kind: "guide",
      title,
      goal,
      scene,
    },
  ];

  userTurns.forEach((turn) => {
    const history = safeTurns.slice(0, turn.turnIndex).map((entry) => ({
      speaker: entry.speaker,
      label: entry.speaker === "system" ? "System" : "You",
      text: entry.text,
    }));
    const promptTurn = safeTurns[turn.turnIndex - 1];

    pages.push({
      id: `step-in-turn-${turn.turnIndex}`,
      kind: "turn",
      userPrompt:
        turn.sourceModule === "notice"
          ? "Your turn: Notice"
          : turn.sourceModule === "interpret"
            ? "Your turn: Interpret"
            : turn.sourceModule === "interact_need"
              ? DEEP_COPY.dialogueNeedPrompt
              : turn.sourceModule === "interact_handle"
                ? DEEP_COPY.dialogueHandlePrompt
                : "",
      scene,
      history,
      bank: uniqueChunks([...(turn.chunks ?? []), ...(turn.distractors ?? [])]),
      answer: turn.answer ?? [],
    });
  });

  pages.push({
    id: "step-in-complete",
    kind: "complete",
    replayTurns: safeTurns.map((turn) => ({
      speaker: turn.speaker,
      label: turn.speaker === "system" ? "System" : "You",
      text: turn.text,
    })),
  });

  return pages;
}

export function useDeepStepInFlow({ title = "Step In", goal = "", scene = "", turns = [] } = {}) {
  const pages = useMemo(() => buildStepInPages({ title, goal, scene, turns }), [goal, scene, title, turns]);
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
  const replayTurns = pages[pages.length - 1]?.replayTurns ?? [];
  const progressPages = pages.filter((page) => page.kind === "turn");
  const progressTotal = progressPages.length;
  const progressCurrent = currentPage?.kind === "turn"
    ? progressPages.findIndex((page) => page.id === currentPage.id) + 1
    : 0;
  const isReadyToCheck = currentPage?.kind === "turn"
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

  function next() {
    clearPendingAdvance();
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
    setPageIndex((current) => current + 1);
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
    const firstChunk = Array.isArray(currentPage?.answer) ? currentPage.answer[0] : "";
    setFeedback({
      tone: "hinted",
      title: DEEP_COPY.hint,
      body: firstChunk ? `Try "${firstChunk}" first.` : "Try a smaller chunk first.",
    });
  }

  function check() {
    if (currentPage?.kind !== "turn" || !isReadyToCheck) {
      return;
    }

    if (isDeepAnswerMatch(selectedChunks, currentPage.answer)) {
      setFeedback({
        tone: "success",
        title: DEEP_COPY.correct,
        body: "You kept the conversation moving.",
      });
      autoAdvanceTimerRef.current = window.setTimeout(() => {
        next();
      }, 650);
      return;
    }

    setFeedback({
      tone: "warning",
      title: DEEP_COPY.incorrect,
      body: "Try the same idea with a more natural chunk order.",
    });
  }

  return {
    currentPage,
    replayTurns,
    selectedChunks,
    feedback,
    progressCurrent,
    progressTotal,
    isReadyToCheck,
    reset,
    back,
    next,
    toggleChunk,
    hint,
    check,
    restartReplay: () => {
      setPageIndex(0);
      setSelectedChunks([]);
      setFeedback({ tone: "idle", title: "", body: "" });
    },
  };
}

export default useDeepStepInFlow;
