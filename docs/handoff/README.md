# Handoff Pack

Compact resume pack for the current kaisensei implementation.

Reading order:

1. `PROJECT_CONTEXT.md`
2. `docs/kaisensei_deep_mode_product_design.md`
3. `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-spec.md`
4. `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-frontend-spec.md`
5. `docs/superpowers/plans/2026-06-19-kaisensei-deepmode-structure-isolation-plan.md`
6. `docs/handoff/CHANGELOG.md`
7. `docs/KAISENSEI_VPS_RUNBOOK.md`

Notes:

- This pack is intentionally compact
- Keep the project context authoritative and the changelog append-only
- The current focus is Deep Mode implementation with Quick Mode left unchanged
- The current alignment task is keeping each Deep Mode pack on one core expression across baseExample and variations
- The latest Interact rule is that `systemReply` should be a bridge sentence while the learned Handle expression stays for the user reply
- The latest Step In rule is that the final dialogue should feel like one continuous role-play in the same scene, with the system staying in character instead of asking quiz-style questions
- Treat the Deep Mode design doc as the authoritative product fact source and the Deep Mode spec as the implementation boundary source
- Treat the structure isolation plan as the next execution step
- Do not duplicate the same state in multiple docs
