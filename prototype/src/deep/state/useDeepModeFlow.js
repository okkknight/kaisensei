import { useEffect, useMemo, useState } from "react";
import { DEEP_COURSE_SCHEMA } from "../schema/deep-course-schema.js";
import { createDeepCourseState } from "./deep-course-state.js";

export const DEEP_PHASE_ORDER = ["overview", "notice", "interpret", "interact", "stepIn", "completion"];

export function useDeepModeFlow({ initialFile = null, initialLevel = "Normal", onExitToCamera } = {}) {
  const [phase, setPhase] = useState("overview");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");

  const lesson = useMemo(
    () => ({
      ...DEEP_COURSE_SCHEMA,
      level: initialLevel,
      modules: DEEP_COURSE_SCHEMA.modules,
    }),
    [initialLevel],
  );

  const completedPhases = useMemo(() => {
    return DEEP_PHASE_ORDER.filter((item) => DEEP_PHASE_ORDER.indexOf(item) < DEEP_PHASE_ORDER.indexOf(phase) && item !== "overview");
  }, [phase]);

  const state = useMemo(() => {
    return {
      ...createDeepCourseState({
        level: initialLevel,
        photoPreviewUrl,
      }),
      phase,
      completedPhases,
    };
  }, [completedPhases, initialLevel, photoPreviewUrl, phase]);

  useEffect(() => {
    if (!initialFile) {
      setPhotoPreviewUrl("");
      return undefined;
    }

    const nextUrl = URL.createObjectURL(initialFile);
    setPhotoPreviewUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [initialFile]);

  function goNext() {
    const currentIndex = DEEP_PHASE_ORDER.indexOf(phase);
    const nextPhase = DEEP_PHASE_ORDER[Math.min(currentIndex + 1, DEEP_PHASE_ORDER.length - 1)];
    setPhase(nextPhase);
  }

  function goBack() {
    if (phase === "overview") {
      onExitToCamera?.();
      return;
    }

    const currentIndex = DEEP_PHASE_ORDER.indexOf(phase);
    const previousPhase = DEEP_PHASE_ORDER[Math.max(currentIndex - 1, 0)];
    setPhase(previousPhase);
  }

  return {
    phase,
    lesson,
    state,
    photoPreviewUrl,
    goNext,
    goBack,
  };
}

export default useDeepModeFlow;
