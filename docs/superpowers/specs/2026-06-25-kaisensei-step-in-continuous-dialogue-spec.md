# Kaisensei Step In Continuous Dialogue Spec

**Status:** Design spec for implementation.  
**Purpose:** Turn the current Step In stage into a single-event, continuous-scene dialogue generator that is still compatible with the existing Deep Mode contract and playback flow.

This document is intentionally based on two kinds of input:

- design sources, including `docs/Kaisensei Step In 连续场景对话优化方案.md` and the current Step In prompt text
- current implementation facts in `api/src/deep/*`, `prototype/src/deep/*`, and the staged-generation tests

Where the design sources and current code diverge, this spec follows the intended Step In direction while naming the current code behavior explicitly.

---

## 1. Source Anchors

Use these files as the implementation anchors for this spec:

- `docs/Kaisensei Step In 连续场景对话优化方案.md`
- `docs/step in 优化prompt.md`
- `api/src/deep/services/course-prompt.js`
- `api/src/deep/services/staged-generation/deep-stage-prompt.js`
- `api/src/deep/services/staged-generation/deep-stage-context.js`
- `api/src/deep/services/course-normalizer.js`
- `api/src/deep/contracts/course.js`
- `api/test/deep-course-provider.test.js`
- `api/test/deep-course-normalizer.test.js`
- `api/test/job-runner.test.js`
- `prototype/src/deep/schema/deep-course-schema.js`
- `prototype/src/deep/course/useDeepStepInFlow.js`
- `prototype/src/deep/course/step-in/StepInModule.jsx`
- `prototype/src/deep/course/deep-text.js`

---

## 2. Problem Statement

Current Step In content is structurally valid, but the generation protocol is still too weak to reliably produce a single continuous scene.

Observed failure mode:

- Notice, Interpret, Need, and Handle are individually correct, but the whole dialogue does not always feel like one event.
- The system turns often behave like generic bridges instead of moving the scene forward.
- The prompt tells the model to be natural, but does not force a concrete event-first planning path.
- Current code validates structure and basic bridge constraints, but not the event coherence that the design wants.

The target is not a new UI or a new data schema. The target is a stronger generation protocol that improves the same existing Step In output shape.

---

## 3. Current Implementation Facts

This section describes what the code does today.

### 3.1 Generation flow

- Deep Mode already uses staged generation.
- `step_in` is the last stage in `lessonJobGenerationStages`.
- The Step In stage currently receives frozen background from earlier stages.
- The stage runner still serializes the final lesson back into the existing `lesson.modules.stepIn.dialogue` shape.

### 3.2 Output shape

The current contract already expects:

- `modules.stepIn.title`
- `modules.stepIn.goal`
- `modules.stepIn.dialogue.scene`
- `modules.stepIn.dialogue.sceneChinese`
- `modules.stepIn.dialogue.turns[]`

The `turns[]` array is already consumed by the frontend as a dialogue flow and replay source.

### 3.3 Current validation

The normalizer already enforces:

- `turns[]` exists and has the expected count
- system and user turns alternate
- user turns contain `speaker`, `text`, `sourceModule`, `chunks`, `distractors`, and `answer`
- `sourceModule` aliases are canonicalized to `notice`, `interpret`, `interact_need`, and `interact_handle`
- `answer` must be coverable by `chunks`

What it does not enforce today:

- whether the whole dialogue is one coherent event
- whether the first system turn is actually a Notice trigger
- whether intermediate system turns create a valid bridge to the next user turn
- whether the selected Notice and Interpret truly belong to the selected Interact task

### 3.4 Current frontend consumption

The frontend already treats Step In as a dialogue-flow page family:

- guide page
- turn pages
- completion page

That means this spec does not need a new frontend contract. It needs a better generation contract feeding the existing one.

### 3.5 Current prompt template facts

The local prompt draft already exposes a practical Step In template with these sections:

- input blocks for level, photo context, and completed module JSON
- a task block that chooses one Interact Task Pack first
- an internal event-planning block
- event templates
- eight-turn dialogue responsibilities
- natural-language rules
- scene description rules
- user exercise field rules
- output-shape rules
- final internal checks

It also already uses placeholders for the concrete prompt wiring, such as:

- `{{LEVEL}}`
- `{{LEVEL_RULES}}`
- `{{PHOTO_CONTEXT}}`
- `{{NOTICE_MODULE_JSON}}`
- `{{INTERPRET_MODULE_JSON}}`
- `{{INTERACT_MODULE_JSON}}`
- `{{STEP_IN_CONFIG}}`
- `{{EXERCISE_CONFIG}}`
- `{{CHUNK_RECONSTRUCTION_RULE}}`
- `{{CHUNK_PRESENTATION_RULE}}`
- `{{DIALOGUE_DISTRACTOR_COUNT}}`
- `{{STEP_IN_OUTPUT_WRAPPER_RULE}}`

This spec keeps those prompt-interface ideas, but does not require the exact placeholder names to stay unchanged if the implementation chooses to wire them differently.

---

## 4. Target Behavior

Step In must become one continuous in-scene conversation built around a single event.

### 4.1 What Step In is

- the final Deep Mode stage
- one scenario, one timeline, one shared goal
- a continuous role-play rather than a list of review sentences
- a dialogue that reuses earlier learning without exposing the learning structure

### 4.2 What Step In is not

- not a generic recap of four expressions
- not a sequence of unrelated photo descriptions
- not a separate question-answer drill
- not a free chat session
- not a second-pass semantic analysis pipeline in the output JSON

### 4.3 Single-event rule

The generated dialogue must be explainable as one event.

The event should follow this causal shape:

```text
visible fact
→ cautious interpretation
→ request / action / decision
→ response from the other person
→ user adjustment / acceptance / resolution
```

If a generated dialogue cannot be summarized as one event, it is off-spec even if each individual line is grammatical.

---

## 5. Current Design Gap

This is the most important mismatch between the design sources and the current code.

### 5.1 Current design direction

The design source says Step In should:

- choose an Interact Task Pack first
- use that task as the event anchor
- then select compatible Notice and Interpret expressions
- build one shared event around those choices
- make Handle respond directly to the latest system turn

### 5.2 Current code path

The current prompt already says Step In should:

- reuse earlier expressions
- stay in the same scene
- remain conversational
- keep `sourceModule`

But the prompt still reads more like a general style guide than a concrete event-planning protocol.

### 5.3 Practical consequence

Today, the model can still produce a structurally correct Step In that feels like four adjacent exercises.

This spec exists to narrow that gap.

---

## 6. Required Generation Protocol

This is the implementation-level behavior the generator must follow.

### 6.1 Input precedence

When building Step In, the prompt and context packaging must make the following precedence obvious:

1. photo and scene context
2. Interact Task Packs
3. Notice candidates
4. Interpret candidates
5. Step In output requirements

The current prompt draft already mirrors this by giving the model separate sections for:

- photo and scene context
- completed Notice module
- completed Interpret module
- completed Interact module
- Step In configuration
- exercise configuration

### 6.2 Selection order

The generator should behave as if it is doing this:

1. pick one Interact Task Pack that can become a real scene interaction
2. identify the shared goal of that task
3. choose Notice expressions that can plausibly trigger the event
4. choose Interpret expressions that can explain the Notice and motivate the Need
5. keep Need and Handle paired within the same task pack
6. generate the actual dialogue turns after the event is internally planned

### 6.3 Internal event planning

The event plan is an internal planning aid only.

The prompt may describe these internal concepts:

- `sharedGoal`
- `trigger`
- `interpretation`
- `actionNeed`
- `systemCondition`
- `resolution`

These are not output fields and must not appear in the final JSON.

### 6.4 Event templates

The generator may choose one of the following internal templates:

- `abnormality_resolution`
- `joint_decision`
- `request_assistance`
- `social_response`
- a fallback template if none of the above fit

The template is only a planning aid. It should not become a new contract surface.

---

## 7. Dialogue Structure Contract

The Step In output shape stays unchanged.

### 7.1 Output shape

The final JSON must keep using:

- `title`
- `goal`
- `dialogue.scene`
- `dialogue.sceneChinese`
- `dialogue.turns`

### 7.2 Turn order

The expected turn pattern remains fixed:

```text
system
user.notice
system
user.interpret
system
user.interact_need
system
user.interact_handle
```

### 7.3 Speaker rules

- every even-indexed turn must be `system`
- every odd-indexed turn must be `user`
- every user turn must have one of the canonical Step In source modules
- system turns must not contain exercise fields

### 7.4 User turn rules

Each user turn must still include:

- `text`
- `sourceModule`
- `chunks`
- `distractors`
- `answer`

The user turn `text` should be a natural sentence that reuses the selected core expression from the corresponding source module.

### 7.5 System turn rules

Each system turn must do two things:

- respond to the previous user turn
- create a reason for the next user turn

System turns must not read like:

- a teacher cue
- a scene caption
- a generic filler reply
- a direct prompt to use an expression

---

## 8. Prompt Organization Requirement

The Step In prompt should be reorganized instead of just appended to.

### 8.1 Required prompt sections

The new Step In prompt should be ordered like this:

1. Step In task definition
2. available pre-stage content
3. expression selection order
4. internal event templates
5. eight-turn dialogue roles
6. language and structure constraints
7. output structure
8. self-check before return

### 8.2 Prompt separation rules

The prompt should clearly separate:

- what to select
- how the event develops
- what each turn must do
- what is forbidden
- how to self-check

It should not repeat the same rule in multiple sections.

### 8.3 Prompt interface rules

The implementation may keep the current prompt-template placeholder approach, but the final prompt visible to the model must still read as a coherent instruction set.

The prompt should clearly translate the current runtime data into these visible blocks:

- learner level
- level-specific language rules
- photo and scene context
- completed Notice module JSON
- completed Interpret module JSON
- completed Interact module JSON
- Step In config
- exercise config
- output wrapper or output shape rule
- reconstruction / distractor rules
- final internal check

### 8.3 Known prompt conflict to remove

The current wording that says the first system turn may set a cue for the learner's Need is too weak for this design.

The first system turn must primarily set up the Notice trigger, not the Need.

### 8.4 Public prompt inventory

The current `course-prompt.js` content should be split by stability rather than by file count.

#### Keep in the public layer unchanged

- the base course-generator opening
- the generic photo/micro-lesson framing
- the learner level tuning rules
- the general `coreExpression` guidance
- the general Notice / Interpret / Interact teaching intent
- the general pack-selection and writing rules that apply to the non-Step-In modules
- the general JSON-return and no-extra-text rules
- the generic configuration and shape rules that apply to the shared contract

#### Move out of the public layer into the Step In builder

- the Step In-specific `STEP IN:` guidance block
- the Step In-specific statements about the final stage
- the Step In-specific system-turn guidance
- the Step In-specific user-turn tagging guidance
- the Step In-specific scene / role continuity guidance
- any Step In-specific self-check language

#### Keep out of scope for this work

- Notice prompt text changes
- Interpret prompt text changes
- Interact prompt text changes
- any changes to the current Quick Mode prompt path

### 8.5 Prompt migration plan

The implementation should follow this migration order:

1. extract or compose a dedicated Step In prompt builder that owns all Step In-specific rules
2. keep `course-prompt.js` as the shared prompt base for stable, non-Step-In content
3. leave the Notice / Interpret / Interact prompt wording unchanged unless a direct conflict appears
4. make the staged Step In builder assemble:
   - the shared base prompt
   - the Step In-specific addendum
   - the staged input blocks
   - the Step In output wrapper
5. update tests so they assert the Step In-specific rules live in the Step In builder, not in the shared base prompt

---

## 9. Backend Contract Rules

### 9.1 What must stay stable

Do not change the current output contract just to support this Step In rewrite.

Stable surfaces:

- the Deep Mode lesson JSON shape
- the Step In output subtree
- the frontend Step In playback flow
- the staged generation stage names

### 9.2 What may change internally

Allowed internal changes:

- prompt organization
- staged Step In context packaging
- repair-note wording
- test assertions
- a small amount of normalizer tightening if required

### 9.3 Validation boundary

The code may enforce deterministic structure, but it should not attempt to prove semantic coherence with brittle keyword rules.

Good deterministic checks include:

- `stepIn` exists
- turn count is correct
- speaker alternation is correct
- `sourceModule` order is canonical
- `chunks` and `answer` reconstruct the user text
- all required fields exist

Bad deterministic checks include:

- trying to prove the dialogue is emotionally natural
- trying to prove the event is clever
- trying to hard-code semantic matching rules in JavaScript

---

## 10. Implementation Scope

### 10.1 Files most likely to change

- `api/src/deep/services/course-prompt.js`
- `api/src/deep/services/staged-generation/deep-stage-prompt.js`
- `api/src/deep/services/staged-generation/deep-stage-context.js`
- `api/src/deep/services/course-normalizer.js`
- `api/test/deep-course-provider.test.js`
- `api/test/deep-course-normalizer.test.js`
- `docs/step in 优化prompt.md` if the team wants the draft prompt kept in sync with the implementation-facing spec
- `api/src/deep/services/staged-generation/step-in-prompt.js`

### 10.2 Files that should not need changes for this spec

- `prototype/src/deep/course/useDeepStepInFlow.js`
- `prototype/src/deep/course/step-in/StepInModule.jsx`
- `prototype/src/deep/schema/deep-course-schema.js`

The frontend already knows how to render the existing contract. Unless a later implementation uncovers a mismatch, Step In should be fixed on the generation side first.

### 10.3 Step In prompt builder design

This is the concrete implementation shape the spec expects. It is intentionally narrower than the design document and broader than the current prompt draft, so the code can land once and stay stable.

#### 10.3.1 File responsibilities

- `api/src/deep/services/course-prompt.js` remains the shared base prompt for all Deep Mode stages.
- `api/src/deep/services/staged-generation/step-in-prompt.js` owns all Step In-specific wording, summary formatting, and step-in-only constraints.
- `api/src/deep/services/staged-generation/deep-stage-prompt.js` remains the generic stage wrapper and the only public stage prompt entrypoint.
- Providers keep calling `buildDeepStagePrompt`; they should not know whether a stage is Step In or not.

#### 10.3.2 Step In builder input contract

The Step In builder should read only from the existing stage inputs:

- `level`
- `repairNotes` when present
- `background.overview`
- `background.notice`
- `background.interpret`
- `background.interact`
- `config`
- `fixedCopy`

The builder may format these inputs into a compact summary layer, but it should not depend on any new persisted state, hidden semantic field, or a separate selection API.

The summary layer should be a pure projection of known fields, not a second reasoning system. For example:

- overview summary: level, keywords, sceneDescriptionChinese, startPromptChinese
- Notice summary: pack id, coreExpression, meaningChinese, baseExample.english
- Interpret summary: pack id, coreExpression, meaningChinese, baseExample.english
- Interact summary: task id, taskTitle, scenePrompt, scenePromptChinese, need.coreExpression, handle.coreExpression

#### 10.3.3 Prompt assembly order

For `step_in`, the final model-visible prompt should read in this order:

1. shared base prompt from `course-prompt.js`
2. generic stage wrapper from `deep-stage-prompt.js`
3. Step In-specific addendum from `step-in-prompt.js`
4. compact human-readable summary blocks derived from the frozen background
5. frozen background JSON
6. `RETURN ONLY THIS STAGE SHAPE` wrapper

Within the Step In addendum itself, the visible ordering should be:

1. Step In task definition
2. pre-stage content description
3. expression selection order
4. internal event templates
5. eight-turn dialogue roles
6. language and structure constraints
7. output structure
8. self-check before return

This ordering matters. It prevents the model from seeing the output contract before it understands the event logic, while still keeping the exact JSON target available at the end.

#### 10.3.4 Prompt content rules for the builder

The Step In builder should explicitly tell the model to:

- anchor on exactly one Interact Task Pack
- treat the selected Need and Handle as one pair from that pack
- use Notice and Interpret as event setup, not as separate mini-lessons
- keep the first system turn focused on the Notice trigger, not on the Need
- make every middle system turn bridge the previous user turn to the next one
- keep the four user turns on canonical `sourceModule` values only
- keep internal event-planning concepts prompt-internal only
- keep the final output shape unchanged

The builder should also explicitly forbid:

- combining Need and Handle from different task packs
- using the system turns as teacher cues or generic captions
- inventing new semantic output fields
- changing the meaning of Notice / Interpret / Interact prompt text for this work

#### 10.3.5 Prompt data presentation rules

The Step In prompt should be summary-first and JSON-second.

Reason:

- The model needs a quick readable view of the candidate pools to choose from.
- The raw JSON is still useful as an exact fallback reference.
- Keeping both reduces the chance that the model drifts on field names or ignores important candidate distinctions.

Practical rule:

- Put the compact summary blocks before the frozen background JSON.
- Keep the summary blocks short enough to scan.
- Include only the fields the model needs to compare candidate packs.
- Do not duplicate long fixed copy from earlier stages into the Step In-specific addendum.

#### 10.3.6 Prompt migration boundaries

The Step In builder must own all text that is specific to Step In:

- the final-stage statement
- the single-event planning logic
- the system-turn bridge rules
- the user-turn tagging rules
- the scene / role continuity rules
- the self-check that is unique to Step In

The shared base must keep only the rules that are stable across Step In design changes:

- base course-generator opening
- general photo / micro-lesson framing
- learner level tuning
- shared `coreExpression` guidance
- shared Notice / Interpret / Interact teaching intent
- shared non-Step-In pack writing rules
- shared JSON-only and no-extra-text rules
- shared contract-shape rules

#### 10.3.7 Test coverage for the builder split

The implementation should add tests that verify the split, not just the output:

- `course-prompt.js` should no longer contain Step In-specific wording.
- The Step In builder should contain the Step In-only rules that were removed from the shared base.
- The stage prompt for `step_in` should still include the shared base, the Step In addendum, the frozen background, and the stage output wrapper.
- The provider tests should keep checking the final prompt path, so the builder split cannot silently bypass the real stage assembly.

---

## 11. Acceptance Snapshot (2026-06-25)

This section records the accepted implementation state after a line-by-line review against this spec.

### 11.1 Landed implementation

The following parts are implemented and accepted:

- `course-prompt.js` now acts as the shared Deep Mode base prompt and no longer owns Step In-specific strategy text.
- `step-in-prompt.js` owns the Step In-specific protocol, including:
  - single-task-pack anchoring
  - internal event-plan guidance
  - event templates with explicit flow definitions
  - eight-turn dialogue-role responsibilities
  - system identity and bridge rules
  - scene consistency rules
  - core-expression reuse rules
  - output-structure and self-check sections
- `deep-stage-prompt.js` assembles the `step_in` prompt using the accepted shared structure:
  1. shared base prompt
  2. stage marker / generic stage wrapper
  3. Step In-specific addendum
  4. compact Step In summary
  5. frozen background JSON
  6. stage output wrapper
- `deep-stage-context.js` provides a pure summary source for the Step In summary layer.
- `course-normalizer.js` keeps Step In validation structural, including:
  - non-empty `scene`
  - non-empty `sceneChinese`
  - exact turn count
  - speaker alternation
  - valid `sourceModule` values with alias canonicalization
  - required user exercise fields
- provider and runner tests confirm that:
  - `step_in` remains the final staged generation step
  - Step In-specific wording lives in the Step In builder path
  - the final output contract and playback-facing shape remain unchanged

### 11.2 Accepted deferred items

The following items were reviewed and intentionally deferred by decision rather than left as accidental gaps:

- Explicit input blocks such as `PHOTO AND SCENE CONTEXT`, `COMPLETED NOTICE MODULE`, and `STEP IN CONFIG` are not yet broken out into separate prompt sections.
  - Accepted reason: the current shared structure of shared base prompt + Step In addendum + summary + frozen background JSON is considered sufficiently general and currently preferable.
- Additional deterministic Step In validation beyond the pre-existing structural boundary was not added if it was not already present before this work.
  - Accepted examples:
    - no new hard check for canonical Step In `sourceModule` order
    - no new hard check that `answer` / `chunks` reconstruct the final user `text`
    - no new hard whitelist that strips or rejects extra turn fields

### 11.3 Current acceptance boundary

Under the accepted decisions above, there is no remaining mandatory implementation gap for this spec.

Any further changes in this area should be treated as optional quality refinements, not as unfinished baseline work, unless the team explicitly reopens one of the deferred items above.

Recommended test assertions:

- positive match for `STEP IN` task-definition language in the Step In builder
- negative match for `STEP IN` language in the shared base prompt
- positive match for `single Interact Task Pack`
- positive match for `first system turn` or equivalent Notice-trigger wording
- positive match for `interact_need` and `interact_handle`
- positive match for `FROZEN BACKGROUND` and stage output shape in the assembled stage prompt

### 10.4 Stage context packaging design

The Step In stage context should stay on the current `background` transport, but the prompt builder should not render that raw object directly to the model without a readable summary layer.

#### 10.4.1 What the stage context already provides

`createDeepStageContext` already gives Step In everything it needs for prompt assembly:

- `stage`
- `level`
- `traceId`
- `imageBuffer`
- `mimeType`
- `background`

For `step_in`, `background` already contains the frozen values for:

- `overview`
- `notice`
- `interpret`
- `interact`

#### 10.4.2 What the Step In stage prompt should add

Before the frozen JSON block, the stage prompt should emit a short human-readable summary block for each available background slice.

Recommended shape:

```text
STEP IN SUMMARY

OVERVIEW
- level: normal
- keywords: ...
- sceneDescriptionChinese: ...

NOTICE CANDIDATES
- pack 1: ...
- pack 2: ...

INTERPRET CANDIDATES
- pack 1: ...
- pack 2: ...

INTERACT TASK PACKS
- task 1: ...
- task 2: ...
```

This summary is not a new API. It is a rendering convenience for the prompt only.

#### 10.4.3 How to build the summary

The summary builder should be a pure formatter over the frozen background:

1. read the frozen `overview`
2. list each Notice expression pack with `id`, `coreExpression`, `meaningChinese`, and `baseExample.english`
3. list each Interpret expression pack with the same fields
4. list each Interact task pack with `id`, `taskTitle`, `scenePrompt`, `scenePromptChinese`, `need.coreExpression`, and `handle.coreExpression`
5. preserve input order
6. omit empty or missing optional fields instead of inventing them

Do not add scoring, ranking, filtering, or semantic rewriting in this summary layer.

#### 10.4.4 Summary-vs-raw JSON rule

The raw frozen background JSON should still be included after the summary block.

Why:

- the summary helps the model compare options quickly
- the raw JSON keeps exact field names available
- the combination reduces prompt drift without changing the contract

The summary must never replace the raw JSON because the raw JSON is the actual stage contract surface.

### 10.5 Normalizer tightening design

The normalizer should stay structural, but the Step In branch has one small place where a deterministic check is useful: it can reject obviously malformed dialogue shapes before the frontend sees them.

#### 10.5.1 Existing checks that stay as-is

Keep the current `normalizeStepInDialogue` behavior that already ensures:

- dialogue exists
- turn count is exactly 8
- turns alternate system / user
- user turns carry canonical `sourceModule` values
- `chunks` and `answer` reconstruct the user text

#### 10.5.2 Optional deterministic check to keep

If the implementation wants one additional guardrail, it should be a shape-only check, not a semantic one:

- `scene` must be a non-empty string
- `sceneChinese` must be a non-empty string
- each system turn must have `speaker === "system"` and a non-empty `text`
- each user turn must have `speaker === "user"` and a non-empty `text`

That is the maximum safe tightening for this work.

#### 10.5.3 Normalizer checks to avoid

Do not add checks for:

- whether the event is “interesting”
- whether the conversation is “natural enough”
- whether the system turn is “good” in a subjective sense
- whether the user line matches a hidden semantic template

Those should remain prompt-driven.

### 10.6 Provider assembly design

The provider layer should remain a thin caller of prompt builders and should not grow Step In special cases.

#### 10.6.1 Current provider responsibilities

The Codex and Gemini providers should keep doing only these steps:

1. build image workspace
2. build prompt
3. call model
4. extract JSON
5. parse JSON
6. normalize payload

#### 10.6.2 Step In-specific caller behavior

For `step_in`, the provider should not:

- branch into a custom caller path
- reformat the background itself
- apply extra post-processing beyond normalization

The only Step In-specific difference should be which prompt builder is used under the hood.

#### 10.6.3 Test coverage for the provider path

The provider tests should keep proving the real assembly path by checking that:

- `generateStage({ stage: "step_in" })` still reaches the real stage prompt
- the assembled prompt still contains `STAGE MODE: step_in`
- the assembled prompt still contains the frozen background marker
- the assembled prompt still contains the Step In output wrapper
- the provider still normalizes the returned Step In dialogue

---

## 11. Acceptance Criteria

This spec is satisfied when all of the following are true:

1. Step In still returns the same JSON shape.
2. Step In still uses the same 8-turn dialogue structure.
3. The prompt explicitly prefers one Interact Task Pack as the event anchor.
4. The prompt explicitly separates Notice, Interpret, Interact, and Step In input roles.
5. The prompt explicitly models an internal single event before generating lines.
6. The first system turn clearly sets up the Notice trigger rather than the Need.
7. Each middle system turn bridges the previous user turn to the next one.
8. Handle clearly responds to the immediate system reply.
9. The prompt tests assert the new Step In direction.
10. Existing Step In playback still works without frontend contract changes.

---

## 12. Resolved Decisions

These items are now part of the spec and should not be re-opened unless the implementation shows a concrete blocker.

### 12.1 Internal event plan surface

Decision:

- Keep `sharedGoal / trigger / interpretation / actionNeed / systemCondition / resolution` as prompt-internal planning concepts only.
- Do not add a persisted event-plan field to the output contract.
- Do not add a separate semantic analysis API.

Why:

- This keeps the current JSON contract stable while still steering the model toward a single event.

### 12.2 Task Pack anchoring strength

Decision:

- Step In must anchor on exactly one Interact Task Pack.
- The selected Need and Handle must come from that same pack.
- Step In must not blend multiple packs in one dialogue.

Why:

- A single task anchor is the most reliable way to preserve one event and one immediate goal.

### 12.3 Normalizer strictness

Decision:

- Keep the normalizer focused on structural validation.
- Retain only very small, deterministic safety checks that are already close to the current contract.
- Do not add brittle semantic rules that try to judge whether the dialogue is “natural enough.”

Why:

- Semantic coherence should be driven by the prompt, not approximated with fragile code rules.

### 12.4 Need / Handle reuse rules

Decision:

- The selected Need and Handle core expressions must appear verbatim in their corresponding user turns.
- The rest of the sentence may be rewritten freely for naturalness.

Why:

- This keeps the learning target stable and matches the current contract and tests.

### 12.5 Prompt helper location

Decision:

- Introduce a dedicated Step In prompt builder under `api/src/deep/services/staged-generation/`.
- Keep `course-prompt.js` as the base teaching-language and shared rule layer.
- Let the Step In builder compose the task-specific prompt from the staged context.

Why:

- Step In has enough special handling to justify its own prompt assembly layer.

### 12.6 Stage context packaging

Decision:

- Keep the full candidate sets available in stage context.
- Add a compact, preformatted summary layer for the selected task pack and candidate pools when building the Step In prompt.

Why:

- Full data preserves fidelity.
- The summary layer makes the final prompt easier for the model to follow.

### 12.7 Public prompt layer scope

Decision:

- `course-prompt.js` only keeps prompt content that does not change when Step In design changes.
- All Step In-specific generation strategy must live in the dedicated Step In prompt builder.
- Prompts for modules other than Step In must remain unchanged for this work.

Why:

- This keeps the shared layer stable and prevents Step In changes from spilling into other module prompts.

---

## 13. Recommended Implementation Order

If this spec is implemented next, use this order:

1. rewrite the Step In prompt structure
2. add the dedicated Step In prompt builder
3. add the Step In summary formatter for frozen background data
4. make the stage prompt expose the new input grouping
5. keep the output JSON shape unchanged
6. tighten tests around prompt wording, summary formatting, and stage shape
7. add only the smallest deterministic validation changes that are truly needed

---

## 14. Non-Goals

This spec does not introduce:

- a new Step In UI
- a new output schema
- a second model call for Step In review
- a semantic-matching engine in JavaScript
- a persisted event-plan contract
- a change to Quick Mode
- a change to the current Step In replay flow
- changes to non-Step-In module prompts
