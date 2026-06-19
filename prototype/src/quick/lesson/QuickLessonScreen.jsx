import React from "react";
import { IconArrowLeft, IconArrowRight, IconCheck, IconRefresh, IconStarFilled } from "@tabler/icons-react";
import { QUICK_STEP_META, QUICK_STEP_ORDER } from "./lesson-state.js";
import { StepProgress } from "./StepProgress.jsx";
import { SeeStep } from "./SeeStep.jsx";
import { LearnStep } from "./LearnStep.jsx";
import { BuildStep } from "./BuildStep.jsx";
import { UseStep } from "./UseStep.jsx";
import { buildHint } from "./lesson-helpers.js";

function ActionButton({ children, onClick, disabled = false }) {
  return (
    <button className={`action-button ${disabled ? "disabled" : ""}`} type="button" onClick={onClick} disabled={disabled}>
      <span>{children}</span>
    </button>
  );
}

export function QuickLessonScreen({
  lesson,
  level,
  activeStep,
  onBack,
  onContinue,
  onSpeak,
  speakingKey,
  buildSelectedChunks,
  useSelectedChunks,
  buildFeedback,
  useFeedback,
  buildSolved,
  useSolved,
  onBuildToggle,
  onBuildReset,
  onUseToggle,
  onUseReset,
  onBuildCheck,
  onUseCheck,
  photoPreviewUrl,
  buildBank,
  useBank,
}) {
  const currentStepNumber = QUICK_STEP_ORDER.indexOf(activeStep) + 1;
  const currentMeta = QUICK_STEP_META[activeStep];
  const MetaIcon = currentMeta.icon;

  const buildCanContinue = buildFeedback.tone === "success";
  const useCanFinish = useFeedback.tone === "success";
  const footerDisabled = false;
  const footerLabel = "Continue";

  return (
    <div className="screen lesson-screen">
      <div className="lesson-content">
        <div className="screen-header">
          <button className="back-button" type="button" aria-label="Back" onClick={() => onBack(activeStep)}>
            <IconArrowLeft size={18} />
          </button>
          <div className="screen-header-copy">
            <div className="screen-progress-copy">
              <span className="screen-progress-count">{currentStepNumber} / 4</span>
              <span className="screen-progress-label">{currentMeta.label}</span>
            </div>
          </div>
        </div>

        <StepProgress current={currentStepNumber} />

        <div className="step-icon-row" aria-hidden="true">
          <button className="step-icon-button" type="button" tabIndex={-1}>
            <MetaIcon size={18} />
          </button>
        </div>

        {activeStep === "See" && (
          <SeeStep lesson={lesson} photoPreviewUrl={photoPreviewUrl} onSpeak={onSpeak} speakingKey={speakingKey} onContinue={onContinue} />
        )}
        {activeStep === "Learn" && (
          <LearnStep lesson={lesson} onContinue={onContinue} onSpeak={onSpeak} speakingKey={speakingKey} />
        )}
        {activeStep === "Build" && (
          <BuildStep
            lesson={lesson}
            selectedChunks={buildSelectedChunks}
            bank={buildBank}
            feedback={buildFeedback}
            onToggleChunk={onBuildToggle}
            onReset={onBuildReset}
            onCheck={onBuildCheck}
            onSpeak={onSpeak}
            speakingKey={speakingKey}
          />
        )}
        {activeStep === "Use" && (
          <UseStep
            lesson={lesson}
            selectedChunks={useSelectedChunks}
            bank={useBank}
            feedback={useFeedback}
            onToggleChunk={onUseToggle}
            onReset={onUseReset}
            onCheck={onUseCheck}
            onSpeak={onSpeak}
            speakingKey={speakingKey}
          />
        )}
      </div>

      <div className="lesson-footer">
        {activeStep === "Build" ? (
          <div className="lesson-footer-actions">
            <button className="secondary-button" type="button" onClick={onBuildReset}>
              <IconRefresh size={17} />
              Reset
            </button>
            <button className="primary-button" type="button" onClick={buildCanContinue ? onContinue : onBuildCheck}>
              {buildCanContinue ? "Continue" : "Check"}
              {buildCanContinue ? <IconArrowRight size={18} /> : <IconCheck size={18} />}
            </button>
          </div>
        ) : activeStep === "Use" ? (
          <div className="lesson-footer-actions">
            <button className="secondary-button" type="button" onClick={onUseReset}>
              <IconRefresh size={17} />
              Reset
            </button>
            <button className="primary-button" type="button" onClick={useCanFinish ? onContinue : onUseCheck}>
              {useCanFinish ? "Finish" : "Check"}
              {useCanFinish ? <IconStarFilled size={16} /> : <IconCheck size={18} />}
            </button>
          </div>
        ) : (
          <ActionButton disabled={footerDisabled} onClick={onContinue}>
            {footerLabel}
            <IconArrowRight size={18} />
          </ActionButton>
        )}
      </div>
    </div>
  );
}

export default QuickLessonScreen;
