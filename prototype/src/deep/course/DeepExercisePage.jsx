import React from "react";
import { DeepChunkChip } from "./DeepChunkChip.jsx";
import { DeepFeedbackCard } from "./DeepFeedbackCard.jsx";
import { DEEP_COPY } from "../copy.js";
import { VoiceButton } from "../../quick/lesson/VoiceButton.jsx";
import { useDeepSpeech } from "../useDeepSpeech.js";
import { isDeepSelectionLocked } from "./deep-flow-utils.js";

function ChunkRow({ items, selectedChunks, selectionLimit, onToggleChunk }) {
  const selectedChunkCounts = selectedChunks.reduce((counts, chunk) => {
    counts.set(chunk, (counts.get(chunk) ?? 0) + 1);
    return counts;
  }, new Map());
  const selectionLocked = isDeepSelectionLocked(selectedChunks, selectionLimit);
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
        <DeepChunkChip
          key={`${chunk}-${index}`}
          chunk={chunk}
          disabled={selectionLocked}
          onClick={() => onToggleChunk(chunk)}
        />
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

function renderFilledBlanks(sentenceWithBlanks, selectedChunks, onToggleChunk) {
  if (!sentenceWithBlanks) {
    return null;
  }

  const parts = String(sentenceWithBlanks).split(/____+/);

  if (parts.length === 1) {
    return <div className="deep-english-sentence">{sentenceWithBlanks}</div>;
  }

  const blanksNeeded = parts.length - 1;

  return (
    <div className="deep-filled-sentence" aria-label={sentenceWithBlanks}>
      {parts.map((part, index) => (
        <React.Fragment key={`part-${index}`}>
          {part ? <span className="deep-filled-sentence-text">{part}</span> : null}
          {index < blanksNeeded ? (
            selectedChunks[index] ? (
              <DeepChunkChip
                key={`blank-${index}`}
                chunk={selectedChunks[index]}
                selected
                onClick={() => onToggleChunk(selectedChunks[index])}
              />
            ) : (
              <span className="deep-filled-sentence-blank">____</span>
            )
          ) : null}
        </React.Fragment>
      ))}
    </div>
  );
}

function renderUnderstandSentence(sentence, highlight) {
  if (!sentence) {
    return null;
  }

  if (!highlight) {
    return <div className="deep-english-sentence">{sentence}</div>;
  }

  const index = sentence.toLowerCase().indexOf(highlight.toLowerCase());

  if (index === -1) {
    return <div className="deep-english-sentence">{sentence}</div>;
  }

  const before = sentence.slice(0, index);
  const matched = sentence.slice(index, index + highlight.length);
  const after = sentence.slice(index + highlight.length);

  return (
    <div className="deep-english-sentence" aria-label={sentence}>
      {before ? <span>{before}</span> : null}
      <span className="deep-english-highlight">{matched}</span>
      {after ? <span>{after}</span> : null}
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
  selectionLimit = 0,
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
      {kind === "understand" ? (
        <section className="deep-page-card">
          <div className="deep-card-head">
            <p>{instruction}</p>
          </div>
          <div className="deep-card-copy">
            {renderUnderstandSentence(englishSentence, englishHighlight)}
          </div>
        </section>
      ) : null}

      {kind === "focus" ? (
        <section className="deep-page-card">
          <div className="deep-card-head">
            <p>{instruction}</p>
          </div>
          <div className="deep-card-copy">
            {renderFilledBlanks(sentenceWithBlanks, selectedChunks, onToggleChunk)}
            <div className="deep-reference-copy">{chineseReference}</div>
          </div>
        </section>
      ) : null}

      {kind === "build" ? (
        <section className="deep-page-card">
          <div className="deep-card-head">
            <p>{instruction}</p>
            <div className="deep-build-example">{chineseReference}</div>
            <div className="deep-build-prompt">{promptChinese}</div>
          </div>
        </section>
      ) : null}

      {kind === "quickResponse" ? (
        <section className="deep-page-card">
          <div className="deep-card-head">
            <p>{DEEP_COPY.buildYourAnswer}</p>
          </div>
          <div className="deep-card-copy">
            {renderSentenceBlock(question, `${kind}-${label}`)}
            <div className="deep-reference-copy">{questionChinese}</div>
          </div>
        </section>
      ) : null}

      <div className="deep-selection-stack">
        {kind === "understand" ? (
          <>
            <AnswerStage selectedChunks={selectedChunks} onToggleChunk={onToggleChunk} />
            <ChunkRow
              items={bank}
              selectedChunks={selectedChunks}
              selectionLimit={0}
              onToggleChunk={onToggleChunk}
            />
          </>
        ) : kind === "focus" ? (
          <ChunkRow
            items={bank}
            selectedChunks={selectedChunks}
            selectionLimit={selectionLimit}
            onToggleChunk={onToggleChunk}
          />
        ) : (
          <>
            <AnswerStage selectedChunks={selectedChunks} onToggleChunk={onToggleChunk} />
            <ChunkRow
              items={bank}
              selectedChunks={selectedChunks}
              selectionLimit={0}
              onToggleChunk={onToggleChunk}
            />
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
