export function normalizeDeepText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isDeepAnswerMatch(selectedChunks, answerChunks) {
  if (selectedChunks.length !== answerChunks.length) {
    return false;
  }

  return selectedChunks.every((chunk, index) => normalizeDeepText(chunk) === normalizeDeepText(answerChunks[index]));
}
