import React from "react";
import { resolveChunkTone, toneMap } from "./lesson-helpers.js";

export function ChunkChip({ chunk, selected = false, ghost = false, onClick }) {
  const tone = resolveChunkTone(chunk);

  return (
    <button
      className={`chunk-chip ${toneMap[tone] || toneMap.purple} ${selected ? "selected" : ""} ${ghost ? "ghost-selected" : ""}`}
      type="button"
      onClick={onClick}
    >
      {chunk.text}
    </button>
  );
}

export default ChunkChip;
