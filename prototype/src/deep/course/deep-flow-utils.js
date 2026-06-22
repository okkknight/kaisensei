import { shuffleChunks } from "../../quick/lesson/lesson-helpers.js";

export function getExampleVariants(section) {
  if (!section) {
    return [];
  }

  return [section.baseExample, ...(section.variations ?? [])].filter(Boolean);
}

export function uniqueChunks(items = []) {
  return [...new Set((Array.isArray(items) ? items : []).filter(Boolean))];
}

export function buildShuffledChunkBank(items = [], seed = "") {
  const unique = uniqueChunks(items);

  if (unique.length <= 1) {
    return unique;
  }

  const shuffled = shuffleChunks(unique, seed);

  if (shuffled.every((item, index) => item === unique[index])) {
    return [...shuffled.slice(1), shuffled[0]];
  }

  return shuffled;
}

export function joinDeepChunks(chunks) {
  if (!Array.isArray(chunks)) {
    return "";
  }

  return chunks
    .join(" ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function isDeepSelectionLocked(selectedChunks, selectionLimit) {
  if (!Number.isFinite(selectionLimit) || selectionLimit <= 0) {
    return false;
  }

  return selectedChunks.length >= selectionLimit;
}

export function toggleDeepChunkSelection(currentSelection, chunk, selectionLimit) {
  const exists = currentSelection.some((item) => item === chunk);

  if (exists) {
    return currentSelection.filter((item) => item !== chunk);
  }

  if (isDeepSelectionLocked(currentSelection, selectionLimit)) {
    return currentSelection;
  }

  return [...currentSelection, chunk];
}
