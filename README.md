# MixAndCall

SNH48 Group **call 本**与 **mix** 查询站。移动端现场查找优先。

## 结构

| 路径 | 作用 |
|------|------|
| `content/` | 数据真源（songs / mixes / stages / releases / images） |
| `web/` | Astro 静态站 → Cloudflare Pages |
| `workers/` | Hono：搜索 API + 匿名投稿开 Issue |
| `scripts/` | 校验、搜索索引构建 |
| `redirect/` | GitHub / GitLab 旧链接跳转页 |
| `.cursor/skills/` | 维护者投稿流程 |

## 本地开发

```bash
npm install
npm test
npm run validate
npm run build:index
npm run dev
```

## 贡献（无账号）

- **网页表单**：`/submit/` → GitHub Issue（需 Pages 部署并配置 `GITHUB_TOKEN` secret）
- **外链收集**：设置 `PUBLIC_EXTERNAL_FORM_URL`
- **改仓库**：按 `.cursor/skills/` 修改 `content/` 后开 PR

推荐文本 call 本；图片可提交但不推荐。

## 部署（Cloudflare）

详见 **[docs/DEPLOY.md](docs/DEPLOY.md)**。

```bash
npm run cf:login          # 浏览器登录
npm run cf:setup          # 创建 KV、写入 wrangler.toml、上传索引
npm run cf:deploy         # 部署 Pages（含同域 /api Functions）
npx wrangler pages secret put GITHUB_TOKEN --project-name=mixandcall
```

CI（推 `master`）需要 GitHub Secrets：`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`。  
投稿用的 `GITHUB_TOKEN` 用上面的 **Pages secret** 配一次即可（不必放进 GitHub Secrets）。

旧链：`github.io/MixAndCall`、`gitlab.io/mixandcall` → 跳转生产站（当前可为 `mixandcall.pages.dev`；自定义域后再改回 `dzyxdd.io`）。

## 文档

设计/计划默认在本地（见 `.gitignore` 的 `docs/superpowers/`、`archives/`），不入库。

| 主题 | 工作副本 | 本地归档 |
|------|----------|----------|
| 架构重构（2026-07-17） | `docs/superpowers/specs/2026-07-17-mixandcall-rearchitecture-design.md` | — |
| UX 导航与曲库动线（2026-07-19） | `docs/superpowers/specs/2026-07-19-ux-navigation-design.md` | `archives/2026-07-19-ux-navigation/` |

部署清单：`docs/DEPLOY.md`。生产站：https://mixandcall.pages.dev/
