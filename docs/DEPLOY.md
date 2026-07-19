# Cloudflare 部署清单

主站 + API：Cloudflare Pages（`mixandcall`）+ **Pages Functions**（同域 `/api/*`）+ KV（`SEARCH_INDEX`）  
旧链：GitHub / GitLab Pages 仅跳转（见 `redirect/`）

> API **不再依赖**独立 `*.workers.dev` Worker 作为生产路径；`workers/` 目录仍保留共享 Hono 应用与 KV 配置，供本地 / 脚本使用。

## 1. 登录 Cloudflare

```bash
cd workers
npx wrangler login
```

浏览器授权后回到终端。

## 2. 一键准备 KV +（可选）部署

在仓库根目录：

```bash
npm run build:index
node scripts/cf-setup.mjs          # 创建/写入 KV id，上传 search:v1
node scripts/cf-setup.mjs --deploy # 同上并部署 Pages（含 Functions）
```

脚本会改 `workers/wrangler.toml` 里的 `REPLACE_AFTER_CREATE`。

也可在 `web/` 下手动部署静态产物：

```bash
npm run build -w web
cd web && npx wrangler pages deploy dist --project-name=mixandcall
```

## 3. 投稿密钥（Pages secret）

投稿走 Pages Functions，密钥挂在 **Pages 项目**上，不是 Worker secret：

```bash
npx wrangler pages secret put GITHUB_TOKEN --project-name=mixandcall
# 粘贴一个有 issues:write（或 classic 的 public_repo + issues）的 token
```

`GITHUB_REPO` 默认 `dzyxdd/MixAndCall`（见 `workers/wrangler.toml` `[vars]`，Functions 侧同步读取）。

## 4. GitHub Actions Secrets（CI 自动部署）

仓库 Settings → Secrets and variables → Actions：

| Secret | 用途 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | Pages 部署 + KV 上传（需 Account / Workers / Pages 编辑） |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账户 ID |

推送到 `master` / `main` 后，`.github/workflows/ci.yml` 会：测试 → 校验 → 构建索引 → 构建站 → 上传 KV → 部署 Pages →（可选）发 GitHub 跳转页。

投稿 token **不要**放进 GitHub Secrets 也可：在 Cloudflare 用上一节的 `pages secret put` 配一次即可（与 CI 无关）。

## 5. 自定义域名

当前生产临时域：https://mixandcall.pages.dev（`/api/*` 已同域）。

绑定 `dzyxdd.io`：

1. 确认域名 DNS 已托管在同一 Cloudflare 账户（或可 CNAME）
2. Dashboard → **Workers & Pages** → `mixandcall` → **Custom domains** → Add  
   - `dzyxdd.io` 和/或 `www.dzyxdd.io`
3. 绑定成功后，把 `redirect/*` 里的 `https://mixandcall.pages.dev` 改回 `https://dzyxdd.io` 并重新部署跳转页

CLI（域名已在本账户时可用）：

```bash
npx wrangler pages domain add dzyxdd.io --project-name=mixandcall
```

## 6. 本地联调

```bash
# 站点（含 prepare-assets）
npm run build:index
npm run dev

# 需要本地打通 /api 时，用 Pages 本地或单独跑 workers：
cd workers
# 复制 .dev.vars.example → .dev.vars 并填 GITHUB_TOKEN（仅测投稿）
npx wrangler dev
```

前端若指向独立 API：`PUBLIC_API_BASE=http://127.0.0.1:8787 npm run dev`  
生产环境前端与 API 同域，一般无需该变量。

## 7. 旧链接

- GitHub：CI 把 `redirect/github` 发到 `gh-pages`（需 push 且配好 `GITHUB_TOKEN` 权限）
- GitLab：CI 用 `git push --force` 镜像 `master` 到 `gitlab.com/dzyxdd/mixandcall`，再由 `.gitlab-ci.yml` 发 `redirect/gitlab` Pages  
  - GitHub Secret：`GITLAB_PASSWORD`（PAT，需 `write_repository`）  
  - GitLab **Protected branches**：`master` 需允许 Maintainer **force push**（覆盖单根历史时必需）  
  - 与 Cloudflare Secrets 无关；PAT 过期后只影响 GitLab 同步
- 跳转目标当前可为 `https://mixandcall.pages.dev`；自定义域就绪后再改回 `https://dzyxdd.io`

## 关于 workers.onboarding 404

旧链接 `.../workers/onboarding` 已失效。不必再走它。

**推荐做法（已采用）：** API 作为 **Pages Functions** 挂在同域：

- 站点：https://mixandcall.pages.dev
- API：https://mixandcall.pages.dev/api/health 、`/api/search` 、`/api/submit`

若仍想单独用 `*.workers.dev`，在控制台打开  
[Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages)  
→ 看 **Your subdomain** / **Change**（不是 onboarding 页）。

## 当前进度

- Pages + `/api` Functions 已部署：https://mixandcall.pages.dev
- KV `SEARCH_INDEX` = `68573bc0e83b4f0f9373d138c8c51885`
- 投稿密钥（一次）：`npx wrangler pages secret put GITHUB_TOKEN --project-name=mixandcall`

## 验收

- [x] Pages 首页
- [x] `/api/health`
- [x] `/api/search`（例：`/api/search?q=英语` 有结果）
- [ ] `/submit`（配置 Pages secret 后；导航入口可在 `SHOW_SUBMIT_NAV` 打开）
- [ ] 自定义域 / 旧链跳转

CI 上传 KV 必须带 `--remote`（Wrangler v4 默认只写本地）：见 `.github/workflows/ci.yml`。
