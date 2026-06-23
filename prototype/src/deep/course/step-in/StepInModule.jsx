import React, { useEffect } from "react";
import { DeepCourseShell } from "../DeepCourseShell.jsx";
import { DeepDialogueFlowPage } from "../DeepDialogueFlowPage.jsx";
import { DeepStepInCompletePage } from "../DeepStepInCompletePage.jsx";
import { DEEP_COPY } from "../../copy.js";
import { useDeepStepInFlow } from "../useDeepStepInFlow.js";

export function StepInModule({ stepInVM, state, photoPreviewUrl, onAdvance, onBack, onRestart, onExitToCamera }) {
  const flow = useDeepStepInFlow({
    title: stepInVM?.title ?? "Step In",
    goal: stepInVM?.goal ?? "",
    scene: stepInVM?.scene ?? "",
    turns: stepInVM?.turns ?? [],
  });

  const currentPage = flow.currentPage;

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
      footerActions={
        currentPage?.kind === "guide" ? (
          <button className="primary-button" type="button" onClick={flow.next}>
            {DEEP_COPY.startPractice} →
          </button>
        ) : currentPage?.kind === "turn" && flow.isPlaybackActive ? (
          <div className="lesson-footer-spacer" />
        ) : currentPage?.kind === "complete" ? (
          <div className="lesson-footer-spacer" />
        ) : (
          <div className="lesson-footer-actions">
            <button className="secondary-button" type="button" onClick={flow.reset}>
              {DEEP_COPY.reset}
            </button>
            <button className="secondary-button" type="button" onClick={flow.hint}>
              {DEEP_COPY.hint}
            </button>
            <button className="primary-button" type="button" onClick={flow.check} disabled={!flow.isReadyToCheck}>
              {DEEP_COPY.send}
            </button>
          </div>
        )
      }
    >
      {currentPage?.kind === "guide" ? (
        <div className="deep-guide-page">
          <div className="deep-stage-card deep-guide-task-card">
            <span>{DEEP_COPY.challengeTitle}</span>
            <strong>{stepInVM?.goal ?? ""}</strong>
            <p>{DEEP_COPY.challengePrompt}</p>
            <small>{DEEP_COPY.challengePromptChinese}</small>
            <p>{stepInVM?.scene ?? ""}</p>
          </div>
        </div>
      ) : currentPage?.kind === "complete" ? (
        <DeepStepInCompletePage replayTurns={flow.replayTurns} onRestart={onRestart} onExitToCamera={onExitToCamera} />
      ) : (
        <DeepDialogueFlowPage
          scene={stepInVM?.scene ?? ""}
          history={currentPage.history}
          liveTurns={flow.liveTurns}
          userPrompt={currentPage.userPrompt}
          bank={currentPage.bank}
          selectedChunks={flow.selectedChunks}
          feedback={flow.feedback}
          onToggleChunk={flow.toggleChunk}
        />
      )}
    </DeepCourseShell>
  );
}

export default StepInModule;
