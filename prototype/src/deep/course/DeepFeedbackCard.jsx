import React from "react";

const SUCCESS_BURST_PIECES = [
  { left: "12%", top: "2%", dx: "-18px", dy: "-24px", rotate: "-24deg", color: "#6F5BFF", delay: "0ms", size: "15px" },
  { left: "30%", top: "1%", dx: "-6px", dy: "-28px", rotate: "-6deg", color: "#FFD24A", delay: "40ms", size: "11px" },
  { left: "50%", top: "0%", dx: "0px", dy: "-32px", rotate: "10deg", color: "#78C96F", delay: "80ms", size: "16px" },
  { left: "70%", top: "1%", dx: "8px", dy: "-28px", rotate: "22deg", color: "#FF8AAE", delay: "25ms", size: "13px" },
  { left: "88%", top: "2%", dx: "18px", dy: "-22px", rotate: "34deg", color: "#6F5BFF", delay: "105ms", size: "14px" },
  { left: "100%", top: "20%", dx: "24px", dy: "-10px", rotate: "58deg", color: "#FFD24A", delay: "55ms", size: "13px" },
  { left: "100%", top: "40%", dx: "26px", dy: "-2px", rotate: "78deg", color: "#78C96F", delay: "95ms", size: "16px" },
  { left: "0%", top: "40%", dx: "-26px", dy: "-2px", rotate: "282deg", color: "#FFD24A", delay: "100ms", size: "16px" },
  { left: "0%", top: "28%", dx: "-22px", dy: "-10px", rotate: "296deg", color: "#78C96F", delay: "30ms", size: "13px" },
  { left: "0%", top: "10%", dx: "-16px", dy: "-20px", rotate: "322deg", color: "#FF8AAE", delay: "130ms", size: "12px" },
];

export function DeepFeedbackCard({ tone = "idle", title = "", body = "", idleBody = "" }) {
  if (tone === "idle") {
    if (!idleBody) {
      return null;
    }

    return (
      <div className="deep-feedback-card muted">
        <p>{idleBody}</p>
      </div>
    );
  }

  return (
    <div className={`deep-feedback-card ${tone}`}>
      {tone === "success" ? (
        <div className="deep-feedback-burst" aria-hidden="true">
          {SUCCESS_BURST_PIECES.map((piece, index) => (
            <span
              key={`${piece.left}-${piece.top}-${index}`}
              className="deep-feedback-burst-piece"
              style={{
                "--burst-left": piece.left,
                "--burst-top": piece.top,
                "--burst-dx": piece.dx,
                "--burst-dy": piece.dy,
                "--burst-rotate": piece.rotate,
                "--burst-color": piece.color,
                "--burst-delay": piece.delay,
                "--burst-size": piece.size,
              }}
            />
          ))}
        </div>
      ) : null}
      <strong>{title}</strong>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

export default DeepFeedbackCard;
