import React from "react";

export function DeepChunkChip({ chunk, selected = false, disabled = false, onClick }) {
  return (
    <button
      className={`deep-chunk-chip ${selected ? "selected" : ""}`}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      <span>{chunk}</span>
    </button>
  );
}

export default DeepChunkChip;
