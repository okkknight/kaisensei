# Kaisensei Deep Mode Frontend Backbone Plan

> **For agentic workers:** implement this plan in order. Use the Deep Mode frontend spec as the source of truth. Treat the current prototype code as implementation facts only, not as design authority.

**Goal:** Bring the prototype frontend into alignment with [`2026-06-19-kaisensei-deepmode-frontend-spec.md`](../specs/2026-06-19-kaisensei-deepmode-frontend-spec.md) while preserving Quick Mode behavior. The result should be a Deep Mode backbone that can run end-to-end, page family by page family, before visual polish.

**Source hierarchy:**

1. `docs/kaisensei_deep_mode_product_design.md`
2. `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-frontend-spec.md`
3. backend lesson contract / `mode=deep` payload shape
4. current `prototype/src/*` implementation state
5. inference

If the current code conflicts with the spec, change the code. Do not promote current implementation details into design truth.

**Current baseline facts, not design truth:**

- `prototype/src/App.jsx` already delegates to `AppShell`.
- `prototype/src/app/AppShell.jsx` already routes between camera, Quick Mode, and Deep Mode.
- `prototype/src/app/CameraEntry.jsx` already owns capture, upload, mode choice, and level choice.
- `prototype/src/deep/*` already contains a partial Deep Mode scaffold.
- These surfaces are useful starting points, but any mismatch with the new spec must be corrected.

**Execution strategy:**

- freeze the shell and data contract first
- validate one end-to-end reference slice before broad rollout
- implement by page family, not by isolated file
- wire global interactions only after the page families are stable
- verify every phase against the spec and fix drift as soon as it appears

---

## Scope

### In scope

- Align the shell, camera entry, and Deep Mode entry with the new spec
- Normalize the Deep Mode state and data view-model layer
- Implement Deep Mode pages in the spec order: Loading, Overview, Notice / Interpret, Interact, Step In, Completion
- Keep the visible Deep Mode page structure self-contained
- Preserve Quick Mode behavior while Deep Mode is refactored
- Keep shared code limited to mode-agnostic primitives, media, and low-level helpers

### Out of scope

- Quick Mode redesign
- Deep Mode backend redesign unless a field mismatch must be clarified
- Visual polish before structure and interaction are correct
- New feature ideas outside the spec
- Any assumption that current code is the source of truth

---

## Phase 0: Gap audit and baseline freeze

**Objective:** Compare the current code surface against the new spec and record the mismatches before changing behavior.

**Target surfaces:**

- `prototype/src/App.jsx`
- `prototype/src/app/AppShell.jsx`
- `prototype/src/app/CameraEntry.jsx`
- `prototype/src/deep/DeepModeApp.jsx`
- `prototype/src/deep/state/useDeepModeFlow.js`
- `prototype/src/deep/course/*`
- `prototype/src/deep/loading/DeepLoadingScreen.jsx`
- `prototype/src/deep/overview/DeepOverviewScreen.jsx`
- `prototype/src/deep/completion/DeepCompletionScreen.jsx`

**Checklist:**

- [ ] Map the current Deep Mode code surfaces to the new spec page inventory
- [ ] Mark where the current code is only an implementation fact and not a spec match
- [ ] Identify any current wrappers or abstractions that hide page structure too aggressively
- [ ] Identify any current fields or copy values that are not anchored by the spec or backend contract
- [ ] Record the minimum set of files that can be reused versus the files that should be reshaped

**Exit criteria:**

- A clear gap list exists between the current code and the new spec
- No current implementation detail is being treated as design authority
- The implementation order is locked before the first refactor begins

---

## Phase 1: Freeze the shell contract and data handoff

**Objective:** Make the app shell, camera entry, and Deep Mode handoff match the spec before changing page bodies.

**Target surfaces:**

- `prototype/src/App.jsx`
- `prototype/src/app/AppShell.jsx`
- `prototype/src/app/CameraEntry.jsx`
- `prototype/src/app/modeRegistry.js`
- `prototype/src/deep/storage.js`
- `prototype/src/deep/schema/deep-course-schema.js`
- `prototype/src/deep/state/deep-course-state.js`
- `prototype/src/deep/state/useDeepModeFlow.js`

**Checklist:**

- [ ] Keep `App.jsx` as a thin shell
- [ ] Keep `AppShell` routing-only and do not let it absorb Deep Mode page logic
- [ ] Ensure `CameraEntry` owns only capture, upload, mode selection, and level selection
- [ ] Keep Deep Mode entry state separate from Quick Mode state
- [ ] Align the Deep Mode schema and state shape with the new spec, not with current ad hoc fields
- [ ] Confirm that the Deep Mode photo preview lifecycle is browser-local and not coupled to Quick Mode

**Exit criteria:**

- A photo captured from the camera entry can enter Deep Mode with the selected level intact
- Quick Mode and Deep Mode remain isolated at the shell boundary
- The Deep Mode state shape is explicit enough to support the spec page family rollout

---

## Reference Slice

**Slice:** `Loading -> Overview -> Notice - Understand -> Notice - Focus`

**Why this slice:**

- It proves the shell, photo handoff, loading state, overview state, and a reusable exercise page pattern in one narrow path.
- It exercises both a top-level Deep Mode page and the first reusable exercise family.
- It is the smallest slice that can reveal whether the implementation is following the spec or just replaying current code assumptions.

**What it proves:**

- loading progress and loading copy
- overview layout and photo preview
- page-by-page field provenance
- one exercise page with reorder / fill behavior
- return / advance behavior across page boundaries

**What it does not prove:**

- Interact pages
- Step In dialogue flow
- completion and recovery
- global wiring across all page families

---

## Phase 2: Build the reference slice end-to-end

**Objective:** Implement the reference slice exactly as the spec describes it, using the current code only where it matches the spec.

**Target surfaces:**

- `prototype/src/deep/loading/DeepLoadingScreen.jsx`
- `prototype/src/deep/overview/DeepOverviewScreen.jsx`
- `prototype/src/deep/course/DeepCourseShell.jsx`
- `prototype/src/deep/course/ModuleProgress.jsx`
- `prototype/src/deep/course/DeepExercisePage.jsx`
- `prototype/src/deep/course/DeepChunkChip.jsx`
- `prototype/src/deep/course/DeepFeedbackCard.jsx`
- `prototype/src/deep/course/notice/NoticeModule.jsx`
- `prototype/src/deep/course/interpret/InterpretModule.jsx`
- any helper files that currently hide page layout too aggressively

**Checklist:**

- [ ] Make Loading match the spec layout and fixed copy
- [ ] Make Overview match the spec layout, copy, and photo-preview provenance
- [ ] Build one Notice exercise flow so the page structure can be verified against the spec
- [ ] Reshape `DeepCourseShell` so it does not become a visible course wrapper that hides page structure
- [ ] Keep reusable primitives small enough that they do not replace page-level descriptions
- [ ] Remove or flatten any current abstraction that forces a generic template over a page-specific layout

**Exit criteria:**

- The reference slice runs end-to-end
- The visible structure matches the spec page-by-page
- The code can show the page family without depending on a hidden generic course shell

---

## Phase 3: Roll out the Notice / Interpret page family

**Objective:** Complete the Notice and Interpret families as two separate page families that can share reusable primitives but keep their own page descriptions, data sources, and milestones.

**Target surfaces:**

- `prototype/src/deep/course/notice/NoticeModule.jsx`
- `prototype/src/deep/course/interpret/InterpretModule.jsx`
- `prototype/src/deep/course/module-registry.js`
- `prototype/src/deep/course/useDeepExerciseSequence.js`
- `prototype/src/deep/course/deep-flow-utils.js`
- `prototype/src/deep/course/deep-text.js`
- milestone / summary pages for Notice and Interpret

**Checklist:**

- [ ] Implement all Notice pages in the spec order
- [ ] Implement all Interpret pages in the spec order
- [ ] Keep the page-level copy and field provenance separate for each page
- [ ] Keep the page structure self-contained even when the layouts are similar
- [ ] Ensure the milestone pages summarize the correct expressions and stage-specific recovery data
- [ ] Keep `Notice` and `Interpret` aligned in structure but not merged into a single abstract page

**Exit criteria:**

- Notice and Interpret can each run through their full page family
- Milestone pages show stage-specific summaries that match the spec
- No page in this family depends on an invisible shared template map

---

## Phase 4: Roll out the Interact page family

**Objective:** Build the full Interact family, including the task-pack guide, Need / Handle exercise pages, dialogue practice, and the Interact milestone.

**Target surfaces:**

- `prototype/src/deep/course/interact/InteractModule.jsx`
- `prototype/src/deep/course/DeepTaskPackGuidePage.jsx`
- `prototype/src/deep/course/DeepDialogueFlowPage.jsx`
- `prototype/src/deep/course/DeepInteractMilestonePage.jsx`
- `prototype/src/deep/course/useDeepInteractFlow.js`
- `prototype/src/deep/course/DeepExercisePage.jsx`
- any task-pack or dialogue helpers under `prototype/src/deep/course/`

**Checklist:**

- [ ] Implement the task-pack guide page as its own page, not as a hidden intro panel
- [ ] Implement Need and Handle exercises as separate pages in the spec order
- [ ] Keep the dialogue practice pages distinct from the earlier exercise pages
- [ ] Keep task-pack data, dialogue data, and stage summary data separated by source
- [ ] Make sure the Interact milestone reflects the completed need/handle expressions and capability summary required by the spec
- [ ] Remove any code path that assumes Interact is only a generic copy of Notice / Interpret

**Exit criteria:**

- The full Interact family runs in order
- Need / Handle pages and dialogue pages are distinguishable in code and in the UI
- The milestone summary matches the spec and does not depend on guessed fields

---

## Phase 5: Roll out Step In and completion

**Objective:** Implement the final challenge flow, Step In completion feedback, and the final Completion page as distinct pieces.

**Target surfaces:**

- `prototype/src/deep/course/step-in/StepInModule.jsx`
- `prototype/src/deep/course/DeepStepInCompletePage.jsx`
- `prototype/src/deep/completion/DeepCompletionScreen.jsx`
- `prototype/src/deep/course/useDeepStepInFlow.js`
- any shared dialogue helpers used only by Step In

**Checklist:**

- [ ] Implement the Step In challenge guide page
- [ ] Implement the Step In round pages in the spec order
- [ ] Keep the Step In completion feedback distinct from the final Completion page
- [ ] Keep the final Completion page as the course-level result page with the spec’s summaries and replay content
- [ ] Ensure return and replay actions follow the spec instead of current code convenience

**Exit criteria:**

- Step In can run from the guide page through the completion feedback
- The final Completion page can be reached and exited as the spec requires
- Step In completion and course completion are not collapsed into one screen

---

## Phase 6: Wire global interactions and shared behavior

**Objective:** Normalize behaviors that apply across the Deep Mode backbone after the page families are in place.

**Target surfaces:**

- `prototype/src/deep/state/useDeepModeFlow.js`
- `prototype/src/deep/course/module-registry.js`
- `prototype/src/deep/course/ModuleProgress.jsx`
- `prototype/src/deep/course/DeepCourseShell.jsx`
- shared primitives under `prototype/src/shared/` if they genuinely help implementation

**Checklist:**

- [ ] Standardize progress behavior across page families
- [ ] Standardize hint, reset, verify, and advance behaviors
- [ ] Standardize back behavior and exit-to-camera behavior
- [ ] Standardize loading, error, and completion handling
- [ ] Keep shared primitives thin and reusable without reintroducing a hidden page template
- [ ] Remove any global rule that asks page code to infer structure from a family-level abstraction

**Exit criteria:**

- Navigation and interaction behavior feel consistent across all page families
- Shared primitives help implementation without replacing page-specific structure
- Error states are visible and recoverable

---

## Phase 7: Verification, drift cleanup, and spec sync

**Objective:** Check the implementation against the spec page by page and correct any drift.

**Checklist:**

- [ ] Run a build and smoke test the Deep Mode flow end to end
- [ ] Compare each page family against the spec’s layout, component list, field provenance, and interaction flow
- [ ] Fix any page where the current code still reflects an older assumption
- [ ] Remove any leftover wrapper, helper, or copy path that duplicates functionality without helping structure
- [ ] Update the spec only if implementation exposes a real gap in the written contract

**Exit criteria:**

- The build succeeds
- The Deep Mode backbone follows the new spec in structure and behavior
- Any mismatch between spec and implementation is either corrected in code or explicitly surfaced as an open question

---

## Definition of Done

The plan is complete when:

1. The shell and camera handoff obey the new spec.
2. The reference slice runs end-to-end.
3. Notice / Interpret, Interact, Step In, and Completion each exist as spec-aligned page families.
4. Global interaction behavior is consistent and not inferred from a hidden template.
5. Current prototype code remains only a baseline fact, not a source of design truth.

