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
          {DEEP_COPY.startPractice} →
        </button>
      );
    }

    if (flow.stage === "milestone") {
      return (
        <button className="primary-button" type="button" onClick={onAdvance}>
          {DEEP_COPY.continueToStepIn}
        </button>
      );
    }

    const primaryLabel = flow.stage === "dialogueHandle"
      ? DEEP_COPY.send
      : DEEP_COPY.check;

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
          {primaryLabel}
        </button>
      </div>
    );
  }

  const body = (() => {
    if (flow.stage === "guide") {
      return (
        <DeepTaskPackGuidePage
          taskTitle={taskPack?.taskTitle ?? "Interact"}
          scenePrompt={taskPack?.scenePrompt ?? ""}
          needExpression={taskPack?.need?.coreExpression ?? ""}
          needMeaning={taskPack?.need?.meaningChinese ?? ""}
          handleExpression={taskPack?.handle?.coreExpression ?? ""}
          handleMeaning={taskPack?.handle?.meaningChinese ?? ""}
        />
      );
    }

    if (flow.stage === "milestone") {
      return <DeepInteractMilestonePage taskPacks={taskPacks} />;
    }

    if (flow.stage === "dialogueNeed" || flow.stage === "dialogueHandle") {
      const isNeedDialogue = flow.stage === "dialogueNeed";
        return (
          <DeepDialogueFlowPage
            stageLabel={flow.stageLabel}
            title={flow.title}
            subtitle={flow.subtitle}
            showHeader={false}
            scene={flow.scene}
            introCards={[]}
            history={flow.stage === "dialogueNeed"
            ? [{ speaker: "system", text: DEEP_COPY.dialogueNeedOpening, label: "System" }]
            : flow.dialogueHistory}
          prompt={flow.prompt}
          hint=""
          bank={flow.bank}
          selectedChunks={flow.selectedChunks}
          feedback={flow.feedback}
          onToggleChunk={flow.toggleChunk}
          onReset={flow.reset}
          onHint={flow.hint}
          onCheck={flow.check}
          onContinue={flow.advance}
          historyEmpty=""
          emptyMessage={DEEP_COPY.tapChunksToBuild}
          idleMessage={isNeedDialogue ? DEEP_COPY.tapChunksThenCheck : DEEP_COPY.tapChunksThenSend}
          showActions={false}
        />
      );
    }

    return (
        <DeepExercisePage
          title={flow.title}
          subtitle={flow.subtitle}
          prompt={flow.prompt}
          hint=""
          bank={flow.bank}
          selectedChunks={flow.selectedChunks}
          feedback={flow.feedback}
          bankFirst={flow.stage === "needBuild" || flow.stage === "handleBuild"}
          onToggleChunk={flow.toggleChunk}
          onReset={flow.reset}
          onHint={flow.hint}
          onCheck={flow.check}
          stageLabel={flow.stageLabel}
          stepLabel={flow.stepLabel}
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
