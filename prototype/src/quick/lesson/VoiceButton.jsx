import React from "react";
import { IconPlayerPlayFilled } from "@tabler/icons-react";

export function VoiceButton({ onClick, active = false, label = "Play", compact = false }) {
  return (
    <button className={`voice-button ${active ? "active" : ""} ${compact ? "compact" : ""}`} type="button" onClick={onClick}>
      <IconPlayerPlayFilled size={compact ? 14 : 16} />
      {!compact && <span>{label}</span>}
    </button>
  );
}

export default VoiceButton;
