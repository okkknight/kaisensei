import React, { useEffect } from "react";
import { DeepCourseShell } from "../DeepCourseShell.jsx";
import { DeepDialogueComposer, DeepDialogueFlowPage } from "../DeepDialogueFlowPage.jsx";
import { DeepFeedbackCard } from "../DeepFeedbackCard.jsx";
import { DeepStepInCompletePage } from "../DeepStepInCompletePage.jsx";
import { DEEP_COPY } from "../../copy.js";
import { useDeepStepInFlow } from "../useDeepStepInFlow.js";
import { VoiceButton } from "../../../quick/lesson/VoiceButton.jsx";
import { useDeepSpeech } from "../../useDeepSpeech.js";

export function StepInModule({ stepInVM, state, photoPreviewUrl, onAdvance, onBack, onRestart, onExitToCamera, initialPageIndex = 0 }) {
  const speech = useDeepSpeech();
  const flow = useDeepStepInFlow({
    title: stepInVM?.title ?? "Step In",
    goal: stepInVM?.goal ?? "",
    scene: stepInVM?.scene ?? "",
    sceneChinese: stepInVM?.sceneChinese ?? "",
    turns: stepInVM?.turns ?? [],
    initialPageIndex,
  });

  const currentPage = flow.currentPage;
  const isSuccessState = flow.feedback.tone === "success";
  const footerNotice =
    currentPage?.kind === "turn" && !flow.isPlaybackActive && flow.feedback.tone !== "idle" ? (
      <DeepFeedbackCard tone={flow.feedback.tone} title={flow.feedback.title} body={flow.feedback.body} />
    ) : null;

  useEffect(() => {
    if (currentPage?.kind !== "complete") {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      onAdvance();
    }, 1400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [currentPage?.kind, onAdvance]);

  function handleBack() {
    const movedWithinModule = flow.back();

    if (!movedWithinModule) {
      onBack();
    }
  }

  return (
    <DeepCourseShell
      state={state}
      photoPreviewUrl={photoPreviewUrl}
      pageProgressLabel={currentPage?.kind === "turn" ? stepInVM?.title ?? "Step In" : ""}
      pageProgressCurrent={currentPage?.kind === "turn" ? flow.progressCurrent : 0}
      pageProgressTotal={currentPage?.kind === "turn" ? flow.progressTotal : 0}
      onBack={handleBack}
      onAdvance={onAdvance}
      footerNotice={footerNotice}
      dock={
        currentPage?.kind === "turn" ? (
          <DeepDialogueComposer
            history={flow.visibleHistory}
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
        currentPage?.kind === "guide" ? (
          <button className="primary-button" type="button" onClick={flow.next}>
            {DEEP_COPY.startPractice} →
          </button>
        ) : currentPage?.kind === "complete" ? (
          <div className="lesson-footer-spacer" />
        ) : (
          <div className="lesson-footer-actions">
            <button className="secondary-button" type="button" onClick={flow.reset} disabled={currentPage?.kind === "turn" && flow.isPlaybackActive}>
              {DEEP_COPY.reset}
            </button>
            <button className="secondary-button" type="button" onClick={flow.hint} disabled={currentPage?.kind === "turn" && flow.isPlaybackActive}>
              {DEEP_COPY.hint}
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={isSuccessState ? flow.next : flow.check}
              disabled={currentPage?.kind === "turn" && flow.isPlaybackActive ? true : isSuccessState ? false : !flow.isReadyToCheck}
            >
              {isSuccessState ? "Continue" : DEEP_COPY.send}
            </button>
          </div>
        )
      }
    >
      {currentPage?.kind === "guide" ? (
        <div className="deep-guide-page">
          <div className="deep-stage-card deep-guide-task-card deep-guide-task-card-stepin">
            <span>{DEEP_COPY.challengeTitle}</span>
            <p className="deep-guide-task-note">{DEEP_COPY.stepInGuideGoal}</p>
            <p>{stepInVM?.scene ?? ""}</p>
            {stepInVM?.sceneChinese ? <small>{stepInVM.sceneChinese}</small> : null}
            {stepInVM?.scene ? (
              <div className="sentence-actions deep-guide-task-audio">
                <VoiceButton
                  onClick={() => speech.speak(stepInVM.scene, "step-in-guide-scene")}
                  active={speech.speakingKey === "step-in-guide-scene"}
                  label="Play sentence"
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : currentPage?.kind === "complete" ? (
        <DeepStepInCompletePage replayTurns={flow.replayTurns} onRestart={onRestart} onExitToCamera={onExitToCamera} />
      ) : (
        <DeepDialogueFlowPage
          history={flow.visibleHistory}
          liveTurns={flow.liveTurns}
          taskPrompt={currentPage.userPrompt}
          taskPromptPlacement="bottom"
          feedback={flow.feedback}
          showComposer={false}
        />
      )}
    </DeepCourseShell>
  );
}

export default StepInModule;
