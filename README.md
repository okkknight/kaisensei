# kaisensei

kaisensei 是一个移动端优先的英语学习 Web 原型：拍摄或上传一张照片，生成一节与现实场景有关的短课。Quick Mode 采用 See → Learn → Build → Use 流程；Deep Mode 提供更长的分阶段学习体验。

在线体验：[kaisensei](https://boringmax.com/kaisensei/)。

## 本地运行

需要 Node.js 和 npm。API 环境变量示例见 [`api/.env.example`](api/.env.example)。使用 Gemini 等外部服务时，请在本地配置自己的凭据，不要提交环境文件。

```bash
npm install
npm --prefix api install
npm --prefix prototype install
npm run dev
```

根目录的开发命令同时启动 API 和前端。产品背景见 [项目上下文](PROJECT_CONTEXT.md)，部署说明见 [VPS 运维文档](docs/KAISENSEI_VPS_RUNBOOK.md)。

## 许可

本项目的应用代码采用 [MIT 许可证](LICENSE)。第三方依赖及其素材遵循各自的许可证。
