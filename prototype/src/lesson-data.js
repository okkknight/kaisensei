export const photoUrl =
  "https://pix4free.org/cache.php?folderID=MTE5Mzg0M2IxOWYy&mediaID=ODAzOTM4NDNiMTlmMg%3D%3D&seo=laptop-mobile-coffee-mug-plant-office&type=sample";

export const flowSteps = [
  { id: "camera", label: "Camera", icon: "camera" },
  { id: "see", label: "See", icon: "eye" },
  { id: "learn", label: "Learn", icon: "book" },
  { id: "build", label: "Build", icon: "puzzle" },
  { id: "use", label: "Use (Q&A)", icon: "message" },
];

export const colorSwatches = [
  { name: "Primary", value: "#6C4EF6" },
  { name: "Accent", value: "#FFD34D" },
  { name: "Success", value: "#67C587" },
  { name: "Pink", value: "#F8B3A3" },
  { name: "Blue", value: "#A8C4FF" },
  { name: "Surface", value: "#FFFFFF" },
  { name: "Background", value: "#FFF8EC" },
  { name: "Text", value: "#14213D" },
];

export const typographyTokens = [
  { label: "Display / 28px / Bold", note: "Main headlines" },
  { label: "Title / 20px / Semibold", note: "Section titles" },
  { label: "Body / 16px / Regular", note: "Primary body text" },
  { label: "Caption / 12px / Medium", note: "Labels and helper text" },
];

export const interactionNotes = [
  {
    title: "Tap chunk to add",
    note: "Tap a chunk to move it into your answer. Tap it again to remove it.",
  },
  {
    title: "Check for instant feedback",
    note: "Tap Check to compare order and show a friendly success or retry card.",
  },
  {
    title: "Learn with audio",
    note: "Tap the play button on sentences or chunks to hear natural pronunciation.",
  },
  {
    title: "Reset anytime",
    note: "Use Reset to clear your sentence and try a different order or answer.",
  },
  {
    title: "Finish in about 1 minute",
    note: "A quick 4-step flow designed to help you learn and use English in real life.",
  },
];

export const mockLessons = {
  Normal: {
    level: "Normal",
    photoSummary: "A desk with a coffee mug and a laptop.",
    see: {
      sentence: "A coffee mug is sitting next to a laptop on the desk.",
      chinese: "一个咖啡杯放在桌上，旁边是一台笔记本电脑。",
      speakText: "A coffee mug is sitting next to a laptop on the desk.",
    },
    learn: {
      chunks: [
        { id: "c1", text: "A coffee mug", chinese: "一个咖啡杯", tone: "purple" },
        { id: "c2", text: "is sitting", chinese: "放着", tone: "yellow" },
        { id: "c3", text: "next to", chinese: "在……旁边", tone: "pink" },
        { id: "c4", text: "a laptop", chinese: "一台笔记本电脑", tone: "blue" },
        { id: "c5", text: "on the desk", chinese: "在桌上", tone: "green" },
      ],
      note: "Use \"next to\" when two things are close together.",
    },
    build: {
      targetSentence: "A coffee mug is sitting next to a laptop on the desk.",
      chunks: [
        { id: "c3", text: "next to", chinese: "在……旁边", tone: "pink" },
        { id: "c1", text: "A coffee mug", chinese: "一个咖啡杯", tone: "purple" },
        { id: "c5", text: "on the desk", chinese: "在桌上", tone: "green" },
        { id: "c4", text: "a laptop", chinese: "一台笔记本电脑", tone: "blue" },
        { id: "c2", text: "is sitting", chinese: "放着", tone: "yellow" },
      ],
      correctOrder: ["c1", "c2", "c3", "c4", "c5"],
    },
    use: {
      situation: "You are talking about your workspace.",
      question: "What do you usually keep next to your laptop while you work?",
      questionChinese: "你工作时通常把什么放在笔记本电脑旁边？",
      targetAnswer: "I usually keep a coffee mug next to my laptop while I work.",
      answerChunks: [
        { id: "u1", text: "I usually keep", chinese: "我通常放", tone: "purple" },
        { id: "u2", text: "a coffee mug", chinese: "一个咖啡杯", tone: "yellow" },
        { id: "u3", text: "next to", chinese: "在……旁边", tone: "pink" },
        { id: "u4", text: "my laptop", chinese: "我的笔记本电脑", tone: "blue" },
        { id: "u5", text: "while I work", chinese: "当我工作时", tone: "green" },
        { id: "u6", text: "a notebook", chinese: "一个笔记本", tone: "mint" },
      ],
      correctOrder: ["u1", "u2", "u3", "u4", "u5"],
      speakText: "I usually keep a coffee mug next to my laptop while I work.",
    },
  },
  Advanced: {
    level: "Advanced",
    photoSummary: "A calm desk with a laptop, mug, notebook, and plant.",
    see: {
      sentence: "A coffee mug sits beside the laptop, making the desk feel like a calm workspace.",
      chinese: "一个咖啡杯放在笔记本电脑旁边，让桌面看起来很安静。",
      speakText: "A coffee mug sits beside the laptop, making the desk feel like a calm workspace.",
    },
    learn: {
      chunks: [
        { id: "a1", text: "A coffee mug", chinese: "一个咖啡杯", tone: "purple" },
        { id: "a2", text: "sits beside", chinese: "坐落在……旁边", tone: "yellow" },
        { id: "a3", text: "the laptop", chinese: "那台笔记本电脑", tone: "pink" },
        { id: "a4", text: "making the desk feel like", chinese: "让桌面感觉像", tone: "blue" },
        { id: "a5", text: "a calm workspace", chinese: "一个安静的工作区", tone: "green" },
      ],
      note: "Use \"beside\" for a slightly more natural, polished tone.",
    },
    build: {
      targetSentence: "A coffee mug sits beside the laptop, making the desk feel like a calm workspace.",
      chunks: [
        { id: "a4", text: "making the desk feel like", chinese: "让桌面感觉像", tone: "blue" },
        { id: "a2", text: "sits beside", chinese: "坐落在……旁边", tone: "yellow" },
        { id: "a1", text: "A coffee mug", chinese: "一个咖啡杯", tone: "purple" },
        { id: "a5", text: "a calm workspace", chinese: "一个安静的工作区", tone: "green" },
        { id: "a3", text: "the laptop", chinese: "那台笔记本电脑", tone: "pink" },
      ],
      correctOrder: ["a1", "a2", "a3", "a4", "a5"],
    },
    use: {
      situation: "You are describing your focused work setup.",
      question: "What do you like to keep beside your laptop when you need a calm workspace?",
      questionChinese: "当你需要安静的工作环境时，你喜欢把什么放在笔记本电脑旁边？",
      targetAnswer: "I like to keep a coffee mug and a notebook beside my laptop when I need a calm workspace.",
      answerChunks: [
        { id: "au1", text: "I like to keep", chinese: "我喜欢放", tone: "purple" },
        { id: "au2", text: "a coffee mug", chinese: "一个咖啡杯", tone: "yellow" },
        { id: "au3", text: "and a notebook", chinese: "和一个笔记本", tone: "pink" },
        { id: "au4", text: "beside my laptop", chinese: "在我的笔记本电脑旁边", tone: "blue" },
        { id: "au5", text: "when I need a calm workspace", chinese: "当我需要安静的工作环境时", tone: "green" },
        { id: "au6", text: "a plant", chinese: "一盆植物", tone: "mint" },
      ],
      correctOrder: ["au1", "au2", "au3", "au4", "au5"],
      speakText:
        "I like to keep a coffee mug and a notebook beside my laptop when I need a calm workspace.",
    },
  },
};

export function normalizeAnswer(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function shuffleForBoard(items) {
  return [...items];
}
