import React from "react";
import { ReorderExercise } from "./ReorderExercise.jsx";

export function BuildStep({ lesson, selectedChunks, bank, feedback, onToggleChunk, onReset, onCheck, onSpeak, speakingKey }) {
  return (
    <div className="lesson-body lesson-body-build">
      <ReorderExercise
        variant="build"
        showActions={false}
        title="Build"
        subtitle="Put the chunks in order."
        bank={bank}
        selectedChunks={selectedChunks}
        onToggleChunk={onToggleChunk}
        onReset={onReset}
        onCheck={onCheck}
        feedback={feedback}
        showQuestion={false}
        primaryActionLabel="Check"
        onSpeak={null}
        speaking={false}
        showVoiceButton={false}
      />
    </div>
  );
}

export default BuildStep;
