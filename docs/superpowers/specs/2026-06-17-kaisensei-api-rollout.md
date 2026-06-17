# Kaisensei API Rollout 执行方案

**目标：** 把当前 `prototype/` 的 mock 学习流替换成真实的 `kaisensei-api` 后端生成链路，让前端通过“先返回任务 id，再轮询结果”的方式拿到一节真实生成的英语微课。

**结论：** 当前 MVP 只做 AI 转发和 lesson 生成，不做登录、历史、支付、口语评分、图片落库或长期存储。失败必须明确落到失败页，不允许回退到假数据。

---

## 1. 已确认的产品决策

- 后端单独做成 `kaisensei-api`
- 生产方向预留 OpenAI provider，但当前开发环境先直接依赖本机可用的 Codex CLI
- 拍照/上传后先创建任务，返回 `jobId`，再由前端轮询任务状态
- 图片不落库，不做持久化保存
- 不使用 mock lesson 作为运行时兜底
- 失败直接展示失败页，不生成假数据补位
- 未来能力要预留接口，但这一版只做 MVP 主链路

## 2. 当前仓库真相

- `prototype/` 已经有可运行的手机端原型，包含 Camera / See / Learn / Build / Use 的交互骨架
- 当前前端还在使用 `prototype/src/lesson-data.js` 里的 mock 数据
- 仓库里还没有 `api/` 服务
- 当前设计约束已经从“品牌区 + 并列步骤入口”调整为“纯手机页面”

## 3. 这次改造的边界

### 只做

- 图片上传或拍照后发起任务
- 后端异步生成 lesson JSON
- 前端轮询任务状态并渲染真实返回结果
- 出错时进入失败页并允许重试
- 预留未来 provider 和未来业务功能的接口边界

### 不做

- 登录
- 历史记录
- 支付
- 口语评分
- 录音
- 图片持久化
- 实时流式生成
- 任何假 lesson 回退

## 4. 推荐架构

### 前端

现有 `prototype/` 继续承担手机端 UI 和本地交互。

职责：

- 采集图片
- 触发任务创建
- 轮询任务状态
- 渲染 See / Learn / Build / Use
- 展示 loading / failure / retry

### 后端

新增 `kaisensei-api`，只负责三件事：

1. 接收图片和 level
2. 把图片交给 Codex CLI 生成 lesson JSON
3. 暴露任务状态查询接口

职责边界：

- 不保存图片
- 不保存用户档案
- 不负责前端 UI
- 不做业务假数据兜底

### Provider 层

后端内部保留 provider 抽象，但当前只实现一个 active provider：

- `codex-cli`

未来如果切到 OpenAI，只替换 provider 实现，不改前端协议。

## 5. 任务流

```text
用户拍照 / 上传图片
↓
POST 创建任务
↓
返回 jobId
↓
前端轮询任务状态
↓
pending / running / succeeded / failed
↓
成功：返回 lesson JSON，进入 See
↓
失败：进入失败页
```

### 状态定义

- `queued`：任务已创建，等待开始
- `running`：后端正在生成 lesson
- `succeeded`：lesson 已通过校验并可展示
- `failed`：生成失败、解析失败、超时或校验失败

## 6. API 协议

### 创建任务

`POST /v1/lesson-jobs`

请求：

- `multipart/form-data`
- `image`: 用户拍照或上传的文件
- `level`: `Normal` 或 `Advanced`

响应：

```json
{
  "jobId": "job_01J...",
  "status": "queued"
}
```

### 查询任务

`GET /v1/lesson-jobs/:jobId`

成功响应示例：

```json
{
  "jobId": "job_01J...",
  "status": "succeeded",
  "lesson": {
    "level": "Normal",
    "see": {
      "sentence": "A coffee mug is sitting next to a laptop on the desk.",
      "chinese": "一个咖啡杯放在桌上，旁边是一台笔记本电脑。",
      "speakText": "A coffee mug is sitting next to a laptop on the desk."
    },
    "learn": {
      "chunks": [
        { "id": "c1", "text": "A coffee mug", "chinese": "一个咖啡杯" }
      ],
      "note": "Use 'next to' when two things are close together."
    },
    "build": {
      "targetSentence": "A coffee mug is sitting next to a laptop on the desk.",
      "chunks": [],
      "correctOrder": ["c1", "c2", "c3", "c4"]
    },
    "use": {
      "situation": "When talking about your workspace, you can say:",
      "sentence": "I usually keep a coffee mug next to my laptop while I work.",
      "chinese": "我工作时通常会把咖啡杯放在笔记本电脑旁边。",
      "speakText": "I usually keep a coffee mug next to my laptop while I work."
    }
  }
}
```

失败响应示例：

```json
{
  "jobId": "job_01J...",
  "status": "failed",
  "error": {
    "code": "provider_parse_error",
    "message": "The lesson got lost on the way."
  }
}
```

## 7. Lesson 产物边界

后端返回的 lesson JSON 必须继续沿用当前产品的学习语义：

- `level`
- `see.sentence`
- `learn.chunks`
- `build.chunks`
- `build.correctOrder`
- `use.question` 或 `use.situation`
- `use.answerChunks`
- `use.correctOrder`

关键要求：

- 句子必须自然、生活化、可复用
- 词块要适合拼句
- 允许高频词，但不要低幼
- `Use` 必须是真实问答，不是例句展示
- 标题空格、轻微标点差异、顺序微调以外的细枝末节不要过度苛刻

## 8. 失败策略

失败只分两种：

1. 任务失败
2. 前端加载失败

原则：

- 后端任何解析失败、超时、空输出、格式不合法，都要进入 `failed`
- 前端不允许用 mock lesson 冒充成功
- 不允许静默重试后偷偷回填假数据
- 失败页必须能让用户重新拍照或重新上传

## 9. 运行时策略

- 图片仅在请求生命周期内存在
- 任务结果只保存在后端内存任务表中，MVP 先不做持久化
- 若后端进程重启，未完成任务可视为丢失，这是当前 MVP 接受的边界
- 任务查询先用轮询；SSE / WebSocket 只保留接口扩展位，不作为首发依赖

## 10. 交付分期

### Phase 1：后端骨架

目标：

- `api/` 可启动
- health 检查可用
- 任务存储模型和 lesson contract 固定下来

### Phase 2：任务与 provider

目标：

- 上传后能创建任务
- Codex CLI 能产出 lesson JSON
- JSON 校验失败会进入失败状态

### Phase 3：前端真实接入

目标：

- Camera 页支持真实拍照/上传
- 前端能创建任务并轮询结果
- 成功进入 See，失败进入失败页

### Phase 4：体验收口

目标：

- 不再有运行时 mock 兜底
- loading、retry、错误状态完整
- 代码路径和文档对齐

## 11. 验收标准

这版方案成立的标志是：

- 用户在手机页面拍照后能进入真实任务流
- 任务 id 可查询，状态变化可见
- 成功时看到真实 lesson
- 失败时看到失败页而不是假数据
- 当前开发环境不需要 OpenAI API key
- 后续切换到 OpenAI 时，前端协议不需要重写
