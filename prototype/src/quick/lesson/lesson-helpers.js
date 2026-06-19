export function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function joinChunkText(chunks) {
  return chunks.map((chunk) => chunk.text).join(" ");
}

export function sortChunksBySentence(chunks, sentence) {
  const normalizedSentence = normalizeText(sentence);

  return [...chunks]
    .map((chunk, index) => {
      const normalizedChunk = normalizeText(chunk?.text);
      const matchIndex = normalizedChunk ? normalizedSentence.indexOf(normalizedChunk) : -1;

      return {
        chunk,
        index,
        matchIndex: matchIndex >= 0 ? matchIndex : Number.POSITIVE_INFINITY,
      };
    })
    .sort((left, right) => {
      if (left.matchIndex !== right.matchIndex) {
        return left.matchIndex - right.matchIndex;
      }

      return left.index - right.index;
    })
    .map((item) => item.chunk);
}

export function buildSeeSentenceSegments(sentence, chunks) {
  const rawSentence = String(sentence || "");
  if (!rawSentence) {
    return [];
  }

  const lowerSentence = rawSentence.toLowerCase();
  const orderedChunks = sortChunksBySentence(chunks, rawSentence);
  const matches = [];
  let cursor = 0;

  for (const chunk of orderedChunks) {
    const needle = String(chunk?.text || "").trim().toLowerCase();
    if (!needle) continue;

    let start = lowerSentence.indexOf(needle, cursor);
    if (start < 0) {
      start = lowerSentence.indexOf(needle);
    }
    if (start < 0) {
      continue;
    }

    const end = start + needle.length;
    if (end <= cursor) {
      continue;
    }

    matches.push({
      chunk,
      start,
      end,
    });
    cursor = end;
  }

  if (matches.length === 0) {
    return [{ type: "text", text: rawSentence }];
  }

  matches.sort((left, right) => left.start - right.start || left.end - right.end);

  const segments = [];
  let textCursor = 0;

  for (const match of matches) {
    if (match.start > textCursor) {
      segments.push({
        type: "text",
        text: rawSentence.slice(textCursor, match.start),
      });
    }

    const normalizedStart = Math.max(match.start, textCursor);
    const normalizedEnd = Math.max(normalizedStart, match.end);
    segments.push({
      type: "chunk",
      chunk: match.chunk,
      text: rawSentence.slice(normalizedStart, normalizedEnd) || match.chunk.text,
    });
    textCursor = normalizedEnd;
  }

  if (textCursor < rawSentence.length) {
    segments.push({
      type: "text",
      text: rawSentence.slice(textCursor),
    });
  }

  return segments;
}

export function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function shuffleChunks(items, seed) {
  const output = [...items];
  let state = hashString(seed) || 1;

  for (let index = output.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }

  return output;
}

export function buildHint(targetChunks) {
  const first = targetChunks[0]?.text || "the first chunk";
  return `Almost. Try starting with "${first}"...`;
}
