import { useEffect, useState } from "react";

export function useQuickLessonSpeech() {
  const [speakingKey, setSpeakingKey] = useState("");

  useEffect(
    () => () => {
      window.speechSynthesis?.cancel?.();
    },
    [],
  );

  function speak(text, key) {
    if (!window?.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.97;
    utterance.pitch = 1;
    setSpeakingKey(key);
    utterance.onend = () => {
      setSpeakingKey((current) => (current === key ? "" : current));
    };
    utterance.onerror = () => {
      setSpeakingKey((current) => (current === key ? "" : current));
    };
    window.speechSynthesis.speak(utterance);
  }

  return {
    speakingKey,
    speak,
  };
}

export default useQuickLessonSpeech;
