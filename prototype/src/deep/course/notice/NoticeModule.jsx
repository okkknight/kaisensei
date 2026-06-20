import React from "react";
import { DeepCourseShell } from "../DeepCourseShell.jsx";
import { DeepExercisePage } from "../DeepExercisePage.jsx";
import { useDeepExerciseSequence } from "../useDeepExerciseSequence.js";
import { DEEP_COPY } from "../../copy.js";

export function NoticeModule({ lesson, state, photoPreviewUrl, onAdvance, onBack }) {
  const packs = lesson?.modules?.notice?.expressionPacks ?? [];
  const sequence = useDeepExerciseSequence(packs);

  if (sequence.stage === "milestone") {
    const summaryItems = packs.map((pack) => ({
      title: pack?.coreExpression ?? "",
      body: pack?.meaningChinese ?? "",
    }));

    return (
      <DeepCourseShell
        lesson={lesson}
        state={state}
        photoPreviewUrl={photoPreviewUrl}
        onBack={onBack}
        onAdvance={onAdvance}
        footerActions={
          <button className="primary-button" type="button" onClick={onAdvance}>
            {DEEP_COPY.continueToInterpret}
          </button>
        }
      >
        <div className="deep-summary-landing">
          <div className="deep-summary-landing-copy">
            <strong>Great job!</strong>
            <p>You completed the Notice stage.</p>
            <span>你已完成 Notice 阶段！</span>
          </div>
          <div className="deep-summary-landing-list">
            {summaryItems.map((item) => (
              <div key={item.title} className="deep-summary-row">
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </div>
            ))}
          </div>
        </div>
      </DeepCourseShell>
    );
  }

  const currentStageData = sequence.currentStageData;

  return (
    <DeepCourseShell
      lesson={lesson}
      state={state}
      photoPreviewUrl={photoPreviewUrl}
      onBack={onBack}
      onAdvance={sequence.advance}
      footerActions={
        <div className="lesson-footer-actions">
          <button className="secondary-button" type="button" onClick={sequence.reset}>
            {DEEP_COPY.reset}
          </button>
          <button className="primary-button" type="button" onClick={sequence.feedback.tone === "success" ? sequence.advance : sequence.check}>
            {sequence.feedback.tone === "success" ? DEEP_COPY.continueToInterpret : DEEP_COPY.check}
          </button>
        </div>
      }
    >
      <DeepExercisePage
        title={currentStageData.title}
        subtitle={currentStageData.subtitle}
        prompt={currentStageData.prompt}
        hint={currentStageData.hint}
        bank={sequence.bank}
        selectedChunks={sequence.selectedChunks}
        feedback={sequence.feedback}
        onToggleChunk={sequence.toggleChunk}
        onReset={sequence.reset}
        onCheck={sequence.check}
        onContinue={sequence.advance}
        continueLabel={DEEP_COPY.continueToInterpret}
        stageLabel={sequence.currentStageLabel}
        showActions={false}
      />
    </DeepCourseShell>
  );
}

export default NoticeModule;
