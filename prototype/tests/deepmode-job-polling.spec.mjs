import { test, expect } from "playwright/test";

test("deep mode renders the overview before later stages finish", async ({ page }) => {
  let pollCount = 0;
  let releaseInterpretPoll = () => {};
  const interpretPollGate = new Promise((resolve) => {
    releaseInterpretPoll = resolve;
  });

  await page.route("**/v1/lesson-jobs", async (route) => {
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({ jobId: "job_123", status: "queued" }),
    });
  });

  await page.route("**/v1/lesson-jobs/job_123", async (route) => {
    pollCount += 1;
    const body =
      pollCount < 3
        ? {
            jobId: "job_123",
            status: "running",
            lesson: null,
            generation: {
              activeStage: "interpret",
              stageStates: {
                overview_notice: "ready",
                interpret: "running",
                interact: "pending",
                step_in: "pending",
              },
              frozenLesson: {
                overview: {
                  keywords: ["coffee", "table", "laptop"],
                  sceneDescriptionChinese: "安静的桌面工作场景",
                  startPromptChinese: "点击开始这次学习之旅",
                },
                notice: {
                  title: "Notice",
                  goal: "Describe what is visible in the photo.",
                  expressionPacks: [],
                },
                interpret: null,
                interact: null,
                stepIn: null,
              },
              errorStage: null,
              errorMessage: null,
            },
            error: null,
          }
        : pollCount === 3
          ? {
              jobId: "job_123",
              status: "running",
              lesson: null,
              generation: {
                activeStage: "interact",
                stageStates: {
                  overview_notice: "ready",
                  interpret: "ready",
                  interact: "running",
                  step_in: "pending",
                },
                frozenLesson: {
                  overview: {
                    keywords: ["coffee", "table", "laptop"],
                    sceneDescriptionChinese: "安静的桌面工作场景",
                    startPromptChinese: "点击开始这次学习之旅",
                  },
                  notice: {
                    title: "Notice",
                    goal: "Describe what is visible in the photo.",
                    expressionPacks: [],
                  },
                  interpret: {
                    title: "Interpret",
                    goal: "Infer what may be happening in the scene.",
                    expressionPacks: [],
                  },
                  interact: null,
                  stepIn: null,
                },
                errorStage: null,
                errorMessage: null,
              },
              error: null,
            }
          : {
            jobId: "job_123",
            status: "succeeded",
            lesson: {
              mode: "deep",
              level: "normal",
              overview: {
                keywords: ["coffee", "table", "laptop"],
                sceneDescriptionChinese: "安静的桌面工作场景",
                startPromptChinese: "点击开始这次学习之旅",
              },
              modules: {
                notice: {
                  title: "Notice",
                  goal: "Describe what is visible in the photo.",
                  expressionPacks: [],
                },
                interpret: {
                  title: "Interpret",
                  goal: "Infer what may be happening in the scene.",
                  expressionPacks: [],
                },
                interact: {
                  title: "Interact",
                  goal: "Express a need and respond naturally.",
                  taskPacks: [],
                },
                stepIn: {
                  title: "Step In",
                  goal: "Complete one full scene conversation.",
                  dialogue: {
                    scene: "You are at a desk with your laptop, and a coworker is nearby.",
                    turns: [],
                  },
                },
              },
            },
            generation: {
              activeStage: "complete",
              stageStates: {
                overview_notice: "ready",
                interpret: "ready",
                interact: "ready",
                step_in: "ready",
              },
              frozenLesson: {
                overview: {
                  keywords: ["coffee", "table", "laptop"],
                  sceneDescriptionChinese: "安静的桌面工作场景",
                  startPromptChinese: "点击开始这次学习之旅",
                },
                notice: {
                  title: "Notice",
                  goal: "Describe what is visible in the photo.",
                  expressionPacks: [],
                },
                interpret: {
                  title: "Interpret",
                  goal: "Infer what may be happening in the scene.",
                  expressionPacks: [],
                },
                interact: {
                  title: "Interact",
                  goal: "Express a need and respond naturally.",
                  taskPacks: [],
                },
                stepIn: {
                  title: "Step In",
                  goal: "Complete one full scene conversation.",
                  dialogue: {
                    scene: "You are at a desk with your laptop, and a coworker is nearby.",
                    turns: [],
                  },
                },
              },
              errorStage: null,
              errorMessage: null,
            },
            error: null,
          };

    if (pollCount === 3) {
      await interpretPollGate;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "深度" }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: "deep-mode.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
  });

  await expect(page.getByRole("progressbar")).toBeVisible();
  await expect(page.getByText("coffee · table · laptop")).toBeVisible();
  await page.getByRole("button", { name: "Start Deep Mode →" }).click();
  await page.getByRole("button", { name: "Continue to Interpret →" }).click();
  await expect(page.getByText("正在生成下一阶段")).toBeVisible();
  releaseInterpretPoll();
  await expect(page.getByText("Continue to Interact →")).toBeVisible();
  await expect.poll(() => pollCount).toBeGreaterThanOrEqual(3);
});

test("deep mode keeps selected chunks stable while generation refreshes in the background", async ({ page }) => {
  let pollCount = 0;
  let releaseRefreshPoll = () => {};
  const refreshPollGate = new Promise((resolve) => {
    releaseRefreshPoll = resolve;
  });

  const noticePack = {
    id: "notice-1",
    coreExpression: "a coffee mug",
    meaningChinese: "一个咖啡杯",
    baseExample: {
      english: "A coffee mug is next to the laptop.",
      chinese: "一个咖啡杯放在笔记本电脑旁边。",
      understand: {
        chunks: ["A coffee mug", "is next to", "the laptop"],
        distractors: ["on the shelf"],
        highlight: "a coffee mug",
        answer: ["A coffee mug", "is next to", "the laptop"],
      },
      focus: {
        sentenceWithBlanks: "____ is next to the laptop.",
        choices: ["A coffee mug"],
        distractors: ["A notebook"],
        answer: ["A coffee mug"],
      },
      build: {
        promptChinese: "把以下词组排列成正确的句子",
        chunks: ["A coffee mug", "is next to", "the laptop"],
        distractors: ["on the shelf"],
        answer: ["A coffee mug", "is next to", "the laptop"],
      },
      quickResponse: {
        question: "What is next to the laptop?",
        chunks: ["A coffee mug", "is next to", "the laptop"],
        distractors: ["A notebook"],
        answer: ["A coffee mug", "is next to", "the laptop"],
      },
    },
    variations: [],
  };

  const runningGeneration = (stageStates, frozenLesson) => ({
    jobId: "job_456",
    status: "running",
    lesson: null,
    generation: {
      activeStage: stageStates.interpret === "running" ? "interpret" : "interact",
      stageStates,
      frozenLesson,
      errorStage: null,
      errorMessage: null,
    },
    error: null,
  });

  await page.route("**/v1/lesson-jobs", async (route) => {
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({ jobId: "job_456", status: "queued" }),
    });
  });

  await page.route("**/v1/lesson-jobs/job_456", async (route) => {
    pollCount += 1;
    const baseFrozenLesson = {
      overview: {
        keywords: ["coffee", "table", "laptop"],
        sceneDescriptionChinese: "安静的桌面工作场景",
        startPromptChinese: "点击开始这次学习之旅",
      },
      notice: {
        title: "Notice",
        goal: "Describe what is visible in the photo.",
        expressionPacks: [noticePack],
      },
      interpret: null,
      interact: null,
      stepIn: null,
    };

    if (pollCount === 1) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          runningGeneration(
            {
              overview_notice: "ready",
              interpret: "running",
              interact: "pending",
              step_in: "pending",
            },
            baseFrozenLesson
          )
        ),
      });
      return;
    }

    if (pollCount === 2) {
      await refreshPollGate;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          runningGeneration(
            {
              overview_notice: "ready",
              interpret: "running",
              interact: "pending",
              step_in: "pending",
            },
            {
              ...baseFrozenLesson,
              interpret: {
                title: "Interpret",
                goal: "Infer what may be happening in the scene.",
                expressionPacks: [],
              },
            }
          )
        ),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        jobId: "job_456",
        status: "succeeded",
        lesson: {
          mode: "deep",
          level: "normal",
          overview: baseFrozenLesson.overview,
          modules: {
            notice: baseFrozenLesson.notice,
            interpret: {
              title: "Interpret",
              goal: "Infer what may be happening in the scene.",
              expressionPacks: [],
            },
            interact: {
              title: "Interact",
              goal: "Express a need and respond naturally.",
              taskPacks: [],
            },
            stepIn: {
              title: "Step In",
              goal: "Complete one full scene conversation.",
              dialogue: {
                scene: "You are at a desk with your laptop, and a coworker is nearby.",
                turns: [],
              },
            },
          },
        },
        generation: {
          activeStage: "complete",
          stageStates: {
            overview_notice: "ready",
            interpret: "ready",
            interact: "ready",
            step_in: "ready",
          },
          frozenLesson: {
            ...baseFrozenLesson,
            interpret: {
              title: "Interpret",
              goal: "Infer what may be happening in the scene.",
              expressionPacks: [],
            },
            interact: {
              title: "Interact",
              goal: "Express a need and respond naturally.",
              taskPacks: [],
            },
            stepIn: {
              title: "Step In",
              goal: "Complete one full scene conversation.",
              dialogue: {
                scene: "You are at a desk with your laptop, and a coworker is nearby.",
                turns: [],
              },
            },
          },
          errorStage: null,
          errorMessage: null,
        },
        error: null,
      }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "深度" }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: "deep-mode.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
  });

  await page.getByRole("button", { name: "Start Deep Mode →" }).click();
  await expect(page.getByText("A coffee mug is next to the laptop.")).toBeVisible();

  const answerChip = page.locator(".deep-answer-stage .deep-chunk-chip.selected", { hasText: "A coffee mug" });
  const candidateChip = page.locator(".deep-bank-row .deep-chunk-chip", { hasText: "A coffee mug" });

  await page.getByRole("button", { name: "A coffee mug" }).click();
  await expect(answerChip).toBeVisible();
  await expect(candidateChip).toHaveCount(0);

  releaseRefreshPoll();
  await expect.poll(() => pollCount).toBeGreaterThanOrEqual(2);
  await expect(answerChip).toBeVisible();
  await expect(candidateChip).toHaveCount(0);
});
