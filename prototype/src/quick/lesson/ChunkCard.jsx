import React from "react";
import { VoiceButton } from "./VoiceButton.jsx";
import { chunkToneSurfaces, resolveChunkTone, toneMap } from "./lesson-helpers.js";

export function ChunkCard({ chunk, onSpeak, speaking }) {
  const tone = resolveChunkTone(chunk);

  return (
    <article className="chunk-card" style={{ "--chunk-card-surface": chunkToneSurfaces[tone] || chunkToneSurfaces.purple }}>
      <div className={`chunk-card-accent ${toneMap[tone] || toneMap.purple}`} />
      <div className="chunk-card-main">
        <div>
          <strong>{chunk.text}</strong>
          <p>{chunk.chinese}</p>
        </div>
        <VoiceButton compact onClick={onSpeak} active={speaking} />
      </div>
    </article>
  );
}

export default ChunkCard;
