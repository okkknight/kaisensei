import React from "react";
import { DeepChunkChip } from "./DeepChunkChip.jsx";
import { DeepFeedbackCard } from "./DeepFeedbackCard.jsx";
import { DEEP_COPY } from "../copy.js";
import { VoiceButton } from "../../quick/lesson/VoiceButton.jsx";
import { useDeepSpeech } from "../useDeepSpeech.js";

function ChunkRow({ items, selectedChunks, onToggleChunk }) {
  const selectedChunkCounts = selectedChunks.reduce((counts, chunk) => {
    counts.set(chunk, (counts.get(chunk) ?? 0) + 1);
    return counts;
  }, new Map());
  const availableItems = items.filter((item) => {
    const usedCount = selectedChunkCounts.get(item) ?? 0;

    if (usedCount === 0) {
      return true;
    }

    selectedChunkCounts.set(item, usedCount - 1);
    return false;
  });

  return (
    <div className="deep-bank-row">
      {availableItems.map((chunk, index) => (
        <DeepChunkChip key={`${chunk}-${index}`} chunk={chunk} onClick={() => onToggleChunk(chunk)} />
      ))}
    </div>
  );
}

function AnswerStage({ selectedChunks, onToggleChunk, emptyMessage = DEEP_COPY.buildYourAnswerChinese }) {
  return (
    <div className="deep-answer-stage">
      {selectedChunks.length > 0 ? (
        selectedChunks.map((chunk, index) => (
          <DeepChunkChip key={`${chunk}-${index}`} chunk={chunk} selected onClick={() => onToggleChunk(chunk)} />
        ))
      ) : (
        <div className="deep-answer-empty">{emptyMessage}</div>
      )}
    </div>
  );
}

export function DeepExercisePage({
  kind,
  label,
  instruction,
  stepLabel,
  englishSentence = "",
  englishHighlight = "",
  sentenceWithBlanks = "",
  chineseReference = "",
  promptChinese = "",
  question = "",
  questionChinese = "",
  speakText = "",
  bank = [],
  selectedChunks = [],
  feedback,
  onToggleChunk,
}) {
  const speech = useDeepSpeech();

  function renderSentenceBlock(text, key) {
    if (!text) {
      return null;
    }

    return (
      <div className="deep-sentence-block">
        <div className="deep-english-sentence">{text}</div>
        {speakText ? (
          <VoiceButton
            onClick={() => speech.speak(speakText, key)}
            active={speech.speakingKey === key}
            label={DEEP_COPY.playAudio}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="deep-exercise-page">
      <div className="deep-exercise-head">
        {stepLabel ? <span className="deep-exercise-step">{stepLabel}</span> : null}
        <span className="deep-exercise-stage">{label}</span>
      </div>

      {kind === "understand" ? (
        <section className="deep-page-card">
          <div className="deep-card-head">
            <strong>{label}</strong>
            <p>{instruction}</p>
          </div>
          <div className="deep-card-copy">
            {renderSentenceBlock(englishSentence, `${kind}-${label}`)}
            {englishHighlight ? <div className="deep-expression-highlight">{englishHighlight}</div> : null}
          </div>
        </section>
      ) : null}

      {kind === "focus" ? (
        <section className="deep-page-card">
          <div className="deep-card-head">
            <strong>{label}</strong>
            <p>{instruction}</p>
          </div>
          <div className="deep-card-copy">
            {renderSentenceBlock(sentenceWithBlanks, `${kind}-${label}`)}
            <div className="deep-reference-copy">{chineseReference}</div>
          </div>
        </section>
      ) : null}

      {kind === "build" ? (
        <section className="deep-page-card">
          <div className="deep-card-head">
            <strong>{label}</strong>
            <p>{instruction}</p>
          </div>
          <div className="deep-card-copy">
            <div className="deep-reference-copy">{promptChinese}</div>
          </div>
        </section>
      ) : null}

      {kind === "quickResponse" ? (
        <section className="deep-page-card">
          <div className="deep-card-head">
            <strong>{label}</strong>
            <p>{DEEP_COPY.buildYourAnswer}</p>
          </div>
          <div className="deep-card-copy">
            {renderSentenceBlock(question, `${kind}-${label}`)}
            <div className="deep-reference-copy">{questionChinese}</div>
          </div>
        </section>
      ) : null}

      <div className="deep-selection-stack">
        {(kind === "focus" || kind === "build" || kind === "quickResponse") ? (
          <>
            <AnswerStage selectedChunks={selectedChunks} onToggleChunk={onToggleChunk} />
            <ChunkRow items={bank} selectedChunks={selectedChunks} onToggleChunk={onToggleChunk} />
          </>
        ) : (
          <>
            <ChunkRow items={bank} selectedChunks={selectedChunks} onToggleChunk={onToggleChunk} />
            <AnswerStage selectedChunks={selectedChunks} onToggleChunk={onToggleChunk} />
          </>
        )}
      </div>

      <DeepFeedbackCard
        tone={feedback.tone}
        title={feedback.title}
        body={feedback.body}
        idleBody={kind === "quickResponse" ? DEEP_COPY.buildYourAnswer : DEEP_COPY.tapChunksThenCheck}
      />
    </div>
  );
}

export default DeepExercisePage;
