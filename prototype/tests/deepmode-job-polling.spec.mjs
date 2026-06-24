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
