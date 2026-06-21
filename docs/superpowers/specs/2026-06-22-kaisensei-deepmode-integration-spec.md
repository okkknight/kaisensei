# Kaisensei Deep Mode Integration Spec

**目标：** 为 Deep Mode 的前后端联调提供一份单独的契约 spec，明确当前后端 API 与前端 Deep Mode 结构之间的对应关系、必须补齐的字段约定、以及联调时必须遵守的适配规则。

**范围：** 只定义 Deep Mode 的联调契约，不重新设计产品，不重写页面结构，不改变 Quick Mode 行为。

---

## 1. 联调结论

当前 Deep Mode 的前后端主结构已经对齐到可以联调的程度，具体表现为：

- 后端返回的是完整 `mode=deep` lesson JSON。
- 前端 Deep Mode 已经按 `overview -> notice -> interpret -> interact -> stepIn -> completion` 拆分成独立页面层。
- Notice / Interpret 已经使用同一套 `expressionPacks -> baseExample + variations` 结构。
- Interact 已经使用 `taskPacks -> need + handle + dialogues` 结构。
- Step In 已经使用 `dialogue.scene + turns[]` 连续对话结构。

联调风险不在“结构完全不兼容”，而在以下几个约定值和字段边界是否统一：

1. `overview.startPromptChinese` 只由后端保留，前端暂不使用。
2. Interact 的 guide 页必须补齐 `scenePromptChinese`。
3. Step In 的 `sourceModule` 必须经过 normalizer 映射成前端可识别的约定值。
4. Understand 页的高亮不新增独立字段，直接以 `pack.coreExpression` 为准。
5. Deep Mode contract 需要补全到真正的 nested 字段层级，而不是只保留骨架。
6. 前端接入时必须按 job polling 方式读取后端 lesson，不做一次性直出假设。

---

## 2. 现状对齐原则

### 2.1 结构对齐

联调以后端 `lesson` 结构为准，前端只做 view model 适配，不再自己发明一套课程语义。

### 2.2 数据来源对齐

- 后端负责生成 lesson JSON。
- 前端负责渲染 lesson JSON。
- 前端不得假设后端会返回未定义字段。
- 后端不得依赖前端推断缺失字段后“凑合运行”。

### 2.3 软字段原则

如果某个字段是“保留给后端、前端当前不使用”，必须在 spec 中明确标注，避免后续误以为前端遗漏。

---

## 3. 任务接口与联调方式

### 3.1 创建任务

Deep Mode 继续使用现有任务接口：

`POST /v1/lesson-jobs`

必须通过 `multipart/form-data` 传入：

- `image`
- `level`
- `mode=deep`
- `traceId`（可选）

### 3.2 轮询任务

前端必须通过轮询读取任务结果：

`GET /v1/lesson-jobs/:jobId`

联调时的正确流程是：

```text
POST /v1/lesson-jobs
↓
拿到 jobId
↓
轮询 GET /v1/lesson-jobs/:jobId
↓
status=succeeded 后读取 job.lesson
```

不允许前端假设 `POST` 直接返回完整 lesson。

---

## 4. 后端与前端的字段边界

### 4.1 Overview

后端 lesson 里保留：

- `overview.keywords`
- `overview.sceneDescriptionChinese`
- `overview.startPromptChinese`

联调约定：

- `keywords` 与 `sceneDescriptionChinese` 是前端当前会消费的字段。
- `startPromptChinese` 仅后端保留，前端暂不使用。
- 这个字段必须继续存在于后端 lesson 中，不能删除。

### 4.2 Notice / Interpret

后端必须继续输出：

- `expressionPacks[]`
- 每个 pack 的 `coreExpression`
- `baseExample`
- `variations[]`
- 每个 example 内的：
  - `english`
  - `chinese`
  - `understand`
  - `focus`
  - `build`
  - `quickResponse`

联调约定：

- Notice 和 Interpret 共用同一套 pack 语义，不允许 variations 另起新的核心词汇。
- `understand` 页的高亮不作为单独业务字段存在。
- 前端高亮显示统一以 `pack.coreExpression` 为准。
- 如果前端需要 view model 层字段，可以由前端从 `coreExpression` 直接派生，不要求后端额外输出 `highlight`。

### 4.3 Interact

后端必须继续输出：

- `taskPacks[]`
- 每个 task pack 的：
  - `taskTitle`
  - `scenePrompt`
  - `need`
  - `handle`
  - `dialogues[]`

联调约定：

- `need` 和 `handle` 各自保持自己的 `coreExpression`，并各自拥有 baseExample / variations。
- `dialogues[].systemReply` 必须是 bridge sentence，不能直接暴露 learned handle 表达。
- `scenePromptChinese` 必须加入 task pack 级 contract，并由前端 guide 页直接渲染。
- 如果后端暂时无法生成该字段，不能让前端靠猜测补齐。

### 4.4 Step In

后端必须继续输出：

- `dialogue.scene`
- `dialogue.turns[]`

联调约定：

- `turns` 必须保持连续角色对话结构。
- `turns` 中的用户回合必须保留：
  - `speaker`
  - `text`
  - `sourceModule`
  - `chunks`
  - `distractors`
  - `answer`
- `sourceModule` 需要通过 normalizer 映射成前端可识别的约定值，至少覆盖：
  - `notice`
  - `interpret`
  - `interact_need`
  - `interact_handle`
- 如果后端输出的源值不在约定集合内，normalizer 必须在后端侧完成映射，而不是交给前端兜底。

---

## 5. Contract 需要补齐的内容

Deep Mode 的 contract 文件不能只保留模块壳，必须补到能表达前端实际消费的 nested 结构。

### 5.1 必须补齐的内容

- `overview` 的完整字段说明
- `notice.expressionPacks[].baseExample + variations`
- `interpret.expressionPacks[].baseExample + variations`
- `interact.taskPacks[].need`
- `interact.taskPacks[].handle`
- `interact.taskPacks[].dialogues`
- `stepIn.dialogue.turns`

### 5.2 必须明确的字段边界

- `overview.startPromptChinese`：保留，但前端当前不使用
- `scenePromptChinese`：需要加入 Interact contract，且必须可渲染
- `highlight`：不作为独立后端字段存在，统一由 `coreExpression` 充当高亮来源

---

## 6. 页面级联调要求

### 6.1 Overview 页

前端渲染只依赖：

- `photoPreviewUrl`
- `overview.keywords`
- `overview.sceneDescriptionChinese`

不依赖：

- `overview.startPromptChinese`

### 6.2 Notice / Interpret 页

前端需要能直接从后端 lesson 渲染：

- `pack.coreExpression`
- `pack.meaningChinese`
- `baseExample`
- `variations`

页面内的理解、高亮、填空、重排、Quick Response 题型，全部应能由 lesson 结构直接映射出来。

### 6.3 Interact 页

前端需要能直接从后端 lesson 渲染：

- task guide
- Need 练习
- Handle 练习
- dialogue 练习
- milestone summary

guide 页中的中文场景说明必须来自后端，不允许前端自行编。

### 6.4 Step In 页

前端需要能直接从后端 lesson 渲染：

- 连续角色对话历史
- 每一轮 user turn 的重排练习
- 完成页 replay

其中 turn 的提示文案只能依赖 normalizer 后的 `sourceModule` 约定值。

---

## 7. 联调时的验收标准

以下条件同时满足时，才算联调通过：

1. 后端返回的 Deep Course JSON 可以被前端直接解析。
2. 前端不需要靠额外猜字段来补页面。
3. Overview、Notice、Interpret、Interact、Step In 都能用同一份 lesson 数据跑通。
4. Notice / Interpret 的高亮来源统一。
5. Interact guide 页有完整的场景中文说明。
6. Step In 的提示文案不会因为 `sourceModule` 不匹配而丢失。
7. 前端 job polling 能稳定拿到 `succeeded` 的 `job.lesson`。

---

## 8. 当前决策记录

以下决策为当前联调的正式约定：

- `overview.startPromptChinese` 仅后端保留、前端暂不使用。
- Interact 的 `scenePromptChinese` 必须加入 contract。
- `sourceModule` 由 normalizer 统一映射。
- `highlight` 不作为独立字段，直接使用 `pack.coreExpression`。
- Contract 必须补齐到 nested 结构。
- 前端必须采用 job polling 适配后端返回。

