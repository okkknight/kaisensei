export function normalizeDeepText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isDeepTextToken(char) {
  return /[\p{L}\p{N}]/u.test(char);
}

function buildDeepTextNormalizationMap(text) {
  const source = String(text || "");
  const chars = [];
  const map = [];
  let pendingSpaceIndex = -1;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (isDeepTextToken(char)) {
      chars.push(char.toLowerCase());
      map.push(index);
      pendingSpaceIndex = -1;
      continue;
    }

    if (chars.length === 0 || chars[chars.length - 1] === " ") {
      continue;
    }

    if (pendingSpaceIndex === -1) {
      pendingSpaceIndex = index;
    }

    chars.push(" ");
    map.push(pendingSpaceIndex);
  }

  while (chars.at(-1) === " ") {
    chars.pop();
    map.pop();
  }

  return { normalized: chars.join(""), map };
}

export function findDeepTextMatchRange(text, highlight) {
  const normalizedHighlight = normalizeDeepText(highlight);

  if (!normalizedHighlight) {
    return null;
  }

  const { normalized, map } = buildDeepTextNormalizationMap(text);
  const index = normalized.indexOf(normalizedHighlight);

  if (index === -1) {
    return null;
  }

  const start = map[index];
  const end = map[index + normalizedHighlight.length - 1] + 1;

  return { start, end };
}

export function isDeepAnswerMatch(selectedChunks, answerChunks) {
  if (selectedChunks.length !== answerChunks.length) {
    return false;
  }

  return selectedChunks.every((chunk, index) => normalizeDeepText(chunk) === normalizeDeepText(answerChunks[index]));
}
