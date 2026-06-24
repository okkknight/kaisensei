import React, { useEffect } from "react";
import { IconSparkles } from "@tabler/icons-react";
import { DeepCourseShell } from "../DeepCourseShell.jsx";
import { DeepExercisePage } from "../DeepExercisePage.jsx";
import DeepStageWaitingPage from "../DeepStageWaitingPage.jsx";
import { useDeepExerciseSequence } from "../useDeepExerciseSequence.js";
import { useDeepStageWaitGate } from "../useDeepStageWaitGate.js";
import { DEEP_COPY } from "../../copy.js";

export function NoticeModule({ noticeVM, state, photoPreviewUrl, generation, onAdvance, onBack, onRetryStage, onBackToCamera }) {
  const packs = noticeVM?.expressionPacks ?? [];
  const sequence = useDeepExerciseSequence({
    packs,
    moduleKey: "notice",
  });
  const waitGate = useDeepStageWaitGate({
    generation,
    modulePhase: "notice",
    onAdvance,
  });

  useEffect(() => {
    if (!sequence.isMilestone) {
      waitGate.resetWait();
    }
  }, [sequence.isMilestone, waitGate.resetWait]);

  function handleBack() {
    if (waitGate.isWaiting) {
      waitGate.resetWait();
    }

    const movedWithinModule = sequence.back();

    if (!movedWithinModule) {
      onBack();
    }
  }

  if (sequence.isMilestone) {
    if (waitGate.isWaiting) {
      return (
        <DeepStageWaitingPage
          state={state}
          photoPreviewUrl={photoPreviewUrl}
          onBack={handleBack}
          onRetry={onRetryStage}
          onBackToCamera={onBackToCamera}
          isFailed={waitGate.gateState.isFailed}
        />
      );
    }

    return (
      <DeepCourseShell
        state={state}
        photoPreviewUrl={photoPreviewUrl}
        onBack={handleBack}
        onAdvance={onAdvance}
        footerActions={
          <button className="primary-button" type="button" onClick={waitGate.continueOrWait}>
            {DEEP_COPY.continueToInterpret}
          </button>
        }
      >
        <div className="deep-summary-landing">
          <div className="deep-summary-landing-copy">
            <strong>Great job!</strong>
            <p>You've completed the Notice stage.</p>
            <span>你已完成 Notice 阶段！</span>
          </div>
          <div className="deep-summary-landing-list">
            <div className="deep-summary-section-title">{DEEP_COPY.completedNoticeTitle}</div>
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
  const primaryActionLabel = sequence.feedback.tone === "success" ? "Continue" : DEEP_COPY.check;
  const handlePrimaryAction = sequence.feedback.tone === "success" ? sequence.next : sequence.check;
  const primaryActionDisabled = sequence.feedback.tone === "success" ? false : !sequence.canAttempt;

  return (
    <DeepCourseShell
      state={state}
      photoPreviewUrl={photoPreviewUrl}
      pageProgressLabel={noticeVM?.title ?? "Notice"}
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
          <button className="primary-button" type="button" onClick={handlePrimaryAction} disabled={primaryActionDisabled}>
            {primaryActionLabel}
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
        selectionLimit={sequence.selectionLimit}
        feedback={sequence.feedback}
        onToggleChunk={sequence.toggleChunk}
      />
    </DeepCourseShell>
  );
}

export default NoticeModule;
