import { deepCourseDefaultConfig, deepCourseDefaultFixedCopy } from "../../config/course.js";
import { buildDeepCoursePrompt } from "../course-prompt.js";

const stageOutputShape = {
  overview_notice: [
    "{",
    '  "mode": "deep",',
    '  "level": "normal" | "advanced",',
    '  "overview": {',
    '    "keywords": ["coffee", "table", "laptop"],',
    '    "sceneDescriptionChinese": "咖啡桌上的安静下午",',
    '    "startPromptChinese": "点击开始这次学习之旅"',
    "  },",
    '  "modules": {',
    '    "notice": {',
    '      "title": "Notice",',
    '      "goal": "Describe what is visible in the photo.",',
    '      "expressionPacks": []',
    "    }",
    "  }",
    "}",
  ].join("\n"),
  interpret: [
    "{",
    '  "mode": "deep",',
    '  "level": "normal" | "advanced",',
    '  "modules": {',
    '    "interpret": {',
    '      "title": "Interpret",',
    '      "goal": "Infer what may be happening in the scene.",',
    '      "expressionPacks": []',
    "    }",
    "  }",
    "}",
  ].join("\n"),
  interact: [
    "{",
    '  "mode": "deep",',
    '  "level": "normal" | "advanced",',
    '  "modules": {',
    '    "interact": {',
    '      "title": "Interact",',
    '      "goal": "Express a need and respond naturally.",',
    '      "taskPacks": []',
    "    }",
    "  }",
    "}",
  ].join("\n"),
  step_in: [
    "{",
    '  "mode": "deep",',
    '  "level": "normal" | "advanced",',
    '  "modules": {',
    '    "stepIn": {',
    '      "title": "Step In",',
    '      "goal": "Complete one full scene conversation.",',
    '      "dialogue": {',
    '        "scene": "",',
    '        "sceneChinese": "",',
    '        "turns": []',
    "      }",
    "    }",
    "  }",
    "}",
  ].join("\n"),
};

const stageInstructions = {
  overview_notice: [
    "STAGE MODE: overview_notice",
    "- Generate only the first playable stage.",
    "- Focus on overview and notice only.",
    "- Do not generate interpret, interact, or stepIn in this response.",
    "- Keep the frozen background fixed and do not rewrite earlier content.",
  ],
  interpret: [
    "STAGE MODE: interpret",
    "- Generate only the interpret subtree.",
    "- Use the frozen overview and notice as fixed background facts.",
    "- Do not regenerate overview or notice.",
  ],
  interact: [
    "STAGE MODE: interact",
    "- Generate only the interact subtree.",
    "- Use the frozen overview, notice, and interpret as fixed background facts.",
    "- Do not regenerate earlier stages.",
  ],
  step_in: [
    "STAGE MODE: step_in",
    "- Generate only the stepIn subtree.",
    "- Use the frozen overview, notice, interpret, and interact as fixed background facts.",
    "- Do not regenerate earlier stages.",
  ],
};

export function buildDeepStagePrompt({
  stage,
  level,
  repairNotes,
  background = {},
  config = deepCourseDefaultConfig,
  fixedCopy = deepCourseDefaultFixedCopy,
} = {}) {
  const basePrompt = buildDeepCoursePrompt({
    level,
    repairNotes,
    config,
    fixedCopy,
  });

  const instructions = stageInstructions[stage];
  const outputShape = stageOutputShape[stage];

  if (!instructions || !outputShape) {
    throw new Error(`Unsupported deep stage: ${String(stage)}`);
  }

  return [
    basePrompt,
    "",
    ...instructions,
    "",
    "FROZEN BACKGROUND:",
    JSON.stringify(background, null, 2),
    "",
    "RETURN ONLY THIS STAGE SHAPE:",
    outputShape,
  ].join("\n");
}
