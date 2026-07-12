# 悦济 v1.0 — 微信小程序 (含微信云开发 + AMAX)

> 滋养/涵养/共修/镜中 — 6 哲学产品
> 严守: 8 禁用词 0 出现, 主观自评 ✅ / 客观识别 ❌
> 微信云开发 + AMAX (deepseek-v3) + 知识库 RAG

## 项目结构

```
yueji-miniprogram-app/
├── app.json / app.js / app.wxss        # 全局 (5 tab + 启动页 + 3 不在 tabBar)
├── project.config.json                 # AppID wx203abf07e1ee4707
├── sitemap.json
├── pages/                              # 7 page + 1 子 page
│   ├── 0_启动页/                       # 2 秒启动, 跳镜中
│   ├── 1_每日一经/                     # 30 经文, dayOfYear seed
│   ├── 2_每日一汤/                     # 9 体质 × 30 汤品
│   ├── 3_共修堂/                       # 3 任务 (占位, 社群 v1.1)
│   ├── 4_镜中/                         # 4 滑块 + 30 天曲线 + 6 对话 (云函数) + 信
│   │   └── letter/                     # 给 3 个月后的信
│   ├── 5_我的/                         # 严守声明 + 重置 + 隐私
│   ├── 6_人格画像/                     # 6 tab: MBTI/八字/星盘/PHQ-9/GAD-7/TIZHI
│   └── 7_悦济之音/                     # 5 滋养曲风 + InnerAudioContext
├── cloudfunctions/                     # 微信云开发
│   └── chat/                           # AMAX/CloudBase 6 类对话 AI
│       ├── index.js                    # 严守 + 6 类角色 + RAG + AMAX 调用
│       └── package.json
├── knowledge_base/                     # 悦济独立知识库 (5 个 .md, 给 RAG 用)
│   ├── 01_yueji_6_philosophy.md
│   ├── 02_music_v1_spec.md
│   ├── 03_jingzhong_4sliders.md
│   ├── 04_30_jingwen_30_soups.md
│   └── 05_6_dialog_roles.md
├── utils/                              # 工具函数 + 静态数据
│   ├── compliance.js                   # 8 禁用词 + 危机检测
│   ├── data_jingwen.js                 # 30 经文
│   ├── data_soups.js                   # 30 汤品
│   ├── data_mbti.js                    # MBTI 8 题 + 16 型
│   ├── data_assess.js                  # 八字 + 星盘 + 3 量表 + 9 体质
│   └── dialog.js                       # 6 类对话静态兜底 (60 句)
├── assets/                             # tabBar icons (v1.1 生成)
└── README.md
```

## 启动 (本地开发)

### 前置

1. **微信开发者工具**: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2. **AppID 已配**: `wx203abf07e1ee4707` (在 `project.config.json`)

### 步骤

1. 打开微信开发者工具 → 导入项目
2. 项目目录: `yueji-miniprogram-app/`
3. AppID: 选「小程序」 → 选已注册 AppID `wx203abf07e1ee4707`
4. 项目名: `悦济`
5. 工具**自动检测** `cloudfunctions/` → 提示「检测到云开发项目, 是否关联」→ 选「是」
6. 工具栏「编译」Ctrl+B → 模拟器看主页
7. 工具栏「预览」→ QR 码 → 微信扫码 → **真机看 7 tab**

## 云开发开通 (生产部署前必做)

1. 微信开发者工具顶部 → 「云开发」 → 「开通」
2. 创建新环境:
   - 环境名: `yueji-prod` (生产) + `yueji-dev` (开发)
   - 付费: 「按量付费」(免费 4 个云函数 + 2GB 数据库, 够 MVP)
3. 拿到 envId (形如 `yueji-prod-xxxxx`)
4. 替换 `pages/4_镜中/4_镜中.js` 中 `wx.cloud.init({ env: 'yueji-prod' })` 的 envId
5. 创建数据库集合:
   - `yueji_messages` (聊天记录)
   - `yueji_crisis_logs` (危机日志)
   - 权限: 「仅创建者可读写」
6. 部署云函数:
   - 右键 `cloudfunctions/chat/` → 「上传并部署: 云端安装依赖」
7. 配置 AMAX 环境变量 (云函数 → chat → 配置 → 环境变量):
   - `AI_PROVIDER = amax` (默认)
   - `AI_MODEL = deepseek-v3`
   - `AI_BASE_URL = https://ai.amaxsmp.com/v1`
   - `AI_API_KEY = sk-xxx` (从 AMAX 用户中心拿)

## 7 tab 架构 (完整可跑)

| 顺序 | tab | 文件 | 内容 | 严守 |
|---|---|---|---|---|
| 0 | 启动页 | `pages/0_启动页/` | 2 秒启动, 「镜中, 是正在成为自己的你」 | ✓ |
| 1 | 经 | `pages/1_每日一经/` | 30 篇经典 (周易/道德经/黄帝内经/清静经), dayOfYear seed | ✓ 不宣称医疗 |
| 2 | 汤 | `pages/2_每日一汤/` | 9 体质 × 30 汤品, 王琦体质 | ✓ 9 体质仅作参考 |
| 3 | 共修 | `pages/3_共修堂/` | 3 任务 (经/汤/自评) 不打卡 | ✓ 社群 v1.1 |
| 4 | 镜中 | `pages/4_镜中/` | 4 滑块 + 30 天曲线 + **6 对话 (云函数 AMAX/CloudBase 兜底)** + 信 | ✓ 主观自评, 不识别情绪 |
| 5 | 我的 | `pages/5_我的/` | 严守声明 + 重置 + 隐私 | ✓ |
| 6 | 画像 | `pages/6_人格画像/` | **6 tab 完整**: MBTI/八字/星盘/PHQ-9/GAD-7/TIZHI | ✓ 量表不诊断 |
| 7 | 音 | `pages/7_悦济之音/` | 5 滋养曲风 + InnerAudioContext 真实音频 | ✓ 滋养不治疗 |

## 调性 (跟心颜 Streamlit 一致)

- **主色**: 暖米色 `#fdfaf6`
- **点缀**: 朱砂红 `#a85a3e` (印章感)
- **5 滋养曲风色**: 青绿/暖橙/浅蓝/暖黄/暖红
- **字体**: PingFang SC / Microsoft YaHei / Source Han Sans SC (CJK fallback)
- **slogan**: "镜中, 是正在成为自己的你"

## 严守 (P0, 全栈预审通过)

- ❌ **8 禁用词 0 出现**: 治疗/改善/缓解/治愈/祛斑/减肥/处方/医美
- ❌ **营销词 0 出现**: 美颜/美白/瘦脸/营销/广告
- ❌ **客观识别 0**: 不识别情绪/皮肤状态
- ✅ **主观自评**: 心情/精力/睡眠/肌肤 4 滑块
- ✅ **危机热线**: 12356 全国心理援助热线 (云函数层自动检测)
- ✅ **不挂祺臻**: 独立 AppID + 独立云环境 + 独立 KB + 独立 AMAX 路由
- ✅ **关 App 即清**: 镜中数据存本地, 清空 = 隐私保护

## AMAX 路由 (关键)

`cloudfunctions/chat/index.js` 复用祺臻 v6.2 架构 (来自 `qi_wechat/cloudfunctions/chat/index.js`):

```js
// 6 类对话角色 prompt (悦济专属, 替代祺臻 6 心理疗法)
const ROLE_PROMPTS = { still, company, hanyang, tongzhou, gongxiu, yueji };

// provider=amax (默认 deepseek-v3) + provider=amax-fallback (失败回退 CloudBase)
const provider = process.env.AI_PROVIDER || "amax";
const modelName = process.env.AI_MODEL || "deepseek-v3";
const baseUrl = process.env.AI_BASE_URL || "https://ai.amaxsmp.com/v1";

// 8 禁用词预审 (云函数层, 拦截 AMAX 输出)
if (!validateText(content)) {
  content = "悦济严守: 抱歉, 我重新组织一下语言。深呼吸一次, 我们再继续。";
}

// 危机词 → 12356
if (detectCrisis(user_input)) {
  return { crisis: true, content: "我们注意到您可能正在经历困难时期。悦济是生活陪伴, 无法替代专业支持。请拨打 12356..." };
}
```

**严守在云函数层, 不在前端**: AMAX 调用**不传 openid/nickname**, 只传「对话类型 + 历史」 → 严守「滋养不治疗」。

## 跟 Streamlit prototype 关系

- Streamlit: https://xinyan.streamlit.app (Cloud, 1-3 分钟重部署)
- 微信小程序: 跟 Streamlit **完全独立**工程, 复用 80% 数据 (经文/汤品/音乐规范)
- v1.0 微信小程序**完整可跑**: 7 tab + 30 经文 + 30 汤品 + 6 类对话 (云函数 + 静态兜底) + 4 滑块 + 30 天曲线 + 5 滋养曲风 + 6 tab 量表

## 待 user 拍板 (PRD v1.0)

1. **AMAX API key**: 从 AMAX 用户中心拿 sk-xxx
2. **云环境 envId**: 开通后拿, 替换 `pages/4_镜中/4_镜中.js` 中 `wx.cloud.init`
3. **5 段音乐源**: 现有 CD (吴慎) vs Suno/Udio 生成 vs 混合 (v0.7.1.9 已 v1.0 规范, v1.1 接)

## 已知限制 (v1.0)

- tabBar icons (`assets/tab_*.png`) 暂未生成, 微信开发者工具会**自动用方块占位** (不影响功能)
- 6 张山水国画 + 9 张食材国画暂未接云存储 (v1.1 接, 暂用文字描述)
- 共修堂社群 v1.1 上线 (当前 3 任务 UI 占位)
- 海报 HTML 路线 v1.1 上线 (跟 Streamlit r6-r8 同源)

## v1.1 路线 (4-6 周)

- CloudBase 全部接入 (云函数 + 数据库 + 存储)
- 海报 HTML 路线 + 15 张国画上云存储
- 共修堂社群 (心颜 → 共济, 哲学第 4 条)
- 5 段音乐 v1.0 规范 (T/CRHA036—2024 + 心理声学 8 维)
- 微信 openid 一键登录 (独立, 不跟祺臻同账号)
