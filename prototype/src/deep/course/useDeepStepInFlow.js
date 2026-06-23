import { useEffect, useMemo, useRef, useState } from "react";
import { DEEP_COPY } from "../copy.js";
import { isDeepAnswerMatch } from "./deep-text.js";
import { buildShuffledChunkBank } from "./deep-flow-utils.js";

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

    pages.push({
      id: `step-in-turn-${turn.turnIndex}`,
      kind: "turn",
      userPrompt:
        turn.sourceModule === "notice"
          ? "Stay in character: notice the scene"
          : turn.sourceModule === "interpret"
            ? "Stay in character: share what it feels like"
            : turn.sourceModule === "interact_need"
              ? "Stay in character: say what you need"
              : turn.sourceModule === "interact_handle"
                ? "Stay in character: answer naturally"
                : "",
      scene,
      history,
      bank: buildShuffledChunkBank(
        [...(turn.chunks ?? []), ...(turn.distractors ?? [])],
        `step-in:${turn.turnIndex}:${turn.text ?? ""}`
      ),
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

export { buildStepInPages };

export function useDeepStepInFlow({ title = "Step In", goal = "", scene = "", turns = [] } = {}) {
  const pages = useMemo(() => buildStepInPages({ title, goal, scene, turns }), [goal, scene, title, turns]);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedChunks, setSelectedChunks] = useState([]);
  const [feedback, setFeedback] = useState({ tone: "idle", title: "", body: "" });
  const [liveTurns, setLiveTurns] = useState([]);
  const autoAdvanceTimerRef = useRef(null);

  useEffect(() => {
    setPageIndex(0);
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
    setLiveTurns([]);
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
  const isPlaybackActive = liveTurns.length > 0;

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

  function next() {
    clearPendingAdvance();
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
    setLiveTurns([]);
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
      const answerText = selectedChunks.join(" ").trim();

      clearPendingAdvance();
      setSelectedChunks([]);
      setFeedback({ tone: "idle", title: "", body: "" });
      setLiveTurns([
        {
          speaker: "user",
          label: "You",
          text: answerText,
          checked: true,
        },
      ]);

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
    liveTurns,
    isPlaybackActive,
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
