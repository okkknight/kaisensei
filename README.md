# kaisensei

kaisensei 把你身边的一张真实照片，变成一节一分钟的场景英语课。

它的学习路径很明确：**See → Learn → Build → Use**。先看懂照片对应的一句自然英文，再学会里面能复用的词块；接着把句子自己拼回来，最后回答一个真实场景里的问题。目标是让你把“看见了，但不会说”变成一句真正能用的英语。

**[拍一张，开始学 →](https://boringmax.com/kaisensei/)**

## 两种学习方式

- **Quick Mode：**一张照片、一句表达、四个动作。适合很快完成一次微练习。
- **Deep Mode：**仍从同一张照片出发，但会一路走到真实场景对话：观察、理解、互动，再完成一段连续交流。

Quick Mode 已经可以完整使用；Deep Mode 还在生长，内容会分阶段出现。

## 本地运行

需要 Node.js、npm，以及可用的 Codex CLI 登录状态；也可以自行配置 Gemini API。分别安装 API 和前端依赖后，从仓库根目录启动：

```bash
npm --prefix api install
npm --prefix prototype install
npm run dev
```

前端默认在 <http://127.0.0.1:5173/>，API 默认监听 `127.0.0.1:3001`。默认 Provider 是本机 Codex CLI；要改用 Gemini，可为 API 进程设置 `LESSON_PROVIDER=gemini` 和 `GEMINI_API_KEY`。监听地址和端口示例见 [`api/.env.example`](api/.env.example)。不要提交密钥或本地环境文件。

## 代码与项目状态

`prototype/` 是 React/Vite 前端，`api/` 是 Fastify 服务。想了解课程怎么生成、Deep Mode 目前做到哪里，可以看 [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md)；部署说明在 [VPS 文档](docs/KAISENSEI_VPS_RUNBOOK.md)。

## 许可

应用代码采用 [MIT 许可证](LICENSE)。第三方依赖及素材遵循各自的许可证。
