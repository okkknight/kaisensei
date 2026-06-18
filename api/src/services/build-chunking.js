const CLAUSE_OPENERS = new Set([
  "while",
  "when",
  "after",
  "before",
  "because",
  "if",
  "though",
  "although",
  "since",
  "as",
  "once",
  "until",
  "unless",
  "where",
  "wherever",
  "whereas",
]);

const PREPOSITIONS = new Set([
  "about",
  "above",
  "across",
  "after",
  "against",
  "along",
  "among",
  "around",
  "at",
  "before",
  "behind",
  "below",
  "beneath",
  "beside",
  "between",
  "by",
  "during",
  "for",
  "from",
  "in",
  "inside",
  "into",
  "near",
  "of",
  "off",
  "on",
  "onto",
  "over",
  "past",
  "through",
  "to",
  "toward",
  "towards",
  "under",
  "until",
  "up",
  "upon",
  "with",
  "within",
  "without",
]);

const NOUN_PHRASE_STARTERS = new Set([
  "a",
  "an",
  "the",
  "this",
  "that",
  "these",
  "those",
  "my",
  "your",
  "his",
  "her",
  "its",
  "our",
  "their",
  "some",
  "any",
  "each",
  "every",
  "many",
  "much",
  "few",
  "several",
  "all",
  "both",
  "another",
  "such",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "no",
  "what",
  "which",
  "who",
  "whom",
  "whose",
  "whatever",
  "whichever",
  "someone",
  "somebody",
  "something",
  "anyone",
  "anybody",
  "anything",
  "everyone",
  "everybody",
  "everything",
  "everyone's",
]);

const TRAILING_ADVERBS = new Set([
  "again",
  "already",
  "away",
  "back",
  "down",
  "else",
  "even",
  "here",
  "home",
  "inside",
  "instead",
  "just",
  "nearby",
  "now",
  "outside",
  "quite",
  "rather",
  "still",
  "there",
  "together",
  "today",
  "tonight",
  "too",
  "up",
  "yesterday",
]);

const COMMON_VERBS = new Set([
  "am",
  "are",
  "be",
  "been",
  "being",
  "can",
  "carry",
  "carrying",
  "chat",
  "chats",
  "chatting",
  "clean",
  "cleans",
  "cleaning",
  "close",
  "closes",
  "closing",
  "cook",
  "cooks",
  "cooking",
  "cross",
  "crosses",
  "crossing",
  "dance",
  "dances",
  "dancing",
  "do",
  "does",
  "done",
  "drink",
  "drinks",
  "drinking",
  "eat",
  "eats",
  "eating",
  "enjoy",
  "enjoys",
  "enjoying",
  "enter",
  "enters",
  "entering",
  "exit",
  "exits",
  "exiting",
  "feel",
  "feels",
  "feeling",
  "feed",
  "feeds",
  "feeding",
  "fix",
  "fixes",
  "fixing",
  "gather",
  "gathers",
  "gathering",
  "glance",
  "glances",
  "glancing",
  "go",
  "goes",
  "going",
  "hang",
  "hangs",
  "hanging",
  "have",
  "has",
  "having",
  "hold",
  "holds",
  "holding",
  "keep",
  "keeps",
  "keeping",
  "kneel",
  "kneels",
  "kneeling",
  "laugh",
  "laughs",
  "laughing",
  "lean",
  "leans",
  "leaning",
  "leave",
  "leaves",
  "leaving",
  "lie",
  "lies",
  "lying",
  "listen",
  "listens",
  "listening",
  "look",
  "looks",
  "looking",
  "make",
  "makes",
  "making",
  "move",
  "moves",
  "moving",
  "open",
  "opens",
  "opening",
  "pack",
  "packs",
  "packing",
  "pet",
  "pets",
  "petting",
  "pick",
  "picks",
  "picking",
  "play",
  "plays",
  "playing",
  "point",
  "points",
  "pointing",
  "pose",
  "poses",
  "posing",
  "pour",
  "pours",
  "pouring",
  "prepare",
  "prepares",
  "preparing",
  "push",
  "pushes",
  "pushing",
  "read",
  "reads",
  "reading",
  "rest",
  "rests",
  "resting",
  "ride",
  "rides",
  "riding",
  "run",
  "runs",
  "running",
  "say",
  "says",
  "saying",
  "see",
  "sees",
  "seeing",
  "sit",
  "sits",
  "sitting",
  "sleep",
  "sleeps",
  "sleeping",
  "smile",
  "smiles",
  "smiling",
  "speak",
  "speaks",
  "speaking",
  "stand",
  "stands",
  "standing",
  "study",
  "studies",
  "studying",
  "take",
  "takes",
  "taking",
  "talk",
  "talks",
  "talking",
  "throw",
  "throws",
  "throwing",
  "touch",
  "touches",
  "touching",
  "travel",
  "travels",
  "traveling",
  "travelled",
  "traveling",
  "use",
  "uses",
  "using",
  "wait",
  "waits",
  "waiting",
  "walk",
  "walks",
  "walking",
  "watch",
  "watches",
  "watching",
  "wear",
  "wears",
  "wearing",
  "work",
  "works",
  "working",
]);

const SOURCE_PRIORITY_CHINESE = new Map([
  ["while crossing", "在穿过时"],
  ["together", "一起"],
  ["a sunny desert", "一片阳光炙热的沙漠"],
  ["next to", "在旁边"],
  ["in front of", "在前面"],
  ["by the sea", "在海边"],
  ["on the desk", "在桌上"],
  ["on a cloudy day", "在阴天"],
  ["in the shade", "在阴凉处"],
  ["at the park", "在公园里"],
  ["at the table", "在桌边"],
  ["in the background", "在背景里"],
  ["in the car", "在车里"],
  ["at the counter", "在柜台前"],
]);

function normalizeLookup(text) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, " ").replace(/\s+/g, " ").trim();
}

function tokenize(sentence) {
  return sentence.match(/\b[\p{L}\p{N}']+\b|[.,!?;:]/gu) || [sentence];
}

function isWordToken(token) {
  return Boolean(token) && /[\p{L}\p{N}']/u.test(token);
}

function wordLower(token) {
  return token.toLowerCase();
}

function countWordTokens(tokens) {
  return tokens.reduce((count, token) => count + (isWordToken(token) ? 1 : 0), 0);
}

function isVerbLike(token, prevToken = "", nextToken = "") {
  const lower = wordLower(token);
  if (COMMON_VERBS.has(lower)) {
    return true;
  }

  if (lower.endsWith("ing") || lower.endsWith("ed")) {
    return true;
  }

  if (lower.endsWith("s") && COMMON_VERBS.has(lower.slice(0, -1))) {
    return true;
  }

  if (lower === "there" && nextToken && ["is", "are", "was", "were"].includes(wordLower(nextToken))) {
    return false;
  }

  return false;
}

function isBoundaryStarter(token) {
  const lower = wordLower(token);
  return CLAUSE_OPENERS.has(lower) || PREPOSITIONS.has(lower) || TRAILING_ADVERBS.has(lower);
}

function isNounPhraseStarter(token) {
  return NOUN_PHRASE_STARTERS.has(wordLower(token));
}

function untokenize(tokens) {
  return tokens.reduce((text, token) => {
    if (!text) {
      return token;
    }

    if (/^[.,!?;:]$/.test(token)) {
      return `${text}${token}`;
    }

    return `${text} ${token}`;
  }, "");
}

function stripChunkEndingPunctuation(text) {
  return text.replace(/[.,!?;:]+$/u, "").trim();
}

function splitSentenceByHeuristics(sentence) {
  const tokens = tokenize(sentence);
  if (tokens.length <= 4) {
    return [sentence.trim()];
  }

  let verbIndex = -1;
  for (let index = 0; index < tokens.length; index += 1) {
    if (!isWordToken(tokens[index])) {
      continue;
    }

    const prevToken = index > 0 ? tokens[index - 1] : "";
    const nextToken = index + 1 < tokens.length ? tokens[index + 1] : "";
    if (isVerbLike(tokens[index], prevToken, nextToken)) {
      verbIndex = index;
      break;
    }
  }

  if (verbIndex < 0) {
    const mid = Math.max(1, Math.round(tokens.length / 2));
    return [untokenize(tokens.slice(0, mid)), untokenize(tokens.slice(mid))]
      .map(stripChunkEndingPunctuation)
      .filter(Boolean);
  }

  const chunks = [];
  const pushChunk = (start, end) => {
    const text = untokenize(tokens.slice(start, end)).trim();
    if (text) {
      chunks.push(text);
    }
  };

  pushChunk(0, verbIndex);

  let chunkStart = verbIndex;
  let sawVerbInChunk = false;
  let clauseOpenerChunk = CLAUSE_OPENERS.has(wordLower(tokens[chunkStart]));

  for (let index = verbIndex; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (!isWordToken(token)) {
      continue;
    }

    const lower = wordLower(token);
    const currentChunkTokens = tokens.slice(chunkStart, index);
    const currentWordCount = countWordTokens(currentChunkTokens);
    const nextToken = index + 1 < tokens.length ? tokens[index + 1] : "";

    let shouldBreak = false;

    if (index > chunkStart && CLAUSE_OPENERS.has(lower)) {
      shouldBreak = currentWordCount >= 1;
    } else if (index > chunkStart && TRAILING_ADVERBS.has(lower)) {
      shouldBreak = currentWordCount >= 2;
    } else if (index > chunkStart && PREPOSITIONS.has(lower)) {
      shouldBreak = currentWordCount >= 4;
    } else if (clauseOpenerChunk && sawVerbInChunk && isNounPhraseStarter(token)) {
      shouldBreak = currentWordCount >= 2;
    } else if (currentWordCount >= 6 && TRAILING_ADVERBS.has(lower)) {
      shouldBreak = true;
    }

    if (shouldBreak) {
      pushChunk(chunkStart, index);
      chunkStart = index;
      clauseOpenerChunk = CLAUSE_OPENERS.has(lower);
      sawVerbInChunk = isVerbLike(token, tokens[index - 1] || "", nextToken);
    } else if (isVerbLike(token, tokens[index - 1] || "", nextToken)) {
      sawVerbInChunk = true;
    }
  }

  pushChunk(chunkStart, tokens.length);

  return (chunks.length > 0 ? chunks : [sentence.trim()]).map(stripChunkEndingPunctuation).filter(Boolean);
}

function buildChineseLookup(sourceChunks = []) {
  const lookup = new Map();

  for (const chunk of sourceChunks) {
    if (!chunk || typeof chunk.text !== "string" || typeof chunk.chinese !== "string") {
      continue;
    }

    lookup.set(normalizeLookup(chunk.text), chunk.chinese.trim());
  }

  return lookup;
}

function resolveChinese(text, sourceLookup) {
  const normalized = normalizeLookup(text);
  if (SOURCE_PRIORITY_CHINESE.has(normalized)) {
    return SOURCE_PRIORITY_CHINESE.get(normalized);
  }

  if (sourceLookup.has(normalized)) {
    return sourceLookup.get(normalized);
  }

  for (const [sourceText, chinese] of sourceLookup.entries()) {
    if (sourceText.startsWith(normalized) || normalized.startsWith(sourceText)) {
      return chinese;
    }
  }

  return text;
}

function splitTrailingAdverb(text) {
  const tokens = tokenize(text).filter((token) => token !== "," && token !== ";" && token !== ":");
  if (tokens.length < 2) {
    return null;
  }

  const lastWordIndex = [...tokens.keys()].reverse().find((index) => isWordToken(tokens[index]));
  if (lastWordIndex === undefined) {
    return null;
  }

  const lastWord = wordLower(tokens[lastWordIndex]);
  if (!TRAILING_ADVERBS.has(lastWord)) {
    return null;
  }

  const head = stripChunkEndingPunctuation(untokenize(tokens.slice(0, lastWordIndex)).trim());
  const tail = stripChunkEndingPunctuation(untokenize(tokens.slice(lastWordIndex)).trim());
  if (!head || !tail) {
    return null;
  }

  return [head, tail];
}

function stripChineseTrailingAdverb(chinese, adverbText) {
  const adverbChinese = SOURCE_PRIORITY_CHINESE.get(normalizeLookup(adverbText));
  if (!adverbChinese) {
    return chinese.trim();
  }

  const trimmed = chinese.trim();
  if (trimmed.endsWith(adverbChinese)) {
    return trimmed.slice(0, -adverbChinese.length).replace(/[，,、\s]+$/u, "").trim();
  }

  return trimmed;
}

export function buildNaturalBuildExercise(sentence, sourceChunks = []) {
  const sourceLookup = buildChineseLookup(sourceChunks);
  const chunkTexts = splitSentenceByHeuristics(sentence);

  return {
    targetSentence: sentence,
    chunks: chunkTexts.map((text, index) => ({
      id: `b${index + 1}`,
      text,
      chinese: resolveChinese(text, sourceLookup),
    })),
    correctOrder: chunkTexts.map((_, index) => `b${index + 1}`),
  };
}

export function repairBuildExercise(chunks, sourceChunks = [], sentence = "") {
  const sourceLookup = buildChineseLookup(sourceChunks);
  const repairedChunks = [];

  for (const chunk of chunks) {
    const text = stripChunkEndingPunctuation((chunk?.text || "").trim());
    if (!text) {
      continue;
    }

    const split = splitTrailingAdverb(text);
    if (!split) {
      repairedChunks.push({
        text,
        chinese: resolveChinese(text, sourceLookup, chunk?.chinese || text),
      });
      continue;
    }

    const [head, tail] = split;
    const fallbackChinese = typeof chunk?.chinese === "string" ? chunk.chinese.trim() : "";
    const exactHeadChinese = sourceLookup.get(normalizeLookup(head));
    repairedChunks.push({
      text: head,
      chinese: exactHeadChinese || stripChineseTrailingAdverb(fallbackChinese, tail) || fallbackChinese || head,
    });
    repairedChunks.push({
      text: tail,
      chinese: resolveChinese(tail, sourceLookup, ""),
    });
  }

  if (repairedChunks.length === 0) {
    return buildNaturalBuildExercise(sentence, sourceChunks);
  }

  return {
    targetSentence: sentence,
    chunks: repairedChunks.map((chunk, index) => ({
      id: `b${index + 1}`,
      text: chunk.text,
      chinese: chunk.chinese,
    })),
    correctOrder: repairedChunks.map((_, index) => `b${index + 1}`),
  };
}
