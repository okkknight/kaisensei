# Kaisensei Deep Mode Structure Isolation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the current prototype structure so Quick Mode and Deep Mode live in clearly separated feature domains, with a thin app shell and shared base utilities only where necessary. This is the foundation for adding Deep Mode without changing existing Quick Mode behavior.

**Architecture:** Keep the current Quick Mode behavior intact. Refactor the app so `App.jsx` becomes a thin shell/router, Quick Mode moves into its own entry domain, and Deep Mode gets its own isolated entry domain and state namespace. Shared code is limited to truly mode-agnostic utilities and UI primitives.

**Tech Stack:** React, Vite, existing prototype code, CSS modules or plain CSS as already used, browser storage.

---

## Scope

### In scope

- Create a thin app shell for mode routing
- Separate Quick Mode and Deep Mode into distinct directories/entry modules
- Introduce a shared layer only for mode-agnostic helpers and UI primitives
- Keep Quick Mode behavior unchanged during the split
- Reserve a Deep Mode entry scaffold and storage namespace

### Out of scope

- No Quick Mode redesign
- No Deep Mode course logic implementation yet
- No backend schema changes yet
- No changes to lesson generation behavior yet

---

## Task 1: Introduce the feature-domain directory split without changing behavior

**Files:**
- Create: `prototype/src/app/AppShell.jsx`
- Create: `prototype/src/shared/...` as needed for mode-agnostic helpers
- Create: `prototype/src/quick/...`
- Create: `prototype/src/deep/...`
- Modify: `prototype/src/App.jsx`

- [ ] **Step 1: Define the target structure**

```text
prototype/src/
  app/
    AppShell.jsx
  shared/
    ui/
    utils/
    media/
  quick/
    QuickModeApp.jsx
    components/
    state/
  deep/
    DeepModeApp.jsx
    components/
    state/
```

- [ ] **Step 2: Move the current Quick Mode implementation behind a quick entry**

The current lesson flow, camera flow, and existing API wiring should keep working exactly as they do now, just from `quick/` instead of the root app file.

- [ ] **Step 3: Keep `App.jsx` as a thin shell**

`App.jsx` should only choose the active mode and render the corresponding entry, with no feature business logic left in the shell.

- [ ] **Step 4: Verify Quick Mode still behaves the same**

Check that:
- the current Quick Mode camera entry still opens
- photo capture/upload still work
- lesson generation still works
- See / Learn / Build / Use still behave as before

---

## Task 2: Add Deep Mode entry scaffolding with isolated namespace

**Files:**
- Create: `prototype/src/deep/DeepModeApp.jsx`
- Create: `prototype/src/deep/state/...`
- Create: `prototype/src/deep/components/...`
- Create: `prototype/src/deep/storage.js`
- Modify: `prototype/src/App.jsx`

- [ ] **Step 1: Add a Deep Mode entry that is separate from Quick Mode**

The entry can be a scaffold or placeholder at first, but it must not import Quick Mode page logic.

- [ ] **Step 2: Define Deep Mode local storage keys**

Use a `deep:` namespace so future progress/state storage is isolated from Quick Mode.

- [ ] **Step 3: Keep Deep Mode documentable without behavior coupling**

Deep Mode entry should be able to mount and receive the shared photo input later, but it should not depend on Quick Mode components or state.

---

## Task 3: Move truly shared utilities into the shared layer

**Files:**
- Create or move only mode-agnostic helpers into `prototype/src/shared/...`

- [ ] **Step 1: Identify mode-agnostic helpers**

Only extract code that has no lesson/business meaning, such as:
- text normalization helpers
- chunk hashing or sorting helpers if they truly stay generic
- image compression utilities
- basic UI primitives

- [ ] **Step 2: Avoid pulling business logic into shared**

Do not place lesson state, mode branching, or course copy into the shared layer.

- [ ] **Step 3: Verify imports stay one-directional**

`shared` can be imported by `quick` and `deep`, but `quick` and `deep` should not import from each other.

---

## Task 4: Validate the isolation boundary

**Files:**
- Validate the updated prototype structure and behavior

- [ ] **Step 1: Build the app**

Run: `cd prototype && npm run build`

- [ ] **Step 2: Inspect the import graph**

Confirm that:
- Quick Mode does not import Deep Mode
- Deep Mode does not import Quick Mode
- `App.jsx` stays thin
- shared utilities remain mode-agnostic

- [ ] **Step 3: Smoke test the browser**

Verify Quick Mode still works exactly as before after the split.

---

## Acceptance Criteria

1. Quick Mode behavior is unchanged after the structural split.
2. `App.jsx` is only a thin shell/router.
3. Quick Mode and Deep Mode live in separate directory domains.
4. Shared code only contains mode-agnostic helpers and UI primitives.
5. Deep Mode has an isolated entry and storage namespace ready for later implementation.
6. The structure makes it practical to eventually extract Deep Mode into an independent project.

