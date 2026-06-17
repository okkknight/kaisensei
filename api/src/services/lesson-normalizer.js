import { lessonContract } from "../contracts/lesson.js";

export class LessonValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "LessonValidationError";
    this.code = "lesson_validation_error";
    this.details = details;
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function ensureString(value, path) {
  if (typeof value !== "string") {
    throw new LessonValidationError(`Missing or invalid string at ${path}`, { path });
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new LessonValidationError(`Missing or empty string at ${path}`, { path });
  }

  return trimmed;
}

function ensureLevel(value) {
  const level = ensureString(value, "level");
  if (level !== "Normal" && level !== "Advanced") {
    throw new LessonValidationError("Invalid lesson level", { path: "level" });
  }
  return level;
}

function normalizeChunk(chunk, path) {
  if (!isPlainObject(chunk)) {
    throw new LessonValidationError(`Missing or invalid chunk at ${path}`, { path });
  }

  return {
    id: ensureString(chunk.id, `${path}.id`),
    text: ensureString(chunk.text, `${path}.text`),
    chinese: ensureString(chunk.chinese, `${path}.chinese`),
  };
}

function ensureUniqueAndCompleteOrder(order, chunks, path) {
  const expectedIds = chunks.map((chunk) => chunk.id);
  if (order.length !== expectedIds.length) {
    throw new LessonValidationError(`Order length mismatch at ${path}`, { path });
  }

  const seen = new Set(order);
  if (seen.size !== order.length) {
    throw new LessonValidationError(`Duplicate ids in ${path}`, { path });
  }

  for (const id of expectedIds) {
    if (!seen.has(id)) {
      throw new LessonValidationError(`Order missing chunk id ${id} at ${path}`, { path });
    }
  }
}

function normalizeReorderExercise(exercise, path, expectedSentence = null) {
  if (!isPlainObject(exercise)) {
    throw new LessonValidationError(`Missing or invalid object at ${path}`, { path });
  }

  const targetSentence = ensureString(exercise.targetSentence, `${path}.targetSentence`);
  if (expectedSentence && targetSentence !== expectedSentence) {
    throw new LessonValidationError(`targetSentence must match ${path === "build" ? "see.sentence" : "target answer"}`, {
      path: `${path}.targetSentence`,
    });
  }

  const chunks = Array.isArray(exercise.chunks)
    ? exercise.chunks.map((chunk, index) => normalizeChunk(chunk, `${path}.chunks[${index}]`))
    : null;

  if (!chunks || chunks.length === 0) {
    throw new LessonValidationError(`Missing chunks at ${path}.chunks`, { path: `${path}.chunks` });
  }

  const correctOrder = Array.isArray(exercise.correctOrder)
    ? exercise.correctOrder.map((id, index) => ensureString(id, `${path}.correctOrder[${index}]`))
    : null;

  if (!correctOrder || correctOrder.length === 0) {
    throw new LessonValidationError(`Missing correctOrder at ${path}.correctOrder`, {
      path: `${path}.correctOrder`,
    });
  }

  ensureUniqueAndCompleteOrder(correctOrder, chunks, `${path}.correctOrder`);

  return {
    targetSentence,
    chunks,
    correctOrder,
  };
}

function normalizeLearn(learn) {
  if (!isPlainObject(learn)) {
    throw new LessonValidationError("Missing or invalid object at learn", { path: "learn" });
  }

  const chunks = Array.isArray(learn.chunks)
    ? learn.chunks.map((chunk, index) => normalizeChunk(chunk, `learn.chunks[${index}]`))
    : null;
  if (!chunks || chunks.length === 0) {
    throw new LessonValidationError("Missing chunks at learn.chunks", { path: "learn.chunks" });
  }

  return {
    chunks,
    note: ensureString(learn.note, "learn.note"),
  };
}

function normalizeUse(use, expectedAnswer) {
  if (!isPlainObject(use)) {
    throw new LessonValidationError("Missing or invalid object at use", { path: "use" });
  }

  const targetAnswer = ensureString(use.targetAnswer, "use.targetAnswer");
  if (expectedAnswer && targetAnswer !== expectedAnswer) {
    throw new LessonValidationError("use.targetAnswer must be consistent with the lesson", {
      path: "use.targetAnswer",
    });
  }

  const answerChunks = Array.isArray(use.answerChunks)
    ? use.answerChunks.map((chunk, index) => normalizeChunk(chunk, `use.answerChunks[${index}]`))
    : null;

  if (!answerChunks || answerChunks.length === 0) {
    throw new LessonValidationError("Missing chunks at use.answerChunks", { path: "use.answerChunks" });
  }

  const correctOrder = Array.isArray(use.correctOrder)
    ? use.correctOrder.map((id, index) => ensureString(id, `use.correctOrder[${index}]`))
    : null;

  if (!correctOrder || correctOrder.length === 0) {
    throw new LessonValidationError("Missing correctOrder at use.correctOrder", {
      path: "use.correctOrder",
    });
  }

  ensureUniqueAndCompleteOrder(correctOrder, answerChunks, "use.correctOrder");

  return {
    situation: ensureString(use.situation, "use.situation"),
    question: ensureString(use.question, "use.question"),
    targetAnswer,
    answerChunks,
    correctOrder,
    speakText: ensureString(use.speakText, "use.speakText"),
  };
}

export function normalizeLessonPayload(payload) {
  if (!isPlainObject(payload)) {
    throw new LessonValidationError("Lesson payload must be a JSON object", { path: "root" });
  }

  const level = ensureLevel(payload.level);
  const see = isPlainObject(payload.see) ? payload.see : null;
  if (!see) {
    throw new LessonValidationError("Missing or invalid object at see", { path: "see" });
  }

  const sentence = ensureString(see.sentence, "see.sentence");
  const chinese = ensureString(see.chinese, "see.chinese");
  const speakText = ensureString(see.speakText, "see.speakText");
  const learn = normalizeLearn(payload.learn);
  const build = normalizeReorderExercise(payload.build, "build", sentence);
  const use = normalizeUse(payload.use);

  if (build.targetSentence !== sentence) {
    throw new LessonValidationError("build.targetSentence must match see.sentence", {
      path: "build.targetSentence",
    });
  }

  return {
    ...lessonContract,
    level,
    see: {
      sentence,
      chinese,
      speakText,
    },
    learn,
    build,
    use,
  };
}
