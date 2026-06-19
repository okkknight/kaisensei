import React from "react";
import { ChunkCard } from "./ChunkCard.jsx";
import { TipCard } from "./TipCard.jsx";

export function LearnStep({ lesson, onSpeak, speakingKey }) {
  return (
    <div className="lesson-body lesson-body-learn">
      <div className="section-title">
        <h2>Learn the useful chunks.</h2>
        <p>Use these building blocks in other sentences too.</p>
      </div>

      <div className="chunk-list">
        {lesson.learn.chunks.map((chunk) => (
          <ChunkCard
            key={chunk.id}
            chunk={chunk}
            onSpeak={() => onSpeak(chunk.text, `learn-${chunk.id}`)}
            speaking={speakingKey === `learn-${chunk.id}`}
          />
        ))}
      </div>

      <TipCard note={lesson.learn.note} />
    </div>
  );
}

export default LearnStep;
