# Handoff Pack

Compact resume pack for kaisensei.

Reading order:

1. `PROJECT_CONTEXT.md`
2. `docs/kaisensei_deep_mode_product_design.md`
3. `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-spec.md`
4. `docs/superpowers/specs/2026-06-22-kaisensei-deepmode-integration-spec.md`
5. `docs/superpowers/plans/2026-06-22-kaisensei-deepmode-integration-plan.md`
6. `docs/handoff/CHANGELOG.md`

Notes:

- Keep `PROJECT_CONTEXT.md` authoritative and concise
- Keep `CHANGELOG.md` append-only
- Deep Mode is the active focus; Quick Mode should remain stable unless a shared boundary is being changed on purpose
- The latest verified change is the light Deep Mode Understand chunk guidance update: chunk cuts should follow simple Chinese sentence parts, avoid碎片词块 like 的 / 了 / 什么, and stop trying to satisfy chunk counts with filler
- The Deep Mode normalizer no longer hard-rejects chunk counts for Understand / Build / Quick Response; it still enforces structure and answer coverage
- If a future task touches the shared AI or lesson contract boundary, verify both Quick Mode and Deep Mode
