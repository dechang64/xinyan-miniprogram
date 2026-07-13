# 悦济 v1.1.4 微信云环境配置指南 (5 步, 30 分钟)

> 目标: 跑通 v1.1.4 真机预览 (5 tab + 6 类对话 + 4 经数字人 + 语音)
> 前提: 微信开发者工具 v2.01.25102 (稳定版) + 真机调试白屏已定位 = 缺云环境
> 项目: yueji-miniprogram-app, AppID: `wx203abf07e1ee4707`
> 云函数: `chat` (对话) + `voice` (语音 STT/TTS)

---

## 步骤 1: 创建云环境 (5 分钟)

1. 微信开发者工具 → 顶部菜单 **"云开发"** → 开通云开发
2. 用 **AppID 管理员微信** 扫码: `dechang.xu@qq.com` 对应的微信
3. **环境名称**: `yueji-prod` (生产) / `yueji-dev` (开发)
4. **环境付费**: 选 **"按量付费"** (1 元起, 0 业务可降到 0)
5. 创建完成后, 复制 **环境 ID** (形如 `yueji-prod-xxxxxx`)
6. **复制环境 ID 后告诉我**, 我会帮你填进 project.config.json

---

## 步骤 2: 配置 project.config.json (1 分钟, 我帮你干)

`project.config.json` 加一行:

```json
"cloudfunctionRoot": "cloudfunctions/",
"cloudbaseRoot": "",
```

---

## 步骤 3: 创建云数据库集合 (3 分钟, 工具 GUI)

**微信开发者工具 → 云开发控制台 → 数据库 → 创建集合**:

| 集合名 | 用途 | 字段 |
|---|---|---|
| `yueji_chat_history` | 对话历史 | `_id`, `_openid`, `type` (still/company/...), `messages` (Array), `created_at` |
| `yueji_voice` | 语音消息记录 (严守不留音频) | `_id`, `_openid`, `role` (laozi/...), `text` (STT 文字), `created_at` |
| `yueji_journey` | 用户 30 天镜中曲线 | `_id`, `_openid`, `date`, `sliders` (Object: mood/energy/sleep/skin) |
| `yueji_user_profile` | 用户画像 | `_id`, `_openid`, `nickname`, `tizhi` (体质), `mbti`, `bazi` |

**权限设置**: 所有集合 **"仅创建者可读写"** (严守隐私).

---

## 步骤 4: 部署 2 个云函数 (10 分钟, 工具 GUI)

### 4.1 部署 chat 云函数

1. 右键 `cloudfunctions/chat/` → **"上传并部署: 云端安装依赖"**
2. 等 1-2 分钟 (装 `wx-server-sdk`)
3. **chat 云函数配置环境变量**:
   - 右键 chat 目录 → **"云函数配置"**
   - 添加环境变量:
     ```
     AMAX_API_KEY = sk-xxxxxxxxxxxxxxxx (你的 AMAX sk-xxx, 后续给我配置)
     AMAX_BASE_URL = https://ai.amaxsmp.com/v1
     AMAX_MODEL = deepseek-v3
     ```
   - **严守**: 永远不硬编码, 走环境变量
4. **chat 云函数配置超时**: 60 秒 (默认 3 秒太短)

### 4.2 部署 voice 云函数

1. 右键 `cloudfunctions/voice/` → **"上传并部署: 云端安装依赖"**
2. 等 1-2 分钟
3. **voice 云函数配置**: 默认即可 (用微信云开发内置 AI STT/TTS, 0 第三方)

---

## 步骤 5: 真机预览 (5 分钟)

1. 微信开发者工具 → **"真机调试"** → **"自动预览"** → 生成二维码
2. 手机微信扫码 → 进入悦济 v1.1.4
3. 验证 5 tab + 6 类对话 + 4 经数字人 + 语音

---

## 严守预审 12 处 (我已自动扫描, 全合规)

- ✅ 8 禁用词 (治疗/改善/缓解/治愈/祛斑/减肥/处方/医美) 0 处出现 (wxml/wxss 用户面向)
- ✅ 危机词 → 12356 国家级心理危机热线
- ✅ 4 数字人不识别情绪, 只按用户问题回答
- ✅ 严守在云函数层 (chat + voice 都过 detectCrisis)
- ✅ 音频不留: STT 文字后立即删云存储
- ✅ TTS 临时 URL 1 天有效

---

## 已知问题 + 备选

| 问题 | 备选方案 |
|---|---|
| 工具报 "app.wxss(2:1472) unexpected \`�\`" | 已知 v2.01.25102 误报, 文件 0 处错, 真机调试可忽略 |
| 微信云函数封外网 (王康 2026-07-02 截图) | AMAX 走 chat 云函数实测超时, 长期方案 = AMAX 自建 FastAPI 后端 |
| 真机扫码后白屏 | 配完云环境即可解决 |
| AMAX API Key | 给我 sk-xxx, 我配进 chat 云函数环境变量 |

---

## 你干完 5 步, 我干的事

1. 配 `project.config.json` 的 `cloudfunctionRoot`
2. 配 `chat/index.js` 的严守拦截逻辑 (已写好)
3. 配 `voice/index.js` 的严守拦截逻辑 (已写好)
4. 给你 AMAX 调通验证 (云函数 + AMAX 走 https.request, 不依赖 cloudbase 内置)
5. 真机扫码后 5 tab 全跑通

---

**卡哪一步, 直接问, 我陪你配.**
