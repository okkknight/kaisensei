import React from "react";
import { QuestionCard } from "./QuestionCard.jsx";
import { ReorderExercise } from "./ReorderExercise.jsx";

export function UseStep({ lesson, selectedChunks, bank, feedback, onToggleChunk, onReset, onCheck, onSpeak, speakingKey }) {
  return (
    <div className="lesson-body lesson-body-use">
      <QuestionCard lesson={lesson} onSpeak={onSpeak} speaking={speakingKey === "use-answer"} />
      <ReorderExercise
        title="Your answer"
        subtitle="Answer the person like you are in the conversation."
        bank={bank}
        selectedChunks={selectedChunks}
        onToggleChunk={onToggleChunk}
        onReset={onReset}
        onCheck={onCheck}
        feedback={feedback}
        showQuestion={true}
        primaryActionLabel="Check"
        onSpeak={null}
        speaking={false}
        showVoiceButton={false}
        showActions={false}
      />
    </div>
  );
}

export default UseStep;
