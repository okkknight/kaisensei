# Handoff Pack

Compact resume pack for kaisensei.

Reading order:

1. `PROJECT_CONTEXT.md`
2. `docs/kaisensei_deep_mode_product_design.md`
3. `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-spec.md`
4. `docs/superpowers/specs/2026-06-24-kaisensei-deepmode-staged-generation-spec.md`
5. `docs/superpowers/specs/2026-06-22-kaisensei-deepmode-integration-spec.md`
6. `docs/superpowers/plans/2026-06-22-kaisensei-deepmode-integration-plan.md`
7. `docs/handoff/CHANGELOG.md`

Notes:

- Keep `PROJECT_CONTEXT.md` authoritative and concise
- Keep `CHANGELOG.md` append-only
- Deep Mode is the active focus; Quick Mode should remain stable unless a shared boundary is being changed on purpose
- The latest prompt wording cleanup aligns Deep Mode Understand with the old product design doc and keeps the Chinese chunking rule centered on one complete sentence first
- The new staged-generation spec freezes `overview + notice` as the first playable unit, keeps later stages serial, and shows waiting pages only when the next stage is not ready
- Task 1 of the staged-generation plan is now implemented: the job contract carries a `generation` envelope, the in-memory store persists it, and the create / poll routes return it
- Task 2 is now underway and the backend can already run staged Deep generation through a serial orchestrator with stage-specific prompt and normalizer helpers
- The prompt still keeps the senior-English-teacher framing, `coreExpression` as a learnable phrase or collocation, and same-scene pack differentiation
- The Deep Mode normalizer still only enforces structure, answer coverage, and the bridge-line rule for Interact system replies
- If a future task touches the shared AI or lesson contract boundary, verify both Quick Mode and Deep Mode
