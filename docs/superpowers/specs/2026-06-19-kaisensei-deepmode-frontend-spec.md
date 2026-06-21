# Kaisensei Deep Mode Frontend Backbone Spec

**目标：** 为 Deep Mode 的前端先定义一套可落地的非视觉基础，让 Codex 能先搭出“能用的前端结构”，再逐步填充视觉设计。

**范围：** 只定义 Deep Mode 的前端骨架、页面流、交互基础、状态边界、数据对接层和组件职责，目标是先把页面结构和交互骨架落下来，再补最终视觉稿。

**权威来源：**

- `docs/kaisensei_deep_mode_product_design.md` 是 Deep Mode 的产品与交互权威事实来源
- `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-spec.md` 是 Deep Mode 的实现边界来源
- `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-backend-spec.md` 是后端输出协议来源

---

## 1. 设计目标

这份 spec 只解决一件事：

> 先把 Deep Mode 的前端做成一个结构清楚、状态明确、接口对得上、后续好补视觉的可运行骨架。

这意味着前端第一阶段要做到：

- 页面顺序正确
- 交互路径正确
- 数据映射正确
- 状态切换正确
- 组件职责清楚
- 视觉暂时可以是占位态，但布局必须稳定

不做的事情：

- 不追求最终美术效果
- 不追求 1:1 还原参考图的所有细节
- 不把 Deep Mode 和 Quick Mode 混成同一棵页面树
- 不在没有确认的地方擅自加功能

---

## 2. 当前基线

当前仓库里已经有这些前端事实：

- `prototype/src/App.jsx` 只是薄壳入口
- `prototype/src/app/AppShell.jsx` 负责在 Camera / Quick / Deep 之间路由
- `prototype/src/app/CameraEntry.jsx` 负责首屏拍照、上传、模式选择和难度选择
- `prototype/src/quick/` 已经是 Quick Mode 自己的域
- `prototype/src/deep/` 已经有 Deep Mode 的骨架入口、纵览页、阶段模块和完成页

因此这份 spec 不从空白开始，而是把已有骨架整理成可执行的前端 Backbone。

---

## 3. 前端原则

### 3.1 先骨架，后皮肤

第一阶段只固定：

- 页面层级
- 区块分布
- 交互行为
- 数据流向
- 状态命名

视觉只保留最小可用占位样式，后续再补颜色、质感、插画和细节。

### 3.2 Deep 与 Quick 强隔离

Deep Mode 的前端不能反向依赖 Quick Mode 的 lesson 实现。

允许共享的只有：

- 应用壳层
- 首屏相机入口
- 图片拍摄 / 上传能力
- 无业务语义的 UI 基元
- 无业务语义的媒体工具

不允许共享的有：

- 课程流
- 状态机
- 练习判定
- 课程页面
- 模式专属文案
- Deep 专属数据映射

### 3.3 所有交互都以可点击、可重排为主

Deep Mode 第一阶段只使用：

- 点击
- 选择
- 词块重排
- 确认 / 返回

不引入：

- 语音输入
- 自由文本输入
- 拖拽作为必需能力

### 3.4 结构优先于装饰

结构优先级高于视觉优先级：

1. 模式与页面流
2. 状态和导航
3. 数据映射
4. 练习容器
5. 视觉样式

### 3.5 字段级写法要求

每个页面的结构说明都必须落到可实现的字段和组件层级，不能只写抽象概念。

必须写清楚的内容包括：

- 页面顶部有哪些固定元素
- 中部有哪些独立区块
- 底部有哪些固定操作
- 每个区块内部包含哪些字段
- 字段之间的上下顺序
- 哪些字段是列表，哪些字段是单值
- 哪些字段带表达释义，哪些字段只显示英文

禁止只写这类模糊词而不定义字段：

- 摘要
- 提示
- 说明
- 内容
- 结果
- 信息块

如果必须使用这些词，后面必须紧跟字段定义，例如：

- `核心表达列表块` = 标题 + 表达列表 + 可选表达释义
- `完成文案块` = 完成标题 + 完成说明 + 固定中文完成说明

### 3.6 页面铺层规则

Deep Mode 的页面内容不是塞进一个统一的大课程壳里，而是直接铺在背景页面上。

允许存在的只是最小必要的页面骨架，比如：

- 顶部导航 / 返回区
- 进度提示区
- 页面主体里的独立卡片、练习区、回放区
- 底部操作栏

不允许把所有内容再包进一个大而完整的“课程主卡”里，让页面看起来像单层面板套娃。

要求：

- 每个页面的主体组件直接挂在页面背景层上
- 只在局部区块使用独立卡片
- 卡片负责自己的内容，不负责封装整页
- 页面之间保持呼吸感，留白由背景承担，而不是靠一个大壳承担
- 视觉边界用局部卡片、分组和间距来做，不用一整块大面板把所有内容兜住

## 4. 页面总流

Deep Mode 前端按以下顺序运行：

```text
Camera Entry
↓
Loading
↓
Overview
↓
Notice
↓
Interpret
↓
Interact
↓
Step In
↓
Completion
```

### 4.1 入口规则

- 在相机页选择 `Deep` 后，拍照或上传图片，进入 Deep Mode
- 一旦进入 Deep Mode 课程，不能在课程内切到 Quick Mode
- 想换模式必须回到相机页重新拍照或上传

### 4.2 返回规则

- 课程内返回，先回到上一个课程页面
- `Overview` 页返回，回到相机页
- 课程流程内返回时要确认，避免误退出
- `Completion` 页返回，先回到上一页或按产品定义回到课程末尾状态

---

## 5. 页面职责

### 5.0 图示标注规则

当设计图顶部出现类似 `1 Deep Loading`、`2 Course Overview` 这类标注时，它们只表示页面说明标题，不属于真实页面结构。

真实页面结构只从下方完整页面容器开始计算。不要把这些说明标题当作组件、布局或导航的一部分。

### 5.1 Camera Entry

相机入口不属于 Deep Mode 专属页面，但 Deep Mode 要从这里接收输入。

### 必须承载的能力

- 选择 Deep / Quick 模式
- 选择 Normal / Advanced
- 拍照
- 上传图片
- 把图片和模式上下文交给对应模式入口

### 第一阶段的非视觉要求

- 提供稳定的模式入口数据
- 不把 Deep Mode 的课程状态带回相机页
- 不在相机页内展示课程内容

---

## 6. Deep Mode 状态机

Deep Mode 前端状态机必须和产品设计一致。

### 6.1 顶层状态

```ts
type DeepPhase =
  | "loading"
  | "overview"
  | "notice"
  | "interpret"
  | "interact"
  | "stepIn"
  | "completion";
```

### 6.2 子状态

每个模块内部还需要自己的练习状态：

```ts
type ExerciseStatus = "idle" | "ready" | "checking" | "correct" | "incorrect" | "hinted";
```

对于对话型模块，还需要：

```ts
type DialogueTurnState = "system" | "userPending" | "userComplete";
```

### 6.3 状态切换原则

- `loading -> overview`：课程生成完成后进入纵览页
- `overview -> notice`：点击整张引导卡片
- `notice -> interpret -> interact -> stepIn`：按模块顺序推进
- `stepIn -> completion`：最终对话完成后进入完成页
- `completion -> camera`：通过返回拍照页或再次练习入口退出

---

## 7. 页面结构规范

### 7.1 Loading

Loading 页只做过渡，不承载课程内容。

### 需要呈现的信息

- 当前在看图 / 生成课程
- 轻量加载文案
- 可选的 loading 动效占位
- 纵向的阶段进度提示
- 生成进度百分比或等价的完成度提示

### 页面展示值

- `[固定]` `Reading the scene...`
- `[固定]` `正在读取场景...`
- `[固定]` `Building your practice...`
- `[固定]` `正在生成练习内容...`
- `[固定]` `Preparing your challenge...`
- `[固定]` `正在准备挑战...`

### 字段来源

- 当前进行中的步骤高亮：来自前端 loading 子状态或 job 生命周期状态
- 底部进度值：来自前端 loading 状态机的展示值
- 阶段卡三条英文文案：来自 Loading 参考图的固定文案
- 加载文案中文：来自前端固定 copy，不来自后端课程 JSON

### 交互要求

- 不可中途切换模式
- 不可进入课程内容页
- 发生错误时切到 Error 状态，不停留在 loading

### 页面布局

- 整页是一个居中的纵向大容器，外层留足留白，内部再分品牌区和进度区
- 上半部居中放品牌区，品牌区只放标识和模式名，不放课程内容
- 下半部放独立的阶段卡，阶段卡本身再分为左侧步骤轨道和右侧文案区
- 阶段卡按顺序显示 `Reading the scene`、`Building your practice`、`Preparing your challenge`
- 当前进行中的步骤在阶段卡内高亮，未进行步骤保持弱色
- 底部单独放整体进度值，和阶段卡视觉上分离

### 字段来源

- 品牌区文案 `kaisensei` 和 `Deep Mode`：前端固定品牌文案，不来自后端 `lesson`。
- 阶段卡三条英文文案 `Reading the scene`、`Building your practice`、`Preparing your challenge`：来自 Loading 参考图的固定文案，不来自后端 `lesson`。
- 当前进行中的步骤高亮：来自前端 loading 子状态或 job 生命周期状态，不来自后端课程 JSON。
- 底部进度值：来自前端 loading 状态机的展示值，不由后端课程 JSON 提供。
- 两行加载文案：固定为 `Reading the scene... / 正在读取场景...`、`Building your practice... / 正在生成练习内容...`、`Preparing your challenge... / 正在准备挑战...`，不来自后端课程 JSON。

---

### 7.2 Overview

Overview 是 Deep Mode 的课程入口页，只做一个判断：

> 这张图被识别成什么场景，值不值得开始这节课。

### 页面区块

- 上方辅助状态行
- 中央主卡片
- 底部开始按钮或整卡点击区域

### 页面展示值

- `[固定]` 顶部品牌名：`Overview`
- `[固定]` 顶部模式名：`Deep Mode`
- `[后端动态]` 关键词行：来自后端 `overview.keywords`
- `[后端动态]` 场景描述：来自后端 `overview.sceneDescriptionChinese`
- `[固定]` 开始引导语：`Ready to explore this scene?`
- `[固定]` 开始按钮：`Start Deep Mode →`

### 页面布局

- 页面顶部是一条单行工具栏，左侧放状态位，中心放品牌名，右侧放设置入口
- 中间是唯一的主卡片，卡片是整页视觉重心
- 主卡片上半部放照片预览，下半部放文字信息和开始区域
- 文字信息在卡内按从上到下的顺序排列为关键词行、场景描述、开始引导语
- 开始引导语区域可以做成卡内底部 CTA，也可以让整张卡可点击
- 关键词区、场景区、引导语区必须是三个独立语义块

### 主卡片内容

- 用户照片预览
- 英文关键词，按 `coffee · table · laptop` 这种方式展示
- 场景描述是后端动态值，不能写死成固定文案
- 开始引导语是固定文案
- 关键词、场景说明、引导语在卡内必须分成独立语义块
- 照片预览在卡片上半部占主视觉
- 下半部可以使用更强调的场景信息块和独立的开始 CTA 区

### 交互要求

- 整张卡片可点击进入课程
- 也可以保留一个明确的开始按钮，但不应改变主交互含义
- 返回回到相机页

### MVP 非视觉要求

- 关键词区、场景区、引导语区必须是独立语义块
- 这些语义块后续可以分别换皮，但不能合并成一个模糊文本区

### 字段来源

- 主图 `photoPreviewUrl`：来自 `useDeepModeFlow.photoPreviewUrl`，它由 `initialFile` 生成的 object URL 提供，不来自后端 `lesson`。
- 关键词行 `overview.keywords`：来自后端 `lesson.overview.keywords`，长度受后端 config `overviewKeywordCount` 约束。
- 场景描述 `overview.sceneDescriptionChinese`：来自后端 `lesson.overview.sceneDescriptionChinese`。
- 开始引导语：`Ready to explore this scene?`
- 开始按钮 `overview.startCta`：固定为 `Start Deep Mode →`。
- 顶部的 `Overview` 和 `Deep Mode` 文案：前端固定文案。

---

### 7.3 Shared Page Layout

各页面的顶部区、中部区和底部区具体放什么，只在各自页面小节里定义。
这里不再描述共享模板，也不做页面骨架选择说明。

### 顶部区

- 返回按钮
- 四阶段主进度
- 用户照片缩略图入口
- 顶部左侧可显示当前题目序号，例如 `4 / 14`

### 顶部布局

- 顶部是固定横向栏，左侧是返回按钮，中间是四阶段主进度，右侧是缩略图入口
- 题目序号放在顶栏下方或顶栏左侧的次级位置，不要和主进度条混成一个区域
- 缩略图入口固定在右上角，作为当前场景的视觉锚点

### 中部区

- 当前阶段标识或任务提示
- 当前练习卡片或对话流
- 练习卡片应是独立白卡，不与顶部条混成一体
- 小照片缩略图通常停在右上角，作为当前场景的视觉锚点

### 中部布局

- 中部是页面的主要可变区域，默认采用单列垂直堆叠
- 每一步只展示一个主练习卡或一段对话流，不并排放多个练习模块
- 练习卡和对话流之间保留明确间距，避免看起来像同一块文本
- 当内容较长时，只允许中部区域滚动，顶部和底部保持稳定

### 底部区

- 清空 / 重置
- Hint
- 验证
- Continue 或下一步按钮
- 底部操作区固定，不跟随中部卡片滚动消失

### 底部布局

- 底部是固定操作栏，按钮横向排布
- Reset 和 Hint 放在左侧，验证或继续放在右侧
- 底部栏始终可见，和中部内容区物理分层
- 不把底部按钮塞进内容卡内部

### 非视觉要求

- 顶部、内容区、底部区必须物理分层
- 不能把所有控件塞在一个大卡片里
- 不要在最外层再额外渲染一个独立的外层包裹框
- 共享布局只负责说明页面内部的分层关系，不负责生成课程内容

### 7.3 复用模板地图

#### 单练习页模板

适用页面：

- Notice - Understand
- Notice - Focus
- Notice - Build
- Interpret - Understand
- Interpret - Focus
- Interpret - Build
- Need - Understand
- Need - Focus
- Need - Build
- Handle - Understand
- Handle - Focus
- Handle - Build

模板骨架：

- 顶部固定返回、主进度、缩略图入口
- 中部单个主练习卡
- 主练习卡下方是对应输入区或词块区
- 底部固定 Reset / Hint / Check

复用：

- 分层
- 交互框架

不复用：

- 字段值
- 题目内容

#### 快问页模板

适用页面：

- Notice - Quick Response
- Interpret - Quick Response

模板骨架：

- 顶部固定返回、主进度、缩略图入口
- 中部问题卡
- 问题卡下方是用户答案区
- 再下方是候选词块池
- 底部固定 Reset / Hint / Check

复用：

- 问题卡与回答区分层

不复用：

- 具体问题内容
- 答案词块

#### 对话页模板

适用页面：

- Dialogue Practice - Need
- Dialogue Practice - Handle
- Notice 轮次
- Interpret 轮次
- Interact - Need 轮次
- Interact - Handle 轮次
- Step In 轮次

模板骨架：

- 顶部固定返回、主进度、缩略图入口
- 中部场景说明卡
- 其下是对话消息轨道
- 再下方是当前轮次输入区
- 底部固定 Reset / Hint / Send 或 Check

复用：

- 对话时间线和输入区位置

不复用：

- 每轮消息内容
- 具体气泡文本

#### 里程碑页模板

适用页面：

- Notice Milestone
- Interpret Milestone
- Interact Milestone
- Completion

模板骨架：

- 居中的完成卡
- 完成提示区
- 摘要区
- 底部 CTA 区

复用：

- 完成态分层

不复用：

- 摘要字段值
- 按钮文案

---

### 7.4 Notice / Interpret

Notice 和 Interpret 共享同一套页面组件族与布局规则，并作为两组独立页面逐个列出。
Interpret 的 Understand / Focus / Build / Quick Response / 里程碑页与 Notice 复用同样的页面骨架与组件族。
这两组页面都直接铺在页面容器上，不再额外包一层独立外框。

### 页面清单

#### Notice 页面

1. Notice - Understand
2. Notice - Focus
3. Notice - Build
4. Notice - Quick Response
5. Notice Milestone

#### Interpret 页面

1. Interpret - Understand
2. Interpret - Focus
3. Interpret - Build
4. Interpret - Quick Response
5. Interpret Milestone

### 共同页面骨架

- 当前基础例句卡
- Understand 区
- Focus 区
- Build 区
- 变式例句切换
- Quick Response
- 模块里程碑页

### 页面布局基线

- 页面顶部先放返回按钮、主进度和缩略图入口，再在中部切出单个练习卡
- 每个状态都保持“上方主卡 + 下方输入区 + 底部操作栏”的纵向节奏
- 不同状态之间只换卡片内容和输入区，不换整页结构
- 如果当前状态需要强调步骤感，步骤提示放在主卡顶部，不单独做成页面标题行
- 上述布局基线只用于 Understand、Focus、Build 和 Quick Response
- 模块里程碑页不使用题目卡和输入区结构，正文直接从完成卡开始

### 字段来源

- 页面顶部返回按钮：前端通用导航行为，不来自后端课程 JSON。
- 顶部主进度条四段：由后端模块顺序 `notice -> interpret -> interact -> stepIn` 和前端当前阶段状态共同决定。
- 顶部缩略图入口：来自 `useDeepModeFlow.photoPreviewUrl`，与 Overview 页复用同一个预览来源。
- 模块标题 `modules.notice.title` / `modules.interpret.title`：来自后端 `modules.notice.title` 或 `modules.interpret.title`。
- 模块目标 `modules.notice.goal` / `modules.interpret.goal`：来自后端 `modules.notice.goal` 或 `modules.interpret.goal`。
- 当前基础例句卡：来自当前 `expressionPacks[i].baseExample`。
- 变式例句切换：来自当前 `expressionPacks[i].variations`。
- Quick Response：来自当前 `expressionPacks[i].quickResponses`。
- 题目顺序：由 `expressionPacks` 数组顺序决定，数组长度由后端 config 中的 `notice.coreExpressionCount` 或 `interpret.coreExpressionCount` 约束。
- 模块内题号 `4 / 14` 这种显示：由当前模块内的练习索引和该模块所有练习数量计算，不是后端直接提供的单字段。

### 基础例句卡布局

- 基础例句卡放在中部靠上位置，承担当前题目的主视觉
- 卡内上方先放任务提示或核心表达提示
- 中间放英文句子或问题句
- 下方放中文词块区或第二层提示
- 卡片外侧再接词块区或空位区，不把所有内容塞进同一块卡

### 基础例句卡字段

- 核心表达提示：来自 `expressionPack.coreExpression` 和 `expressionPack.meaningChinese`。
- 英文句子：来自 `expressionPack.baseExample.english`。
- 中文例句基准：来自 `baseExample.chinese`。
- 基础例句卡的 `Understand / Focus / Build` 三个训练区：来自 `expressionPack.baseExample.understand`、`expressionPack.baseExample.focus`、`expressionPack.baseExample.build`。
- 训练区顺序：固定为 `Understand -> Focus -> Build`。

### Understand 区

- 英文例句展示
- 中文词块排序区
- 1 个干扰块的容纳位
- 验证按钮
- 英文句子里当前核心表达需要被视觉强调
- 中文词块区是一个独立的可重排区域，不应和句子说明混在一起

### Understand 字段

- 英文例句展示：来自 `baseExample.english`。
- 中文词块排序区：来自 `baseExample.understand.chunks`。
- 干扰块：来自 `baseExample.understand.distractors`，数量由后端 config `exercise.understandDistractorCount` 约束。
- 正确答案顺序：来自 `baseExample.understand.answer`。
- 高亮核心表达：来自 `expressionPack.coreExpression`，使用强调色高亮。

### Understand 布局

- 题目卡放在中上部，英文句子在上，中文词块区在下
- 中文词块排序区单独放在题目卡下方，使用独立的词块池
- 词块池和题目卡之间保留明显间距，避免误认为同一文本块
- 底部操作栏只负责 Reset、Hint、Check，不承担题目内容

### Understand 固定文案

- `[固定]` 题目说明：`Reorder to understand the sentence.`
- `[固定]` 底部按钮：`Reset` / `Hint` / `Check`

### Focus 区

- 英文例句 + 空位
- 候选词块
- 已填空位
- 验证按钮
- 空位数量与后端 config 对齐，当前默认按 2 个空位实现
- 候选词块区和答案区需要明确分层

### Focus 字段

- 带空位的句子：来自 `baseExample.focus.sentenceWithBlanks`。
- 候选词块：来自 `baseExample.focus.choices`。
- 正确答案：来自 `baseExample.focus.answer`。
- 干扰词块：来自 `baseExample.focus.distractors`，数量由后端 config `exercise.focusDistractorCount` 约束。
- 空位数量：由 `baseExample.focus.sentenceWithBlanks` 中的空位数决定，并且必须匹配后端 config `exercise.focusBlankCount`。

### Focus 布局

- 题目卡里先放完整英文句子，再把目标表达留成空位
- 空位区域和候选词块区域分开呈现，空位区靠上，候选词块池靠下
- 候选词块最好用两行或多行网格排布，方便用户一眼区分可选项
- 底部操作栏固定在页面底部，不跟着词块池一起滚动

### Focus 固定文案

- `[固定]` 题目说明：`Fill in the blanks with the core expression.`
- `[固定]` 底部按钮：`Reset` / `Hint` / `Check`

### Build 区

- 固定任务说明
- 目标句中文
- 用户答案区
- 英文词块池
- 已选词块可撤回
- 验证按钮
- 英文词块池和答案区要分离，方便用户知道哪里还能选、哪里已经选
- 词块本身允许是胶囊样式，但这只是视觉层，结构上仍属于同一个练习卡

### Build 字段

- 固定任务说明：来自前端固定 copy。
- 目标句中文：来自 `baseExample.build.promptChinese`，作为页面上展示的句子中文，下面据此重排英文词块。
- 中文例句基准：来自 `baseExample.chinese`。
- 用户答案区的候选词块：来自 `baseExample.build.chunks`。
- 干扰词块：来自 `baseExample.build.distractors`，数量由后端 config `exercise.buildDistractorCount` 约束。
- 正确答案顺序：来自 `baseExample.build.answer`。
- 该页本质是“根据给定中文句子重排英文表达”的任务，固定任务说明和目标句中文必须分开呈现。

### Build 布局

- 固定任务说明放在题目卡上方或卡内顶部，先告诉用户当前要做什么
- 目标句中文放在固定任务说明下方、答案区上方，作为本题要重排的句子
- 用户答案区放在中部，作为已选词块的落点
- 英文词块池放在答案区下方，未选择的词块始终可见
- 已选词块和待选词块之间要有明确的视觉分区
- 底部操作栏仍然固定，只提供 Reset、Hint、Check

### Build 固定文案

- `[固定]` 题目说明：`Build the sentence.`
- `[后端动态]` 目标句中文：来自 `baseExample.build.promptChinese`
- `[固定]` 底部按钮：`Reset` / `Hint` / `Check`

### Quick Response

- 问题卡
- 答案词块池
- 用户答案区
- 验证按钮
- 问题卡先出题，答案区后放词块池
- 题目下方应保留清晰的回答构建区，避免和词块池混在一起

### Quick Response 字段

- 问题句：来自 `expressionPack.quickResponses[i].question`。
- 答案词块池：来自 `expressionPack.quickResponses[i].chunks`。
- 干扰词块：来自 `expressionPack.quickResponses[i].distractors`，数量由后端 config `exercise.dialogueDistractorCount` 约束。
- 正确答案顺序：来自 `expressionPack.quickResponses[i].answer`。
- 问题句顺序：按 `quickResponses` 数组顺序展示，数组长度由后端 config `notice.quickResponsePerExpression` 或 `interpret.quickResponsePerExpression` 约束。

### Quick Response 布局

- 问题卡放在中部靠上，先给出提问，再给出中文辅助
- 用户答案区放在问题卡下方，作为单独的回答构建区
- 答案词块池再放在更下方，和答案区分层
- 回答区和词块池之间必须有明显空隙，不能像一块连续文本
- 底部操作栏只放验证相关操作，不把答案提交埋进卡内

### Quick Response 固定文案

- `[后端动态]` Notice 问题：来自 `expressionPack.quickResponses[i].question`
- `[固定]` Notice 中文：`这个句子表达的主要原因是什么？`
- `[后端动态]` Interpret 问题：来自 `expressionPack.quickResponses[i].question`
- `[固定]` Interpret 中文：`目前可能正在发生什么？`
- `[固定]` 回答占位：`Build your answer`
- `[固定]` 回答占位中文：`在此形成句组`
- `[固定]` 底部按钮：`Reset` / `Hint` / `Check`

### 里程碑页

- 完成文案块
- 核心表达列表块
- Continue 按钮
- 可带一个结果徽章或庆祝标识，但不应替代文本总结

### 里程碑布局

- 里程碑页正文从一张居中的完成卡开始，不再使用题目卡、输入区或词块池结构
- 完成卡内部按从上到下排列庆祝图标、完成文案块和核心表达列表块
- `完成文案块` = 完成图标下方的三行文案，依次是英文主标题、英文完成说明、固定中文完成说明
- `核心表达列表块` = 一个独立信息卡，标题下方逐条列出本模块学到的表达，每条表达可带表达释义
- Continue 按钮放在完成卡下方，和完成卡分层
- 不把里程碑页做成新的练习页

### 里程碑字段

- 完成图标和散点：固定视觉元素。
- 英文主标题 `Great job!`：来自当前 Notice Milestone 参考图的固定文案。
- 英文完成说明 `You've completed the Notice stage.`：来自当前 Notice Milestone 参考图的固定文案。
- 固定中文完成说明 `你已完成 Notice 阶段！`：来自当前 Notice Milestone 参考图的固定文案。
- 核心表达列表标题 `Core expressions you noticed`：来自当前 Notice Milestone 参考图的固定文案。
- 核心表达列表项：来自 `modules.notice.expressionPacks[*].coreExpression` 和 `meaningChinese`，按 `expressionPacks` 顺序展示。
- Continue 按钮文案 `Continue to Interpret →`：来自当前参考图，作为固定跳转文案。

---

### 7.5 Interact

Interact 使用任务包和对话流，不再只是静态例句练习。
Interact 同样直接使用页面容器，不额外增加一层可见外框。

### 页面状态

1. 任务包引导页
2. Need - Understand
3. Need - Focus
4. Need - Build
5. Handle - Understand
6. Handle - Focus
7. Handle - Build
8. Dialogue Practice - Need
9. Dialogue Practice - Handle
10. 里程碑页

### 页面状态来源

- 任务包引导页：使用当前 `taskPacks[i]` 的 `taskTitle`、`scenePrompt`、`need.coreExpression`、`need.meaningChinese`、`handle.coreExpression`、`handle.meaningChinese`。
- Need - Understand：使用当前 `taskPacks[i].need.baseExample` 或 `taskPacks[i].need.variations[k]` 的 `english`、`chinese`、`understand.chunks`、`understand.distractors`、`understand.answer`。
- Need - Focus：使用当前 `taskPacks[i].need.baseExample` 或 `taskPacks[i].need.variations[k]` 的 `focus.sentenceWithBlanks`、`focus.choices`、`focus.distractors`、`focus.answer`。
- Need - Build：使用当前 `taskPacks[i].need.baseExample` 或 `taskPacks[i].need.variations[k]` 的 `build.promptChinese`、`build.chunks`、`build.distractors`、`build.answer`。
- Handle - Understand：使用当前 `taskPacks[i].handle.baseExample` 或 `taskPacks[i].handle.variations[k]` 的 `english`、`chinese`、`understand.chunks`、`understand.distractors`、`understand.answer`。
- Handle - Focus：使用当前 `taskPacks[i].handle.baseExample` 或 `taskPacks[i].handle.variations[k]` 的 `focus.sentenceWithBlanks`、`focus.choices`、`focus.distractors`、`focus.answer`。
- Handle - Build：使用当前 `taskPacks[i].handle.baseExample` 或 `taskPacks[i].handle.variations[k]` 的 `build.promptChinese`、`build.chunks`、`build.distractors`、`build.answer`。
- Dialogue Practice - Need：使用当前 `taskPacks[i].dialogues[j].scene`、`need` 和前端固定开场提示 copy。
- Dialogue Practice - Handle：使用当前 `taskPacks[i].dialogues[j].scene`、`need.answer` 形成的上一轮用户气泡、`systemReply`、`handle`。
- 里程碑页完成任务摘要：由当前 `taskPacks[i].taskTitle`、`need.coreExpression`、`handle.coreExpression` 和已完成的对话状态组合出来，不是后端单独返回的 summary 字段。

### 页面布局基线

- Interact 顶部先放返回按钮、主进度和缩略图入口，中部内容从任务包引导页切到具体练习页
- `Need - Understand`、`Need - Focus`、`Need - Build`、`Handle - Understand`、`Handle - Focus`、`Handle - Build` 六个页面都使用和 Notice / Interpret 相同的单练习纵向布局
- 这六个页面都只展示当前一条例句或当前一个空位练习，不把 Need / Handle 混成一个总卡
- `Dialogue Practice - Need` 和 `Dialogue Practice - Handle` 使用同一套对话流布局，主视觉是对话气泡，词块输入区保持独立
- 任务包引导页、例句训练页、Dialogue Practice 两页都在同一任务包语义内，不切到别的课程结构

### 任务包引导页区块

- 场景说明
- 当前任务说明卡
- Need Expression 预览卡
- Handle Expression 预览卡
- Start Practice 按钮
- 任务包引导页只负责让用户理解这组互动任务，不直接进入词块重排

### 任务包引导页布局

- 引导页顶部先保留返回按钮、主进度和缩略图入口，主内容区里放任务包总览
- 总览卡放在中部，先讲任务场景，再讲 Need 和 Handle 两个表达预览
- Need 和 Handle 预览卡纵向堆叠，不要并排挤在一起
- Start Practice 按钮放在引导卡底部，作为唯一主操作

### 任务包引导页页面展示值

- `[固定]` 顶部模块标签：`Interact`
- `[后端动态]` 卡片标题：来自后端 `taskPacks[i].taskTitle`
- `[后端动态]` 场景句：来自后端 `taskPacks[i].scenePrompt`
- `[固定]` 表达标题：`Need Expression`
- `[固定]` 表达标题：`Handle Expression`
- `[固定]` 按钮：`Start Practice →`

### 任务包引导页字段

- `[后端动态]` 当前任务说明卡标题：来自 `taskPacks[i].taskTitle`。
- `[后端动态]` 场景说明：来自 `taskPacks[i].scenePrompt`，显示为任务场景说明。
- `[后端动态]` 中文辅助说明：来自后端返回的场景中文描述文本，显示在英文场景说明下方。
- Need Expression 预览卡主表达：来自 `taskPacks[i].need.coreExpression`。
- Need Expression 释义：来自 `taskPacks[i].need.meaningChinese`。
- Handle Expression 预览卡主表达：来自 `taskPacks[i].handle.coreExpression`。
- Handle Expression 释义：来自 `taskPacks[i].handle.meaningChinese`。
- Start Practice 按钮文案：`Start Practice →`。

### Need - Understand 页面

- 页面顶部放返回按钮、主进度和缩略图入口。
- 中部主卡先展示当前 Need 例句的英文句子，再展示中文词块排序区。
- 主卡下方放中文词块排序区和干扰块。
- 底部固定 Reset、Hint、Check。

### Need - Understand 页面展示值

- `[前端状态动态]` 页内进度：`Step 1 of 3`，由当前模块题目索引动态计算
- `[后端动态]` 题目标签：来自后端 `taskPacks[i].need.coreExpression`
- `[固定]` 题目说明：`Reorder the chunks.`
- `[固定]` 底部按钮：`Reset` / `Hint` / `Check`

### Need - Understand 字段

- 当前 Need 例句英文句子：来自当前 `taskPacks[i].need.baseExample` 或 `taskPacks[i].need.variations[k]` 的 `english`。
- 当前 Need 例句中文基准：来自当前 `taskPacks[i].need.baseExample` 或 `taskPacks[i].need.variations[k]` 的 `chinese`。
- 中文词块排序区：来自当前例句的 `understand.chunks`。
- 干扰块：来自当前例句的 `understand.distractors`，数量由后端 config `exercise.understandDistractorCount` 约束。
- 正确答案顺序：来自当前例句的 `understand.answer`。
- 底部 Reset / Hint / Check：来自前端固定交互 copy，不来自后端 `lesson`。

### Need - Focus 页面

- 页面顶部放返回按钮、主进度和缩略图入口。
- 中部主卡先展示当前 Need 例句的带空位句子。
- 主卡下方放候选词块区和已填空位区，二者明确分层。
- 底部固定 Reset、Hint、Check。

### Need - Focus 页面展示值

- `[前端状态动态]` 页内进度：`Step 2 of 3`，由当前模块题目索引动态计算
- `[后端动态]` 题目标签：来自后端 `taskPacks[i].need.coreExpression`
- `[固定]` 题目说明：`Fill in the blanks with the core expression.`
- `[固定]` 底部按钮：`Reset` / `Hint` / `Check`

### Need - Focus 字段

- 带空位句子：来自当前 `taskPacks[i].need.baseExample` 或 `taskPacks[i].need.variations[k]` 的 `focus.sentenceWithBlanks`。
- 中文基准句：来自当前 `taskPacks[i].need.baseExample` 或 `taskPacks[i].need.variations[k]` 的 `chinese`。
- 候选词块：来自当前例句的 `focus.choices`。
- 干扰词块：来自当前例句的 `focus.distractors`，数量由后端 config `exercise.focusDistractorCount` 约束。
- 正确答案：来自当前例句的 `focus.answer`。
- 空位数量：由 `focus.sentenceWithBlanks` 中的空位数决定，并且必须匹配后端 config `exercise.focusBlankCount`。
- 底部 Reset / Hint / Check：来自前端固定交互 copy，不来自后端 `lesson`。

### Need - Build 页面

- 页面顶部放返回按钮、主进度和缩略图入口。
- 中部主卡先展示固定任务说明。
- 固定任务说明下方放当前 Need 例句的中文句子。
- 中文句子下方放当前例句的词块池。
- 词块池下方放用户答案区。
- 底部固定 Reset、Hint、Check。

### Need - Build 页面展示值

- `[前端状态动态]` 页内进度：`Step 3 of 3`，由当前模块题目索引动态计算
- `[后端动态]` 题目标签：来自后端 `taskPacks[i].need.coreExpression`
- `[固定]` 题目说明：`Build the sentence.`
- `[后端动态]` 目标句中文：来自当前 `taskPacks[i].need.baseExample` 或 `taskPacks[i].need.variations[k]` 的 `build.promptChinese`
- `[固定]` 底部按钮：`Reset` / `Hint` / `Check`

### Need - Build 字段

- 固定任务说明：来自前端固定 copy。
- 目标句中文：来自当前 `taskPacks[i].need.baseExample` 或 `taskPacks[i].need.variations[k]` 的 `build.promptChinese`，作为页面上展示的句子中文，下面据此重排英文词块。
- 词块池：来自当前例句的 `build.chunks`。
- 干扰词块：来自当前例句的 `build.distractors`，数量由后端 config `exercise.buildDistractorCount` 约束。
- 用户答案区：来自当前例句的 `build.answer`。
- 底部 Reset / Hint / Check：来自前端固定交互 copy，不来自后端 `lesson`。

### Handle - Understand 页面

- 页面顶部放返回按钮、主进度和缩略图入口。
- 中部主卡先展示当前 Handle 例句的英文句子，再展示中文词块排序区。
- 主卡下方放中文词块排序区和干扰块。
- 底部固定 Reset、Hint、Check。

### Handle - Understand 页面展示值

- `[前端状态动态]` 页内进度：`Step 1 of 3`，由当前模块题目索引动态计算
- `[后端动态]` 题目标签：来自后端 `taskPacks[i].handle.coreExpression`
- `[固定]` 题目说明：`Reorder the chunks.`
- `[固定]` 底部按钮：`Reset` / `Hint` / `Check`

### Handle - Understand 字段

- 当前 Handle 例句英文句子：来自当前 `taskPacks[i].handle.baseExample` 或 `taskPacks[i].handle.variations[k]` 的 `english`。
- 当前 Handle 例句中文基准：来自当前 `taskPacks[i].handle.baseExample` 或 `taskPacks[i].handle.variations[k]` 的 `chinese`。
- 中文词块排序区：来自当前例句的 `understand.chunks`。
- 干扰块：来自当前例句的 `understand.distractors`，数量由后端 config `exercise.understandDistractorCount` 约束。
- 正确答案顺序：来自当前例句的 `understand.answer`。
- 底部 Reset / Hint / Check：来自前端固定交互 copy，不来自后端 `lesson`。

### Handle - Focus 页面

- 页面顶部放返回按钮、主进度和缩略图入口。
- 中部主卡先展示当前 Handle 例句的带空位句子。
- 主卡下方放候选词块区和已填空位区，二者明确分层。
- 底部固定 Reset、Hint、Check。

### Handle - Focus 页面展示值

- `[前端状态动态]` 页内进度：`Step 2 of 3`，由当前模块题目索引动态计算
- `[后端动态]` 题目标签：来自后端 `taskPacks[i].handle.coreExpression`
- `[固定]` 题目说明：`Fill in the blanks with the core expression.`
- `[固定]` 底部按钮：`Reset` / `Hint` / `Check`

### Handle - Focus 字段

- 带空位句子：来自当前 `taskPacks[i].handle.baseExample` 或 `taskPacks[i].handle.variations[k]` 的 `focus.sentenceWithBlanks`。
- 中文基准句：来自当前 `taskPacks[i].handle.baseExample` 或 `taskPacks[i].handle.variations[k]` 的 `chinese`。
- 候选词块：来自当前例句的 `focus.choices`。
- 干扰词块：来自当前例句的 `focus.distractors`，数量由后端 config `exercise.focusDistractorCount` 约束。
- 正确答案：来自当前例句的 `focus.answer`。
- 空位数量：由 `focus.sentenceWithBlanks` 中的空位数决定，并且必须匹配后端 config `exercise.focusBlankCount`。
- 底部 Reset / Hint / Check：来自前端固定交互 copy，不来自后端 `lesson`。

### Handle - Build 页面

- 页面顶部放返回按钮、主进度和缩略图入口。
- 中部主卡先展示固定任务说明。
- 固定任务说明下方放当前 Handle 例句的中文句子。
- 中文句子下方放当前例句的词块池。
- 词块池下方放用户答案区。
- 底部固定 Reset、Hint、Check。

### Handle - Build 页面展示值

- `[前端状态动态]` 页内进度：`Step 3 of 3`，由当前模块题目索引动态计算
- `[后端动态]` 题目标签：来自后端 `taskPacks[i].handle.coreExpression`
- `[固定]` 题目说明：`Build the sentence.`
- `[后端动态]` 目标句中文：来自当前 `taskPacks[i].handle.baseExample` 或 `taskPacks[i].handle.variations[k]` 的 `build.promptChinese`
- `[固定]` 底部按钮：`Reset` / `Hint` / `Check`

### Handle - Build 字段

- 固定任务说明：来自前端固定 copy。
- 目标句中文：来自当前 `taskPacks[i].handle.baseExample` 或 `taskPacks[i].handle.variations[k]` 的 `build.promptChinese`，作为页面上展示的句子中文，下面据此重排英文词块。
- 词块池：来自当前例句的 `build.chunks`。
- 干扰词块：来自当前例句的 `build.distractors`，数量由后端 config `exercise.buildDistractorCount` 约束。
- 用户答案区：来自当前例句的 `build.answer`。
- 底部 Reset / Hint / Check：来自前端固定交互 copy，不来自后端 `lesson`。

### Dialogue Practice - Need 页面

- 页面顶部放返回按钮、主进度和缩略图入口。
- 中部先放场景说明卡，交代这轮任务发生的语境。
- 场景卡下方放一条对方开场气泡或身份提示，再往下放当前 Need 的用户回答提示。
- 用户回答提示下方放 Need 的答案区和候选词块池。
- 底部固定 Reset、Hint、Check。

### Dialogue Practice - Need 页面展示值

- `[固定]` 场景卡标题：`Scene`
- `[后端动态]` 场景说明：来自后端 `taskPacks[i].dialogues[j].scene`，显示为对话场景说明。
- `[后端动态]` 中文辅助说明：来自后端返回的对话场景中文描述文本，显示在英文场景说明下方。
- `[后端动态]` 对方开场气泡：来自后端返回的该轮对话开场文本，显示在场景卡下方、Need 输入区上方。
- `[固定]` 系统标签：`System`
- `[固定]` 用户提示：`Your turn: Build your Need`
- `[固定]` 底部按钮：`Reset` / `Hint` / `Check`

### Dialogue Practice - Need 字段

- 场景说明卡：来自 `taskPacks[i].dialogues[j].scene`，显示为场景语境说明。
- `[后端动态]` 中文辅助说明：来自后端返回的对话场景中文描述文本。
- `[后端动态]` 对方开场气泡：来自后端返回的该轮对话开场文本。
- Need 页面当前提示文案：前端固定交互文案。
- Need turn 用户输入区：来自 `taskPacks[i].dialogues[j].need.chunks`、`distractors`、`answer`。
- 底部 Reset / Hint / Check：来自前端固定交互 copy，不来自后端 `lesson`。

### Dialogue Practice - Handle 页面

- 页面顶部放返回按钮、主进度和缩略图入口。
- 中部先放同一轮次的场景说明卡。
- 场景卡下方先回放上一轮 Need 的正确用户气泡，再放系统回复气泡。
- 系统回复气泡下方放当前 Handle 的用户回答提示。
- 用户回答提示下方放 Handle 的答案区和候选词块池。
- 底部固定 Reset、Hint、Check。

### Dialogue Practice - Handle 页面展示值

- `[固定]` 场景卡标题：`Scene`
- `[后端动态]` 场景说明：来自后端 `taskPacks[i].dialogues[j].scene`，显示为对话场景说明。
- `[后端动态]` 中文辅助说明：来自后端返回的对话场景中文描述文本，显示在英文场景说明下方。
- `[后端动态]` 系统回复：来自后端 `taskPacks[i].dialogues[j].systemReply`
- `[固定]` 系统标签：`System`
- `[固定]` 用户标签：`You`
- `[固定]` 用户提示：`Your turn: Build your Handle`
- `[固定]` 底部按钮：`Reset` / `Hint` / `Send`

### Dialogue Practice - Handle 字段

- 场景说明卡：来自 `taskPacks[i].dialogues[j].scene`，显示为场景语境说明。
- `[后端动态]` 中文辅助说明：来自后端返回的对话场景中文描述文本。
- 上一轮 Need 的正确用户气泡：来自 `taskPacks[i].dialogues[j].need.answer`，由当前任务的 Need 完成状态拼成前一条消息气泡。
- 系统回复气泡：来自 `taskPacks[i].dialogues[j].systemReply`。
- Handle 页面当前提示文案：前端固定交互文案。
- Handle turn 用户输入区：来自 `taskPacks[i].dialogues[j].handle.chunks`、`distractors`、`answer`。
- 底部 Reset / Hint / Check：来自前端固定交互 copy，不来自后端 `lesson`。

### Dialogue Practice 进入规则

1. 先显示任务包引导页。
2. 用户点击 Start Practice 后，先进入当前 Task Pack 的 Need - Understand 页面。
3. Need 例句按 `Understand -> Focus -> Build` 三页完成后，切到下一条例句的 Need - Understand 页面。
4. 当前 Task Pack 的 Need 例句全部完成后，进入当前 Task Pack 的 Handle - Understand 页面。
5. Handle 例句按 `Understand -> Focus -> Build` 三页完成后，切到下一条例句的 Handle - Understand 页面。
6. 当前 Task Pack 的 Need 和 Handle 例句全部完成后，进入 Dialogue Practice - Need 页面。
7. 在 Dialogue Practice - Need 页面完成 Need turn 后，切到 Dialogue Practice - Handle 页面。
8. 在 Dialogue Practice - Handle 页面完成 Handle turn 后，进入下一任务包或里程碑页。

### 里程碑页布局

- 里程碑页正文从一张居中的完成卡开始，不再使用对话流或词块池结构。
- 完成卡内部按从上到下排列完成图标、模块名、完成任务说明、Need 表达列表、Handle 表达列表和能力总结。
- Continue 按钮放在完成卡下方，文案固定为 `Continue to Step In →`。

### Interact 里程碑页面展示值

- `[固定]` 主标题：`Excellent!`
- `[固定]` 说明：`You've completed the Interact stage.`
- `[固定]` 中文说明：`你已完成 Interact 阶段！`
- `[固定]` 分组标题：`Completed task packs`
- `[固定]` 分组标题：`Need expressions`
- `[固定]` 分组标题：`Handle expressions`
- `[固定]` 分组标题：`Capability summary`
- `[后端动态]` Need 表达：来自后端 `taskPacks[i].need.coreExpression`
- `[后端动态]` Handle 表达：来自后端 `taskPacks[i].handle.coreExpression`
- `[固定]` 能力总结句：`Speak and respond naturally.`
- `[固定]` 按钮：`Continue to Step In →`

### 里程碑页字段

- 完成图标和庆祝点状装饰：固定视觉元素。
- 模块名 `Interact`：来自后端 `modules.interact.title`。
- 完成任务说明：来自当前 `taskPacks[i].taskTitle` 和 `taskPacks[i].scenePrompt`。
- Need 表达列表：来自 `taskPacks[i].need.coreExpression` 和 `taskPacks[i].need.meaningChinese`。
- Handle 表达列表：来自 `taskPacks[i].handle.coreExpression` 和 `taskPacks[i].handle.meaningChinese`。
- 能力总结：固定完成态 copy，不来自后端 `lesson`。
- Continue 按钮文案 `Continue to Step In →`：固定为 `Continue to Step In →`。

---

### 7.6 Step In

Step In 是综合挑战，页面形式为对话流，内容从前面模块抽取。
Step In 直接铺在页面容器上，不增加独立外框。

### 页面状态

1. 挑战引导卡
2. Notice 轮次
3. Interpret 轮次
4. Interact - Need 轮次
5. Interact - Handle 轮次
6. 完成反馈

### 页面状态来源

- 挑战引导卡：来自 `modules.stepIn.title`、`modules.stepIn.goal` 和 `modules.stepIn.dialogue.scene`。
- Notice 轮次：来自 `modules.stepIn.dialogue.turns` 中 `sourceModule = notice` 的 user turn，配套使用前一条 system turn 的提问。
- Interpret 轮次：来自 `modules.stepIn.dialogue.turns` 中 `sourceModule = interpret` 的 user turn，配套使用前一条 system turn 的追问。
- Interact - Need 轮次：来自 `modules.stepIn.dialogue.turns` 中 `sourceModule = interact_need` 的 user turn，配套使用前一条 system turn 的任务提示。
- Interact - Handle 轮次：来自 `modules.stepIn.dialogue.turns` 中 `sourceModule = interact_handle` 的 user turn，配套使用前一条 system turn 的回复。
- 完成反馈：由前端完成态与 `turns` 走完后的状态组成。

### 挑战引导卡页面

- 页面顶部放返回按钮、主进度和缩略图入口。
- 中部先放一张简短的挑战引导卡，交代这是最终场景和最终目标。
- 引导卡下方先不显示词块池，只保留进入下一轮对话的铺垫。
- 引导卡本身不新增额外开始按钮，后续对话轨道直接从引导卡下方展开。

### 挑战引导卡页面展示值

- `[固定]` 标题：`Challenge`
- `[后端动态]` 目标说明：来自后端 `modules.stepIn.goal`
- `[固定]` 追加入门语：`Use what you've learned!`
- `[固定]` 中文说明：`请使用你学到的内容！`

### 挑战引导卡字段

- 顶部返回按钮：前端通用导航行为，不来自后端课程 JSON。
- 顶部主进度四段：由 `DEEP_PHASES` 和前端当前阶段状态决定。
- 顶部缩略图入口：来自 `useDeepModeFlow.photoPreviewUrl`。
- 挑战引导卡标题：来自 `modules.stepIn.title`。
- 挑战引导卡目标说明：来自 `modules.stepIn.goal`。
- 挑战引导卡场景说明：来自 `modules.stepIn.dialogue.scene`。

### Notice 轮次页面

- 页面顶部仍保留返回按钮、主进度和缩略图入口。
- 中部是完整对话时间线，先放场景说明和之前的消息气泡。
- 当前 Notice 轮次的用户输入区放在对话轨道下方。
- 当前轮次的词块池放在用户输入区下方。
- 底部固定 Reset、Hint、Send 或 Check。

### Notice 轮次页面展示值

- 按钮：`Reset` / `Hint` / `Check`，固定文案
- 轮次提示：来自后端 `modules.stepIn.dialogue.turns` 和当前 turn 状态

### Notice 轮次字段

- 历史消息列表：来自 `modules.stepIn.dialogue.turns` 中已经完成的前置 turn。
- 当前轮次系统提问：来自当前 Notice turn 前一条 system turn 的 `text`。
- 当前轮次用户输入区：来自当前 Notice turn 的 `chunks`、`distractors`、`answer`。
- 当前轮次的对话来源标记：来自当前 turn 的 `sourceModule = notice`。
- 底部 Reset / Hint / Send 或 Check：来自前端固定交互 copy，不来自后端 `lesson`。

### Interpret 轮次页面

- 页面顶部仍保留返回按钮、主进度和缩略图入口。
- 中部延续同一条对话时间线，显示前置 Notice 内容和当前轮次系统追问。
- 当前 Interpret 轮次的用户输入区放在对话轨道下方。
- 当前轮次的词块池放在用户输入区下方。
- 底部固定 Reset、Hint、Send 或 Check。

### Interpret 轮次页面展示值

- 按钮：`Reset` / `Hint` / `Check`，固定文案
- 轮次提示：来自后端 `modules.stepIn.dialogue.turns` 和当前 turn 状态

### Interpret 轮次字段

- 历史消息列表：来自 `modules.stepIn.dialogue.turns` 中已经完成的前置 turn。
- 当前轮次系统追问：来自当前 Interpret turn 前一条 system turn 的 `text`。
- 当前轮次用户输入区：来自当前 Interpret turn 的 `chunks`、`distractors`、`answer`。
- 当前轮次的对话来源标记：来自当前 turn 的 `sourceModule = interpret`。
- 底部 Reset / Hint / Send 或 Check：来自前端固定交互 copy，不来自后端 `lesson`。

### Interact - Need 轮次页面

- 页面顶部仍保留返回按钮、主进度和缩略图入口。
- 中部延续同一条对话时间线，显示前置 Notice 和 Interpret 内容，以及当前任务提示。
- 当前 Interact - Need 轮次的用户输入区放在对话轨道下方。
- 当前轮次的词块池放在用户输入区下方。
- 底部固定 Reset、Hint、Send 或 Check。

### Interact - Need 轮次页面展示值

- 按钮：`Reset` / `Hint` / `Send`，固定文案
- 轮次提示：来自后端 `modules.stepIn.dialogue.turns` 和当前 turn 状态

### Interact - Need 轮次字段

- 历史消息列表：来自 `modules.stepIn.dialogue.turns` 中已经完成的前置 turn。
- 当前轮次任务提示：来自当前 `interact_need` turn 前一条 system turn 的 `text`。
- 当前轮次用户输入区：来自当前 `interact_need` turn 的 `chunks`、`distractors`、`answer`。
- 当前轮次的对话来源标记：来自当前 turn 的 `sourceModule = interact_need`。
- 底部 Reset / Hint / Send 或 Check：来自前端固定交互 copy，不来自后端 `lesson`。

### Interact - Handle 轮次页面

- 页面顶部仍保留返回按钮、主进度和缩略图入口。
- 中部延续同一条对话时间线，显示前置所有消息以及当前系统回复。
- 当前 Interact - Handle 轮次的用户输入区放在对话轨道下方。
- 当前轮次的词块池放在用户输入区下方。
- 底部固定 Reset、Hint、Send 或 Check。

### Interact - Handle 轮次页面展示值

- 按钮：`Reset` / `Hint` / `Send`，固定文案
- 轮次提示：来自后端 `modules.stepIn.dialogue.turns` 和当前 turn 状态

### Interact - Handle 轮次字段

- 历史消息列表：来自 `modules.stepIn.dialogue.turns` 中已经完成的前置 turn。
- 当前轮次系统回复：来自当前 `interact_handle` turn 前一条 system turn 的 `text`。
- 当前轮次用户输入区：来自当前 `interact_handle` turn 的 `chunks`、`distractors`、`answer`。
- 当前轮次的对话来源标记：来自当前 turn 的 `sourceModule = interact_handle`。
- 底部 Reset / Hint / Send 或 Check：来自前端固定交互 copy，不来自后端 `lesson`。

### 完成反馈页面

- 完成所有轮次后，页面切到完成反馈状态，然后进入 7.7 的 Completion 独立页面。
- 这个状态只负责短暂收束，不再出现新的输入区。
- 这一层可以复用 Completion 页的结果数据，但不再单独定义新的页面结构。

### 完成反馈固定文案

- `Great job!`
- `You've completed the Deep Mode course.`
- `你已完成 Deep Mode 课程！`
- `Practice again`
- `Back to camera`

### 完成反馈字段

- 完成反馈：来自前端完成态与 `turns` 走完后的状态，不是后端单独字段。
- 完整回放：来自 `modules.stepIn.dialogue.turns`。
- 返回拍照页或课程完成页的后续 CTA：来自前端固定完成态 copy，不来自后端 `lesson`。

### 交互要求

- 只能复用前面学过的表达。
- 每步仍然通过词块重排完成。
- 不允许自由输入。
- 不允许引入新核心表达。

---

### 7.7 Completion

Completion 是课程最终结果页，承接 Step In 完成后的收束状态。

### 页面区块

- 顶部完成视觉锚点
- 完成提示区
- 四阶段表达摘要区
- 完整对话回放区
- 底部双 CTA 区
- 这页只负责收束和回放，不再进入新的练习状态

### Completion 页面展示值

- `[固定]` 主标题：`Great job!`
- `[固定]` 说明：`You've completed the Deep Mode course.`
- `[固定]` 中文说明：`你已完成 Deep Mode 课程！`
- `[固定]` 左侧按钮：`Practice again`
- `[固定]` 右侧按钮：`Back to camera`

### 顶部完成视觉锚点

- 顶部可以保留用户照片或完成徽章，作为完成状态的视觉锚点。
- 顶部区域不再出现课程进度条或输入区。

### 完成提示区

- 完成提示区放在顶部视觉锚点下方，作为课程结束说明。
- 完成提示区可以包含主标题、简短说明和可选的轻量庆祝文案。

### 四阶段表达摘要区

- 四阶段表达摘要区按从上到下排列 Notice、Interpret、Interact、Step In 四个回收块。
- 每个回收块可以是卡片或列表，但必须能看出是独立的阶段摘要。
- Notice 和 Interpret 只回收核心表达列表。
- Interact 回收 Need 和 Handle 的核心表达。
- Step In 回收完整对话，不再拆成新的表达项。

### 完整对话回放区

- 完整对话回放区放在四阶段摘要区下方。
- 该区域按时间顺序回放 Step In 的整段对话。
- 该区域不再提供新的输入控件。

### 底部双 CTA 区

- 底部固定两个并列按钮。
- 一个按钮负责再次练习。
- 一个按钮负责返回拍照页。
- 两个按钮都应在首版保留。

### 页面字段

- 顶部照片或完成徽章：来自 `useDeepModeFlow.photoPreviewUrl` 或前端固定 completion 图标。
- 完成提示主标题：固定为 `Great job!`。
- 完成提示说明：固定为 `You've completed the Deep Mode course.`。
- 中文完成说明：固定为 `你已完成 Deep Mode 课程！`。
- Notice 阶段摘要块：来自 `modules.notice.expressionPacks[*].coreExpression` 和 `meaningChinese`，按 `expressionPacks` 顺序回收。
- Interpret 阶段摘要块：来自 `modules.interpret.expressionPacks[*].coreExpression` 和 `meaningChinese`，按 `expressionPacks` 顺序回收。
- Interact 阶段摘要块：来自 `modules.interact.taskPacks[*].need.coreExpression` / `meaningChinese` 与 `handle.coreExpression` / `meaningChinese`，按 `taskPacks` 顺序回收。
- Step In 阶段摘要块：来自 `modules.stepIn.dialogue.turns` 的完整回放，不再拆分成新的表达项。
- 完整对话回放：来自 `modules.stepIn.dialogue.turns`。
- 再次练习按钮：固定为 `Practice again`。
- 返回拍照页按钮：固定为 `Back to camera`。

---

## 8. 组件与职责

以下是 Codex 实现时建议遵守的组件职责，不要求一次性全部拆完，但职责边界要稳定。

### 8.1 入口与路由

- `AppShell`
  - 只负责模式分发
  - 不写课程业务

- `DeepModeApp`
  - 只负责 Deep Mode 的入口编排
  - 不承担具体练习判定

- `useDeepModeFlow`
  - 只负责 Deep 模式状态、阶段推进、照片预览 URL 生命周期
  - 不负责渲染

### 8.2 页面层

- `DeepOverviewScreen`
  - 只负责纵览页

- `DeepCourseShell`
  - 只负责选择并承载页面模板，不自己发明独立课程壳层
  - 负责把当前 phase 映射到对应模板，并把顶部区、中部区、底部区传给子页面

- `NoticeModule`
- `InterpretModule`
- `InteractModule`
- `StepInModule`
  - 各自负责模块内任务渲染和本模块状态推进

- `DeepCompletionScreen`
  - 只负责完成页

## 9. 数据与对接层

### 9.1 后端输入

前端接收的 Deep Mode 课程数据以后端 `lesson` 为准，来自 `mode=deep` 的课程 JSON。

### 核心输入

- `mode`
- `level`
- `overview`
- `modules.notice`
- `modules.interpret`
- `modules.interact`
- `modules.stepIn`

### 前端要求

- 不能在 UI 里猜字段
- 缺字段要走 error 或重新请求，不要静默降级
- 前端需要有一层 view model 映射，不直接把原始 JSON 塞进页面组件

### 9.2 前端 view model

建议前端把后端 JSON 映射成以下结构：

```ts
type DeepCourseViewModel = {
  level: "Normal" | "Advanced";
  phase: DeepPhase;
  overview: {
    photoPreviewUrl: string;
    keywords: string[];
    sceneDescriptionChinese: string;
    startPromptChinese: string;
  };
  modules: {
    notice: ModuleViewModel;
    interpret: ModuleViewModel;
    interact: InteractModuleViewModel;
    stepIn: StepInViewModel;
  };
};
```

- 数据层只关心字段
- 页面层只关心当前页面内容
- 交互层只关心当前状态
- 不要让页面组件直接依赖后端 payload 细节

---

## 10. 交互细则

### 10.1 选择方式

Deep Mode 第一版只用点击或选择，不做拖拽必需交互。

### 10.2 验证行为

- 验证按钮在输入未完成时禁用
- 正确时给轻量反馈并推进下一步
- 错误时先局部提示，不直接暴露完整答案

### 10.3 Hint 行为

- Hint 只提示局部信息
- Hint 不能一次性展示完整答案
- Hint 可以减少干扰项、突出核心表达或固定首块

### 10.4 进度行为

- 顶部主进度固定四段
- 模块内进度单独显示
- 里程碑页不计入题目进度

### 10.5 返回行为

- course shell 内返回先确认
- overview 返回直接回相机页
- completion 返回按照产品定义回到上一层或相机页

---

## 11. 非视觉验收标准

第一阶段只要满足以下条件，就可以认为 Deep Mode 前端 backbone 可用：

1. 能从相机页进入 Deep Mode
2. 能经历 `loading -> overview -> notice -> interpret -> interact -> stepIn -> completion`
3. 能正确展示四阶段主进度
4. 能正确展示模块内题目进度
5. 能正确承接后端 Deep Course JSON
6. 练习交互只用点击 / 选择 / 重排
7. 课程内不会混入 Quick Mode 业务
8. 视觉样式可以先简陋，但区块关系必须稳定
9. 发生错误时有明确 error state，而不是空白页

---

## 12. 已确认项

以下前端骨架决策已经确认：

1. **照片缩略图放大**
   - 第一版不做原图 modal
   - 课程页只保留缩略图入口和占位承接位，放大能力后置

2. **完成页 CTA**
   - Completion 页保留 `再次练习` 和 `返回拍照页` 两个按钮
   - 两个按钮都属于首版结构

3. **TTS 入口**
   - Deep Mode 前端第一版纳入英文 TTS 播放按钮结构
   - 具体播放实现可后续接入，但结构位要先预留

4. **首版 loading 文案**
   - 直接沿用 loading 文案

---

## 13. 实施建议

建议实现顺序如下：

1. 先把 `useDeepModeFlow` 和 `DeepModeApp` 的状态流对齐到页面骨架
2. 再把 `DeepOverviewScreen`、`DeepCourseShell`、`NoticeModule`、`InterpretModule`、`InteractModule`、`StepInModule` 和 `DeepCompletionScreen` 的职责切稳
3. 再补 `DeepCourseViewModel` 和各页面的字段映射层
4. 再补页面骨架组件
5. 最后再做视觉还原

这会让前端先“可用”，再“好看”，而不是反过来。
