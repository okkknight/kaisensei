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
        <button className="primary-button" type="button" onClick={flow.feedback.tone === "success" ? flow.advance : flow.check}>
          {flow.feedback.tone === "success" ? DEEP_COPY.continue : DEEP_COPY.check}
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
        <DeepStepInCompletePage
          title={lesson?.modules?.stepIn?.title ?? "Step In"}
          summaryItems={flow.summaryItems}
          replayTurns={flow.replayTurns}
        />
      ) : (
        <DeepDialogueFlowPage
          stageLabel={flow.currentPromptLabel}
          title={lesson?.modules?.stepIn?.title ?? "Step In"}
          subtitle={lesson?.modules?.stepIn?.goal ?? "Complete one full scene conversation."}
          scene={flow.currentScene}
          introCards={[
            {
              label: "Challenge",
              title: lesson?.modules?.stepIn?.goal ?? "Complete one full scene conversation.",
              body: "Use only the learned chunks to keep the scene moving.",
              caption: flow.currentScene,
            },
          ]}
          history={flow.historyTurns}
          prompt={flow.currentPrompt}
          hint={flow.currentUserTurn?.sourceModule === "notice" ? "Use the Notice sentence." : flow.currentUserTurn?.sourceModule === "interpret" ? "Use the Interpret sentence." : flow.currentUserTurn?.sourceModule === "interact_need" ? "Use the Need line." : "Use the Handle line."}
          bank={flow.currentBank}
          selectedChunks={flow.selectedChunks}
          feedback={flow.feedback}
          onToggleChunk={flow.toggleChunk}
          onReset={flow.reset}
          onCheck={flow.check}
          onContinue={flow.advance}
          continueLabel={DEEP_COPY.continue}
          historyEmpty="The conversation starts with the system prompt."
          showActions={false}
        />
      )}
    </DeepCourseShell>
  );
}

export default StepInModule;
