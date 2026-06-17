# Lesson Richness & Color Balance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the lesson pages feel richer and more layered by generating more substantial See/Learn content and using a small, muted multi-tone palette across chunk-based UI.

**Architecture:** Keep the current API-backed lesson flow intact. Update the lesson generation prompt so the model returns longer, more natural See copy and 3-5 high-value Learn chunks. On the frontend, derive stable muted tones for chunks and reuse the existing chunk/card components so the visual system stays consistent instead of introducing new UI structures.

**Tech Stack:** Node.js, Fastify Codex CLI provider, React, Vite, CSS variables, browser validation.

---

### Task 1: Richer lesson generation rules in the API provider

**Files:**
- Modify: `api/src/services/codex-cli-provider.js`
- Modify: `api/test/codex-cli-provider.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPrompt } from "../src/services/codex-cli-provider.js";

test("buildPrompt asks for richer See and Learn output", () => {
  const prompt = buildPrompt("Advanced");
  assert.match(prompt, /Normal.*1-2 sentences/s);
  assert.match(prompt, /Advanced.*2-3 sentences/s);
  assert.match(prompt, /3-5 high-value chunks/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `cd api && node --test test/codex-cli-provider.test.js`

Expected: fail because `buildPrompt` is not exported and the new prompt rules are not present yet.

- [ ] **Step 3: Write the minimal implementation**

```js
export function buildPrompt(level) {
  return [
    "You are kaisensei, a friendly photo-based English coach.",
    "",
    `Level: ${level}`,
    "",
    "Rules:",
    "- See should return 1-2 sentences in Normal and 2-3 sentences in Advanced.",
    "- Use slightly richer, more natural vocabulary than the current prototype.",
    "- Learn should select 3-5 high-value chunks, not every possible fragment.",
    "- Prefer reusable phrases, useful collocations, and teaching value.",
    "- Keep the lesson warm, practical, and concise.",
  ].join("\n");
}
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `cd api && node --test test/codex-cli-provider.test.js`

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add api/src/services/codex-cli-provider.js api/test/codex-cli-provider.test.js
git commit -m "feat: enrich lesson generation prompt"
```

---

### Task 2: Stable muted chunk tones in the prototype

**Files:**
- Modify: `prototype/src/App.jsx`
- Modify: `prototype/src/styles.css`

- [ ] **Step 1: Implement tone selection for chunks**

```js
const chunkToneOrder = ["purple", "yellow", "blue", "green", "mint", "pink"];

function pickChunkTone(chunk) {
  const source = chunk.tone || chunk.id || chunk.text;
  const toneIndex = hashString(String(source)) % chunkToneOrder.length;
  return chunkToneOrder[toneIndex];
}
```

- [ ] **Step 2: Wire the tone through Learn / Build / Use chunk surfaces**

```jsx
const tone = pickChunkTone(chunk);
<div className={`chunk-card-accent ${toneMap[tone]}`} />
<button className={`chunk-chip ${toneMap[tone]} ${selected ? "selected" : ""}`}>
```

- [ ] **Step 3: Make the chunk chips and cards read as separate layers**

```css
.tone-purple { background: var(--primary-soft); color: #5946c0; }
.tone-yellow { background: var(--yellow-soft); color: #927000; }
.tone-pink { background: var(--pink-soft); color: #c05a70; }
.tone-blue { background: var(--blue-soft); color: #4b6fb7; }
.tone-green { background: var(--green-soft); color: #2c8f57; }
.tone-mint { background: var(--mint-soft); color: #2f8f72; }
```

- [ ] **Step 4: Run the build and check the rendered lesson**

Run: `cd prototype && npm run build`

Expected: build succeeds and the chunk cards/chips show a small family of muted colors instead of a single purple block.

- [ ] **Step 5: Commit**

```bash
git add prototype/src/App.jsx prototype/src/styles.css
git commit -m "feat: add muted lesson color variety"
```

---

### Task 3: Browser QA on the lesson flow

**Files:**
- Validate: rendered `See`, `Learn`, `Build`, and `Use` screens in the browser

- [ ] **Step 1: Open the app and inspect lesson screens**

```text
http://localhost:5175/
```

- [ ] **Step 2: Verify visual changes**

Check that:
- See has 1-2 sentences in Normal and 2-3 in Advanced
- Learn shows 3-5 meaningful chunks
- chunk tones are no longer all purple
- yellow appears as a restrained accent

- [ ] **Step 3: Commit any follow-up polish**

If the browser reveals clipping, overlap, or unreadable color contrast, patch the related CSS and rebuild before committing.

