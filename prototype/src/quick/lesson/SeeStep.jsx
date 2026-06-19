import React, { useEffect, useState } from "react";
import { IconArrowRight, IconStarFilled } from "@tabler/icons-react";
import { buildSeeSentenceSegments } from "./lesson-helpers.js";
import { VoiceButton } from "./VoiceButton.jsx";

function CameraScene() {
  return (
    <div className="camera-scene" aria-hidden="true">
      <div className="camera-scene-stars" />
      <div className="camera-scene-meteor camera-scene-meteor-one" />
      <div className="camera-scene-meteor camera-scene-meteor-two" />
      <div className="camera-scene-glow camera-scene-glow-left" />
      <div className="camera-scene-glow camera-scene-glow-right" />
    </div>
  );
}

export function SeeStep({ lesson, photoPreviewUrl, onSpeak, speakingKey }) {
  const [translationOpen, setTranslationOpen] = useState(false);
  const [activeChunkId, setActiveChunkId] = useState("");

  useEffect(() => {
    setActiveChunkId("");
    setTranslationOpen(false);
  }, [lesson?.see?.sentence]);

  useEffect(() => {
    function handlePointerDown(event) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (!target.closest(".see-chunk-wrap")) {
        setActiveChunkId("");
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const sentenceSegments = buildSeeSentenceSegments(lesson.see.sentence, lesson.learn.chunks);

  return (
    <div className="lesson-body lesson-body-see">
      <div className="sentence-card see-sentence-card">
        <div className="sentence-card-main">
          <div className="sentence-card-top">
            <div className="sentence-favorite">
              <IconStarFilled size={14} />
            </div>
            <div className="sentence-text see-sentence-text" aria-label={lesson.see.sentence}>
              {sentenceSegments.map((segment, index) => {
                if (segment.type === "text") {
                  return <span key={`see-text-${index}`}>{segment.text}</span>;
                }

                const chunk = segment.chunk;
                const isActive = chunk.id === activeChunkId;
                return (
                  <span className="see-chunk-wrap" key={chunk.id}>
                    {isActive ? (
                      <span className="see-chunk-popover" role="status" aria-live="polite">
                        {chunk.chinese}
                      </span>
                    ) : null}
                    <span
                      className={`see-chunk ${isActive ? "active" : ""}`}
                      onClick={() => setActiveChunkId((current) => (current === chunk.id ? "" : chunk.id))}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isActive}
                      aria-label={`${chunk.text}，${chunk.chinese}`}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setActiveChunkId((current) => (current === chunk.id ? "" : chunk.id));
                        }
                      }}
                    >
                      {segment.text}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="sentence-actions">
          <VoiceButton
            onClick={() => onSpeak(lesson.see.speakText, "see-sentence")}
            active={speakingKey === "see-sentence"}
            label="Play sentence"
          />
        </div>

        <div className="sentence-translation-section">
          <button
            className={`translation-toggle ${translationOpen ? "open" : ""}`}
            type="button"
            onClick={() => setTranslationOpen((current) => !current)}
            aria-expanded={translationOpen}
            aria-controls="see-translation"
          >
            {translationOpen ? "收起中文" : "显示中文"}
            <IconArrowRight size={14} />
          </button>
          {translationOpen ? (
            <div className="sentence-translation-panel" id="see-translation">
              <p className="sentence-translation">{lesson.see.chinese}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="scene-rail">
        {photoPreviewUrl ? (
          <img src={photoPreviewUrl} alt="Selected photo preview" className="scene-thumb" />
        ) : (
          <div className="scene-thumb scene-thumb-preview">
            <CameraScene />
          </div>
        )}
      </div>
    </div>
  );
}

export default SeeStep;
