# Kaisensei Deep Mode Frontend Implementation Plan

> **For agentic workers:** Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. The work should be executed in phases, with spec feedback written back after each phase.

**Goal:** Turn `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-frontend-spec.md` into a runnable Deep Mode frontend skeleton that gets the page structure, flow, and interaction hierarchy right first, then allows visual styling to be layered on later.

**Recommended strategy:** Do not build page-by-page in a flat list. Start with the shared skeleton and templates, then validate them with one reference slice, then expand by page family, then wire global interaction behavior, and only then do polish and acceptance passes. This is the safest way to test whether the spec is precise enough and to prevent every page from being redrawn independently.

**Architecture:** Keep `prototype/src/App.jsx` as a thin entry, keep `AppShell` as the route and mode boundary, use `DeepCourseShell` as a template dispatcher instead of a visual shell, and let page families reuse a small set of templates: `EntryPage`, `SingleExercisePage`, `QuickResponsePage`, `DialogueFlowPage`, and `SummaryPage`. Reusable primitives should stay limited to layout and interaction building blocks such as `TopBar`, `MainCard`, `InputDock`, `Timeline`, `SummaryStack`, and `CTABar`.

**Tech Stack:** React, Vite, plain JavaScript, existing browser APIs, current Deep Mode scaffold under `prototype/src/deep/`, and the current Quick Mode implementation as a non-target baseline.

---

## Scope

### In scope

- Align the frontend implementation to the finalized Deep Mode frontend spec
- Keep Deep Mode isolated from Quick Mode behavior and data flow
- Build the global reusable skeleton and template layer first
- Implement every Deep Mode page family in the spec
- Validate the spec against the real code after each phase and record any mismatch
- Preserve the current Quick Mode implementation unchanged unless a shared boundary is explicitly required

### Out of scope

- No backend contract changes in this plan
- No final visual redesign work
- No Quick Mode behavior changes
- No new Deep Mode content generation logic
- No cross-mode lesson sharing

---

## Plan Shape

This plan intentionally has one verification loop:

1. freeze the rules
2. build the reusable skeleton
3. implement one reference slice
4. expand by page family
5. wire cross-page interaction
6. polish and verify
7. write back any spec corrections discovered during implementation

The reference slice is important. Without it, the skeleton can look correct in theory but still fail once real page details land.

---

## Phase 0: Freeze the implementation contract

**Objective:** Make sure the implementation plan matches the current codebase, the product design doc, and the frontend spec before code changes start.

**Files to review:**
- `docs/kaisensei_deep_mode_product_design.md`
- `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-frontend-spec.md`
- `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-spec.md`
- `prototype/src/App.jsx`
- `prototype/src/app/AppShell.jsx`
- `prototype/src/app/CameraEntry.jsx`
- `prototype/src/deep/DeepModeApp.jsx`
- `prototype/src/deep/course/DeepCourseShell.jsx`
- `prototype/src/deep/state/useDeepModeFlow.js`

**Checklist:**
- [ ] Confirm the authoritative page chain: `loading -> overview -> notice -> interpret -> interact -> stepIn -> completion`
- [ ] Confirm the page-family map and template map from the frontend spec
- [ ] Confirm the shared-vs-isolated boundary between Quick Mode and Deep Mode
- [ ] Confirm which captions are documentation only and not real UI
- [ ] Record any remaining ambiguity as explicit open questions before implementation begins

**Exit criteria:**
- The team can point to one exact page chain and one exact template set
- No unresolved boundary is being silently assumed
- The implementation order below can proceed without inventing new architecture

---

## Phase 1: Build the reusable skeleton first

**Objective:** Put the app on a reusable foundation so later pages reuse structure instead of re-creating it.

**Target files:**
- `prototype/src/App.jsx`
- `prototype/src/app/AppShell.jsx`
- `prototype/src/app/CameraEntry.jsx`
- `prototype/src/app/modeRegistry.js`
- `prototype/src/deep/DeepModeApp.jsx`
- `prototype/src/deep/course/DeepCourseShell.jsx`
- `prototype/src/deep/course/module-registry.js`
- `prototype/src/deep/state/useDeepModeFlow.js`
- `prototype/src/deep/schema/deep-course-schema.js`
- `prototype/src/deep/copy.js`
- `prototype/src/deep/storage.js`
- `prototype/src/shared/ui/*` if a shared primitive layer is introduced

**What to build:**
- Thin app entry and routing-only shell
- Camera entry as the only first-screen handoff surface
- Deep mode phase state and view-model wiring
- Template dispatcher instead of a visible global course shell
- Reusable primitives for top bar, main card, input dock, timeline, summary stack, and CTA bar
- A backend-to-view-model mapping layer that page components consume instead of raw payloads

**Checklist:**
- [ ] Keep `App.jsx` as a thin wrapper
- [ ] Keep `AppShell` focused on camera/deep/quick routing only
- [ ] Keep `CameraEntry` as the shared input surface
- [ ] Make `DeepCourseShell` select templates rather than invent a new shell
- [ ] Add or confirm the reusable primitives that all page families will share
- [ ] Add or confirm the Deep view-model mapping layer

**Exit criteria:**
- The app can still start from the camera entry
- Deep Mode has a clear routing and state shell
- Page families can be rendered through reusable templates instead of one-off pages

---

## Phase 2: Implement the reference slice

**Objective:** Validate the spec and the reusable templates against one real end-to-end slice before scaling out.

**Reference slice:** `Loading -> Overview -> Notice`

**Why this slice first:**
- It validates the entry template and the first exercise template
- It tests field provenance on the simplest real Deep Mode flow
- It reveals whether the page template boundaries are stable enough before more families are added
- It gives an early signal on whether the spec over- or under-describes page structure

**Target files:**
- `prototype/src/deep/overview/DeepOverviewScreen.jsx`
- `prototype/src/deep/loading/*` if loading UI is still embedded elsewhere
- `prototype/src/deep/course/notice/*`
- `prototype/src/deep/course/ModuleProgress.jsx`
- `prototype/src/deep/course/DeepCourseShell.jsx`
- `prototype/src/deep/course/module-registry.js`

**What to build:**
- Loading page structure and copy
- Overview page structure and card hierarchy
- `Notice - Understand`
- `Notice - Focus`
- `Notice - Build`
- `Notice - Quick Response`
- `Notice Milestone`

**Checklist:**
- [ ] Make the loading page match the fixed loading structure in the spec
- [ ] Make the overview page map cleanly to `overview` fields
- [ ] Implement the Notice family using the correct page templates
- [ ] Ensure every visible block has field provenance
- [ ] Ensure Notice milestone uses `SummaryPage` rather than the practice templates

**Exit criteria:**
- The first Deep Mode slice runs end-to-end without spec ambiguity
- The UI can be built from the spec without inventing missing regions
- Any mismatch between spec and implementation is recorded immediately

---

## Phase 3: Expand Interpret using the same templates

**Objective:** Prove that the Notice templates and logic generalize to a second page family without redesigning the page skeleton.

**Target files:**
- `prototype/src/deep/course/interpret/*`
- shared template primitives and registry files touched in Phase 1

**What to build:**
- `Interpret - Understand`
- `Interpret - Focus`
- `Interpret - Build`
- `Interpret - Quick Response`
- `Interpret Milestone`

**Checklist:**
- [ ] Reuse the same `SingleExercisePage` and `QuickResponsePage` skeletons
- [ ] Keep Interpret page-specific fields separate from Notice fields
- [ ] Verify the milestone page still fits the `SummaryPage` template
- [ ] Confirm that shared components did not swallow page-specific layout differences

**Exit criteria:**
- Interpret is implemented without new page skeletons
- The spec’s “shared template, distinct page” rule survives a second family
- The implementation does not drift back into one-off page layout logic

---

## Phase 4: Expand Interact with explicit task-pack and dialogue behavior

**Objective:** Implement the more complex family that combines repeated exercise pages with dialogue-flow pages, while preserving the template discipline.

**Target files:**
- `prototype/src/deep/course/interact/*`
- `prototype/src/deep/course/ModuleProgress.jsx`
- `prototype/src/deep/course/module-registry.js`

**What to build:**
- `Need - Understand`
- `Need - Focus`
- `Need - Build`
- `Handle - Understand`
- `Handle - Focus`
- `Handle - Build`
- `Dialogue Practice - Need`
- `Dialogue Practice - Handle`
- Interact milestone

**Checklist:**
- [ ] Keep Need and Handle as separate three-step exercise sequences
- [ ] Reuse `SingleExercisePage` for the six exercise pages
- [ ] Reuse `DialogueFlowPage` for the two dialogue pages
- [ ] Keep the dialogue pages linear and turn-based
- [ ] Ensure the milestone page only summarizes the task pack results

**Exit criteria:**
- Interact works without introducing a new template
- The dialogue pages stay distinct from the exercise pages
- The spec’s page family split remains legible in code

---

## Phase 5: Implement Step In and the final completion path

**Objective:** Build the final dialogue flow and the end-state summary pages using the same template discipline.

**Target files:**
- `prototype/src/deep/course/step-in/*`
- `prototype/src/deep/completion/DeepCompletionScreen.jsx`
- `prototype/src/deep/state/deep-course-state.js`

**What to build:**
- `Step In` dialogue flow with explicit turn states
- final completion feedback state
- final `Completion` page with photo, completion message, four-stage summary, dialogue replay, and dual CTA

**Checklist:**
- [ ] Keep `Step In` as a dialogue-flow page family, not a new lesson type
- [ ] Ensure the final completion page uses `SummaryPage`
- [ ] Reuse the learned expression summaries instead of generating new content
- [ ] Preserve the two-button completion CTA structure from the spec

**Exit criteria:**
- The complete Deep Mode flow ends in a valid summary page
- The final screen can be implemented directly from the spec
- No new page skeleton was introduced for the end state

---

## Phase 6: Wire global interaction behavior and cross-page consistency

**Objective:** Make the shared interaction rules consistent across the whole Deep Mode flow.

**Cross-cutting concerns:**
- progress behavior
- reset / hint / verify behavior
- back / return behavior
- empty, loading, and error states
- persistence boundaries
- photo preview reuse

**Checklist:**
- [ ] Confirm the four-part main progress works everywhere it should
- [ ] Confirm module-internal progress works in the exercise families
- [ ] Confirm back behavior matches the spec for each page family
- [ ] Confirm Hint and Reset do not expose complete answers too early
- [ ] Confirm error states are explicit and do not collapse into blank pages

**Exit criteria:**
- Interaction rules feel coherent across page families
- Shared controls behave the same without flattening page-specific logic

---

## Phase 7: Spec feedback loop and final verification

**Objective:** Test whether the spec actually held up in implementation and write back any corrections.

**Checklist:**
- [ ] Compare the implemented structure against the page-by-page spec
- [ ] Record any ambiguous or missing spec detail discovered during implementation
- [ ] Update the spec if the implementation forced a justified boundary clarification
- [ ] Verify the build and smoke-test the main Deep Mode path
- [ ] Verify the UI can be understood from the spec without reading code first

**Exit criteria:**
- The implementation matches the spec at the level of pages, templates, fields, and interactions
- Any new ambiguity is either resolved or explicitly parked
- The plan has been validated against the actual result, not an idealized result

---

## Recommended Task Order

1. Freeze the contract
2. Build the reusable skeleton
3. Implement the reference slice
4. Expand Interpret
5. Expand Interact
6. Implement Step In and Completion
7. Wire global interaction behavior
8. Verify and feed corrections back into the spec

This order is intentionally not “all pages in sequence.” The reference slice proves the templates before the rest of the family is scaled out.

---

## Risks To Watch

- Treating `DeepCourseShell` as a visible shell instead of a template dispatcher
- Letting shared primitives leak business meaning
- Recreating page layout per page instead of per template
- Letting the implementation drift away from the page-family map
- Failing to feed implementation discoveries back into the spec

---

## Definition of Done

The plan is complete when:

1. the frontend can render the full Deep Mode chain
2. the implementation uses the reusable templates instead of one-off page shells
3. each page family maps cleanly to the spec
4. the global interaction rules are consistent
5. the spec has been corrected wherever the real implementation exposed a gap

