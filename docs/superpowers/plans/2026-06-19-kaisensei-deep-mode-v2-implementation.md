# kaisensei Deep Mode V2 Implementation Plan

## Goal

Implement Deep Mode V2 as a separate mode using the spec in
`docs/superpowers/specs/2026-06-19-kaisensei-deep-mode-v2-spec.md`.

This plan is ordered to keep contracts stable before UI work starts.

## Dependencies

Before coding any page flow, the repo needs:

- a Deep Mode schema definition
- a mode-driven job contract
- a validation path that can reject malformed Deep Mode output
- a persistence model that can support same-browser recovery

## Phase 0: Contract and schema foundation

### What changes

- define the Deep Mode course schema
- define the Deep Mode job request / response shape
- add `mode` to the generation pipeline
- keep Quick Mode behavior intact

### Exit criteria

- the backend can distinguish Quick Mode and Deep Mode requests
- the repository has a stable Deep Mode schema file
- validation rules for Deep Mode are explicit and testable

## Phase 1: Mode-driven generation pipeline

### What changes

- update the job entry to route by `mode`
- keep one job system, not two parallel systems
- add Deep Mode prompt / generation logic
- normalize and validate Deep Mode output separately from Quick Mode output

### Exit criteria

- a Deep Mode request can reach a generator path
- malformed Deep Mode output is rejected or retried
- Quick Mode generation still works

## Phase 2: Deep Mode shell and overview page

### What changes

- wire the camera-page mode switch to Deep Mode
- add Deep Mode loading state
- render the Deep Mode overview page
- show photo, keywords, scene description, and start prompt

### Exit criteria

- a user can enter Deep Mode from the existing camera page
- the first post-generation screen is the overview page
- Quick Mode navigation remains unchanged

## Phase 3: Notice and Interpret

### What changes

- implement the Notice module flow
- implement the Interpret module flow
- support milestone pages between modules
- render TTS / question playback where needed

### Exit criteria

- generated Deep Mode content can be played through Notice and Interpret
- each module enforces its own content rules
- module progression is linear and stateful

## Phase 4: Interact

### What changes

- implement Task Pack rendering
- implement Need / Handle reordering exercises
- implement dialogue practice flow
- keep answers structured and tolerant to spacing / punctuation differences

### Exit criteria

- users can complete one or more task packs
- dialogue flow stays short and grounded in the photo
- no free-text or speech-input UI is introduced

## Phase 5: Step In and recovery

### What changes

- implement the final Step In dialogue
- reuse learned expressions only
- add completion screen
- persist progress in browser storage for same-device, same-browser resume

### Exit criteria

- the course can be resumed after refresh in the same browser
- Step In only reuses prior module expressions
- the course can be completed end to end

## Phase 6: QA and hardening

### What changes

- add or update tests for the Deep Mode schema and validator
- verify the mode-driven job flow
- verify the browser experience on mobile viewport
- verify TTS and question playback
- verify recovery and restart behavior

### Exit criteria

- build and tests pass
- Deep Mode content flow matches the spec
- no Quick Mode scope was pulled into the Deep Mode work

## Implementation Notes

- Keep the Deep Mode schema and the Quick Mode schema separate
- Keep the job entry unified, but never merge the output payloads
- Preserve stable IDs so recovery can be migrated to service-side persistence later
- Treat same-browser recovery as the MVP contract, not a future enhancement
- If any phase reveals a new product decision, stop and reopen the spec before continuing
