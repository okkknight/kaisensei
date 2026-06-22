import React from "react";
import { DeepCourseShell } from "../DeepCourseShell.jsx";
import { DeepDialogueFlowPage } from "../DeepDialogueFlowPage.jsx";
import { DeepInteractMilestonePage } from "../DeepInteractMilestonePage.jsx";
import { DeepTaskPackGuidePage } from "../DeepTaskPackGuidePage.jsx";
import { DeepExercisePage } from "../DeepExercisePage.jsx";
import { DEEP_COPY } from "../../copy.js";
import { useDeepInteractFlow } from "../useDeepInteractFlow.js";

export function InteractModule({ interactVM, state, photoPreviewUrl, onAdvance, onBack }) {
  const taskPacks = interactVM?.taskPacks ?? [];
  const flow = useDeepInteractFlow(taskPacks);

  function handleBack() {
    const movedWithinModule = flow.back();

    if (!movedWithinModule) {
      onBack();
    }
  }

  if (flow.isMilestone) {
      return (
        <DeepCourseShell
          state={state}
          photoPreviewUrl={photoPreviewUrl}
          onBack={handleBack}
          onAdvance={onAdvance}
          footerActions={
            <button className="primary-button" type="button" onClick={onAdvance}>
              {DEEP_COPY.continueToStepIn}
          </button>
        }
      >
        <DeepInteractMilestonePage taskPacks={taskPacks} />
      </DeepCourseShell>
    );
  }

  const currentPage = flow.currentPage;
  const primaryActionLabel =
    currentPage.kind === "dialogue"
      ? flow.feedback.tone === "success"
        ? "Continue"
        : DEEP_COPY.send
      : flow.feedback.tone === "success"
        ? "Continue"
        : DEEP_COPY.check;
  const handlePrimaryAction = flow.feedback.tone === "success" ? flow.next : flow.check;
  const primaryActionDisabled =
    currentPage.kind === "guide" ? false : flow.feedback.tone === "success" ? false : !flow.canAttempt;

  const body = (() => {
    if (currentPage.kind === "guide") {
      return (
        <DeepTaskPackGuidePage
          taskTitle={currentPage.title}
          scenePrompt={currentPage.scene}
          scenePromptChinese={currentPage.sceneChinese}
          needExpression={currentPage.needExpression}
          needMeaning={currentPage.needMeaning}
          handleExpression={currentPage.handleExpression}
          handleMeaning={currentPage.handleMeaning}
        />
      );
    }

    if (currentPage.kind === "dialogue") {
      return (
        <DeepDialogueFlowPage
          scene={currentPage.scene}
          sceneChinese={currentPage.sceneChinese}
          history={currentPage.history}
          userPrompt={currentPage.userPrompt}
          bank={currentPage.bank}
          selectedChunks={flow.selectedChunks}
          feedback={flow.feedback}
          onToggleChunk={flow.toggleChunk}
        />
      );
    }

    return (
      <DeepExercisePage
        kind={currentPage.pageType}
        label={currentPage.title}
        instruction={currentPage.instruction}
        stepLabel={currentPage.stepLabel}
        englishSentence={currentPage.englishSentence}
        englishHighlight={currentPage.englishHighlight}
        sentenceWithBlanks={currentPage.sentenceWithBlanks}
        chineseReference={currentPage.chineseReference}
        promptChinese={currentPage.promptChinese}
        speakText={currentPage.speakText}
        bank={currentPage.bank}
        selectedChunks={flow.selectedChunks}
        selectionLimit={flow.selectionLimit}
        feedback={flow.feedback}
        onToggleChunk={flow.toggleChunk}
      />
    );
  })();

  return (
    <DeepCourseShell
      state={state}
      photoPreviewUrl={photoPreviewUrl}
      pageProgressLabel={currentPage.kind === "guide" ? "" : interactVM?.title ?? "Interact"}
      pageProgressCurrent={currentPage.kind === "guide" ? 0 : flow.progressCurrent}
      pageProgressTotal={currentPage.kind === "guide" ? 0 : flow.progressTotal}
      onBack={handleBack}
      onAdvance={onAdvance}
      footerActions={
        currentPage.kind === "guide" ? (
          <button className="primary-button" type="button" onClick={flow.next}>
            {DEEP_COPY.startPractice} →
          </button>
        ) : (
          <div className="lesson-footer-actions">
            <button className="secondary-button" type="button" onClick={flow.reset}>
              {DEEP_COPY.reset}
            </button>
            <button className="secondary-button" type="button" onClick={flow.hint}>
              {DEEP_COPY.hint}
            </button>
            <button className="primary-button" type="button" onClick={handlePrimaryAction} disabled={primaryActionDisabled}>
              {primaryActionLabel}
            </button>
          </div>
        )
      }
    >
      {body}
    </DeepCourseShell>
  );
}

export default InteractModule;
