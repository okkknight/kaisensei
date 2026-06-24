# Kaisensei Deep Mode Staged Generation Spec

**目标：** 在不推翻现有 Deep Mode 教学质量的前提下，把一次性全量生成改成阶段式生成，优先缩短首响时间，同时保持课程内容基于真实照片、前后阶段一致、且尽量复用现有 prompt 资产。

**范围：** 只定义 Deep Mode 的阶段式生成策略、阶段边界、等待页规则、重试规则和基础架构拆分原则。不重新设计 Quick Mode，不引入持久化恢复，不引入并行预热，不重写已有教学 prompt 的核心风格。

**对现有实现的对齐原则：** 这份 spec 不是重新发明一套 Deep Mode，而是基于当前已存在的 `api/src/deep/*`、`prototype/src/deep/*` 和现有阶段页流继续向前演进。凡是和现有实现直接冲突的地方，优先改 spec 说明，不要默认现有实现就是未来目标。

---

## 1. 现状事实

- 当前 Deep Mode 是单次生成整套课程后，job 才会进入 `succeeded`，前端也只在整套 lesson 完整后进入课程页。
- 当前 Deep Mode prompt 与 normalizer 已经过多轮质量优化，不能轻易整体重写。
- 当前课程结构已经按 `overview -> notice -> interpret -> interact -> stepIn -> completion` 组织。
- 当前前端 Deep Mode 结构已经能够消费完整 lesson，但不支持依赖阶段快照的增量进入。

结论：

- 这次改造必须以“照片为锚”，不能用 blueprint 替代真实场景。
- 这次改造必须保持 prompt 风格和生成资产的连续性，不做推倒重来式重写。
- 这次改造的核心不是把任务拆散，而是把“生成执行”拆成阶段，把“已完成内容”冻结下来供后续阶段复用。

---

## 2. 已确认的决策

以下决策为当前正式约定：

1. `overview + notice` 是固定的首阶段提交单元。
2. 后续阶段只依赖结构化字段白名单，不把整段自由文本当作背景输入。
3. `interpret`、`interact`、`step in` 按顺序串行生成，不并行。
4. 每个后续阶段都以上一阶段及更早阶段的冻结结果作为背景。
5. 后续阶段不会反向修改前面已经完成的阶段。
6. `overview + notice` 完成后，用户即可进入首个可用课程内容。
7. 后续阶段未就绪时，才展示等待页。
8. 等待页只显示“正在生成下一阶段”，并放在每个模块现有的里程碑页面后。
9. 如果后续阶段明确失败，等待页增加“手动重试失败阶段”和“回到相机页”功能。
10. 失败时只重试失败段，但必须带上已冻结前文。
11. 先不做落库。
12. 先不做离线恢复或离开后继续。
13. 阶段就绪标准参照当前 normalizer 规则，不新造规则，除非必要。
14. 若新阶段内容与已冻结前文重复，则重写该阶段。
15. 不做生成预热，不做并行抢跑。

---

## 3. 阶段模型

Deep Mode 采用四段串行模型：

```text
Stage A: overview + notice
Stage B: interpret
Stage C: interact
Stage D: step in
```

### 3.1 Stage A: overview + notice

这是首个固定提交单元，也是用户最早能用起来的部分。

实现上，这一阶段应直接承接现有的 `overview` 页面和 `notice` 模块，不要求先发明新的 UI 家族。阶段式改造的重点是让这两块内容更早就绪，并在它们之后再决定后续阶段是否可继续。

输入：

- 原始照片
- 课程生成协议
- level

输出：

- `overview`
- `notice`

规则：

- 这一阶段必须保证整体可直接渲染。
- 这一阶段完成后，用户可以先进入课程使用，不必等待后续阶段。
- 后续阶段不得修改 `overview` 和 `notice` 的已冻结内容。

### 3.2 Stage B: interpret

输入：

- 原始照片
- 课程生成协议
- 冻结的 `overview`
- 冻结的 `notice`

输出：

- `interpret`

规则：

- 只负责 `interpret` 自己的子树。
- 必须把前面已冻结内容视为背景事实。
- 必须避免重复 `notice` 已经选定的核心表达和学习角度。

### 3.3 Stage C: interact

输入：

- 原始照片
- 课程生成协议
- 冻结的 `overview`
- 冻结的 `notice`
- 冻结的 `interpret`

输出：

- `interact`

规则：

- 串行生成，不与 `step in` 并行。
- 必须把前面所有已冻结阶段当作背景。
- 必须避免重新讲一遍前面已经完成的学习重点。

### 3.4 Stage D: step in

输入：

- 原始照片
- 课程生成协议
- 冻结的 `overview`
- 冻结的 `notice`
- 冻结的 `interpret`
- 冻结的 `interact`

输出：

- `stepIn`

规则：

- 串行生成，不与 `interact` 并行。
- 这是最终整合阶段，但仍然只能在前文冻结结果上做推导。
- 必须自然复用前面已经出现过的表达，不能重新开一个独立语义中心。

---

## 4. 背景输入白名单

后续阶段只能读取结构化字段白名单，不能把前文自由文本整段当成上下文。

### 4.1 允许的输入类型

- 原图
- `overview.keywords`
- `overview.sceneDescriptionChinese`
- `notice.expressionPacks[].coreExpression`
- `notice.expressionPacks[].baseExample`
- `notice.expressionPacks[].variations`
- `interpret.expressionPacks[].coreExpression`
- `interpret.expressionPacks[].baseExample`
- `interpret.expressionPacks[].variations`
- `interact.taskPacks[].need`
- `interact.taskPacks[].handle`
- `interact.taskPacks[].dialogues`

### 4.2 不建议直接传入的内容

- 前面阶段的完整自然语言长文案
- 与当前阶段无关的调试信息
- 尚未冻结的半成品草稿
- blueprint 式全局规划文本

原则：

- 后续阶段要知道“前面已经定了什么”，但不要被一大段自由文本牵着跑。
- 结构化字段是背景，原图是锚点，冻结内容是约束。

---

## 5. Prompt 策略

这次改造不以重写 prompt 为目标，而以“保留主 prompt 风格，做阶段化补丁”为目标。

### 5.1 保留项

- 保留现有 Deep Mode prompt 的教学语气。
- 保留现有 Normal / Advanced 的区分。
- 保留 `coreExpression` 作为核心知识点的设定。
- 保留“同一张照片，不同学习角度”的主方向。

### 5.2 阶段补丁

每个阶段只额外补充以下信息：

- 本阶段只负责自己的 JSON 子树。
- 前文已冻结内容为背景事实，不得推翻。
- 新阶段不得重复前文已选定的核心表达。
- 若发现重复，应在本阶段重写，直到通过校验。

### 5.3 禁止项

- 禁止把现有完整 prompt 改造成另一套全新风格。
- 禁止引入 blueprint 替代真实照片作为主约束。
- 禁止为了分阶段而删除现有稳定的教学约束。

---

## 6. 架构拆分原则

这次改造同时要求逻辑和代码结构一起拆开。

### 6.1 后端目录边界

现有实现已经把 Deep Mode 放在独立的后端域内，相关代码分布在：

- `api/src/deep/config/`
- `api/src/deep/contracts/`
- `api/src/deep/services/`

这次改造不要再把 Deep Mode 的阶段逻辑塞回共享层，也不要把现有的 services 全部推翻重写。更合适的做法是：

- 在现有 `api/src/deep/` 目录域里继续拆阶段文件。
- 阶段 prompt、阶段 normalizer、阶段组装逻辑保持就近放置。
- 现有 `config`、`contracts`、`services` 继续作为稳定边界使用。
- 最终组装器只负责合并已冻结阶段，不负责重新发明课程语义。

前端侧也一样，现有实现已经有明确的 Deep Mode 目录边界：

- `prototype/src/deep/course/`
- `prototype/src/deep/state/`
- `prototype/src/deep/schema/`

因此这次的架构拆分应当是在现有目录域里继续分层，而不是再造一个与现有 Deep Mode 并行的第二套结构。

### 6.2 状态管理边界

- job runner 负责串行调度阶段。
- job 状态要能够表达阶段进行中、阶段已就绪、阶段失败。
- 先使用内存态，不做落库。
- 失败后只重试失败阶段，已冻结阶段保持不变。

建议把阶段状态放在 `job.generation` 子对象里，而不是把阶段字段散落到 job 顶层。这样可以把 staged generation 作为一个自包含的附加域，和最终完整 `lesson` 保持清晰分层。

建议的内存态最小形状：

```text
generation = {
  activeStage: "overview_notice" | "interpret" | "interact" | "step_in" | "complete",
  stageStates: {
    overview_notice: "pending" | "running" | "ready" | "failed",
    interpret: "pending" | "running" | "ready" | "failed",
    interact: "pending" | "running" | "ready" | "failed",
    step_in: "pending" | "running" | "ready" | "failed"
  },
  frozenLesson: {
    overview?: object,
    notice?: object,
    interpret?: object,
    interact?: object,
    stepIn?: object
  },
  errorStage?: string,
  errorMessage?: string
}
```

说明：

- `frozenLesson` 只保存已经通过校验的阶段结果。
- `activeStage` 表示当前正在推进哪一段。
- `stageStates` 用来驱动等待页和失败页。
- 这个形状是最小建议，不要求字段命名一字不差，但语义要保持一致。
- 当 `generation.activeStage` 指向某个阶段时，前端应该优先渲染已冻结的 `lesson` 内容，并把等待页作为补充 interstitial。

### 6.3 前端边界

- 前端不再只理解“整课 succeeded”。
- 前端需要能消费“阶段已就绪”的状态。
- 等待页只在下一阶段未完成时出现。
- 等待页是阶段间的桥，不是独立课程页。

### 6.4 需要进一步确认的实现边界

- 阶段快照放在单独的 `generation` 子对象里。
- 等待页复用现有 `DeepCourseShell` 壳层和顶部栏。
- 当前 `DEEP_PHASE_ORDER` 保持不变，等待页只作为生成状态介入，不进入课程 phase 序列。

---

## 7. 等待页规则

等待页的出现条件：

- 当前模块的里程碑页已经完成。
- 下一阶段还没有完成。

等待页的内容：

- 仅显示“正在生成下一阶段”。
- 不主动打断已经可用的前文内容。

等待页的失败态：

- 如果后续阶段明确失败，展示手动重试失败阶段的入口。
- 同时提供回到相机页的入口。

等待页的非目标：

- 不做离线缓存恢复。
- 不做跨会话继续。
- 不做复杂的等待原因解释。

---

## 8. 就绪与校验

### 8.1 就绪标准

阶段就绪标准沿用当前 normalizer 的规则：

- 结构完整
- 必要数组完整
- 必要字段完整
- 重复表达通过阶段重写解决

### 8.2 不新增硬规则

除非现有 normalizer 明显不够，否则不新增一套新的“阶段就绪判定规则”。

原则：

- 能沿用现有规则就沿用。
- 只有当阶段式生成引入了新的结构边界，且现有规则无法表达时，才补最小必要规则。

实现上，现有 `api/src/deep/services/course-normalizer.js` 已经有按模块拆开的校验函数，例如：

- `normalizeExpressionPack`
- `normalizeTaskPack`
- `normalizeStepInDialogue`

所以 staged generation 更像是把这些现有规则拆成阶段级入口并复用，而不是重新发明一套与当前 normalizer 平行的新校验系统。

同时，现有的 `normalizeDeepCoursePayload` 仍然适合作为最终装配后的整课门禁：阶段级校验负责保证每一段自己是可用的，最终整课 normalizer 负责保证合并后的 lesson 仍然符合完整 contract。

---

## 9. 失败与重试

### 9.1 失败影响范围

- 后续阶段失败，不影响前面已完成阶段的使用。
- 前面已完成阶段保持冻结状态，不被后续失败拖回。

### 9.2 重试策略

- 只重试失败阶段。
- 重试时必须带上已冻结前文。
- 如果重试仍然与前文重复，则继续重写失败阶段，直到通过或判定失败。

### 9.3 退出策略

- 后续阶段明确失败时，用户可以选择重新生成失败阶段。
- 用户也可以直接回到相机页重新开始。

---

## 10. 验收标准

以下条件满足时，才算这份 staged generation 规格成立：

1. `overview + notice` 可以作为首阶段先返回并先进入可用状态。
2. `interpret -> interact -> step in` 按顺序串行生成。
3. 每个后续阶段都只使用结构化白名单作为背景输入。
4. 已冻结阶段不会被后续阶段修改。
5. 下一阶段未完成时才显示等待页。
6. 下一阶段完成后自动跳过等待页。
7. 后续阶段失败时，前面阶段仍然可用。
8. 失败后可手动重试失败阶段，或回到相机页。
9. 不做落库、不做跨会话恢复、不做并行预热。
10. Prompt 主体风格保持连续，不因分阶段而整体重写。

---

## 11. 已确认的实现边界

- 失败阶段重试成功后，前端自动继续，不需要用户再点一次继续。
