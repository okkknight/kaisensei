export function getExampleVariants(section) {
  if (!section) {
    return [];
  }

  return [section.baseExample, ...(section.variations ?? [])].filter(Boolean);
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

