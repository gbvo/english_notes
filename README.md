# English Notes

基于 Quartz v5 的英语阅读笔记：[在线访问](https://gbvo.github.io/english_notes/)。

## 本地预览

```bash
npm ci
npx quartz build --serve
```

## 新增笔记

- 单词放在 `content/Vocabulary/`，表达放在 `content/Expressions/`。
- 两个分类首页分别是对应目录中的 `index.md`，不计入词条数量。
- 可以复制 `content/templates/` 中的模板；该目录不会发布到网站。
- `title` 是词条标题，`description` 是索引中显示的短释义，`topics` 是主题数组（例如 `[教育, 社会]`）。
- `cssclasses: [learning-note]` 启用词条排版，原文与译文分别成段。
- 使用 `[[其他词条]]` 关联笔记，页面底部会显示相关词条。

首页数量、主题入口、最近更新，以及三个词库索引都会在构建时自动生成。索引支持英文和中文释义筛选、主题筛选、A–Z 导航、最近更新排序，每页 20 条；筛选条件保存在 URL 中，可以复制链接。

页面组件在 `quartz/components/Learning.tsx`，交互脚本在 `quartz/components/scripts/learning.inline.ts`，样式在 `quartz/styles/custom.scss`。布局通过 `quartz.ts` 扩展，无需修改 Quartz 核心或已安装插件。

## Quartz

> “[One] who works with the door open gets all kinds of interruptions, but [they] also occasionally gets clues as to what the world is and what might be important.” — Richard Hamming

Quartz is a set of tools that helps you publish your [digital garden](https://jzhao.xyz/posts/networked-thought) and notes as a website for free.

🔗 Read the documentation and get started: https://quartz.jzhao.xyz/

[Join the Discord Community](https://discord.gg/cRFFHYye7t)

## Sponsors

<p align="center">
  <a href="https://github.com/sponsors/jackyzha0">
    <img src="https://cdn.jsdelivr.net/gh/jackyzha0/jackyzha0/sponsorkit/sponsors.svg" />
  </a>
</p>
