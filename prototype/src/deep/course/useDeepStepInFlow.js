import { useEffect, useMemo, useRef, useState } from "react";
import { DEEP_COPY } from "../copy.js";
import { isDeepAnswerMatch } from "./deep-text.js";
import { joinDeepChunks } from "./deep-flow-utils.js";

export function useDeepStepInFlow({ scene = "", turns = [] } = {}) {
  const safeTurns = Array.isArray(turns) ? turns : [];
  const [turnIndex, setTurnIndex] = useState(1);
  const [selectedChunks, setSelectedChunks] = useState([]);
  const [feedback, setFeedback] = useState({ tone: "idle", title: "", body: "" });
  const [isComplete, setIsComplete] = useState(false);
  const autoAdvanceTimerRef = useRef(null);

  const currentSystemTurn = safeTurns[turnIndex - 1] ?? null;
  const currentUserTurn = safeTurns[turnIndex] ?? null;
  const historyTurns = useMemo(() => {
    if (turnIndex <= 1) {
      return [];
    }

    return safeTurns.slice(0, turnIndex - 1).map((turn) => ({
      speaker: turn.speaker,
      text: turn.text,
      label: turn.speaker === "system" ? "System" : "You",
    }));
  }, [safeTurns, turnIndex]);

  const currentAnswer = currentUserTurn?.answer ?? [];
  const currentPrompt = currentSystemTurn?.text ?? "";
  const currentScene = scene || "Complete the full scene conversation.";
  const activeTurnSource = currentUserTurn?.sourceModule ?? "";
  const currentPromptLabel = activeTurnSource === "notice"
    ? "Notice turn"
    : activeTurnSource === "interpret"
      ? "Interpret turn"
      : activeTurnSource === "interact_need"
        ? "Interact · Need"
        : activeTurnSource === "interact_handle"
          ? "Interact · Handle"
          : "Step In";

  function clearSelection() {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setSelectedChunks([]);
    setFeedback({ tone: "idle", title: "", body: "" });
  }

  function reset() {
    if (isComplete) {
      setTurnIndex(1);
      setIsComplete(false);
      clearSelection();
      return;
    }

    clearSelection();
  }

  function hint() {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    const firstChunk = Array.isArray(currentAnswer) ? currentAnswer[0] : "";
    setFeedback({
      tone: "hinted",
      title: DEEP_COPY.hint,
      body: firstChunk ? `Try "${firstChunk}" first.` : "Try a smaller chunk first.",
    });
  }

  function toggleChunk(chunk) {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setSelectedChunks((current) => {
      const exists = current.some((item) => item === chunk);
      return exists ? current.filter((item) => item !== chunk) : [...current, chunk];
    });
    setFeedback({ tone: "idle", title: "", body: "" });
  }

  function check() {
    if (selectedChunks.length === 0 || !currentUserTurn) {
      return;
    }

    if (isDeepAnswerMatch(selectedChunks, currentAnswer)) {
      setFeedback({
        tone: "success",
        title: DEEP_COPY.correct,
        body: "You kept the conversation moving.",
      });
      autoAdvanceTimerRef.current = window.setTimeout(() => {
        advance();
      }, 650);
      return;
    }

    setFeedback({
      tone: "warning",
      title: DEEP_COPY.incorrect,
      body: "Try the same idea with a more natural chunk order.",
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

  function advance() {
    clearSelection();

    if (isComplete) {
      return;
    }

    if (turnIndex + 2 >= safeTurns.length) {
      setIsComplete(true);
      return;
    }

    setTurnIndex((current) => current + 2);
  }

  const currentBank = currentUserTurn ? [...(currentUserTurn.chunks ?? []), ...(currentUserTurn.distractors ?? [])] : [];

  return {
    isComplete,
    currentScene,
    currentPrompt,
    currentPromptLabel,
    historyTurns,
    currentBank,
    currentAnswer,
    selectedChunks,
    feedback,
    toggleChunk,
    reset,
    hint,
    check,
    advance,
    currentUserTurn,
    replayTurns: safeTurns.map((turn) => ({
      speaker: turn.speaker,
      text: turn.text,
      label: turn.speaker === "system" ? "System" : "You",
    })),
    summaryItems: [
      ...new Map(
        safeTurns
          .filter((turn) => turn.speaker === "user" && turn.sourceModule)
          .map((turn) => [
            `${turn.sourceModule}-${turn.text}`,
            {
              title:
                turn.sourceModule === "notice"
                  ? "Notice"
                  : turn.sourceModule === "interpret"
                    ? "Interpret"
                    : turn.sourceModule === "interact_need"
                      ? "Need"
                      : turn.sourceModule === "interact_handle"
                        ? "Handle"
                        : "Step In",
              body: joinDeepChunks(turn.answer ?? []),
            },
          ])
      ).values(),
    ],
  };
}

export default useDeepStepInFlow;
