# 陈十一学术主页

Astro 7 静态站点，默认英文，支持中文。版式参考 Stone Lab 的浅灰背景、细线框、左侧个人资料与右侧正文，不依赖数据库或内容管理后台。

## 本地使用

需要 Node.js 22.12+（或 Astro 当前支持的更新 LTS）。

```sh
npm ci
npm run dev
```

打开终端显示的地址（默认 `http://localhost:4321`）。英文首页直接位于 `/`，中文首页 `/zh/`，不经过跳转中间页；旧的 `/en/` 地址仍兼容访问。修改 Markdown 后开发服务器自动刷新。

```sh
npm run verify  # 类型检查、构建、静态页面测试
npm run build  # 生成 dist/
npm run preview
```

可选的真实浏览器检查（桌面、平板、手机、语言切换与无障碍）：

```sh
npx playwright install chromium  # 首次安装浏览器
npm run build
npm run test:browser
```

浏览器测试有每项 20 秒、整套 120 秒的超时限制，截图输出至 `artifacts/`。

## 日常内容：只修改 Markdown

| 想修改什么 | 文件位置 |
| --- | --- |
| 英文首页、简介、研究介绍 | `src/content/pages/en/*.md` |
| 中文对应内容 | `src/content/pages/zh/*.md` |
| 论文（中英共用） | `src/content/publications/*.md` |
| 当前成员（一个文件包含中英字段） | `src/content/people/*.md` |
| 往届成员 | `src/content/pages/en/alumni.md`、`zh/alumni.md` |
| 照片与中英文说明 | `src/content/gallery/*.md` |
| 图片文件 | `public/images/` |

文件开头两个 `---` 之间是固定字段，后面是 Markdown 正文。若字段内容含冒号，使用引号包裹。

### 加一篇论文

复制 `src/content/publications/1998-lattice-boltzmann.md`，改文件名及字段：

```markdown
---
title: "论文原文标题"
authors: "作者列表，保留原文顺序"
year: 2026
venue: "期刊名称"
volume: "卷号"
pages: "页码或文章编号"
source: https://example.org/paper
selected: false
---
```

- `selected: true`：自动同时出现在首页代表论文中。
- 首页目前选取 Google Scholar 引用最高的四篇；`selectedRank: 1` 至 `4` 控制引用排名顺序。完整论文页仍按年份排列。更新排名时同步修改四篇的精选标记和排序值，本站不在运行时抓取 Scholar。
- 有 DOI 时增加 `doi: https://doi.org/实际DOI`。
- `volume`、`pages`、`doi` 可省略，不能留伪造值。
- 预印本可增加 `kind: preprint`，正式论文默认 `article`。
- 论文按年份自动排序；两种语言共用同一份数据。
- `source` 为论文核对来源，目前部分是官方论文列表或 Scholar。拿到精确论文地址后可以替换；有 `doi` 时优先链接 DOI。

### 加一名成员

复制 `src/content/people/shengqi-zhang.md`，编辑其中的中英文姓名、职务、简介、个人主页和 `order`（显示顺序）。照片放进 `public/images/`，`image` 填 `/images/文件名.jpg`。不需要编辑网页组件。

李岩松的文件含 `last: true`，保证固定排在最后；其他成员不要设置该字段。成员外链不是普通个人主页时，可以填写 `homepageLabel` / `homepageLabelZh` 修改链接文字（如 Google Scholar）。

课题组负责人使用 `pi: true`，页面会在职称后加上 PI；默认不显示。

### 修改研究配图

中英文 `research.md` 的每个研究方向下都有一条普通 Markdown 图片引用，图片放在 `public/images/research/`。替换文件或修改 `![说明](/images/research/文件名.svg)` 即可；网站会自动处理部署子路径。

### 加一张照片

复制 `src/content/gallery/portrait.md`，填写中英文标题、说明、图片路径和来源。图片必须由你拥有或得到使用许可。照片页面不会自动生成活动、时间、地点或人物关系。

### 修改侧栏

侧栏身份和联系方式位于 `src/content/profile.md`。修改该文件即可更新两种语言页面。

## 部署

`npm run build` 生成可直接部署的 `dist/`，适用于学校静态服务器、Cloudflare Pages、Netlify 或其他静态托管。构建命令 `npm run build`，输出目录 `dist`。本地和这些构建默认使用域名根路径。

正式域名确定后，设置环境变量 `SITE_URL=https://你的域名` 再构建，用于 canonical 和中英文 hreflang。未设置时不输出虚假的正式站点地址。网站无外部 API 运行依赖，字体和图片随站点部署。

### GitHub Pages 正式站点

部署仓库：`chenshiyieit/chenshiyieit.github.io`。

已上线网址：`https://chenshiyieit.github.io/`。

```sh
npm run verify:pages
```

`build:pages` 自动设置正式域名及根路径 `/`，输出到 `dist-pages/`，不覆盖本地构建 `dist/`。这是 GitHub 用户站点，不应再增加 `/shiyi-chen-web/` 子路径。导航、Markdown 站内链接、图片、语言切换与 SEO 地址均按新域名生成。

仓库的 `main` 分支保存网站源码和 Markdown。GitHub Actions 在每次推送后自动检查、构建并部署 `dist-pages/`，无需手动同步生成文件。Pages 的发布来源为 **GitHub Actions**。

今后在本项目根目录操作：

```sh
# 修改 Markdown 后
npm run verify
git add src/content/  # 或明确指定本次修改的其他文件
git commit -m "Update website content"
git push
```

推送后在 GitHub 仓库的 Actions 标签页查看 `Deploy website` 工作流。检查或构建失败不会发布错误产物；成功后网站自动更新。只需提交一次源文件，不要提交 `dist/`、`dist-pages/` 或 `.pages-deploy/`。

此仓库的本地 `core.sshCommand` 指定专用 Deploy Key，因此普通 `git push` 就能推送，不需要切换默认 GitHub 账号。它不修改全局 SSH 设置，私钥只保留在本机。新电脑克隆后，需要自行配置有权写入此仓库的密钥。

内部调研文档 `docs/`、浏览器日志 `.playwright-mcp/`、`.sisyphus/`、本地环境变量和截图已排除，不会随源码提交。 `.pages-deploy/` 仅作旧部署备份，今后不再使用它推送。

旧项目 `JackYansongLi/shiyi-chen-web` 的 Pages 已关闭，旧仓库保留，原个人主页 `JackYansongLi.github.io` 未改动。

## 内容来源与上线核对

来源说明、名单覆盖范围和照片许可事项保留在本机内部文档，不上传公开仓库、不在访客页面显示。论文列表不承诺穷尽全部发表成果；可以按同一 Markdown 格式持续补充。
