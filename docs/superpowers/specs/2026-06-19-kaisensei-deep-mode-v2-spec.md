# kaisensei Deep Mode V2 Spec

## 1. Purpose

Deep Mode V2 is a separate, photo-grounded English speaking course mode in `kaisensei`.

It is not a longer version of Quick Mode.
It turns one real photo into one complete text-based scene course that teaches the learner to:

1. notice what is visible
2. interpret what may be happening
3. interact with a realistic need and response
4. step into the scene with a final dialogue

## 2. Current Truth

The live repo already has a working Quick Mode prototype and a working API-backed lesson flow.

Deep Mode V2 is not implemented yet.
This spec defines the separate Deep Mode product boundary and the contract that implementation must follow.

## 3. Scope

### In scope

- Deep Mode entry from the existing camera-page mode switch
- Real photo upload / capture input
- A Deep Mode-specific loading state
- A Deep Mode-specific overview page
- Four Deep Mode stages:
  - Notice
  - Interpret
  - Interact
  - Step In
- Browser TTS playback for English
- Question reading for tasks and dialogues
- Click/tap reordering and selection-based exercises
- Same-device, same-browser recovery for MVP
- Mode-driven backend generation with separate output schema per mode

### Out of scope

- Any Quick Mode UX or flow change
- Speech input
- Free-text answer input
- Login, history, payment, or social features
- Separate Deep Mode home page
- Sharing Deep Mode course structure with Quick Mode

## 4. Product Boundary

Deep Mode shares only the generic photo input surface with Quick Mode:

- camera capture
- image upload
- image input plumbing

Everything else in Deep Mode is mode-owned:

- loading shell
- playback controls
- lesson generation
- schema validation
- page flow
- module UI
- recovery state

The backend should stay mode-driven:

- one unified job entry
- `mode` decides which schema and generator path to use
- Quick Mode and Deep Mode do not share a single output schema

## 5. User Flow

```text
Open camera page
→ choose Deep Mode
→ capture or upload photo
→ generate course
→ overview page
→ Notice
→ Notice milestone
→ Interpret
→ Interpret milestone
→ Interact
→ Interact milestone
→ Step In
→ course complete
```

After a course is generated, the user should not switch into Quick Mode from inside that course.
To switch modes, the user returns to the camera page.

## 6. Deep Mode Content Model

### 6.1 Overview

The overview page is the entry point into the course.

It should show:

- the user photo
- a small set of objective English keywords
- one short Chinese scene description
- one fixed prompt to start the lesson

### 6.2 Modules

#### Notice

Teaches objective visible description only.

Allowed content:

- objects
- people
- visible actions
- positions
- spatial relationships
- environmental details

#### Interpret

Teaches cautious inference grounded in the photo.

Allowed content:

- what may be happening
- possible activity
- likely state
- atmosphere
- possible reason

#### Interact

Teaches realistic task-based interaction.

Each task pack contains:

- a real task
- a Need expression
- a Handle expression
- example sentences
- reordering exercises
- one short dialogue practice

#### Step In

The final stage reuses learned expressions from the earlier modules.

It must not introduce new core expressions.

The final dialogue should feel like one coherent scene conversation.

## 7. Generation Contract

The generation contract must be mode-driven.

### Request shape

At minimum, the backend should receive:

- `mode`
- `level`
- `image`
- config for counts / difficulty

### Output shape

Deep Mode returns an independent course schema.

Required top-level areas:

- overview
- modules
  - notice
  - interpret
  - interact
  - stepIn

### Validation rules

The backend must reject or regenerate courses when:

- JSON is invalid
- required modules are missing
- counts do not match config
- answer chunks cannot build the target answer
- Step In introduces new core expressions
- Notice contains unsupported inference
- Interact is not plausible for the photo
- any answer depends on free text or voice input

## 8. Playback and Recovery

### Playback

Deep Mode keeps English TTS and question reading.

This is not shared shell behavior.
It is part of the Deep Mode experience.

### Recovery

MVP recovery only needs to work on the same device and same browser.

The recovery model should already use stable IDs and module/item progress so a future server-side restore can reuse the same structure.

## 9. Non-goals for This Spec

- No Quick Mode redesign
- No deep implementation details
- No task-by-task sequencing
- No service-side recovery design beyond structure compatibility

## 10. Acceptance Criteria

Deep Mode V2 is considered ready for implementation when:

1. the boundary between Deep Mode and Quick Mode is explicit
2. the unified job entry is mode-driven
3. the Deep Mode schema is separate from Quick Mode
4. TTS and question reading are preserved inside Deep Mode
5. recovery is defined for same-device, same-browser MVP use
6. the spec leaves no unresolved product-level scope inside Deep Mode
