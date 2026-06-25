import React, { useEffect, useMemo, useRef } from "react";
import { DEEP_COPY } from "../copy.js";
import { DeepChunkChip } from "./DeepChunkChip.jsx";
import { DeepFeedbackCard } from "./DeepFeedbackCard.jsx";
import { VoiceButton } from "../../quick/lesson/VoiceButton.jsx";
import { useDeepSpeech } from "../useDeepSpeech.js";

function DialogueTurn({ turn }) {
  if (turn.isTyping) {
    return (
      <div className={`deep-dialogue-turn ${turn.speaker} deep-dialogue-turn-typing`}>
        <span>{turn.label || "System"}</span>
        <div className="loading-dots deep-dialogue-typing-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  return (
    <div className={`deep-dialogue-turn ${turn.speaker}${turn.checked ? " checked" : ""}`}>
      {turn.checked ? <span className="deep-dialogue-turn-check" aria-hidden="true">✓</span> : null}
      <span>{turn.label || (turn.speaker === "system" ? "System" : "You")}</span>
      <p>{turn.text}</p>
    </div>
  );
}

export function DeepDialogueFlowPage({
  scene = "",
  sceneChinese = "",
  history = [],
  liveTurns = [],
  userPrompt = "",
  taskPrompt = "",
  taskPromptPlacement = "top",
  showHistory = true,
  bank = [],
  selectedChunks = [],
  feedback,
  onToggleChunk,
  showComposer = true,
  hideSelectionOnSuccess = false,
}) {
  const speech = useDeepSpeech();
  const isPlaybackActive = liveTurns.some((turn) => turn.isTyping || turn.speaker === "system");
  const isSuccessState = feedback?.tone === "success";
  const selectedChunkCounts = selectedChunks.reduce((counts, chunk) => {
    counts.set(chunk, (counts.get(chunk) ?? 0) + 1);
    return counts;
  }, new Map());
  const availableBank = bank.filter((chunk) => {
    const usedCount = selectedChunkCounts.get(chunk) ?? 0;

    if (usedCount === 0) {
      return true;
    }

    selectedChunkCounts.set(chunk, usedCount - 1);
    return false;
  });
  const latestSystemTurn = [...history].reverse().find((turn) => turn.speaker === "system");
  const visibleHistory = showHistory ? history : [];
  const visibleTurns = [...visibleHistory, ...liveTurns];
  const scrollAnchorRef = useRef(null);
  const visibleTurnSignature = useMemo(
    () =>
      visibleTurns
        .map((turn) => `${turn.speaker}:${turn.text ?? ""}:${turn.isTyping ? "typing" : ""}:${turn.checked ? "checked" : ""}`)
        .join("|"),
    [visibleTurns]
  );

  useEffect(() => {
    if (!scrollAnchorRef.current) {
      return;
    }

    scrollAnchorRef.current.scrollIntoView({
      block: "end",
      behavior: isPlaybackActive ? "auto" : "smooth",
    });
  }, [isPlaybackActive, visibleTurnSignature, feedback?.tone, selectedChunks.length, userPrompt]);

  const composer = !showComposer ? null : (
    <>
      {!isPlaybackActive && userPrompt ? (
        <div className="deep-dialogue-user-prompt">
          <strong>{userPrompt}</strong>
          {latestSystemTurn?.text ? (
            <VoiceButton
              onClick={() => speech.speak(latestSystemTurn.text, userPrompt)}
              active={speech.speakingKey === userPrompt}
              label={DEEP_COPY.playAudio}
              className="deep-dialogue-user-prompt-audio"
            />
          ) : null}
        </div>
      ) : null}

      {!isPlaybackActive ? (
        <div className="deep-selection-stack">
          <div className="deep-answer-stage">
            {selectedChunks.length > 0 ? (
              selectedChunks.map((chunk, index) => (
                <DeepChunkChip key={`${chunk}-${index}`} chunk={chunk} selected onClick={() => onToggleChunk(chunk)} />
              ))
            ) : (
              <div className="deep-answer-empty">{DEEP_COPY.buildYourAnswerChinese}</div>
            )}
          </div>

          <div className="deep-bank-row">
            {availableBank.map((chunk, index) => (
              <DeepChunkChip key={`${chunk}-${index}`} chunk={chunk} onClick={() => onToggleChunk(chunk)} />
            ))}
          </div>
        </div>
      ) : null}

      {!isPlaybackActive ? (
        <DeepFeedbackCard
          tone={feedback.tone}
          title={feedback.title}
          body={feedback.body}
          idleBody={DEEP_COPY.tapChunksThenSend}
        />
      ) : null}
    </>
  );

  return (
    <div className="deep-dialogue-flow-page">
      {scene ? (
        <div className="deep-dialogue-scene-card">
          <span>{DEEP_COPY.sceneLabel}</span>
          <strong>{sceneChinese || scene}</strong>
        </div>
      ) : null}

      {!showComposer && taskPrompt && taskPromptPlacement !== "bottom" && !isSuccessState && !isPlaybackActive ? (
        <p className="deep-dialogue-task-line">{taskPrompt}</p>
      ) : null}

      {visibleTurns.length > 0 ? (
        <div className="deep-dialogue-history">
          {visibleTurns.map((turn, index) => (
            <DialogueTurn key={`${turn.speaker}-${index}-${turn.text ?? "typing"}`} turn={turn} />
          ))}
        </div>
      ) : null}

      {!showComposer && taskPrompt && taskPromptPlacement === "bottom" && !isSuccessState && !isPlaybackActive ? (
        <p className="deep-dialogue-task-line">{taskPrompt}</p>
      ) : null}

      {composer}

      <div ref={scrollAnchorRef} className="deep-dialogue-scroll-anchor" aria-hidden="true" />
    </div>
  );
}

export function DeepDialogueComposer({
  history = [],
  liveTurns = [],
  userPrompt = "",
  showPrompt = true,
  bank = [],
  selectedChunks = [],
  feedback,
  onToggleChunk,
  hideSelectionOnSuccess = false,
  activeFeedbackPlacement = "inline",
}) {
  const speech = useDeepSpeech();
  const isPlaybackActive = liveTurns.some((turn) => turn.isTyping || turn.speaker === "system");
  const shouldHideSelection = hideSelectionOnSuccess && feedback?.tone === "success";
  const idleBody = DEEP_COPY.tapChunksThenSend;
  const shouldRenderInlineFeedback = activeFeedbackPlacement === "inline" && feedback?.tone !== "idle";
  const shouldShowComposerBody = !isPlaybackActive && !shouldHideSelection;
  const selectedChunkCounts = selectedChunks.reduce((counts, chunk) => {
    counts.set(chunk, (counts.get(chunk) ?? 0) + 1);
    return counts;
  }, new Map());
  const availableBank = bank.filter((chunk) => {
    const usedCount = selectedChunkCounts.get(chunk) ?? 0;

    if (usedCount === 0) {
      return true;
    }

    selectedChunkCounts.set(chunk, usedCount - 1);
    return false;
  });
  const latestSystemTurn = [...history].reverse().find((turn) => turn.speaker === "system");

  return (
    <div className="deep-dialogue-composer">
      {!isPlaybackActive && showPrompt && userPrompt && !shouldHideSelection ? (
        <div className="deep-dialogue-user-prompt">
          <strong>{userPrompt}</strong>
          {latestSystemTurn?.text ? (
            <VoiceButton
              onClick={() => speech.speak(latestSystemTurn.text, userPrompt)}
              active={speech.speakingKey === userPrompt}
              label={DEEP_COPY.playAudio}
              className="deep-dialogue-user-prompt-audio"
            />
          ) : null}
        </div>
      ) : null}

      <div className={`deep-dialogue-composer-panel${shouldShowComposerBody ? " is-visible" : ""}`} aria-hidden={!shouldShowComposerBody}>
        <div className="deep-dialogue-composer-panel-body">
          <div className="deep-selection-stack">
            <div className="deep-answer-stage">
              {selectedChunks.length > 0 ? (
                selectedChunks.map((chunk, index) => (
                  <DeepChunkChip key={`${chunk}-${index}`} chunk={chunk} selected onClick={() => onToggleChunk(chunk)} />
                ))
              ) : (
                <div className="deep-answer-empty">{idleBody}</div>
              )}
            </div>

            <div className="deep-bank-row">
              {availableBank.map((chunk, index) => (
                <DeepChunkChip key={`${chunk}-${index}`} chunk={chunk} onClick={() => onToggleChunk(chunk)} />
              ))}
            </div>
          </div>

          {shouldRenderInlineFeedback ? (
            <DeepFeedbackCard
              tone={feedback.tone}
              title={feedback.title}
              body={feedback.body}
              idleBody={idleBody}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default DeepDialogueFlowPage;
