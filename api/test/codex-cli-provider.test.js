import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeLessonPayload } from "../src/services/lesson-normalizer.js";

test("normalizeLessonPayload rejects missing required fields", () => {
  assert.throws(() => normalizeLessonPayload({ level: "Normal" }));
});
