import React from "react";
import { IconCheck, IconRefresh } from "@tabler/icons-react";
import { DEEP_COPY } from "../copy.js";
import { DeepChunkChip } from "./DeepChunkChip.jsx";

function DialogueTurn({ turn }) {
  return (
    <div className={`deep-dialogue-turn ${turn.speaker}`}>
      <span>{turn.label || (turn.speaker === "system" ? "System" : "You")}</span>
      <p>{turn.text}</p>
    </div>
  );
}

export function DeepDialogueFlowPage({
  stageLabel = "Dialogue",
  title,
  subtitle,
  showHeader = true,
  scene,
  introCards = [],
  history = [],
  prompt,
  hint,
  bank = [],
  selectedChunks = [],
  feedback,
  onToggleChunk,
  onReset,
  onCheck,
  onContinue,
  continueLabel = DEEP_COPY.continue,
  historyEmpty = "",
  showActions = false,
  emptyMessage = DEEP_COPY.tapChunksToBuild,
}) {
  const canContinue = feedback.tone === "success";
  const selectedChunkSet = new Set(selectedChunks);
  const availableBank = bank.filter((chunk) => !selectedChunkSet.has(chunk));

  return (
    <div className="deep-dialogue-flow-page">
      {showHeader ? (
        <div className="deep-exercise-head">
          <span className="deep-exercise-stage">{stageLabel}</span>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      ) : null}

      {scene ? (
        <div className="deep-dialogue-scene-card">
          <span>Scene</span>
          <strong>{scene}</strong>
        </div>
      ) : null}

      {introCards.length > 0 ? (
        <div className="deep-stage-stack">
          {introCards.map((card) => (
            <div key={`${card.label}-${card.title}`} className="deep-stage-card">
              <span>{card.label}</span>
              <strong>{card.title}</strong>
              <p>{card.body}</p>
              {card.caption ? <small>{card.caption}</small> : null}
            </div>
          ))}
        </div>
      ) : null}

      {history.length > 0 || historyEmpty ? (
        <div className="deep-dialogue-history">
          {history.length > 0 ? (
            history.map((turn, index) => <DialogueTurn key={`${turn.speaker}-${index}-${turn.text}`} turn={turn} />)
          ) : (
            <div className="deep-dialogue-history-empty">{historyEmpty}</div>
          )}
        </div>
      ) : null}

      <div className="deep-exercise-prompt deep-dialogue-prompt">
        <strong>{prompt}</strong>
        {hint ? <p>{hint}</p> : null}
      </div>

      <div className="deep-answer-stage">
        {selectedChunks.length > 0 ? (
          selectedChunks.map((chunk) => (
            <DeepChunkChip key={chunk} chunk={chunk} selected onClick={() => onToggleChunk(chunk)} />
          ))
        ) : (
          <div className="deep-answer-empty">{emptyMessage}</div>
        )}
      </div>

      <div className="deep-bank-row">
        {availableBank.map((chunk) => {
          return <DeepChunkChip key={chunk} chunk={chunk} onClick={() => onToggleChunk(chunk)} />;
        })}
      </div>

      {showActions ? (
        <div className="deep-exercise-actions">
          <button className="secondary-button" type="button" onClick={onReset}>
            <IconRefresh size={17} />
            {DEEP_COPY.reset}
          </button>
          <button className="primary-button" type="button" onClick={canContinue ? onContinue : onCheck}>
            {canContinue ? continueLabel : DEEP_COPY.check}
            {canContinue ? null : <IconCheck size={18} />}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default DeepDialogueFlowPage;
