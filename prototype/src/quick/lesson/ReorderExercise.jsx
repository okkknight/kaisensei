import React from "react";
import { IconCheck, IconCircleDashed, IconRefresh } from "@tabler/icons-react";
import { VoiceButton } from "./VoiceButton.jsx";
import { ChunkChip } from "./ChunkChip.jsx";
import { FeedbackCard } from "./FeedbackCard.jsx";

export function ReorderExercise({
  variant = "default",
  showActions = true,
  title,
  subtitle,
  promptLabel,
  bank,
  selectedChunks,
  onToggleChunk,
  onReset,
  onCheck,
  feedback,
  showQuestion,
  primaryActionLabel,
  onSpeak,
  speaking,
  showVoiceButton = false,
}) {
  return (
    <div className={`reorder-exercise ${variant === "build" ? "build-layout" : ""}`}>
      <div className="reorder-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        {showVoiceButton ? (
          <VoiceButton onClick={onSpeak} active={speaking} label="Play answer" />
        ) : promptLabel ? (
          <span className="reorder-prompt">{promptLabel}</span>
        ) : null}
      </div>

      <div className="answer-section">
        <div className={`answer-stage ${selectedChunks.length === 0 ? "empty" : ""}`}>
          {selectedChunks.length > 0 ? (
            selectedChunks.map((chunk) => (
              <ChunkChip key={chunk.id} chunk={chunk} selected onClick={() => onToggleChunk(chunk.id)} />
            ))
          ) : (
            <div className="empty-answer">
              <IconCircleDashed size={22} />
              <span>Tap chunks here to build your answer.</span>
            </div>
          )}
        </div>

        <div className="available-row">
          {bank.map((chunk) => {
            const isSelected = selectedChunks.some((item) => item.id === chunk.id);
            return (
              <ChunkChip
                key={chunk.id}
                chunk={chunk}
                selected={isSelected}
                ghost={isSelected}
                onClick={() => onToggleChunk(chunk.id)}
              />
            );
          })}
        </div>
      </div>

      <FeedbackCard tone={feedback.tone} title={feedback.title} body={feedback.body} />

      {showActions ? (
        <div className="exercise-footer">
          <div className="exercise-actions">
            <button className="secondary-button" type="button" onClick={onReset}>
              <IconRefresh size={17} />
              Reset
            </button>
            <button className="primary-button" type="button" onClick={onCheck}>
              <IconCheck size={18} />
              {primaryActionLabel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ReorderExercise;
