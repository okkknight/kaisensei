# Kaisensei Deep Mode Backend Spec

**目标：** 为 Deep Mode 建立一份后端专项规格，明确它如何复用现有 `api/` 服务、如何通过 `mode=deep` 进入独立课程生成链路、以及如何在不影响 Quick Mode 的前提下产出完整的 Deep Course JSON。

**范围：** 只定义 Deep Mode 的后端责任、请求协议、课程输出协议、校验与重试规则、存储与恢复边界。Quick Mode 继续沿用现有行为，不在本 spec 中重新设计。

---

## 1. 设计前提

Deep Mode 的权威产品来源是 `docs/kaisensei_deep_mode_product_design.md`。本 spec 只提炼对后端落地必须固定的部分，并把默认实现边界收敛到可执行范围。

已确认的默认决策如下：

- 继续使用现有 `api/` 服务，不新建独立 Deep API 服务。
- 仍使用同一套 `POST /v1/lesson-jobs` 与 `GET /v1/lesson-jobs/:jobId` 任务入口。
- Deep Mode 通过 `mode=deep` 进入独立 schema 分支。
- 成功时直接返回完整 Deep Course JSON，不返回半成品草稿。
- 生成失败或校验失败时，后端自动重试一次。
- 仍然采用严格 reject，不允许前端猜测缺失字段。
- 同设备、同浏览器恢复仍由前端浏览器侧处理，后端 MVP 不做服务端持久化恢复。
- 共享 provider 切换底座，但 Deep Mode 自己有独立 prompt、schema、normalizer 和 validator。
- 上传体积、mime 约束与当前 Quick 流程保持一致。

---

## 2. 后端职责边界

### 2.1 允许后端做的事

- 接收图片、level、traceId 和 mode。
- 把图片交给 Deep 课程生成器。
- 将生成结果做确定性校验。
- 在首次失败时自动重试一次。
- 把最终结果写回 job store。
- 通过轮询接口返回 job 状态与最终课程数据。

### 2.2 不允许后端做的事

- 不做登录。
- 不做用户档案。
- 不做历史库。
- 不做支付。
- 不做语音输入。
- 不做实时流式生成。
- 不做图片落库。
- 不做服务端长久恢复。
- 不给前端返回“差不多能用”的半成品 JSON。

### 2.3 与 Quick Mode 的关系

Deep Mode 和 Quick Mode 共享同一套最外层 `api/` 服务与 job 入口，但必须在业务层分流。

要求：

- Quick Mode 现有逻辑不能被 Deep 改坏。
- Deep 的 prompt、schema、validator 不能回流到 Quick 的文件里。
- 共享层只放 transport、trace、IO、job 外壳这类无产品语义的东西。

---

## 3. 请求协议

### 3.1 创建任务

`POST /v1/lesson-jobs`

保持 `multipart/form-data`。

字段如下：

- `image`：用户拍照或上传的文件。
- `level`：沿用当前相机页的难度值，兼容 `Normal` / `Advanced`。
- `mode`：`quick` 或 `deep`。
- `traceId`：可选的链路标识。

兼容规则：

- 旧 Quick 调用如果没有 `mode`，后端默认视为 `quick`。
- 新 Deep 调用必须显式传 `mode=deep`。
- `mode` 不合法时返回 `invalid_mode`。
- `level` 不合法时返回 `invalid_level`。

响应：

```json
{
  "jobId": "job_01J...",
  "status": "queued"
}
```

### 3.2 查询任务

`GET /v1/lesson-jobs/:jobId`

任务状态保持现有四态：

- `queued`
- `running`
- `succeeded`
- `failed`

成功时返回：

- `jobId`
- `mode`
- `level`
- `status`
- `lesson`
- `error: null`

失败时返回：

- `jobId`
- `mode`
- `level`
- `status`
- `lesson: null`
- `error`

`/api/v1/lesson-jobs/:jobId` 的网关式别名保持可用。

---

## 4. Deep Course 输出协议

Deep Mode 的 job 成功后，`lesson` 字段不是 Quick lesson，而是完整的 Deep Course JSON。

### 4.1 顶层结构

```json
{
  "mode": "deep",
  "level": "normal",
  "overview": {
    "keywords": ["coffee", "table", "laptop"],
    "sceneDescriptionChinese": "咖啡厅里悠闲的下午茶时间",
    "startPromptChinese": "点击开始这次学习之旅"
  },
  "modules": {
    "notice": {
      "title": "Notice",
      "goal": "Describe what is visible in the photo.",
      "expressionPacks": []
    },
    "interpret": {
      "title": "Interpret",
      "goal": "Infer what may be happening in the scene.",
      "expressionPacks": []
    },
    "interact": {
      "title": "Interact",
      "goal": "Express a need and respond naturally.",
      "taskPacks": []
    },
    "stepIn": {
      "title": "Step In",
      "goal": "Complete one full scene conversation.",
      "dialogue": {}
    }
  }
}
```

### 4.2 关键约束

- `mode` 必须是 `deep`。
- `level` 在 Deep Course JSON 里使用小写规范值，`normal` 或 `advanced`。
- `overview.keywords` 只写照片中真实可见的具体名词。
- `sceneDescriptionChinese` 只能做保守、自然的场景判断。
- `startPromptChinese` 由产品固定文案提供，不让模型自由改写。
- `modules.notice`、`modules.interpret`、`modules.interact`、`modules.stepIn` 必须全部存在。
- 每个模块内部的字段形状必须符合 `docs/kaisensei_deep_mode_product_design.md` 的课程定义。

### 4.3 模块层级要求

- `Notice`：只描述客观可见内容。
- `Interpret`：只做有照片依据的合理推测。
- `Interact`：只生成这个场景里现实可发生的需求与回应。
- `Step In`：只复用前面已经学过的表达，不引入新核心表达，并保持同一场景里的连续角色对话语气。

---

## 5. 生成与重试规则

### 5.1 一次生成完整课程

Deep Mode 默认只做一次 LLM 课程生成调用，之后再做确定性校验。

流程如下：

```text
原始照片
+ level
+ mode=deep
+ config / fixed copy
↓
Deep prompt
↓
一次生成完整 Deep Course JSON
↓
系统 validator / normalizer 校验
↓
通过：写入 succeeded
失败：自动重试一次
```

不采用默认的分模块多次生成。

### 5.2 自动重试

首次生成或校验失败后，后端自动重试一次。

重试规则：

- 保留同一张图片。
- 保留同一个 `level`。
- 保留同一个 `mode=deep`。
- 把上一次失败的校验原因整理成简短修正提示，附加到下一次生成请求里。
- 第二次仍失败时，任务进入 `failed`。

### 5.3 严格 reject

以下情况都必须失败，不允许前端猜测：

- JSON 不能解析。
- 顶层字段缺失。
- `mode` 不等于 `deep`。
- 模块数量不对。
- `answer` 不能由 `chunks` 组成。
- Step In 引入了新表达。
- 题目中出现自由文本任务或语音任务。
- 图片太模糊，无法形成可用课程。

---

## 6. 校验规则

Deep backend 的校验必须是确定性的，不依赖 LLM 打分。

至少要校验：

- JSON 可解析。
- `mode === "deep"`。
- `level` 合法且已规范化。
- `overview` 存在。
- 四个模块都存在且顺序固定。
- 所有 `id` 唯一。
- 所有 `answerChunkIds` 或等价结构都能在候选块中找到。
- 所有正确答案都能由现有 `chunks` 组成。
- distractors 不进入正确答案。
- Step In 只复用已学过的表达。
- 不出现前端无法直接消费的缺失字段。

校验失败时：

- 不把脏数据交给前端。
- 不写入 succeeded。
- 先自动重试一次。
- 重试仍失败再返回 `failed`。

---

## 7. 存储与恢复

### 7.1 后端存储

MVP 仍使用内存 job store。

这意味着：

- job 只在当前进程内有效。
- 服务重启后未完成的 job 会丢失。
- 图片不落库。
- 课程结果只在 job 生命周期内保留。

### 7.2 恢复边界

恢复只做前端浏览器侧持久化，后端不额外保存课程进度。

原因：

- 当前目标是先把 Deep Mode 跑通。
- 之后如果要独立拆分 Deep 项目，状态模型可以直接迁移。

---

## 8. 后端模块边界

建议的目标边界如下：

```text
api/src/
  app.js
  routes/lesson-jobs.js
  services/job-runner.js
  services/provider-registry.js
  stores/in-memory-job-store.js
  contracts/job.js
  shared/ai/
  quick/
  deep/
```

Deep Mode 自己的代码应落在：

```text
api/src/deep/
  contracts/course.js
  services/course-prompt.js
  services/course-normalizer.js
  services/deep-codex-cli-provider.js
  services/deep-gemini-api-provider.js
```

原则：

- `shared/ai/` 只管怎么调用模型，不理解产品语义。
- `quick/` 继续承载现有 Quick 逻辑。
- `deep/` 承载 Deep 专属 prompt、schema、normalizer、provider。
- `job-runner` 负责 mode 分流和 retry，不放产品内容。

---

## 9. 错误码

推荐固定以下错误码：

- `missing_image`
- `invalid_mode`
- `invalid_level`
- `job_not_found`
- `provider_empty_output`
- `provider_parse_error`
- `provider_runtime_error`
- `validation_error`
- `generation_failed`

规则：

- 路由级错误优先返回 4xx。
- 生成阶段错误进入 job 的 `failed` 状态。
- 错误消息要短、可读、可重试。

---

## 10. 验收标准

Deep backend 可以认为完成，当且仅当：

1. `mode=deep` 能走同一套 `lesson-jobs` 入口。
2. Quick Mode 不受影响。
3. Deep job 成功后返回完整 Deep Course JSON。
4. JSON 通过确定性校验后才算成功。
5. 首次失败会自动重试一次。
6. 重试仍失败时返回明确的 job failure。
7. 后端没有引入图片落库或服务端恢复。
8. Deep 的 prompt、schema、validator 与 Quick 隔离。
9. 现有共享 AI 底座仍然可复用，但不承载产品逻辑。
10. 当前任务结束后，Deep frontend 可以只对接这个固定 contract。
