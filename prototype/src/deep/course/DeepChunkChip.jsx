import React from "react";

export function DeepChunkChip({ chunk, selected = false, onClick }) {
  return (
    <button className={`deep-chunk-chip ${selected ? "selected" : ""}`} type="button" onClick={onClick}>
      <span>{chunk}</span>
    </button>
  );
}

export default DeepChunkChip;
