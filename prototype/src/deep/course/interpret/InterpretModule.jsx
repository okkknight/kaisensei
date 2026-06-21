import React from "react";
import { IconSparkles } from "@tabler/icons-react";
import { DeepCourseShell } from "../DeepCourseShell.jsx";
import { DeepExercisePage } from "../DeepExercisePage.jsx";
import { useDeepExerciseSequence } from "../useDeepExerciseSequence.js";
import { DEEP_COPY } from "../../copy.js";

export function InterpretModule({ interpretVM, state, photoPreviewUrl, onAdvance, onBack }) {
  const packs = interpretVM?.expressionPacks ?? [];
  const sequence = useDeepExerciseSequence({
    packs,
    moduleKey: "interpret",
  });

  function handleBack() {
    const movedWithinModule = sequence.back();

    if (!movedWithinModule) {
      onBack();
    }
  }

  if (sequence.isMilestone) {
    return (
      <DeepCourseShell
        state={state}
        photoPreviewUrl={photoPreviewUrl}
        onBack={handleBack}
        onAdvance={onAdvance}
        footerActions={
          <button className="primary-button" type="button" onClick={onAdvance}>
            {DEEP_COPY.continueToInteract}
          </button>
        }
      >
        <div className="deep-summary-landing">
          <div className="deep-summary-landing-copy">
            <strong>Great job!</strong>
            <p>You've completed the Interpret stage.</p>
            <span>你已完成 Interpret 阶段！</span>
          </div>
          <div className="deep-summary-landing-list">
            <div className="deep-summary-section-title">{DEEP_COPY.completedInterpretTitle}</div>
            {sequence.milestoneItems.map((item) => (
              <div key={item.title} className="deep-summary-row">
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="deep-summary-landing-icon">
          <IconSparkles size={20} />
        </div>
      </DeepCourseShell>
    );
  }

  const currentPage = sequence.currentPage;

  return (
    <DeepCourseShell
      state={state}
      photoPreviewUrl={photoPreviewUrl}
      pageProgressLabel={interpretVM?.title ?? "Interpret"}
      pageProgressCurrent={sequence.progressCurrent}
      pageProgressTotal={sequence.progressTotal}
      onBack={handleBack}
      onAdvance={sequence.next}
      footerActions={
        <div className="lesson-footer-actions">
          <button className="secondary-button" type="button" onClick={sequence.reset}>
            {DEEP_COPY.reset}
          </button>
          <button className="secondary-button" type="button" onClick={sequence.hint}>
            {DEEP_COPY.hint}
          </button>
          <button className="primary-button" type="button" onClick={sequence.check} disabled={!sequence.isReadyToCheck}>
            {DEEP_COPY.check}
          </button>
        </div>
      }
    >
      <DeepExercisePage
        kind={currentPage.kind}
        label={currentPage.label}
        instruction={currentPage.instruction}
        stepLabel={currentPage.stepLabel}
        englishSentence={currentPage.englishSentence}
        englishHighlight={currentPage.englishHighlight}
        sentenceWithBlanks={currentPage.sentenceWithBlanks}
        chineseReference={currentPage.chineseReference}
        promptChinese={currentPage.promptChinese}
        question={currentPage.question}
        questionChinese={currentPage.questionChinese}
        speakText={currentPage.speakText}
        bank={currentPage.bank}
        selectedChunks={sequence.selectedChunks}
        feedback={sequence.feedback}
        onToggleChunk={sequence.toggleChunk}
      />
    </DeepCourseShell>
  );
}

export default InterpretModule;
