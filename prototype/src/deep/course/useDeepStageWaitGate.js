import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getDeepGenerationGateState } from "../state/staged-generation/deep-generation-state.js";

export function useDeepStageWaitGate({ generation, modulePhase, onAdvance } = {}) {
  const gateState = useMemo(() => getDeepGenerationGateState(generation, modulePhase), [generation, modulePhase]);
  const [isWaiting, setIsWaiting] = useState(false);
  const autoAdvanceRef = useRef(false);

  useEffect(() => {
    if (!isWaiting) {
      autoAdvanceRef.current = false;
      return undefined;
    }

    if (gateState.isReady && !autoAdvanceRef.current) {
      autoAdvanceRef.current = true;
      onAdvance?.();
      return undefined;
    }

    if (!gateState.isReady) {
      autoAdvanceRef.current = false;
    }

    return undefined;
  }, [gateState.isReady, isWaiting, onAdvance]);

  const continueOrWait = useCallback(() => {
    if (gateState.isReady) {
      onAdvance?.();
      return;
    }

    setIsWaiting(true);
  }, [gateState.isReady, onAdvance]);

  const resetWait = useCallback(() => {
    setIsWaiting(false);
    autoAdvanceRef.current = false;
  }, []);

  return {
    gateState,
    isWaiting,
    continueOrWait,
    resetWait,
  };
}

export default useDeepStageWaitGate;
