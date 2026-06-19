import React from "react";
import { IconSparkles } from "@tabler/icons-react";

export function TipCard({ note }) {
  return (
    <div className="tip-card">
      <IconSparkles size={18} />
      <p>{note}</p>
    </div>
  );
}

export default TipCard;
