import React from "react";
import { IconArrowRight, IconRefresh } from "@tabler/icons-react";
import { DeepCourseShell } from "../DeepCourseShell.jsx";
import { DeepDialogueFlowPage } from "../DeepDialogueFlowPage.jsx";
import { DeepInteractMilestonePage } from "../DeepInteractMilestonePage.jsx";
import { DeepTaskPackGuidePage } from "../DeepTaskPackGuidePage.jsx";
import { DeepExercisePage } from "../DeepExercisePage.jsx";
import { DEEP_COPY } from "../../copy.js";
import { useDeepInteractFlow } from "../useDeepInteractFlow.js";

export function InteractModule({ lesson, state, photoPreviewUrl, onAdvance, onBack }) {
  const taskPacks = lesson?.modules?.interact?.taskPacks ?? [];
  const flow = useDeepInteractFlow(taskPacks);
  const taskPack = flow.taskPack;

  function renderFooter() {
    if (flow.stage === "guide") {
      return (
        <button className="primary-button" type="button" onClick={flow.startPractice}>
          {DEEP_COPY.startPractice}
          <IconArrowRight size={18} />
        </button>
      );
    }

    if (flow.stage === "milestone") {
      return (
        <button className="primary-button" type="button" onClick={onAdvance}>
          {DEEP_COPY.continueToStepIn}
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

  const body = (() => {
    if (flow.stage === "guide") {
      return (
        <DeepTaskPackGuidePage
          taskIndex={flow.taskIndex}
          taskTotal={flow.taskTotal}
          taskTitle={taskPack?.taskTitle ?? "Interact"}
          scenePrompt={taskPack?.scenePrompt ?? ""}
          needExpression={taskPack?.need?.coreExpression ?? ""}
          needMeaning={taskPack?.need?.meaningChinese ?? ""}
          handleExpression={taskPack?.handle?.coreExpression ?? ""}
          handleMeaning={taskPack?.handle?.meaningChinese ?? ""}
          lead="Follow the task, then speak and respond naturally."
        />
      );
    }

    if (flow.stage === "milestone") {
      return <DeepInteractMilestonePage taskPacks={taskPacks} />;
    }

    if (flow.stage === "dialogueNeed" || flow.stage === "dialogueHandle") {
      return (
        <DeepDialogueFlowPage
          stageLabel={flow.stageLabel}
          title={flow.title}
          subtitle={flow.subtitle}
          scene={flow.scene}
          introCards={flow.introCards}
          history={flow.dialogueHistory}
          prompt={flow.prompt}
          hint={flow.hint}
          bank={flow.bank}
          selectedChunks={flow.selectedChunks}
          feedback={flow.feedback}
          onToggleChunk={flow.toggleChunk}
          onReset={flow.reset}
          onCheck={flow.check}
          onContinue={flow.advance}
          continueLabel={flow.stage === "dialogueNeed" ? "Continue to Handle" : flow.taskIndex + 1 < flow.taskTotal ? "Continue to next task" : DEEP_COPY.continueToStepIn}
          historyEmpty={flow.stage === "dialogueNeed" ? "Build the Need answer to start the exchange." : "Build the Handle reply to finish the exchange."}
          showActions={false}
        />
      );
    }

    return (
      <DeepExercisePage
        title={flow.title}
        subtitle={flow.subtitle}
        prompt={flow.prompt}
        hint={flow.hint}
        bank={flow.bank}
        selectedChunks={flow.selectedChunks}
        feedback={flow.feedback}
        onToggleChunk={flow.toggleChunk}
        onReset={flow.reset}
        onCheck={flow.check}
        onContinue={flow.advance}
        continueLabel={DEEP_COPY.continue}
        stageLabel={flow.stageLabel}
        showActions={false}
      />
    );
  })();

  return (
    <DeepCourseShell
      lesson={lesson}
      state={state}
      photoPreviewUrl={photoPreviewUrl}
      onBack={onBack}
      onAdvance={onAdvance}
      footerActions={renderFooter()}
    >
      {body}
    </DeepCourseShell>
  );
}

export default InteractModule;
