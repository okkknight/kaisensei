import { useEffect, useMemo, useRef, useState } from "react";
import { DEEP_COPY } from "../copy.js";
import { isDeepAnswerMatch } from "./deep-text.js";
import { buildShuffledChunkBank } from "./deep-flow-utils.js";

function buildStepInPages({ title, goal, scene, sceneChinese, turns }) {
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
      sceneChinese,
    },
  ];

  userTurns.forEach((turn) => {
    const nextTurn = safeTurns[turn.turnIndex + 1];
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
          ? "先看细节"
          : turn.sourceModule === "interpret"
            ? "说说你的感觉"
            : turn.sourceModule === "interact_need"
              ? "说说你的需要"
              : turn.sourceModule === "interact_handle"
                ? "自然接一句"
                : "",
      scene,
      history,
      bank: buildShuffledChunkBank(
        [...(turn.chunks ?? []), ...(turn.distractors ?? [])],
        `step-in:${turn.turnIndex}:${turn.text ?? ""}`
      ),
      answer: turn.answer ?? [],
      bridgeReply: nextTurn?.speaker === "system" ? nextTurn.text : "",
    });
  });

  return pages;
}

function shouldStageStepInPrompt(history) {
  if (!Array.isArray(history) || history.length !== 1) {
    return false;
  }

  const onlyTurn = history[0];
  return Boolean(onlyTurn?.speaker === "system" && onlyTurn?.text);
}

export { buildStepInPages, shouldStageStepInPrompt };

export function useDeepStepInFlow({
  title = "Step In",
  goal = "",
  scene = "",
  sceneChinese = "",
  turns = [],
  initialPageIndex = 0,
  onComplete = null,
} = {}) {
  const pages = useMemo(() => buildStepInPages({ title, goal, scene, sceneChinese, turns }), [goal, scene, sceneChinese, title, turns]);
  const pagesSignature = useMemo(() => pages.map((page) => page.id).join("|"), [pages]);
  const [pageIndex, setPageIndex] = useState(() => Math.max(0, initialPageIndex));
  const [selectedChunks, setSelectedChunks] = useState([]);
  const [feedback, setFeedback] = useState({ tone: "idle", title: "", body: "" });
  const [liveTurns, setLiveTurns] = useState([]);
  const [visibleHistory, setVisibleHistory] = useState([]);
  const timersRef = useRef([]);

  useEffect(() => {
    const maxIndex = Math.max(0, pages.length - 1);
    setPageIndex(Math.min(Math.max(0, initialPageIndex), maxIndex));
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
    setLiveTurns([]);
    setVisibleHistory([]);
  }, [pagesSignature, initialPageIndex]);

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
  const progressPages = pages.filter((page) => page.kind === "turn");
  const progressTotal = progressPages.length;
  const progressCurrent = currentPage?.kind === "turn"
    ? progressPages.findIndex((page) => page.id === currentPage.id) + 1
    : 0;
  const isReadyToCheck = currentPage?.kind === "turn"
    ? currentPage.answer.length > 0 && selectedChunks.length === currentPage.answer.length
    : false;
  const isPlaybackActive = liveTurns.some((turn) => turn.isTyping || turn.speaker === "system");

  useEffect(() => {
    if (currentPage?.kind !== "turn") {
      setVisibleHistory(currentPage?.history ?? []);
      return;
    }

    const history = Array.isArray(currentPage.history) ? currentPage.history : [];
    const shouldStagePrompt = shouldStageStepInPrompt(history);

    if (!shouldStagePrompt) {
      setVisibleHistory(history);
      setLiveTurns([]);
      return;
    }

    const stableHistory = history.slice(0, -1);
    setVisibleHistory(stableHistory);
    setLiveTurns([
      {
        speaker: "system",
        label: "System",
        text: "",
        isTyping: true,
      },
    ]);

    scheduleTimer(() => {
      setVisibleHistory(history);
      setLiveTurns([]);
    }, 1000);
  }, [currentPage?.id]);

  function clearPendingAdvance() {
    timersRef.current.forEach((timer) => {
      window.clearTimeout(timer);
    });
    timersRef.current = [];
  }

  function scheduleTimer(callback, delay) {
    const timer = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((currentTimer) => currentTimer !== timer);
      callback();
    }, delay);

    timersRef.current.push(timer);
    return timer;
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
    setVisibleHistory([]);
    return true;
  }

  function next() {
    clearPendingAdvance();
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
    setLiveTurns([]);
    setVisibleHistory([]);
    if (pageIndex >= pages.length - 1) {
      onComplete?.();
      return;
    }

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
      const bridgeReply = currentPage.bridgeReply?.trim() ?? "";

      clearPendingAdvance();
      setSelectedChunks([]);
      if (!bridgeReply) {
        setLiveTurns([
          {
            speaker: "user",
            label: "You",
            text: answerText,
            checked: true,
          },
        ]);
        setFeedback({
          tone: "success",
          title: DEEP_COPY.correct,
          body: "You finished the scene conversation.",
        });
        scheduleTimer(() => {
          next();
        }, 900);
        return;
      }

      setFeedback({ tone: "idle", title: "", body: "" });
      setLiveTurns([
        {
          speaker: "user",
          label: "You",
          text: answerText,
          checked: true,
        },
        {
          speaker: "system",
          label: "System",
          text: "",
          isTyping: true,
        },
      ]);

      scheduleTimer(() => {
        setLiveTurns([
          {
            speaker: "user",
            label: "You",
            text: answerText,
            checked: true,
          },
          {
            speaker: "system",
            label: "System",
            text: bridgeReply,
          },
        ]);
      }, 1000);

      scheduleTimer(() => {
        next();
      }, 1900);
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
    visibleHistory,
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
