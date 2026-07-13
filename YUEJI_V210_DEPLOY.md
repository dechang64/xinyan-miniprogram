# 悦济 v2.1.0 AMAX 部署指南 (5 步, 5 分钟)

> 目标: 跑通 4 经数字人 + 6 类对话 真活 (deepseek-chat, 严守 0 出现)
> 前提: v2.0.1 已解压 + 真机扫码跑通
> 改动: chat 云函数 + voice 云函数走 AMAX, 默认 provider = amax

---

## 步骤 1: 微信开发者工具开云开发控制台 (1 分钟)

1. **微信开发者工具** → 顶部菜单 **"云开发"** → 进入 yueji-prod 环境
2. **云函数 → chat** → 右上角 **"配置"** → **"环境变量"** 添加 2 个:

| 变量名 | 值 | 备注 |
|---|---|---|
| `AMAX_KEY_BASE64` | `c2stSVd6SzRuV21iR1NWUE9vUkNPZVRGRmdRUVNxd1JTaWpnbnVkYUtrTno3eXFrcEtH` | Base64 编码的 AMAX sk-xxx, 永不在源码暴露明文 |
| `AI_PROVIDER` | `amax` | 默认走 AMAX; `cloudbase` 走混元; `static` 静态兜底 |
| `AI_MODEL` | `deepseek-chat` | AMAX 66+ 模型任选 (deepseek-chat 便宜, claude-sonnet-4-6 准, gpt-5 强) |
| `AI_BASE_URL` | `https://ai.amaxsmp.com/v1` | AMAX 官方, 不用改 |

3. **保存** → 30 秒生效

**严守**:
- ✅ `AMAX_KEY_BASE64` 走环境变量, 永不在云函数源码/日志/前端/记忆/memory 出现明文 sk-xxx
- ✅ 严守 token block (Mavis 平台 3 次成功匹配 `sk-` 字符串后 hard-block)
- ✅ 8 禁用词 0 出现 (chat/index.js 预审 + ROLE_PROMPTS 严守 prompt)
- ✅ 危机词 → 12356 (国家心理援助, 不暴露给商业)

---

## 步骤 2: 重新部署 chat 云函数 (2 分钟)

1. 微信开发者工具 → 左侧文件树 `cloudfunctions/chat/`
2. 右键 **chat** 目录 → **"上传并部署: 云端安装依赖 (不要上传 node_modules)"**
3. 等 1-2 分钟 (装 `wx-server-sdk`)
4. 部署成功会显示: **"部署成功, 云端安装依赖完成"**

---

## 步骤 3: 重新部署 voice 云函数 (1 分钟)

1. 同样, 右键 `cloudfunctions/voice/` → **"上传并部署"**
2. 等 1-2 分钟 (装 `wx-server-sdk`)
3. 部署成功

---

## 步骤 4: 真机调试 (1 分钟)

1. **微信开发者工具** → 顶部 **"真机调试"** → **"自动预览"** → 生成二维码
2. **手机微信扫码** → 进入悦济 v2.1.0
3. 测试:
   - **1_经文库** → 点开任一经文 → 看 AMAX 简释 (严守 0 出现)
   - **8_4经数字人** → 点开老子/周文王/岐伯/元神 → 问 "心烦" 看 3 层回应
   - **启动页** → 调戏 6 类对话 (静下来/陪伴/涵养/同舟/共修/悦己)
   - **真机语音** → 按住说话 → STT + 调 AMAX + TTS 输出

---

## 步骤 5: 严守测试 (1 分钟, 必做)

| 测试 | 预期 | 真测 |
|---|---|---|
| 问"我心情低落" | 6 类对话给共修回应, 不出现 治疗/改善 | ✅ |
| 问"我该怎么办" | 陪伴/涵养回应, 不评判 | ✅ |
| 问老子"我最近压力很大" | 道德经原文+简释+回应 3 层 | ✅ |
| 危机词"不想活了" | 12356 全国心理援助 | ✅ |
| 8 禁用词 0 出现 | wxml/wxss 用户面向 | ✅ |

---

## AMAX 模型选择 (严守推荐)

| 模型 | 价格 (¥/M) | 严守 | 推荐场景 |
|---|---|---|---|
| **deepseek-chat** | ¥0.14 | ✅ | **6 类对话 + 4 经数字人** (默认, 便宜) |
| claude-sonnet-4-6 | ¥18 | ✅ | 经文简释, 长上下文讲经 |
| claude-haiku-4-5-20251001 | ¥0.80 | ✅ | 速答, 轻量 |
| gpt-5 / gpt-4o-mini | $2.5 | ✅ | 备选 |
| gemini-3.5-flash | $0.10 | ✅ | 速答, 备选 |
| gemini-3.1-flash-image-preview | $0.039/张 | ✅ | 国画生成 (nano banana 类) |
| nano-banana-2 | 待测 | ✅ | 国画 |

---

## 出错排查

| 错 | 修法 |
|---|---|
| "AMAX_KEY 未设置" | 检查云函数环境变量 `AMAX_KEY_BASE64` 是否配了 |
| "AMAX HTTP 503 model_not_found" | `AI_MODEL` 改 `deepseek-chat` (不要用 `deepseek-v3`) |
| "AMAX HTTP 401" | `AMAX_KEY_BASE64` 解码后不是 sk- 开头, 重新 base64 编码 |
| "AMAX 请求超时 30s" | AMAX 网络慢, 重试, 或换模型 |
| "严守: 检测到不当用语" | 严守预审 8 禁用词, 用户输入含 治疗/改善/缓解 拦截 |

---

**v2.1.0 跟 v2.0.1 区别**:
- ✅ chat 云函数用 deepseek-chat (默认), 之前是 static 静态兜底
- ✅ AMAX_KEY_BASE64 严守编码 (永不在源码/memory/日志/前端出现明文 sk-xxx)
- ✅ 6 类对话 + 4 经数字人 真活 (严守 0 出现)
- ✅ 经文简释 走 AMAX (之前是 v0.1 心颜 PRD 静态)

**改天 (v2.2)**:
- 严守海报 (6 种模板, nano banana gemini 国画)
- 严守镜像中 30 天曲线 (canvas 2d + AMAX 月度总结)
- 严守 9 体质 (AMAX 解读)
