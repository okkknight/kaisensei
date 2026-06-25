import React, { useEffect } from "react";
import { DeepCourseShell } from "../DeepCourseShell.jsx";
import { DeepDialogueComposer, DeepDialogueFlowPage } from "../DeepDialogueFlowPage.jsx";
import { DeepInteractMilestonePage } from "../DeepInteractMilestonePage.jsx";
import { DeepTaskPackGuidePage } from "../DeepTaskPackGuidePage.jsx";
import { DeepExercisePage } from "../DeepExercisePage.jsx";
import DeepStageWaitingPage from "../DeepStageWaitingPage.jsx";
import { DEEP_COPY } from "../../copy.js";
import { useDeepInteractFlow } from "../useDeepInteractFlow.js";
import { useDeepStageWaitGate } from "../useDeepStageWaitGate.js";

export function InteractModule({
  interactVM,
  state,
  photoPreviewUrl,
  generation,
  initialPageIndex = 0,
  onAdvance,
  onBack,
  onRetryStage,
  onBackToCamera,
}) {
  const taskPacks = interactVM?.taskPacks ?? [];
  const flow = useDeepInteractFlow(taskPacks, initialPageIndex);
  const waitGate = useDeepStageWaitGate({
    generation,
    modulePhase: "interact",
    onAdvance,
  });

  useEffect(() => {
    if (!flow.isMilestone) {
      waitGate.resetWait();
    }
  }, [flow.isMilestone, waitGate.resetWait]);

  function handleBack() {
    if (waitGate.isWaiting) {
      waitGate.resetWait();
    }

    const movedWithinModule = flow.back();

    if (!movedWithinModule) {
      onBack();
    }
  }

  if (flow.isMilestone) {
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
            {DEEP_COPY.continueToStepIn}
          </button>
        }
      >
        <DeepInteractMilestonePage taskPacks={taskPacks} />
      </DeepCourseShell>
    );
  }

  const currentPage = flow.currentPage;
  const isDialoguePage = currentPage.kind === "dialogue";
  const primaryActionLabel = isDialoguePage ? DEEP_COPY.send : flow.feedback.tone === "success" ? "Continue" : DEEP_COPY.check;
  const handlePrimaryAction = isDialoguePage ? flow.check : flow.feedback.tone === "success" ? flow.next : flow.check;
  const primaryActionDisabled =
    currentPage.kind === "guide" ? false : isDialoguePage ? !flow.canAttempt : flow.feedback.tone === "success" ? false : !flow.canAttempt;

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
          liveTurns={flow.liveTurns}
          showHistory={currentPage.showHistory !== false}
          showComposer={false}
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
      dock={
        currentPage.kind === "dialogue" ? (
          <DeepDialogueComposer
            history={currentPage.history}
            liveTurns={flow.liveTurns}
            userPrompt={currentPage.userPrompt}
            bank={currentPage.bank}
            selectedChunks={flow.selectedChunks}
            feedback={flow.feedback}
            onToggleChunk={flow.toggleChunk}
          />
        ) : null
      }
      footerActions={
        currentPage.kind === "guide" ? (
          <button className="primary-button" type="button" onClick={flow.next}>
            {DEEP_COPY.startPractice} →
          </button>
        ) : currentPage.kind === "dialogue" && flow.isPlaybackActive ? (
          <div className="lesson-footer-spacer" />
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
