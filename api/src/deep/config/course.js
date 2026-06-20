export const deepCourseDefaultFixedCopy = {
  startPromptChinese: "点击开始这次学习之旅",
};

export const deepCourseDefaultConfig = {
  overviewKeywordCount: 3,
  notice: {
    coreExpressionCount: 2,
    variationsPerExpression: 1,
    quickResponsePerExpression: 1,
  },
  interpret: {
    coreExpressionCount: 2,
    variationsPerExpression: 1,
    quickResponsePerExpression: 1,
  },
  interact: {
    taskPackCount: 2,
    variationsPerNeedExpression: 1,
    variationsPerHandleExpression: 1,
    dialoguesPerTaskPack: 1,
  },
  stepIn: {
    noticeExpressionCount: 1,
    interpretExpressionCount: 1,
    needExpressionCount: 1,
    handleExpressionCount: 1,
  },
  exercise: {
    understandDistractorCount: 1,
    focusBlankCount: 2,
    focusDistractorCount: 1,
    buildDistractorCount: 1,
    dialogueDistractorCount: 1,
  },
  difficulty: {
    vocabularyLevel: "daily",
    expressionStyle: "natural",
    sentenceLength: "short",
    supportChinese: true,
  },
};
