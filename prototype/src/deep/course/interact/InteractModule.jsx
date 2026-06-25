import React, { useEffect } from "react";
import { DeepCourseShell } from "../DeepCourseShell.jsx";
import { DeepDialogueComposer, DeepDialogueFlowPage } from "../DeepDialogueFlowPage.jsx";
import { DeepFeedbackCard } from "../DeepFeedbackCard.jsx";
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
        <DeepInteractMilestonePage taskPacks={taskPacks} photoPreviewUrl={photoPreviewUrl} />
      </DeepCourseShell>
    );
  }

  const currentPage = flow.currentPage;
  const isDialoguePage = currentPage.kind === "dialogue";
  const isSuccessState = flow.feedback.tone === "success";
  const dialogueTaskPrompt = currentPage.dialogueRole === "need"
    ? DEEP_COPY.dialogueTaskPrompt
    : DEEP_COPY.dialogueTaskClosePrompt;
  const dialogueTaskPlacement = currentPage.dialogueRole === "handle" ? "bottom" : "top";
  const primaryActionLabel = isDialoguePage ? (isSuccessState ? "Continue" : DEEP_COPY.send) : isSuccessState ? "Continue" : DEEP_COPY.check;
  const handlePrimaryAction = isDialoguePage ? (isSuccessState ? flow.next : flow.check) : isSuccessState ? flow.next : flow.check;
  const primaryActionDisabled =
    currentPage.kind === "guide" ? false : isSuccessState ? false : isDialoguePage ? !flow.canAttempt : !flow.canAttempt;
  const footerNotice =
    currentPage.kind !== "guide" && !(isDialoguePage && flow.isPlaybackActive) && flow.feedback.tone !== "idle" ? (
      <DeepFeedbackCard tone={flow.feedback.tone} title={flow.feedback.title} body={flow.feedback.body} />
    ) : null;

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
          taskPrompt={dialogueTaskPrompt}
          taskPromptPlacement={dialogueTaskPlacement}
          history={currentPage.history}
          liveTurns={flow.liveTurns}
          feedback={flow.feedback}
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
        activeFeedbackPlacement="footer"
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
      footerNotice={footerNotice}
      dock={
        currentPage.kind === "dialogue" ? (
          <DeepDialogueComposer
            history={currentPage.history}
            liveTurns={flow.liveTurns}
            userPrompt={currentPage.userPrompt}
            showPrompt={false}
            bank={currentPage.bank}
            selectedChunks={flow.selectedChunks}
            feedback={flow.feedback}
            hideSelectionOnSuccess
            activeFeedbackPlacement="footer"
            onToggleChunk={flow.toggleChunk}
          />
        ) : null
      }
      footerActions={
        currentPage.kind === "guide" ? (
          <button className="primary-button" type="button" onClick={flow.next}>
            {DEEP_COPY.startPractice} →
          </button>
        ) : (
          <div className="lesson-footer-actions">
            <button className="secondary-button" type="button" onClick={flow.reset} disabled={currentPage.kind === "dialogue" && flow.isPlaybackActive}>
              {DEEP_COPY.reset}
            </button>
            <button className="secondary-button" type="button" onClick={flow.hint} disabled={currentPage.kind === "dialogue" && flow.isPlaybackActive}>
              {DEEP_COPY.hint}
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={handlePrimaryAction}
              disabled={currentPage.kind === "dialogue" && flow.isPlaybackActive ? true : primaryActionDisabled}
            >
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
