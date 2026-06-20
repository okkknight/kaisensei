import React from "react";
import { IconCheck, IconRefresh } from "@tabler/icons-react";
import { DEEP_COPY } from "../copy.js";
import { DeepChunkChip } from "./DeepChunkChip.jsx";
import { DeepFeedbackCard } from "./DeepFeedbackCard.jsx";

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
  historyEmpty = "Build the answer to move the dialogue forward.",
  showActions = false,
}) {
  const canContinue = feedback.tone === "success";

  return (
    <div className="deep-dialogue-flow-page">
      <div className="deep-exercise-head">
        <span className="deep-exercise-stage">{stageLabel}</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="deep-dialogue-scene-card">
        <span>Scene</span>
        <strong>{scene}</strong>
      </div>

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

      <div className="deep-dialogue-history">
        {history.length > 0 ? (
          history.map((turn, index) => <DialogueTurn key={`${turn.speaker}-${index}-${turn.text}`} turn={turn} />)
        ) : (
          <div className="deep-dialogue-history-empty">{historyEmpty}</div>
        )}
      </div>

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
          <div className="deep-answer-empty">Tap chunks to build your answer.</div>
        )}
      </div>

      <div className="deep-bank-row">
        {bank.map((chunk) => {
          const isSelected = selectedChunks.includes(chunk);
          return <DeepChunkChip key={chunk} chunk={chunk} selected={isSelected} onClick={() => onToggleChunk(chunk)} />;
        })}
      </div>

      <DeepFeedbackCard tone={feedback.tone} title={feedback.title} body={feedback.body} />

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
