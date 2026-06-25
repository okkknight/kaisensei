# **Kaisensei Step In 连续场景对话优化方案**

请基于当前项目实际代码，优化 Deep Mode 的 Step In 生成质量。

本次工作的核心目标是：

让 Step In 成为两个真实角色围绕同一个事件持续推进的自然对话，而不是依次使用 Notice、Interpret、Need、Handle 核心表达的复习列表。

请先阅读当前分阶段生成实现、Step In Prompt、数据结构、校验逻辑和相关测试，再开始修改。

重点检查但不限于：

- 当前 Step In 独立生成的真实入口
- `api/src/deep/services/course-prompt.js` 或实际已拆分出的阶段 Prompt
- Step In 阶段的上下文组装逻辑
- `api/src/deep/services/course-normalizer.js`
- Step In 相关契约、测试和前端读取代码
- 当前 staged generation 设计文档

不要默认旧版整课生成 Prompt 仍是当前唯一入口，以实际运行链路为准。

------

## **一、当前生成架构**

Deep Mode 已经采用分阶段生成：

```text
Notice
↓
Interpret
↓
Interact
↓
Step In
```

每个模块单独调用模型生成。

后一个模块会获得前面已经生成的内容作为背景。Step In 生成时已经可以获得：

- 原始图片或图片理解结果
- 课程等级及必要配置
- 已生成的 Notice 内容
- 已生成的 Interpret 内容
- 已生成的 Interact Task Packs

本次优化必须保持这一架构，不改回整门课程一次性生成，也不增加第二次 Step In 审核调用。

Step In 在自己的一次模型调用中完成：

```text
读取前面模块内容
→ 临时分析表达之间的关系
→ 选择兼容表达
→ 规划一个事件
→ 生成连续对话
→ 输出前自行检查
```

临时语义分析只是模型在 Step In 阶段的内部生成过程，不需要成为持久数据。

------

## **二、本次修改边界**

本次只优化 Step In。

不要修改：

- Notice 的输出结构
- Interpret 的输出结构
- Interact 的输出结构
- 前面模块的核心表达结构
- 现有 Step In 页面交互
- 词块重排机制
- 模块顺序
- 用户可见的课程流程
- Normal / Advanced 的现有等级机制

不要给前面模块增加：

- `semantic`
- `eventTags`
- `communicativeFunction`
- `referent`
- `actionDirection`
- 任何仅为 Step In 服务的新字段

不要新增独立的：

- 语义分类接口
- 规则匹配引擎
- 第二次 LLM 审核
- 多 Agent 流程
- 新的用户输入步骤

本次优先通过 Step In Prompt、上下文组织和必要测试提升生成质量。

只有在当前实现确实需要时，才修改 Step In 相关的校验或兼容代码。

------

## **三、当前问题**

Step In 当前会抽取：

- 1 个 Notice 核心表达
- 1 个 Interpret 核心表达
- 1 个 Need 核心表达
- 1 个 Handle 核心表达

并组成以下对话：

```text
system
user · Notice
system
user · Interpret
system
user · Need
system
user · Handle
```

结构本身可以保留，但当前生成逻辑容易出现以下问题：

1. 每句话单独成立，但彼此之间没有真正的因果关系。
2. Notice 描述一个物体，Interpret 判断另一件事，Need 又突然提出新的需求。
3. 系统角色只是机械接话，没有推动事件。
4. 对话为了覆盖四个表达，不断切换照片中的观察对象。
5. Handle 只与整个场景大致相关，没有回应上一条系统消息。
6. 隐藏 `sourceModule` 后，对话不像真人交流，更像连续四道练习题。
7. Prompt 只要求“自然连续”，但没有规定自然连续是如何产生的。

问题根源不是模型不会写自然句子，而是模型在写句子之前，没有先建立一个共同目标和完整事件。

------

## **四、核心解决思路**

Step In 不再按照以下方式生成：

```text
选一个 Notice
+ 选一个 Interpret
+ 选一个 Need
+ 选一个 Handle
→ 尝试把四句话拼起来
```

改为：

```text
选择一个适合展开真实互动的 Interact Task Pack
↓
围绕这个互动目标寻找兼容的 Notice 和 Interpret
↓
建立一个单一事件
↓
把四类表达安排在事件的不同阶段
↓
最后生成具体台词
```

对话必须形成以下因果链：

```text
可见事实
→ 对事实的合理判断
→ 因此产生的请求或行动
→ 对对方最新回应的自然处理
```

四类表达在事件中的职责分别是：

| **表达来源**    | **事件功能**                               |
| --------------- | ------------------------------------------ |
| Notice          | 提供与当前事件有关的可见事实               |
| Interpret       | 判断这个事实可能意味着什么                 |
| Interact Need   | 基于判断提出请求、建议、选择或行动         |
| Interact Handle | 针对对方最新回复进行接受、调整、澄清或解决 |

重点不是四句话都出现在同一个地点，而是四句话共同推动同一件事。

------

## **五、Step In 输入组织**

保留现有阶段生成接口和数据来源，但在 Step In Prompt 中清晰区分输入内容。

建议将上下文组织为以下逻辑分区：

```text
PHOTO / SCENE CONTEXT

NOTICE CANDIDATES

INTERPRET CANDIDATES

INTERACT TASK PACKS

STEP IN OUTPUT REQUIREMENTS
```

不一定需要改变实际 JSON 接口，但最终传给模型的 Prompt 不要把前面模块内容无结构地混在一起。

模型必须能够明确识别：

- 哪些是 Notice 候选表达
- 哪些是 Interpret 候选表达
- 哪些 Need 和 Handle 属于同一个 Interact Task Pack
- 每个 Task Pack 原本要完成什么互动目标
- 哪些内容是例句，哪些内容是核心表达

保留前面模块的完整必要信息，但避免传入与 Step In 无关的大量 UI 固定文案和练习细节。

Step In 选词主要依赖：

- `coreExpression`
- `meaningChinese`
- `baseExample.english`
- Task Pack 的场景或互动目标
- Need 与 Handle 的原有关系
- 图片和场景背景

------

## **六、表达选择策略**

### **6.1 先选择 Interact Task Pack**

Interact 是整个事件的行动目标，因此应优先成为 Step In 的锚点。

从现有 Task Packs 中选择一个最适合扩展成完整场景的 Task Pack。

选择时考虑：

- Need 是否对应清晰的现实目的
- Handle 是否可以自然接住对方回复
- 该互动是否可以由照片中的可见事实触发
- 是否可以在前面自然加入一次观察和一次判断
- 是否适合在短对话中完成

不要机械选择第一个 Task Pack。

### **6.2 Need 和 Handle 来自同一个 Task Pack**

所选 Need 和 Handle必须来自同一个 Interact Task Pack。

不要跨 Task Pack 组合 Need 和 Handle，因为不同 Task Pack 通常代表不同任务、角色关系或互动目标。

Interact Task Pack 已经建立了：

```text
Need
→ systemReply
→ Handle
```

Step In 应在这个互动之前补充自然的 Notice 和 Interpret，而不是拆散原有互动关系。

### **6.3 再选择 Notice**

从 Notice 候选中选择一个能够成为当前互动起因的表达。

合适的 Notice 应满足：

- 指向照片中真实可见的内容
- 与所选互动目标直接相关
- 能够为 Interpret 提供证据
- 不是仅仅因为它容易塞进句子而被选择

例如，互动目标是寻找其他停车位置，那么合适的 Notice 可以是：

```text
blocked off
a traffic cone
no space left
```

不合适的 Notice 可能是：

```text
dark trees
a quiet evening
long shadows
```

这些表达虽然来自同一照片，但不能自然推动停车请求。

### **6.4 再选择 Interpret**

从 Interpret 候选中选择一个能够解释 Notice，并引出 Need 的表达。

合适的关系是：

```text
Notice：这个位置被挡住了
↓
Interpret：这里可能暂时不能使用
↓
Need：我们可以停到别处吗？
```

不合适的关系是：

```text
Notice：树影很长
↓
Interpret：停车场可能关闭了
↓
Need：我们能停在这里吗？
```

Interpret 不能只是与照片整体相关，必须能从 Notice 中合理推导出来。

### **6.5 Handle 的使用**

Handle 的核心表达必须保留，但最终完整句子应根据 Step In 中实际生成的系统回复重新组织。

不要求照搬 Interact 中原有完整 Handle 例句。

必须保证：

- 核心表达逐字保留
- 句子直接回应当前系统回复
- 不改变原表达的基本含义
- 不只是泛泛总结场景

### **6.6 选择失败时的处理**

如果当前 Task Pack 找不到兼容的 Notice 和 Interpret：

1. 先尝试同一个 Task Pack 中其他可用例句或变体。
2. 再尝试另一个 Interact Task Pack。
3. 重新选择 Notice 和 Interpret 组合。
4. 不得通过加入无关物体、突然切换话题或虚构新问题强行连接。

选择优先级是：

```text
自然事件关系
> 模块或 Pack 的原始顺序
```

------

## **七、事件规划**

选定表达后，模型不能立即写台词。

在内部先确定以下事件信息：

```text
sharedGoal
trigger
interpretation
actionNeed
systemCondition
resolution
```

含义如下：

### **`sharedGoal`**

两个角色当前共同面对或正在完成的事情。

例如：

- 找到一个可以停车的位置
- 决定是否继续户外活动
- 解决无法使用设备的问题
- 帮助一位看起来不舒服的同事
- 向店员确认某件商品

### **`trigger`**

让这段对话开始的具体变化、问题、机会或人物状态。

例如：

- 预计使用的停车位被交通锥挡住
- 天空开始变暗
- 电脑屏幕没有反应
- 同事显得很疲惫
- 商品架上没有目标商品

### **`interpretation`**

用户根据可见事实做出的谨慎判断。

### **`actionNeed`**

判断之后自然产生的请求、建议、选择或行动。

### **`systemCondition`**

系统角色对 Need 的有效回应。

它可以是：

- 新信息
- 现实条件
- 一个选择
- 轻微限制
- 澄清问题
- 可执行建议

### **`resolution`**

用户如何接住系统回应，使当前事件得到局部解决或明确下一步。

这些信息只用于本次生成时的内部规划。

不要把它们新增到最终输出，不新增 `eventPlan` 字段。

------

## **八、事件模板**

模型根据所选表达和场景，选择以下一种事件模板。

模板规定事件关系，不规定固定句式。

### **8.1** **`abnormality_resolution`**

适用于发现异常并处理问题。

```text
出现异常
→ 用户指出可见事实
→ 用户判断原因或影响
→ 用户提出处理方式
→ 对方给出条件、信息或限制
→ 用户调整并解决
```

适合：

- 停车位被挡住
- 入口无法使用
- 道路受阻
- 设备失灵
- 店铺或区域关闭
- 物品缺失
- 环境出现异常

### **8.2** **`joint_decision`**

适用于两个人共同作出决定。

```text
注意到当前情况
→ 判断状态或趋势
→ 提出一个选择
→ 对方表达条件或顾虑
→ 用户确认或调整决定
```

适合：

- 是否出门
- 是否继续活动
- 选择路线
- 选择座位
- 调整行程
- 选择餐厅或地点
- 根据天气改变安排

### **8.3** **`request_assistance`**

适用于用户需要信息或帮助。

```text
注意到困难或缺失
→ 判断需要协助
→ 提出具体请求
→ 对方提供信息、提出条件或询问细节
→ 用户补充、接受或调整请求
```

适合：

- 问路
- 商店咨询
- 酒店入住
- 借用物品
- 寻找商品
- 请求同事帮助
- 解决服务问题

### **8.4** **`social_response`**

适用于注意到他人的状态并进行回应。

```text
注意到对方的可见状态
→ 谨慎判断其感受或处境
→ 询问或提供帮助
→ 对方说明情况或表达需要
→ 用户自然接住并回应
```

适合：

- 同事显得疲惫
- 朋友看起来担心
- 顾客正在等待
- 某人似乎需要帮助
- 日常关心和轻社交

### **8.5 通用兜底**

只有以上四种模板都明显不适合时，才能自行设计其他事件关系。

兜底事件仍必须满足：

```text
可见事实
→ 合理判断
→ 实际行动
→ 对方反馈
→ 用户处理
```

不要为了套模板而牺牲自然度，也不要因为使用兜底而放弃因果结构。

------

## **九、固定对话结构**

保持当前 Step In 的八轮对话结构：

```text
1. system
2. user · notice
3. system
4. user · interpret
5. system
6. user · interact_need
7. system
8. user · interact_handle
```

必须严格交替，四个用户 turn 的 `sourceModule` 顺序固定为：

```text
notice
interpret
interact_need
interact_handle
```

### **9.1 第一个 system turn：触发 Notice**

职责：

- 建立当前时刻
- 暗示共同目标或当前变化
- 让用户指出某个可见事实成为自然回应

它不能：

- 直接替用户说出 Notice
- 泛泛介绍整张照片
- 像老师一样要求用户描述图片
- 提前跳到 Need
- 与后续事件无关

错误示例：

```text
What can you see in this picture?
```

错误示例：

```text
This parking lot has trees, cars, lights, and several empty spaces.
```

更合理的方向：

```text
I thought we could stop here, but something looks different.
```

### **9.2 Notice：指出事件证据**

职责：

- 说出照片中真实可见的事实
- 该事实必须与当前问题直接相关
- 使用所选 Notice 核心表达

Notice 不是单独的看图描述题，而是事件的证据。

### **9.3 第二个 system turn：从事实过渡到判断**

职责：

- 明确回应 Notice
- 表现出疑问、不确定性或补充反应
- 让用户随后作出 Interpret 成为自然行为

它不能无视上一句，也不能突然提到另一个物体。

### **9.4 Interpret：解释事实可能意味着什么**

职责：

- 使用谨慎推测
- 判断必须受到 Notice 支持
- 判断结果必须为接下来的 Need 提供理由
- 使用所选 Interpret 核心表达

Interpret 不能把未经支持的结论说成事实。

### **9.5 第三个 system turn：从判断推进到行动**

职责：

- 回应用户的判断
- 将问题推进到“现在怎么办”
- 让 Need 成为自然的下一步

它不能直接完成用户本应提出的请求。

### **9.6 Need：提出具体行动**

职责：

- 使用所选 Need 核心表达
- 提出请求、建议、选择、确认或行动意图
- 与当前事件和 sharedGoal 直接相关

Need 不能重新开启一个新话题。

### **9.7 第四个 system turn：提供可回应的信息**

职责：

- 真实回应 Need
- 提供 Handle 可以直接处理的信息
- 保持同一角色、地点和目标

可以提供：

- 一个可行方案
- 一个现实限制
- 一个需要确认的条件
- 一个替代选项
- 一个简短澄清
- 一个轻微阻力

避免只有：

```text
Sure.
Okay.
No problem.
I see.
```

这类回复没有为 Handle 提供足够的回应对象。

### **9.8 Handle：回应最新系统消息并收束**

职责：

- 使用所选 Handle 核心表达
- 直接回应紧邻的 system turn
- 完成接受、调整、确认、澄清、拒绝或解决
- 明确当前事件的下一步

Handle 不能只与整个场景泛泛相关。

判断标准不是：

这句话放在这个场景里是否说得通？

而是：

这句话是否明显是在回应对方刚刚说的内容？

------

## **十、系统回复的桥接规则**

每一条中间 system turn 都必须同时完成两件事：

```text
承接上一条用户消息
+
为下一条用户消息创造理由
```

可以将 system turn 理解为一座桥：

```text
上一条用户行为
→ system 真实反应
→ 下一条用户行为
```

如果 system turn 只完成其中一项，对话仍会显得断裂。

例如：

```text
User Notice:
That space is blocked off.

System:
Yes, I can see the cone. There isn’t any sign explaining it.

User Interpret:
Maybe this part of the lot is closed.
```

这里 system 既回应了“被挡住”，又提供了不确定性，使推测自然出现。

生成时禁止将 system turn 写成：

- 场景旁白
- 教师提示
- 下一题说明
- 与上一句无关的新话题
- 为了引出核心表达而设计的生硬问题

系统始终是同一个场景人物。

------

## **十一、语言与内容约束**

### **11.1 单一事件原则**

整段对话必须保持：

- 同一个地点
- 同一组角色
- 同一个即时目标
- 同一个主要问题或决定
- 同一条时间线
- 同一个系统角色身份

不能因为照片里存在多个物体，就依次描述每个物体。

照片提供的是场景资源，不是必须全部覆盖的内容清单。

### **11.2 核心表达使用**

四个用户 turn 必须逐字包含所选 `coreExpression`。

允许：

- 改写完整句子
- 调整主语和宾语
- 增加必要的口语成分
- 根据新的上下文重新组织表达

不要求照搬前面模块的完整例句。

不允许：

- 用同义词替换核心表达
- 改变核心表达内部词形
- 只保留核心表达的一部分
- 为了逐字使用而写出不自然句子
- 引入新的学习型核心表达替代旧表达

系统台词可以使用普通连接语言，但不要刻意引入新的重点词汇。

### **11.3 自然口语**

台词应当：

- 简短
- 易于说出口
- 符合人物关系
- 符合场景当下反应
- 避免书面解释
- 避免文学化环境描写
- 避免过度完整和过度礼貌的教材腔

建议长度：

- 用户句子：5–14 个英文词
- system 回复：4–18 个英文词
- system 必要时可以使用两个短句
- 不写长段背景说明

### **11.4 Scene 文案**

`scene` 和 `sceneChinese` 应简短说明：

- 两个角色是谁
- 此刻在哪里
- 当前要处理什么

不要提前剧透完整对话，不要列出四个核心表达，也不要写成长篇任务说明。

### **11.5 系统角色**

系统角色必须：

- 从第一句到最后一句保持同一身份
- 知道自己在场景中的目标和立场
- 根据用户消息自然回应
- 不知道自己正在参与语言练习

禁止出现：

```text
What do you think is happening?
Now use the expression...
How would you ask for help?
Try responding naturally.
```

除非这些句子本身就是现实角色在当前场景中会说的话。

------

## **十二、输出结构**

保持当前 Step In 输出结构，不新增字段：

```json
{
  "title": "Step In",
  "goal": "Complete one full scene conversation.",
  "dialogue": {
    "scene": "string",
    "sceneChinese": "string",
    "turns": [
      {
        "speaker": "system",
        "text": "string"
      },
      {
        "speaker": "user",
        "text": "string",
        "sourceModule": "notice",
        "chunks": [],
        "distractors": [],
        "answer": []
      }
    ]
  }
}
```

不要新增：

- `semantic`
- `eventPlan`
- `template`
- `sharedGoal`
- `trigger`
- `beats`
- `selectedExpressions`
- 其他调试字段

事件模板和事件规划只存在于模型生成过程内部。

现有字段含义保持不变：

- `text` 是完整自然台词
- `answer` 能重建完整台词
- `chunks` 用于用户重排
- `distractors` 保持现有数量要求
- `sourceModule` 只标记来源
- system turn 不需要词块练习字段

不要改变前端消费方式。

------

## **十三、Prompt 组织方式**

请重新整理当前 Step In Prompt，不要简单在旧 Prompt 末尾继续堆规则。

建议 Step In Prompt 按以下顺序组织：

```text
1. Step In 的任务定义
2. 可用的前置模块内容
3. 表达选择顺序
4. 事件模板
5. 八轮对话职责
6. 语言和结构约束
7. 输出结构
8. 输出前自检
```

删除旧 Prompt 中与新方案冲突或重复的规则。

尤其注意修正类似以下旧规则：

```text
The first system turn may set the moment or give a light cue that makes the learner's Need feel natural.
```

第一条用户消息是 Notice，因此第一个 system turn 首先应该让 Notice 自然出现，而不是直接为 Need 铺垫。

不要在 Prompt 的多个章节重复写同一规则。

各部分职责应明确：

- 表达选择部分只规定选哪些表达
- 事件模板部分只规定事件如何发展
- 对话结构部分只规定每一轮做什么
- 约束部分只规定不能出现什么
- 自检部分只负责检查结果

最终 Prompt 应只有一份权威规则。

------

## **十四、输出前连贯性自检**

模型在返回 JSON 前，必须在内部检查以下内容。

### **14.1 单句摘要测试**

整段对话必须可以概括成一句话：

```text
两个人注意到 X，判断 Y，因此决定或尝试 Z。
```

如果无法概括为一个事件，说明对话包含多个话题，需要重写。

### **14.2 证据关系测试**

检查：

```text
Notice
→ 是否真的支持 Interpret
```

Interpret 不能只是与照片相关，而必须由 Notice 提供依据。

### **14.3 行动关系测试**

检查：

```text
Interpret
→ 是否真的解释了为什么用户会提出 Need
```

如果删除 Interpret，Need 仍然毫无差别地成立，连接可能过弱。

### **14.4 回应关系测试**

检查：

```text
Need
→ system response
→ Handle
```

Handle 必须回应 system response 中的具体信息、条件、选择或限制。

### **14.5 桥接测试**

每个 system turn 都应：

- 回应上一句
- 铺垫下一句

任何一个 system turn 只满足一项，都需要重写。

### **14.6 删除测试**

从第二轮开始，逐一判断：

如果删除上一句，当前句是否仍然完全一样自然？

如果答案是“是”，说明两句之间依赖关系不足，应增强承接或因果关系。

该测试不是要求每句话都显式使用 “because”“so”，而是要求语义上存在依赖。

### **14.7 隐藏标签测试**

隐藏所有 `sourceModule` 标签后，整段内容仍应像两个真人的连续交流。

不能让人明显感受到：

```text
现在练 Notice
→ 现在练 Interpret
→ 现在练 Need
→ 现在练 Handle
```

### **14.8 场景一致性测试**

确认对话中没有发生：

- 地点变化
- 角色变化
- 主要目标变化
- 无关物体切换
- 突然产生的新问题
- 系统角色变成老师

------

## **十五、实现要求**

### **15.1 找到真实运行入口**

确认当前 staged generation 中，Step In 实际使用哪个 Prompt builder 和 provider。

只修改真实生效的实现。

如果旧版整课 Prompt 已不再参与 Step In 生产，不要只修改旧文件后宣称完成。

### **15.2 保持分阶段生成**

不要改变以下流程：

```text
前一个阶段生成完成
→ 结果写入阶段状态
→ 下一阶段读取已有结果
→ Step In 最后单独生成
```

本次不优化首次响应策略，也不调整阶段并发和加载行为。

### **15.3 清晰传入前置内容**

确认 Step In 的调用中确实包含：

- Notice 完整候选
- Interpret 完整候选
- Interact Task Packs
- 图片场景背景
- 课程等级

如已包含，只优化 Prompt 中的组织方式。

如存在缺失，只补齐 Step In 必需的上下文，不重构其他阶段。

### **15.4 不实现代码层语义匹配**

不要在 JavaScript 中硬编码：

- 词义分类表
- 场景标签系统
- 表达兼容矩阵
- 大量关键词匹配规则

表达语义和兼容关系由 Step In 模型在本次调用中分析。

代码层只负责：

- 提供结构清晰的候选内容
- 要求模型按协议选择
- 验证可确定的数据结构

### **15.5 校验边界**

确定性校验可以包括：

- Step In 存在
- turn 数量正确
- system / user 顺序正确
- 四个 `sourceModule` 顺序正确
- 用户台词包含所选核心表达
- `chunks` 和 `answer` 能重建 `text`
- 必需字段存在

不要试图用简单代码规则判断：

- 对话是否真正自然
- Interpret 是否一定由 Notice 推导
- Handle 是否语义回应 system
- 事件是否足够合理

这些属于生成 Prompt 和样例验收范围，不要用脆弱的关键词逻辑伪装成语义校验。

### **15.6 兼容旧数据**

现有 Step In 输出结构保持不变，因此旧课程应继续正常读取。

若修改 Prompt 测试或阶段上下文组装，不得影响：

- Notice 页面
- Interpret 页面
- Interact 页面
- 已保存的旧课程
- Quick Mode
- Deep Mode 当前页面路由和练习状态