import React from "react";
import { DEEP_COPY } from "../copy.js";
import { DeepChunkChip } from "./DeepChunkChip.jsx";
import { DeepFeedbackCard } from "./DeepFeedbackCard.jsx";
import { VoiceButton } from "../../quick/lesson/VoiceButton.jsx";
import { useDeepSpeech } from "../useDeepSpeech.js";

function DialogueTurn({ turn }) {
  return (
    <div className={`deep-dialogue-turn ${turn.speaker}`}>
      <span>{turn.label || (turn.speaker === "system" ? "System" : "You")}</span>
      <p>{turn.text}</p>
    </div>
  );
}

export function DeepDialogueFlowPage({
  scene = "",
  sceneChinese = "",
  history = [],
  userPrompt = "",
  bank = [],
  selectedChunks = [],
  feedback,
  onToggleChunk,
}) {
  const speech = useDeepSpeech();
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
    <div className="deep-dialogue-flow-page">
      {scene ? (
        <div className="deep-dialogue-scene-card">
          <span>{DEEP_COPY.sceneLabel}</span>
          <strong>{scene}</strong>
          {sceneChinese ? <p>{sceneChinese}</p> : null}
        </div>
      ) : null}

      {history.length > 0 ? (
        <div className="deep-dialogue-history">
          {history.map((turn, index) => (
            <DialogueTurn key={`${turn.speaker}-${index}-${turn.text}`} turn={turn} />
          ))}
        </div>
      ) : null}

      {userPrompt ? (
        <div className="deep-dialogue-user-prompt">
          <strong>{userPrompt}</strong>
          {latestSystemTurn?.text ? (
            <VoiceButton
              onClick={() => speech.speak(latestSystemTurn.text, userPrompt)}
              active={speech.speakingKey === userPrompt}
              label={DEEP_COPY.playAudio}
            />
          ) : null}
        </div>
      ) : null}

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

      <DeepFeedbackCard
        tone={feedback.tone}
        title={feedback.title}
        body={feedback.body}
        idleBody={DEEP_COPY.tapChunksThenSend}
      />
    </div>
  );
}

export default DeepDialogueFlowPage;
