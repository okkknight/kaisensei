import React from "react";
import { IconCheck, IconRefresh } from "@tabler/icons-react";
import { DeepChunkChip } from "./DeepChunkChip.jsx";
import { DeepFeedbackCard } from "./DeepFeedbackCard.jsx";
import { DEEP_COPY } from "../copy.js";

export function DeepExercisePage({
  title,
  subtitle,
  prompt,
  hint,
  bank,
  selectedChunks,
  feedback,
  emptyMessage = DEEP_COPY.tapChunksToBuild,
  idleMessage = DEEP_COPY.tapChunksThenCheck,
  bankFirst = false,
  stepLabel = "",
  onToggleChunk,
  onReset,
  onCheck,
  onContinue,
  continueLabel = DEEP_COPY.continue,
  stageLabel = "Understand",
  showActions = true,
}) {
  const canContinue = feedback.tone === "success";
  const selectedChunkSet = new Set(selectedChunks);
  const availableBank = bank.filter((chunk) => !selectedChunkSet.has(chunk));

  return (
    <div className="deep-exercise-page">
      <div className="deep-exercise-head">
        {stepLabel ? <span className="deep-exercise-step">{stepLabel}</span> : null}
        <span className="deep-exercise-stage">{stageLabel}</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <section className="deep-exercise-main">
        <div className="deep-exercise-prompt">
          <strong>{prompt}</strong>
          {hint ? <p>{hint}</p> : null}
        </div>

        {bankFirst ? (
          <>
            <div className="deep-bank-row">
              {availableBank.map((chunk) => {
                return <DeepChunkChip key={chunk} chunk={chunk} onClick={() => onToggleChunk(chunk)} />;
              })}
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
          </>
        ) : (
          <>
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
          </>
        )}
      </section>

      <DeepFeedbackCard tone={feedback.tone} title={feedback.title} body={feedback.body} idleBody={idleMessage} />

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

export default DeepExercisePage;
