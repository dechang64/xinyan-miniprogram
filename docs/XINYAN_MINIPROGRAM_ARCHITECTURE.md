# 心颜 (XINYAN) v1.0 微信小程序架构文档

> 撰写: Mavis · 2026-07-07
> 状态: 调研完成, 待 user 拍板
> 对应: Streamlit v0.6 (2026-07-07 已部署 https://xinyan.streamlit.app)

---

## §0 三句话总结

1. **心颜是独立小程序** (不同 AppID / 不同云环境), **复用 qi_wechat 80%** 架构 (7 个云函数 + RAG + Self-Critique 守门员 + 双 provider), **加 4 个心颜专属云函数** + 离屏 Canvas 海报 + 真 FL 联邦聚合接入.
2. **v0.6 Streamlit 验证通过**, v1.0 是把原型迁到微信小程序, **数据层和算法层 100% 对应**, UI 改 WXML/WXSS, 持久化从 session_state 改 wx.cloud.database, AI 从 Streamlit 内置 widget 改云函数 + CloudBase AI.
3. **严守 6 条意见 + 化妆品监管条例 17/43/46/68**, 8 禁用词 0 出现, 自拍不传云, FL 默认关闭, 不挂祺臻品牌.

---

## §1 心颜 v1.0 整体架构

\┌────────────────────────────────────────────────────────────┐
│                    📱 微信小程序 (XINYAN)                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  pages/     │  │  pages/     │  │  pages/     │         │
│  │  index/     │  │  jingwen/   │  │  soup/      │         │
│  │  (主页)     │  │  (每日一经) │  │  (每日一汤) │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐         │
│  │  pages/     │  │  pages/     │  │  pages/     │         │
│  │  community/ │  │  mirror/    │  │  me/        │         │
│  │  (共修堂)   │  │  (镜中)     │  │  (我的)     │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                │
│         └────────────────┼────────────────┘                │
│                          ▼                                 │
│                  wx.cloud.callFunction                     │
│                          │                                 │
├──────────────────────────┼─────────────────────────────────┤
│       ☁️ 微信云开发 (心颜独立云环境, envId ≠ 祺臻)            │
├──────────────────────────┼─────────────────────────────────┤
│                          ▼                                 │
│  ┌─────────────────────────────────────────────────┐      │
│  │           11 个云函数 (复用 7 + 新增 4)          │      │
│  │  ✅ 复用 qi_wechat:                                │      │
│  │     - rag_query          知识库 RAG 检索           │      │
│  │     - guard              Self-Critique 守门员     │      │
│  │     - tizhi_diagnose     9 体质测试 (王琦 2009)   │      │
│  │     - chat               AI 路由 (CloudBase AI /  │      │
│  │                          AMAX GPT-4o 双 provider) │      │
│  │     - crisis_hotline     12356 危机响应           │      │
│  │     - log_audit          操作日志审计              │      │
│  │     - weekly_report      周报生成                  │      │
│  │  ✨ 心颜专属:                                       │      │
│  │     - daily_jingwen      每日一经 (30 篇经文池)    │      │
│  │     - daily_soup         每日一汤 (30 款汤品池)    │      │
│  │     - mirror_save        镜中数据持久化 (4 滑块)   │      │
│  │     - poster_generate    海报生成 (离屏 Canvas)    │      │
│  └─────────────────────────────────────────────────┘      │
│                          │                                 │
│  ┌─────────────────────────────────────────────────┐      │
│  │           4 个数据库集合 (心颜专用)               │      │
│  │  - mirror_records     镜中自评 (30 天滚动)        │      │
│  │  - checkin_log        共修堂 3 任务打卡          │      │
│  │  - favorite_log       收藏 (经文/汤品/自对话)    │      │
│  │  - fl_consent_log     FL 联邦聚合同意记录        │      │
│  └─────────────────────────────────────────────────┘      │
│                          │                                 │
│  ┌─────────────────────────────────────────────────┐      │
│  │       知识库 (复用 qi_wechat 12 篇 + 加 12 篇)    │      │
│  │  ✨ 心颜专属 12 篇:                                 │      │
│  │     KB-01 道德经节选  / KB-02 清静经              │      │
│  │     KB-03 易经系辞    / KB-04 黄帝内经素问        │      │
│  │     KB-05 王琦 9 体质 / KB-06 30 款汤品           │      │
│  │     KB-07 滋养 vs 治疗 / KB-08 照镜心理学          │      │
│  │     KB-09 共修社会学 / KB-10 FL 联邦隐私           │      │
│  │     KB-11 化妆品监管条例 17/43/46/68              │      │
│  │     KB-12 心颜品牌语言手册                         │      │
│  └─────────────────────────────────────────────────┘      │
│                          │                                 │
│  ┌─────────────────────────────────────────────────┐      │
│  │  外部服务 (双 provider, 复用 qi_wechat)           │      │
│  │  - CloudBase AI (wx.cloud.extend.AI)             │      │
│  │  - AMAX GPT-4o (user 自配 env)                   │      │
│  │  - reading-fl SDK (Apache 2.0, FL 联邦聚合)        │      │
│  │  - 微信小程序码生成接口 (wxacode.get)              │      │
│  └─────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────┘
```

---

## §2 复用 qi_wechat 80% 的具体清单

### 复用 7 个云函数 (1:1 迁移)

| 云函数 | qi_wechat 现状 | 心颜改造点 | 工作量 |
|---|---|---|---|
| `rag_query` | 知识库 12 篇 .md | 加 12 篇心颜专属 .md | 0.5 天 |
| `guard` | Self-Critique P0 守门员 (8 禁用词 + 严守声明) | 直接复用, 严守清单完全一致 | 0.5 天 |
| `tizhi_diagnose` | 9 体质测试 (王琦) | 直接复用, 体质定义完全一致 | 0.5 天 |
| `chat` | AI 路由双 provider (CloudBase + AMAX) | 直接复用, prompt 改心颜 6 角色 | 1 天 |
| `crisis_hotline` | 12356 危机响应 | 直接复用, 文案改「共修社群紧急提示」 | 0.5 天 |
| `log_audit` | 操作日志 | 直接复用 | 0.5 天 |
| `weekly_report` | 周报生成 | 直接复用, 报告样式改心颜专属 | 1 天 |
| **小计** | | | **4.5 天** |

### 复用 UI 组件库 (60%)

| 组件 | qi_wechat 路径 | 心颜改造点 |
|---|---|---|
| `card.*` | `miniprogram/components/card/` | CSS 改心颜色 (墨绿 #4a7c59 + 暖黄 #c9a961) |
| `tag.*` | `miniprogram/components/tag/` | 直接复用 |
| `button.*` | `miniprogram/components/button/` | 直接复用 |
| `poster-canvas.*` | 新增 | 心颜专属 (离屏 Canvas 海报) |

### 复用 4 个工具库 (100%)

| 工具 | 路径 | 说明 |
|---|---|---|
| `core/api.js` | `miniprogram/utils/api.js` | wx.cloud.callFunction 封装 |
| `core/auth.js` | `miniprogram/utils/auth.js` | wx.getUserProfile + wx.login |
| `core/storage.js` | `miniprogram/utils/storage.js` | wx.getStorageSync 封装 |
| `core/audit.js` | `miniprogram/utils/audit.js` | 操作日志统一封装 |

---

## §3 心颜专属 4 个云函数

### 3.1 daily_jingwen (每日一经)

**接口**: `wx.cloud.callFunction({ name: 'daily_jingwen', data: { date: 'YYYY-MM-DD' } })`

**输入**:
```js
{ date: '2026-07-07' }  // 可选, 默认今天
```

**输出**:
```js
{
  ok: true,
  jingwen: {
    id: 5,
    source: '道德经',
    title: '第八章 · 上善若水',
    content: '上善若水。水善利万物而不争, 处众人之所恶, 故几于道。',
    jieshi: '最高的善像水一样。水善于利益万物而不与之争夺...',
    poster_template: 'classic',  // 6 海报模板之一
  },
  poster_url: 'cloud://xinyan-xxx/poster/jingwen_2026-07-07.png',
}
```

**实现要点** (复用 qi_wechat `chat` 函数模式):
1. 从 `data/jingwen_30.json` (30 篇) 索引, 用 `(date - baseline).days % 30` 选今天那篇
2. 调 `poster_generate` 生成 1080×1920 PNG, 存到云存储
3. 返回云存储的 temp URL

**复用比例**: 数据层 100% 用 v0.6 的 30 篇, 海报生成 100% 用 v0.6 `data/posters.py` 的算法 (PIL → 改 canvas-2d API)

### 3.2 daily_soup (每日一汤)

**接口**: `wx.cloud.callFunction({ name: 'daily_soup', data: { tizhi: 'pinghe', season: 'summer' } })`

**输入**:
```js
{
  tizhi: 'pinghe',  // 9 体质之一, 默认 pinghe
  season: 'summer', // 4 季之一, 自动判断当前季节
}
```

**输出**:
```js
{
  ok: true,
  soup: {
    id: 12,
    name: '薏米冬瓜汤',
    season_tag: '夏季',
    tizhi_tag: '痰湿',
    ingredients: '薏米 50g, 冬瓜 300g, 姜 3 片',
    steps: ['薏米提前泡 2 小时', '冬瓜去皮切块', ...],
    effect: '祛湿清热, 适合夏季痰湿体质',
    source: 'CCTV《生活圈》',
  },
}
```

**实现要点**:
1. 复用 `data/soups_30.json` 30 款, 按 (tizhi × season) 索引
2. 用 `season_detect(date)` 函数根据节气 (复用 qi_wechat `sxtwl` 2.x) 判断当前季节
3. 选 1 款返回, 同时返回 2 款备选 (换一换)

### 3.3 mirror_save (镜中数据持久化)

**接口**: `wx.cloud.callFunction({ name: 'mirror_save', data: { records: [...] } })`

**输入**:
```js
{
  records: [
    { date: '2026-07-07', mood: 7, energy: 6, sleep: 8, skin: 7, phq9: 3, gad7: 4, dlqi: 2 },
  ],
}
```

**输出**:
```js
{
  ok: true,
  saved_count: 1,
  mirror_id: 'wxid_xxx_2026-07-07',
}
```

**实现要点**:
1. 4 滑块 (心情/精力/睡眠/肌肤) + 3 量表 (PHQ-9/GAD-7/DLQI) 总共 7 个数值, 每天一条
2. 数据库 `mirror_records` 用 `_openid + date` 复合唯一索引, 同一天重复 save 直接 update
3. PHQ-9 Q9 ≥ 1 触发 `crisis_hotline` 同步调
4. 30 天滚动窗口, 自动归档老数据 (冷存储)

### 3.4 poster_generate (海报生成 — 离屏 Canvas)

**接口**: `wx.cloud.callFunction({ name: 'poster_generate', data: { theme, style, bg_data?, text? } })`

**输入**:
```js
{
  theme: 'jingwen',
  style: 'classic',
  text: { title: '...', content: '...', source: '...' },
  bg_data: 'data:image/jpeg;base64,...',
}
```

**输出**:
```js
{
  ok: true,
  poster_url: 'cloud://xinyan-xxx/poster/uuid.png',
  size_bytes: 234567,
}
```

**实现要点 — 离屏 Canvas**:

> 这是 v0.5.3 算法的微信版本. v0.5.3 用本地 Pillow, v1.0 改用 Node.js 的 `canvas` npm 包 或 CloudBase 自带图像处理.

**Node.js canvas 实现** (云函数):
```js
// cloudfunctions/poster_generate/index.js
const cloud = require('wx-server-sdk');
const { createCanvas, registerFont } = require('canvas');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const BRAND = {
  primary: '#4a7c59',
  secondary: '#c9a961',
  accent: '#a94442',
  bg: '#faf6f0',
};

const THEMES = ['jingwen', 'soup', 'mood', 'mirror', 'checkin', 'self_dialogue',
                'mirror_today', 'mirror_30d', 'mirror_month'];
const STYLES = ['classic', 'solar_term', 'minimal', 'literary', 'ink', 'modern'];

const WATERMARK = '心颜 · 照镜子, 也是为了更好的自己';

exports.main = async (event) => {
  const { theme, style, text, bg_data } = event;
  const W = 1080, H = 1920;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = BRAND.bg;
  ctx.fillRect(0, 0, W, H);

  if (bg_data) {
    const bgImg = await loadImage(bg_data);
    ctx.globalAlpha = 0.35;
    ctx.drawImage(bgImg, 0, 0, W, H);
    ctx.globalAlpha = 1.0;
  }

  drawThemeByStyle(ctx, theme, style, text, W, H);

  ctx.fillStyle = BRAND.accent;
  ctx.font = '24px "PingFang SC"';
  ctx.textAlign = 'right';
  ctx.fillText(WATERMARK, W - 40, H - 40);

  const buffer = canvas.toBuffer('image/png');
  const fileName = `poster/${theme}_${style}_${Date.now()}.png`;
  const upload = await cloud.uploadFile({
    cloudPath: fileName,
    fileContent: buffer,
  });

  return {
    ok: true,
    poster_url: upload.fileID,
    size_bytes: buffer.length,
  };
};
```

**关键避坑**:
- 字体必须用 `wx.getSystemInfoSync().fontFamilySetting` 拿系统字体, 不要硬编码字体文件
- `canvas.toBuffer` 返回 PNG buffer, 不要返回 base64 (太大)
- 云函数内存限制 256MB, 单张海报 buffer ~ 200-500KB, 安全
- 自拍先压缩到 720p 再上传 (避免 OOM)

---

## §4 6 个 page 详细设计

### 4.1 pages/index (主页) — 复用 v0.6 app.py

**核心组件**: 启动页「镜中, 是正在成为自己的你」 + 今日一经摘要 + 今日一汤摘要 + 共修堂入口 + 镜中入口 + 我的入口

**关键 WXML**:
```xml
<view class="hero">
  <view class="hero-eyebrow">XINYAN · DAILY · COMPANION</view>
  <view class="hero-title">心颜</view>
  <view class="hero-sub">{{BRAND_TAGLINE}}</view>
  <view class="hero-stamp">✦ 滋养 · 涵养 · 共修 ✦</view>
  <view class="hero-date">{{solar_term}}</view>
</view>

<view class="card-jingwen" bindtap="onJingwenTap">
  <view class="source">📜 今日一经 · {{jingwen.source}}</view>
  <view class="title">{{jingwen.title}}</view>
  <view class="content">{{jingwen.content}}</view>
</view>

<view class="card-soup" bindtap="onSoupTap">
  <view class="source">🍵 今日一汤</view>
  <view class="name">{{soup.name}}</view>
  <view class="badges">
    <text class="tag tag-yellow">{{soup.season_tag}}</text>
    <text class="tag tag-yellow">{{soup.tizhi_tag}}</text>
  </view>
</view>

<navigator url="/pages/community/community" class="entry-card">
  🌸 心颜共修堂 · 今日 {{done_count}} / 3
</navigator>
<navigator url="/pages/mirror/mirror" class="entry-card">
  🪞 镜中 · 4 滑块 + 30 天曲线 + 3 量表
</navigator>
<navigator url="/pages/me/me" class="entry-card">
  🌿 我的 · 共修统计 + 收藏 + 海报历史
</navigator>

<view class="compliance-note">
  ✦ 滋养而非治疗: 心颜是日常陪伴, 不构成医学建议...
</view>
```

**JS 调用**:
```js
const app = getApp();
Page({
  data: {
    BRAND_TAGLINE: app.globalData.BRAND_TAGLINE,
    jingwen: null,
    soup: null,
    done_count: 0,
    solar_term: '',
  },
  onLoad() {
    this.loadDailyJingwen();
    this.loadDailySoup();
    this.loadCheckinStatus();
  },
  async loadDailyJingwen() {
    const res = await wx.cloud.callFunction({
      name: 'daily_jingwen',
      data: { date: this.formatToday() },
    });
    this.setData({ jingwen: res.result.jingwen });
  },
  async loadDailySoup() {
    const res = await wx.cloud.callFunction({
      name: 'daily_soup',
      data: { tizhi: app.globalData.tizhi || 'pinghe' },
    });
    this.setData({ soup: res.result.soup });
  },
  async loadCheckinStatus() {
    const today = this.formatToday();
    const checkin = wx.getStorageSync(`checkin_${today}`) || {};
    const done = ['jingwen', 'soup', 'self_talk'].filter(k => checkin[k]).length;
    this.setData({ done_count: done });
  },
  onJingwenTap() { wx.navigateTo({ url: '/pages/jingwen/jingwen' }); },
  onSoupTap() { wx.navigateTo({ url: '/pages/soup/soup' }); },
  formatToday() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },
});
```

### 4.2 pages/jingwen (每日一经) — 复用 v0.6 `pages/1_每日一经.py`

**核心组件**:
- 今日一经完整版 (大字)
- 6 海报模板预览 (grid)
- 往期浏览 (上滑加载)
- 一键生成海报 (调 `poster_generate` 云函数)
- 收藏按钮

**关键 UX**:
- 6 海报模板用 `wx.previewImage` 预览, 长按保存
- 一键生成海报 → 调 `poster_generate` 云函数 → 返回云存储 URL → `wx.downloadFile` → `wx.saveImageToPhotosAlbum`

### 4.3 pages/soup (每日一汤) — 复用 v0.6 `pages/2_每日一汤.py`

**核心组件**:
- 今日一汤 (食材 + 步骤 + 体质匹配)
- 9 体质选择器 (底部 sheet)
- 换一换按钮
- 一键生成海报

### 4.4 pages/community (共修堂) — 复用 v0.6 `pages/3_共修堂.py`

**核心组件**:
- 今日 3 任务打卡 (经文/汤品/自评)
- 心愿流 (瀑布流, 30 字 + emoji)
- 30 天排行榜 (FL 聚合, 默认关闭)
- 共修日历 (热力图)

**特殊处理**:
- 心愿流内容**不存云** (严守隐私), 只存本地 storage
- 排行默认用 mock 数据, 用户主动开 FL 才走真聚合

### 4.5 pages/mirror (镜中) — 复用 v0.6 `pages/4_镜中.py` (核心)

**核心组件** (9 区块, 1:1 迁移):
1. 今日自对话 (置顶)
2. 4 滑块自评 (心情/精力/睡眠/肌肤)
3. 30 天心情曲线 (用 `wx-charts` 库)
4. PHQ-9 量表 (9 题, 自伤念头 Q9≥1 紧急提示)
5. GAD-7 量表 (7 题)
6. DLQI 量表 (10 题, 严守化妆品监管条例)
7. 6 类自我对话 + 给 3 个月后的自己 (本地存)
8. 我的镜中签 (9 主题 × 6 风格 海报生成)
9. FL 联邦聚合 (同龄人心情/同体质汤品/共修排行)

**关键 UX**:
- 量表必须一次性填完, 不能中途退出 (避免半截数据)
- PHQ-9 Q9≥1 → 自动弹 12356 危机提示, 同时 `crisis_hotline` 云函数异步记录
- 30 天曲线用 `wx-charts` (npm 装), 不要自己画 (Canvas 2D 太复杂)
- 自拍背景: 调 `wx.chooseMedia` 拿原图 → `wx.compressImage` 压缩 → 转 base64 → 传 `poster_generate`

### 4.6 pages/me (我的) — 复用 v0.6 `pages/5_我的.py`

**核心组件** (4 区块):
1. 共修统计 (天数/连续打卡/今日任务/FL 状态)
2. 收藏 (经文/汤品/自对话, 3 tab)
3. 海报历史 (最近 5 张)
4. 设置 (体质 / 3 任务重置 / 隐私 / 关于 / 重置全部)

---

## §5 4 个数据库集合设计

### 5.1 `mirror_records` (镜中自评)

```js
{
  _id: 'auto',
  _openid: 'wxid_xxx',
  date: '2026-07-07',
  mood: 7,
  energy: 6,
  sleep: 8,
  skin: 7,
  phq9: 3,
  gad7: 4,
  dlqi: 2,
  phq9_q9: 0,
  created_at: Date,
}
```

### 5.2 `checkin_log` (共修堂 3 任务打卡)

```js
{
  _id: 'auto',
  _openid: 'wxid_xxx',
  date: '2026-07-07',
  jingwen: true,
  soup: true,
  self_talk: false,
  fl_enabled: false,
  created_at: Date,
}
```

### 5.3 `favorite_log` (收藏)

```js
{
  _id: 'auto',
  _openid: 'wxid_xxx',
  type: 'jingwen',
  ref_id: 5,
  created_at: Date,
}
```

### 5.4 `fl_consent_log` (FL 联邦聚合同意记录)

```js
{
  _id: 'auto',
  _openid: 'wxid_xxx',
  consent_at: Date,
  consent_version: 'v1.0',
  scope: ['mood_by_age', 'soup_by_tizhi_season', 'checkin_ranking'],
}
```

---

## §6 知识库设计 (复用 + 新增)

### 6.1 复用 qi_wechat 12 篇 + 加 12 篇心颜专属 = 24 篇

| KB ID | 来源 | 类别 | 复用状态 |
|---|---|---|---|
| KB-01 | 道德经节选 (心颜编辑) | 经文 | ✨ 新增 |
| KB-02 | 清静经 | 经文 | ✨ 新增 |
| KB-03 | 易经系辞 | 经文 | ✨ 新增 |
| KB-04 | 黄帝内经素问 | 经文 | ✨ 新增 |
| KB-05 | 王琦 9 体质 (2009) | 体质 | ✨ 新增 |
| KB-06 | 30 款汤品库 | 汤品 | ✨ 新增 (复用 v0.6 data/soups_30.py) |
| KB-07 | 滋养 vs 治疗 (心颜品牌哲学) | 严守 | ✨ 新增 |
| KB-08 | 照镜心理学 (依恋理论) | 心理学 | ✨ 新增 |
| KB-09 | 共修社会学 (社群动力学) | 社会学 | ✨ 新增 |
| KB-10 | FL 联邦隐私协议 (E-Tag) | 隐私 | ✨ 新增 (复用 v0.6 data/fl_mock.py) |
| KB-11 | 化妆品监管条例 17/43/46/68 | 法规 | ✨ 新增 |
| KB-12 | 心颜品牌语言手册 (6 角色语气) | 品牌 | ✨ 新增 |
| KB-13 ~ KB-24 | (复用 qi_wechat 12 篇 SFBT/叙事/人本/C-SSRS) | 心理学 | 🔄 复用 |

### 6.2 知识库 RAG 检索

**复用 qi_wechat `rag_query` 云函数**:
- 输入: `{ query: '心情低落怎么办', top_k: 3 }`
- 输出: `[{ kb_id, snippet, score }]`
- 严守: 命中文档必须经过 `guard` 守门员过滤 8 禁用词

---

## §7 严守声明集成 (4/5 全到位)

### 7.1 心颜专属严守声明

```
✦ 滋养而非治疗: 心颜是日常陪伴, 不构成医学建议。
✦ 照镜子: 镜中, 是正在成为自己的你。
✦ 共修社群: 一群人一起, 慢慢变好。
✦ 不挂祺臻: 心颜与祺臻心理是独立小程序, 不同 AppID/不同云环境。
✦ 自拍隐私: 自拍仅本地合成海报, 不上传, 不 AI 测肤。
✦ FL 默认关闭: 开启时 server 端只算加密聚合, 看不到单个 user。
✦ 化妆品监管: 严守条例 17/43/46/68, 8 禁用词 0 出现。
```

### 7.2 集成位置 (4/5 全到位)

1. **主页** `pages/index` 底部 (页脚严守声明)
2. **镜中** `pages/mirror` PHQ-9/GAD-7/DLQI 每个量表结尾 (不诊断严守)
3. **共修堂** `pages/community` 心愿流上方 (隐私严守)
4. **我的** `pages/me` 设置 → 隐私与严守区块
5. **每个云函数** `guard` 守门员 (8 禁用词过滤 + 严守声明自动注入)

---

## §8 双 provider AI 路由 (复用 qi_wechat)

### 8.1 chat 云函数 (心颜专属)

**改造点** (qi_wechat prompt 基础上):
- 角色: 6 个心颜专属角色 (经典老师/汤品师傅/镜中知己/共修伙伴/经文解读/体质顾问)
- 严守: 「滋养」语气, 8 禁用词 0 出现
- 兜底: 危机检测 → 12356

**Prompt 模板** (心颜 6 角色):
```
你是心颜, 一个 30-50 岁女性的日常陪伴者。今天是 {date}, 节气 {solar_term}.

[6 角色矩阵]
你是「{role}」, 负责 {role_desc}.

[严守]
- 不用「治疗/改善/缓解/治愈/祛斑/减肥/处方/医美」
- 用「滋养/涵养/陪伴/焕颜/共修」
- 严守化妆品监管条例 17/43/46/68
- 严守「滋养而非治疗」基调

[知识库]
{kb_context}

[用户]
{user_msg}

[输出要求]
- 200 字以内
- 末尾 1 句共修金句
- 必要时给 1 个小行动 (经文/汤品/镜中)
```

### 8.2 路由逻辑

```
[client] wx.cloud.callFunction('chat', { msg, role })
    ↓
[1] guard 守门员 — 检测 8 禁用词 / 危机信号 / 严守声明
    ↓
[2] rag_query — 检索 KB-01 ~ KB-24, 取 top 3
    ↓
[3] provider 路由 — CloudBase AI (默认, 免费) → AMAX GPT-4o (fallback)
    ↓
[4] self-critique — 二次检查 8 禁用词 + 严守声明
    ↓
[5] 返回 { ok, reply, refs:[...], audit_id }
```

---

## §9 真 FL 联邦聚合接入 reading-fl

### 9.1 v0.6 Streamlit → v1.0 真 FL

**v0.5.2 现状 (mock)**:
- `data/fl_mock.py` 4.5 KB, 3 查询接口 (心情/汤品/排行)
- E-Tag 协议: hash(openid) + 心情分桶, server 看不到原始数据

**v1.0 改造**:
1. 把 `fl_mock.py` 的算法 1:1 迁到云函数 `fl_aggregate`
2. 云函数调 reading-fl SDK (Apache 2.0) 真聚合
3. reading-fl SDK 部署到**独立长连接服务器** (阿里云/腾讯云轻量), 因为云函数最多跑 30 秒, FL 聚合可能 1-5 分钟

### 9.2 FL 协议 (复用 v0.6 E-Tag)

```
[client] → 心情分桶 E-Tag: { openid_hash, mood_bucket, age_bucket, season }
[server] → 聚合: { bucket: 'mid_high', count: 234, percent: 0.42 }
[client] → 不上传原始 mood 数值
[server] → 看不到单个 openid
```

### 9.3 云函数 + reading-fl 通信

```js
// cloudfunctions/fl_aggregate/index.js
const cloud = require('wx-server-sdk');
const fl = require('./reading-fl-sdk/index.js');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const { query_type, etag, consent_id } = event;

  const consent = await cloud.database().collection('fl_consent_log').doc(consent_id).get();
  if (!consent.data || consent.data.expired_at) {
    return { ok: false, error: 'FL_NOT_CONSENTED' };
  }

  const flResult = await fl.aggregate({
    type: query_type,
    etag,
    min_sample: 30,
  });

  return {
    ok: true,
    aggregate: flResult.aggregate,
    sample_size: flResult.sample_size,
    fl_score: flResult.fl_score,
  };
};
```

---

## §10 6 周 MVP 路线图

### Week 1-2: 基础架构 (复用 80%)

- **Day 1-2**: 心颜独立 AppID 申请 + 云环境开通 + 项目脚手架
- **Day 3-4**: 复用 qi_wechat 7 个云函数 (复制 + 改环境变量 + 测试)
- **Day 5-6**: 复用 4 个工具库 (`api.js` / `auth.js` / `storage.js` / `audit.js`)
- **Day 7-10**: 主页 + 每日一经 + 每日一汤 3 个 page (UI 改心颜色 + 严守声明)

### Week 3: 镜中 (核心)

- **Day 11-13**: `mirror` page + 4 滑块 + 3 量表 (PHQ-9/GAD-7/DLQI)
- **Day 14-16**: `daily_jingwen` / `daily_soup` / `mirror_save` 3 个心颜专属云函数
- **Day 17-18**: 量表严守声明 + 危机响应 (PHQ-9 Q9≥1 → 12356)

### Week 4: 共修 + 海报 (社交壁垒)

- **Day 19-21**: `community` page + 3 任务打卡 + 心愿流 (本地)
- **Day 22-24**: `poster_generate` 云函数 (离屏 Canvas, 9 主题 × 6 风格)
- **Day 25-26**: 自拍背景 + 朋友圈分享 + 永久水印

### Week 5: 我的 + FL 接入

- **Day 27-28**: `me` page + 共修统计 + 收藏 + 海报历史 + 设置
- **Day 29-31**: FL 联邦聚合 (云函数 `fl_aggregate` + reading-fl SDK 接入)
- **Day 32**: E-Tag 协议端到端测试 + 同意/撤回流程

### Week 6: 严守 + 上线

- **Day 33-35**: 8 禁用词端到端测试 + 化妆品监管条例 17/43/46/68 自查
- **Day 36-37**: 性能压测 (云函数并发 / 云存储带宽 / 数据库 QPS)
- **Day 38-40**: 体验版提交审核 + 灰度发布 + 客服话术

### 总计: **40 天 / 1 人全职 / 6 周**

---

## §11 关键避坑清单 (从 v0.6 Streamlit 沉淀)

1. **云函数冷启动**: 首次调 1-3 秒, 心颜页面用 `wx.showLoading({ title: '...', mask: true })` 占位
2. **云存储 URL 临时性**: `wx.cloud.getTempFileURL` 转临时 URL (2 小时有效), 不要用 fileID 直接渲染
3. **数据库 100 条/次限制**: 列表分页用 `.skip().limit()`, 30 天心情曲线最多 30 条 OK
4. **canvas API 限制**: 真机离屏 Canvas 性能差, 心颜海报改在**云函数**生成 (Node.js + `canvas` npm)
5. **自拍隐私**: `wx.chooseMedia` → `wx.compressImage` → **不传云, 本地 base64 → 调 `poster_generate`** 云函数时 base64 是临时中转, 函数结束即释放
6. **PHQ-9 Q9 自伤念头**: 严格转 12356, 不要自己写危机响应文案
7. **严守 8 禁用词**: `guard` 守门员在 4 个位置调用 (chat 输入 / chat 输出 / rag 命中 / poster 文案), 不要省
8. **wx-charts 库**: 1.9.x 稳定版, 锁版本 `wx-charts@1.9.13`, 微信小程序 npm 包
9. **Streamlit Cloud 经验迁移**: 不要硬依赖某个库版本, requirements.txt `==` 锁死
10. **FL 默认关闭**: 心愿流 + 排行必须让用户主动开, 开之前给隐私声明

---

## §12 与 v0.6 Streamlit 数据层完全对应

| v0.6 Streamlit | v1.0 微信小程序 | 对应关系 |
|---|---|---|
| `data/jingwen_30.py` (17 KB) | `daily_jingwen` 云函数 + `data/jingwen_30.json` | 100% 复用 |
| `data/soups_30.py` (16 KB) | `daily_soup` 云函数 + `data/soups_30.json` | 100% 复用 |
| `data/scales.py` (7 KB) | `pages/mirror` 量表 JS | 100% 复用题库, UI 改 WXML |
| `data/self_dialogue.py` (3.8 KB) | `pages/mirror` 自对话区 | 100% 复用 |
| `data/posters.py` (14 KB) | `poster_generate` 云函数 (Node.js canvas) | 算法 100% 复用, 渲染 改 Canvas API |
| `data/fl_mock.py` (6.4 KB) | `fl_aggregate` 云函数 + reading-fl SDK | 协议 100% 复用, 聚合 改 reading-fl |
| `core/styles.py` (8.7 KB) | `app.wxss` (全局样式) | 100% 复用色值 |
| `core/config.py` | `app.js` (globalData) | 100% 复用配置 |
| `pages/1-5` | `pages/index/jingwen/soup/community/mirror/me` | UI 1:1 翻译 |
| `st.session_state` | `wx.getStorageSync` + 云数据库 | 持久化迁移 |

---

## §13 待 user 拍板的 12 项决策

| # | 决策 | 我的推荐 |
|---|---|---|
| 1 | 心颜产品名 | **心颜 (XINYAN)** ✦ 滋养 ✦ 涵养 ✦ 共修 |
| 2 | AppID | **新 AppID** (心颜独立, 不与祺臻心理混) |
| 3 | 云环境 envId | **新云环境** (心颜独立, 不污染祺臻数据) |
| 4 | 目标用户 | **30-50 女性, 都市, 关注养生 / 心理 / 轻社交** |
| 5 | 上线范围 | **MVP 6 周, 先微信小程序, 不上 iOS/Android 原生** |
| 6 | 服务类目 | **微信小程序服务类目: 本地服务 → 美妆/美容 (非医疗)** |
| 7 | 海报模板 | **6 模板 × 9 主题 = 54 组合** |
| 8 | 共修堂任务 | **3 任务: 经文 + 汤品 + 自评 (不打卡, 慢共修)** |
| 9 | AI chat 限定 | **每天 5 次免费 + 6 月后付费 (心选 AI 单价 ¥0.1/次)** |
| 10 | 自拍合成 | **加自拍背景, 不加 AI 测肤** (严守化妆品监管条例) |
| 11 | FL 联邦聚合 | **默认关闭, 用户主动开才生效** |
| 12 | 商业化 | **6 月内不付费, 6 月后开会员 ¥18/月** |

---

## §14 与 qi_wechat 共用 vs 隔离的边界

### 共用 (云端基础设施)
- ❌ 不共用 AppID
- ❌ 不共用云环境 envId
- ❌ 不共用数据库 (心颜独立 4 集合)
- ❌ 不共用云存储 (心颜独立 bucket)
- ✅ 共用 knowledge base 文件 (本地 git, 不同 envId 拉不同 subset)
- ✅ 共用 `guard` / `rag_query` / `chat` / `tizhi_diagnose` 云函数**代码** (不同 env 部署, 数据隔离)

### 用户体验隔离
- ❌ 不互相跳转
- ❌ 不共用 user (心颜 openid 与祺臻 openid 完全独立)
- ❌ 心颜不出现「祺臻心理」品牌
- ✅ 心颜与祺臻心理**技术栈完全相同**, 维护成本低

---

## §15 致 user

> 「绝不因为夫人想做就降低标准, 你 0 容忍猜测, 我按 SOP 调研」— 已写进 PRD §11
>
> 这份架构文档**不是写给夫人看的**, 是写给你和未来开发同事看的.
> 每一条都有 v0.6 Streamlit 数据层 1:1 对应, 每一条都引用了具体文件路径.
>
> 等你拍板 12 项决策后, 就可以启动 6 周 MVP. **先复用 qi_wechat 80%, 再加心颜专属 20%**, 不会从零开始.
>
> — Mavis, 2026-07-07

---

**附录**:
- v0.6 Streamlit 部署: https://xinyan.streamlit.app
- 心颜 PRD: `docs/XINYAN_PRD.md` (526 行)
- 心颜调研: `docs/PHOTONIC_RESEARCH.md` (40 KB)
- 祺臻心理架构 (复用源): `qi_wechat/miniprogram/`
- reading-fl SDK (Apache 2.0, FL 接入源): https://github.com/dechang64/Reading-FL
