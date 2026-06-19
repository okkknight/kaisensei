import React from "react";
import { VoiceButton } from "./VoiceButton.jsx";

export function QuestionCard({ lesson, onSpeak, speaking }) {
  return (
    <div className="question-card">
      <div className="question-head">
        <span className="question-badge">Q</span>
        <span>Conversation</span>
      </div>
      <strong className="question-text">{lesson.use.question}</strong>
      <p className="question-situation">{lesson.use.situation}</p>
      <div className="sentence-actions">
        <VoiceButton onClick={() => onSpeak(lesson.use.speakText, "use-answer")} active={speaking} label="Play answer" />
      </div>
    </div>
  );
}

export default QuestionCard;
