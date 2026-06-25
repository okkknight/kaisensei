# Kaisensei Step In Continuous Dialogue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework Deep Mode Step In generation so it is built from one anchored Interact Task Pack, a single internal event plan, and a dedicated Step In prompt builder, while keeping the existing output contract and frontend playback unchanged.

**Architecture:** Keep the current Deep staged-generation flow and lesson contract intact, but split prompt construction into a shared base plus a Step In-specific builder. Add a readable summary layer for Step In stage context, keep normalizer changes strictly structural, and verify the split with tests that check both prompt assembly and contract stability. Quick Mode stays untouched.

**Tech Stack:** Node.js, Fastify, React, Vite, node:test, existing Deep Mode provider / prompt / normalizer code.

---

## Baseline Facts

- Deep Mode already uses staged generation.
- `step_in` is the last stage in the Deep pipeline.
- `api/src/deep/services/course-prompt.js` currently still contains Step In-specific wording.
- `api/src/deep/services/staged-generation/deep-stage-prompt.js` currently appends stage-specific instructions to the shared prompt.
- `api/src/deep/services/course-normalizer.js` already validates Step In structure and canonicalizes `sourceModule`.
- The frontend already consumes the existing `modules.stepIn.dialogue` shape and should not need a new contract.

## Locked Decisions

- Step In must anchor on exactly one Interact Task Pack.
- Need and Handle must come from the same task pack.
- Internal event-plan labels stay prompt-internal only.
- `course-prompt.js` keeps only stable shared content.
- Step In-specific wording moves into a dedicated Step In builder.
- Other module prompt wording stays unchanged for this work.
- Normalizer changes, if any, must stay structural and deterministic.
- No new output fields, no second model call, and no semantic-matching engine.

---

## Task 1: Split the shared prompt from Step In-specific wording

**Files:**
- Modify: `api/src/deep/services/course-prompt.js`
- Create: `api/src/deep/services/staged-generation/step-in-prompt.js`
- Modify: `api/test/deep-course-provider.test.js`

**Plan:**
- [ ] Move the Step In-only `STEP IN:` block out of `course-prompt.js` and into a new Step In-specific builder.
- [ ] Keep the shared base prompt focused on stable teaching-language rules that apply across Deep Mode stages.
- [ ] Make the new Step In builder export a function that returns only Step In-specific wording and not the shared base prompt.
- [ ] Keep the other module wording unchanged so Notice, Interpret, and Interact remain behaviorally stable.
- [ ] Update the provider test to prove the shared base no longer contains Step In-only wording while the assembled stage prompt still does.

**Validation:**
- [ ] `npm --prefix api test -- deep-course-provider.test.js`

---

## Task 2: Add Step In summary formatting and stage prompt composition

**Files:**
- Modify: `api/src/deep/services/staged-generation/deep-stage-prompt.js`
- Modify: `api/src/deep/services/staged-generation/deep-stage-context.js`
- Create: `api/src/deep/services/staged-generation/step-in-prompt.js`
- Modify: `api/test/deep-course-provider.test.js`

**Plan:**
- [ ] Add a pure formatter that turns frozen `background.overview`, `background.notice`, `background.interpret`, and `background.interact` into a short human-readable Step In summary block.
- [ ] Keep the summary formatter projection-only: no ranking, no filtering, no semantic rewriting, no hidden selection state.
- [ ] Compose the final `step_in` prompt in this order: shared base prompt, stage wrapper, Step In addendum, summary block, frozen background JSON, stage output wrapper.
- [ ] Keep the raw frozen background JSON in the prompt after the summary so exact field names remain available.
- [ ] Make the stage prompt tests assert the new ordering and the presence of summary blocks, frozen background, and output wrapper.

**Validation:**
- [ ] `npm --prefix api test -- deep-course-provider.test.js`

---

## Task 3: Keep Step In normalizer changes structural only

**Files:**
- Modify: `api/src/deep/services/course-normalizer.js`
- Modify: `api/src/deep/services/staged-generation/deep-stage-normalizer.js`
- Modify: `api/test/deep-course-normalizer.test.js`

**Plan:**
- [ ] Keep the existing Step In dialogue validation path as the main guardrail for turn count, alternation, canonical `sourceModule`, and chunk/answer reconstruction.
- [ ] If extra tightening is needed, add only shape-only checks for `scene`, `sceneChinese`, and non-empty `speaker` / `text` fields.
- [ ] Avoid any semantic checks that try to judge coherence, emotional quality, or event correctness.
- [ ] Make sure `need` and `handle` aliases still canonicalize to `interact_need` and `interact_handle`.
- [ ] Add tests that prove the normalizer still accepts valid Step In payloads and rejects malformed dialogue shapes without introducing semantic rules.

**Validation:**
- [ ] `npm --prefix api test -- deep-course-normalizer.test.js`

---

## Task 4: Keep provider assembly thin and stage-aware

**Files:**
- Modify: `api/src/deep/services/deep-codex-cli-provider.js`
- Modify: `api/src/deep/services/deep-gemini-api-provider.js`
- Modify: `api/src/deep/services/staged-generation/deep-stage-prompt.js`
- Modify: `api/test/deep-course-provider.test.js`

**Plan:**
- [ ] Keep the provider path thin: workspace, prompt, model call, JSON extraction, parse, normalize.
- [ ] Ensure `step_in` uses the new Step In builder under the hood without a custom provider branch.
- [ ] Keep `generateStage({ stage: "step_in" })` as the real entrypoint the tests exercise.
- [ ] Preserve the existing quick provider path unchanged.
- [ ] Add prompt assertions that prove the assembled Step In prompt still contains the stage marker, frozen background marker, and stage output wrapper.

**Validation:**
- [ ] `npm --prefix api test -- deep-course-provider.test.js`

---

## Task 5: Lock the contract boundary in the spec-adjacent tests

**Files:**
- Modify: `api/test/deep-course-provider.test.js`
- Modify: `api/test/deep-course-normalizer.test.js`
- Modify: `api/test/job-runner.test.js`

**Plan:**
- [ ] Add test coverage that proves the prompt split did not change the output JSON shape.
- [ ] Keep the 8-turn Step In dialogue structure as the expected contract.
- [ ] Assert that the provider still normalizes returned Step In payloads.
- [ ] Assert that the staged generation orchestration still treats `step_in` as the final stage.
- [ ] Add a regression test that catches Step In wording drifting back into the shared base prompt.

**Validation:**
- [ ] `npm --prefix api test`

---

## Task 6: Final verification

**Files:**
- None new; run against the files touched above.

**Plan:**
- [ ] Verify the assembled Step In prompt reads as one coherent instruction set rather than a pile of appended rules.
- [ ] Verify the shared base prompt no longer owns Step In-only strategy.
- [ ] Verify the Step In summary layer is present and compact.
- [ ] Verify the returned lesson contract still matches the current frontend playback expectations.
- [ ] Verify Quick Mode behavior has not changed.

**Validation:**
- [ ] `npm --prefix api test`

---

## Self-check

- The plan is split around the real implementation boundaries: shared prompt, Step In builder, summary formatter, normalizer, provider, and tests.
- No task introduces a new output schema, a second model call, or semantic post-processing.
- Quick Mode remains out of scope.
- The frontend contract remains unchanged.
