# Kaisensei Deep Mode Foundation Split Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the prototype into a thin app shell, a shared camera entry, a Quick Mode course domain, and a Deep Mode course domain scaffold that matches the real Deep Mode design. The split must preserve Quick Mode behavior while making Deep Mode easy to grow into a standalone project later.

**Architecture:** The shell owns mode routing and the first photo-input surface only. The shared camera entry handles capture/upload, mode selection, and handoff. Quick Mode keeps its existing See / Learn / Build / Use behavior inside a quick-owned domain. Deep Mode gets its own domain tree that mirrors the product design: overview, Notice, Interpret, Interact, Step In, and completion. Shared code is limited to mode-agnostic UI, media, and low-level helpers.

**Tech Stack:** React, Vite, plain JavaScript, existing browser APIs, `node:test` for helper smoke tests where useful.

---

## Scope

### In scope

- Make `prototype/src/App.jsx` a thin wrapper
- Introduce a shared camera entry that can route to Quick Mode or Deep Mode
- Split Quick Mode into a quick-owned feature domain without changing behavior
- Scaffold Deep Mode using the real product phases from `docs/kaisensei_deep_mode_product_design.md`
- Move only mode-agnostic helpers and primitives into `prototype/src/shared/`
- Keep Quick Mode and Deep Mode storage keys, copy, and state namespaced separately

### Out of scope

- No Deep Mode course content generation yet
- No backend schema changes in this plan
- No redesign of Quick Mode lesson behavior
- No cross-mode shared lesson components
- No speech input

---

## Target File Structure

```text
prototype/src/
  App.jsx
  app/
    AppShell.jsx
    CameraEntry.jsx
    modeRegistry.js
  shared/
    ui/
      Button.jsx
      Card.jsx
      Modal.jsx
      ProgressBar.jsx
      IconButton.jsx
    media/
      image.js
    utils/
      text.js
      time.js
  quick/
    QuickModeApp.jsx
    storage.js
    copy.js
    camera/
      camera-session.js
      camera-controls.jsx
    lesson/
      QuickLessonScreen.jsx
      StepProgress.jsx
      SeeStep.jsx
      LearnStep.jsx
      BuildStep.jsx
      UseStep.jsx
      VoiceButton.jsx
      lesson-state.js
      lesson-helpers.js
  deep/
    DeepModeApp.jsx
    storage.js
    copy.js
    schema/
      deep-course-schema.js
    overview/
      DeepOverviewScreen.jsx
    completion/
      DeepCompletionScreen.jsx
    course/
      DeepCourseShell.jsx
      ModuleProgress.jsx
      module-registry.js
      notice/
        NoticeModule.jsx
      interpret/
        InterpretModule.jsx
      interact/
        InteractModule.jsx
      step-in/
        StepInModule.jsx
    state/
      deep-course-state.js
      useDeepModeFlow.js
```

## Current Baseline Mapping

The split should start from the current working code, not from a blank theoretical layout.

- `prototype/src/App.jsx` is currently the app entry and should become the thin shell.
- `prototype/src/app/AppShell.jsx` should own the route between camera entry, Quick Mode, and Deep Mode.
- `prototype/src/quick/QuickModeApp.jsx` is the current Quick Mode baseline and should be carved into smaller Quick-owned files without changing behavior.
- `prototype/src/shared/media/image.js` can stay shared because it is mode-agnostic.
- `prototype/src/quick/lesson/lesson-helpers.js` should own the current Quick lesson sentence/chunk helpers; anything truly mode-agnostic can be lifted into `shared/` later if needed.
- `prototype/src/deep/DeepModeApp.jsx` should become the Deep entry point shaped by the real Deep Mode product design.
- `prototype/src/deep/state/useDeepModeFlow.js` should own the phase flow, preview URL lifecycle, and navigation shell state.
- `prototype/src/deep/completion/DeepCompletionScreen.jsx` should keep the completion screen isolated from the course shell.

---

## Task 1: Make the shell and camera entry the only shared mode boundary

**Files:**
- Modify: `prototype/src/App.jsx`
- Modify: `prototype/src/app/AppShell.jsx`
- Create: `prototype/src/app/CameraEntry.jsx`
- Create: `prototype/src/app/modeRegistry.js`

- [ ] **Step 1: Define the shell contract**

`App.jsx` should do only this:

```jsx
import { AppShell } from "./app/AppShell.jsx";

export default function App() {
  return <AppShell />;
}
```

`modeRegistry.js` should hold the shared mode names:

```js
export const MODE_QUICK = "quick";
export const MODE_DEEP = "deep";
export const MODE_CAMERA = "camera";
```

- [ ] **Step 2: Move the first-screen camera responsibilities into `CameraEntry`**

`CameraEntry` owns:

- quick/deep mode selection
- Normal / Advanced level selection
- upload / capture intent
- handing photo input and mode choice back to the shell

The shell should decide which domain entry receives the photo:

```jsx
<CameraEntry
  mode={mode}
  level={level}
  onModeChange={setMode}
  onLevelChange={setLevel}
  onCapture={handleCapture}
  onUpload={handleUpload}
/>
```

- [ ] **Step 3: Keep the shell thin and routing-only**

`AppShell` should own the minimal cross-mode state needed to route from the camera entry into the selected mode entry. It should not contain Quick lesson logic, Deep course logic, or mode-specific copy.

- [ ] **Step 4: Verify the shell still starts the app correctly**

Run:

```bash
cd prototype && npm run build
```

Expected:

- build succeeds
- the app still opens to the camera entry
- the mode switch is still available before photo capture

---

## Task 2: Carve the current Quick Mode behavior into its own owned domain

**Files:**
- Modify: `prototype/src/quick/QuickModeApp.jsx`
- Create: `prototype/src/quick/storage.js`
- Create: `prototype/src/quick/copy.js`
- Create: `prototype/src/quick/camera/camera-session.js`
- Create: `prototype/src/quick/camera/camera-controls.jsx`
- Create: `prototype/src/quick/lesson/QuickLessonScreen.jsx`
- Create: `prototype/src/quick/lesson/StepProgress.jsx`
- Create: `prototype/src/quick/lesson/SeeStep.jsx`
- Create: `prototype/src/quick/lesson/LearnStep.jsx`
- Create: `prototype/src/quick/lesson/BuildStep.jsx`
- Create: `prototype/src/quick/lesson/UseStep.jsx`
- Create: `prototype/src/quick/lesson/VoiceButton.jsx`
- Create: `prototype/src/quick/lesson/lesson-state.js`
- Create: `prototype/src/quick/lesson/lesson-helpers.js`

- [ ] **Step 1: Move the Quick lesson UI out of the monolith**

`QuickModeApp.jsx` should become a quick-owned container that delegates to small files for the current camera flow, lesson screen, and each step.

The current 4-step flow must remain unchanged:

```text
See -> Learn -> Build -> Use
```

- [ ] **Step 2: Pull the camera/session side effects into quick-owned helpers**

Anything that is still specific to the current Quick Mode camera-to-lesson flow should live under `quick/`, not in `shared/`.

Examples:

- lesson polling state
- browser TTS triggering
- build/use selection state
- retry and retake handling
- current Quick Mode lesson copy
- current Quick Mode lesson validation

- [ ] **Step 3: Namescope Quick Mode copy and persistence**

`quick/copy.js` should hold Quick-only UI strings.

`quick/storage.js` should own Quick-only local storage keys so future Deep Mode persistence cannot accidentally collide with Quick Mode.

Example key shape:

```js
export const QUICK_STORAGE_PREFIX = "quick:";
```

- [ ] **Step 4: Verify Quick Mode behavior is unchanged**

Run:

```bash
cd prototype && npm run build
```

Then smoke test the running app and confirm:

- camera capture still works
- image upload still works
- lesson generation still works
- See / Learn / Build / Use still behave the same

---

## Task 3: Scaffold Deep Mode using the actual product phases

**Files:**
- Modify: `prototype/src/deep/DeepModeApp.jsx`
- Create: `prototype/src/deep/storage.js`
- Create: `prototype/src/deep/copy.js`
- Create: `prototype/src/deep/schema/deep-course-schema.js`
- Create: `prototype/src/deep/overview/DeepOverviewScreen.jsx`
- Create: `prototype/src/deep/completion/DeepCompletionScreen.jsx`
- Create: `prototype/src/deep/course/DeepCourseShell.jsx`
- Create: `prototype/src/deep/course/ModuleProgress.jsx`
- Create: `prototype/src/deep/course/module-registry.js`
- Create: `prototype/src/deep/course/notice/NoticeModule.jsx`
- Create: `prototype/src/deep/course/interpret/InterpretModule.jsx`
- Create: `prototype/src/deep/course/interact/InteractModule.jsx`
- Create: `prototype/src/deep/course/step-in/StepInModule.jsx`
- Create: `prototype/src/deep/state/deep-course-state.js`
- Create: `prototype/src/deep/state/useDeepModeFlow.js`

- [ ] **Step 1: Encode the Deep Mode phase order from the design**

The Deep Mode scaffold must reflect the product design, not a recycled Quick lesson shape:

```text
Overview -> Notice -> Interpret -> Interact -> Step In -> Completion
```

`module-registry.js` should define those phases and their ordering.

- [ ] **Step 2: Give Deep Mode its own entry and course shell**

`DeepModeApp.jsx` should mount a Deep-specific flow, starting from an overview page rather than jumping straight into the first exercise.

The Deep entry should not import Quick lesson components.
The phase flow, preview URL lifecycle, and next/back navigation should live in `deep/state/useDeepModeFlow.js`, not in the entry component itself.

- [ ] **Step 3: Give Deep Mode its own schema and copy namespace**

`deep-course-schema.js` should model the Deep Mode course shape from the spec:

- overview keywords and scene description
- four major modules
- module-specific expression packs / task packs
- module progress and completion data

`deep/copy.js` should hold Deep-only loading, back, error, continue, and completion text.

`deep/storage.js` should use a `deep:` prefix and never reuse Quick keys.

- [ ] **Step 4: Scaffold module-specific screens without borrowing Quick lesson structure**

Each Deep module should be a distinct file even if the first version is just a scaffold:

- `NoticeModule.jsx`
- `InterpretModule.jsx`
- `InteractModule.jsx`
- `StepInModule.jsx`

This keeps the future implementation aligned with the real Deep curriculum instead of a single generic lesson screen.

- [ ] **Step 5: Verify the Deep scaffold is isolated**

Confirm by inspection that:

- Deep files do not import Quick lesson screens
- Deep copy does not come from Quick copy
- Deep storage uses its own namespace
- Deep module names match the design doc

---

## Task 4: Move only mode-agnostic helpers into shared

**Files:**
- Create or modify only truly mode-agnostic helpers under `prototype/src/shared/`

- [ ] **Step 1: Keep shared code boring**

Only move helpers that do not care whether the user is in Quick Mode or Deep Mode:

- image compression
- generic text normalization
- generic time formatting
- pure button/card/modal/progress primitives

- [ ] **Step 2: Do not put course meaning in shared**

Do not move these into `shared/`:

- lesson flow logic
- mode copy
- Deep course schema
- Quick lesson state
- build/check validation

- [ ] **Step 3: Verify imports stay one-way**

`shared` may be imported by `quick` and `deep`.

`quick` must not import from `deep`.

`deep` must not import from `quick`.

- [ ] **Step 4: Make the import graph easy to audit**

Use `rg` to confirm the intended dependency direction after the split:

```bash
rg -n "from \"../deep|from '../deep|from \"../quick|from '../quick" prototype/src
```

Expected:

- no Quick/Deep cross-imports

---

## Task 5: Final verification

**Files:**
- Validate the updated prototype structure and behavior

- [ ] **Step 1: Build the app**

Run:

```bash
cd prototype && npm run build
```

- [ ] **Step 2: Smoke test the app in the browser**

Verify that the camera entry still opens and that Quick Mode still reaches the lesson flow after photo capture.

- [ ] **Step 3: Check the structure against the Deep Mode design**

Confirm the file boundaries now line up with the real Deep Mode phases from `docs/kaisensei_deep_mode_product_design.md`.

---

## Acceptance Criteria

1. `App.jsx` is a thin shell only.
2. The shared camera entry owns the first-screen mode choice and photo input.
3. Quick Mode is split into smaller quick-owned files without changing behavior.
4. Deep Mode has a scaffold that matches the actual design phases: Overview, Notice, Interpret, Interact, Step In, Completion.
5. Shared code contains only mode-agnostic helpers and primitives.
6. Quick and Deep storage keys, copy, and state are namespaced separately.
7. No Quick/Deep cross-imports remain.
8. `cd prototype && npm run build` passes.
