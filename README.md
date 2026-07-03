# HangI0 服装展示网站

这是一个适合 GitHub Pages 部署的服装展示网站原型，包含：

- 电脑端和手机端响应式展示页
- 新款、分类筛选、搜索、款式详情弹窗
- 店主后台页面
- Supabase 数据库和图片存储接入位

## 直接预览

打开 `index.html` 即可看展示页，打开 `admin.html` 可看店主后台。

未配置 Supabase 时，后台新增款式只会保存在当前浏览器本机，适合演示和确认样式。

## GitHub Pages 部署

1. 把 `fashion-showcase` 文件夹提交到 GitHub 仓库。
2. 在仓库设置里进入 `Pages`。
3. Source 选择部署分支，目录选择包含这些文件的目录。
4. 发布后访问 GitHub Pages 给出的地址。

## 开通真实后台上传

GitHub Pages 本身只能托管静态页面，不能运行后台服务。要实现店主登录、上传图片、更新款式，建议使用 Supabase：

1. 创建 Supabase 项目。
2. 在 SQL Editor 执行 `supabase.sql`。
3. 在 Authentication 里创建店主邮箱账号。
4. 打开 `config.js`，填写：

```js
window.BOUTIQUE_CONFIG = {
  SUPABASE_URL: "你的 Supabase Project URL",
  SUPABASE_ANON_KEY: "你的 Supabase anon public key",
  STORAGE_BUCKET: "product-images"
};
```

5. 重新部署到 GitHub Pages。

说明：示例 SQL 默认所有已登录用户都能管理产品。正式使用时，建议只创建店主账号，或进一步把策略限制为指定店主用户 ID。

## 替换店铺信息

常改内容在 `index.html`：

- 品牌名：`HangI0`
- 电话、邮箱、地址、微信说明
- 首屏大图和搭配图片
- 页面文案

展示页视觉在 `styles.css`，产品展示逻辑在 `app.js`；后台 `admin.html` 使用独立的 `admin.css`，逻辑在 `admin.js`。
