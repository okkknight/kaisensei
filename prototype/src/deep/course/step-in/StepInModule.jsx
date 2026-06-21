import React from "react";
import { IconArrowRight, IconRefresh } from "@tabler/icons-react";
import { DeepCourseShell } from "../DeepCourseShell.jsx";
import { DeepDialogueFlowPage } from "../DeepDialogueFlowPage.jsx";
import { DeepStepInCompletePage } from "../DeepStepInCompletePage.jsx";
import { DEEP_COPY } from "../../copy.js";
import { useDeepStepInFlow } from "../useDeepStepInFlow.js";

export function StepInModule({ lesson, state, photoPreviewUrl, onAdvance, onBack }) {
  const dialogue = lesson?.modules?.stepIn?.dialogue ?? {};
  const flow = useDeepStepInFlow({
    scene: dialogue.scene ?? "",
    turns: dialogue.turns ?? [],
  });

  function renderFooter() {
    if (flow.isComplete) {
      return (
        <button className="primary-button" type="button" onClick={onAdvance}>
          {DEEP_COPY.finishAction}
          <IconArrowRight size={18} />
        </button>
      );
    }

    return (
      <div className="lesson-footer-actions">
        <button className="secondary-button" type="button" onClick={flow.reset}>
          <IconRefresh size={17} />
          {DEEP_COPY.reset}
        </button>
        <button className="secondary-button" type="button" onClick={flow.hint}>
          {DEEP_COPY.hint}
        </button>
        <button className="primary-button" type="button" onClick={flow.feedback.tone === "success" ? flow.advance : flow.check}>
          {DEEP_COPY.send}
        </button>
      </div>
    );
  }

  return (
    <DeepCourseShell
      lesson={lesson}
      state={state}
      photoPreviewUrl={photoPreviewUrl}
      onBack={onBack}
      onAdvance={onAdvance}
      footerActions={renderFooter()}
    >
      {flow.isComplete ? (
        <DeepStepInCompletePage />
      ) : (
        <DeepDialogueFlowPage
          stageLabel={flow.historyTurns.length === 0 ? "Step In" : flow.currentPromptLabel}
          title={lesson?.modules?.stepIn?.title ?? "Step In"}
          subtitle={lesson?.modules?.stepIn?.goal ?? "Complete one full scene conversation."}
          showHeader={false}
          scene=""
          introCards={[
            {
              label: DEEP_COPY.challengeTitle,
              title: lesson?.modules?.stepIn?.goal ?? "Complete one full scene conversation.",
              body: DEEP_COPY.challengePrompt,
              caption: flow.currentScene,
            },
          ]}
          history={flow.historyTurns}
          prompt={flow.currentPrompt}
          hint=""
          bank={flow.currentBank}
          selectedChunks={flow.selectedChunks}
          feedback={flow.feedback}
          onToggleChunk={flow.toggleChunk}
          onReset={flow.reset}
          onHint={flow.hint}
          onCheck={flow.check}
          onContinue={flow.advance}
          historyEmpty=""
          showActions={false}
        />
      )}
    </DeepCourseShell>
  );
}

export default StepInModule;
