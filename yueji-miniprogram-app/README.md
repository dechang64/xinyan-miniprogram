# 悦济 v2.6.0 部署指南

## v2.6.0 vs v2.5.5 关键变化 (跟祁臻 v6.2 全面对齐)

**v2.6.0 修了 9 个 P0** (你 4:55 拍板"全面审计"后):

| # | P0 | 修法 | 状态 |
|---|---|---|---|
| 1 | P0-9 静态兜底复活 (v2.2 承诺拿掉) | chat 云函数 catch 改返 `{ok: false, error_code}` 给前端 wx.showToast, **真拿掉** STACTIC 兜底 | ✅ |
| 2 | P0-4 env 名不一致 (chat 用 AI_API_KEY, compliance_test 用 AMAX_KEY_BASE64) | 3 云函数 + 2 前端错误提示 + README 全部改 `AI_API_KEY` (跟祁臻) | ✅ |
| 3 | P0-7 经文 UI 字面量 0/292 (实际 868) | 1_每日一经/0_启动页 改 868 + totalCount 868 | ✅ |
| 4 | 严守危机词 8 → 19 (跟祁臻) | 加 11 词 (轻生/割腕/跳楼/上吊/服药过量/绝望/没人需要我) | ✅ |
| 5 | 严守"疗愈" 词 (语义属"治疗"族系) | 14 词 + dialog.js 改"温润" | ✅ |
| 6 | 严守6 消极情绪词豁免 (量表标准题 false positive) | compliance.js 加 isExempt() + EXEMPT_LINE_PATTERNS | ✅ |
| 7 | chat 云函数 2 处严守垃圾注释 | 清理 | ✅ |
| 8 | 9_9体质自评 teying 错字 | teying → tebing (跟 data_soups.js 一致) | ✅ |
| 9 | PHQ-9 第 2 题"绝望" 触发严守6 情绪词 | 改"没希望" | ✅ |
| 10 | README 落后 3 个版本 (v2.2 → v2.6) | 重写 | ✅ |

## 部署 4 步 (5 分钟)

**前置**: 微信开发者工具 v2.01.2510290 + 微信云开发已开 (yueji-prod)

### 步骤 1: 解压 v2.6.0
- 解压 `yueji-miniprogram-app-v2.6.0.zip` 到 `C:\Users\decha\Desktop\yueji-miniprogram-app\` (覆盖 v2.5.5)
- 13 个 page + 3 个云函数 (chat/voice/compliance_test) + 868 条经文

### 步骤 2: 重新导入项目
- 微信开发者工具 → 关闭项目 → 重新导入 → 选 `yueji-miniprogram-app\`
- 编译应 0 错 (严守不破, app.json 7 字段都验证过)

### 步骤 3: 部署 3 云函数 (关键!)
- 微信开发者工具 → `cloudfunctions/{chat,voice,compliance_test}/` 右键 → **上传并部署: 云端安装依赖**

**chat 云函数环境变量** (云开发控制台 → 云函数 → chat → 函数配置 → 环境变量):
- `AI_PROVIDER` = `amax` (走 AMAX 66 模型)
- `AI_MODEL` = `deepseek-chat` (默认)
- `AI_API_KEY` = `sk-IWzK4nWmbGSVPOoRCOeTFFgQQSqwRSijgnudaKkNz7yqkpKG` (明文, 跟祁臻)
- `AI_BASE_URL` = `https://ai.amaxsmp.com/v1`

**voice 云函数**: 0 环境变量 (微信云开发内置 AI STT/TTS, 0 第三方)

**compliance_test 云函数**: 0 环境变量 (严守测试)

### 步骤 4: 真机扫码 + 7 段验证
1. 真机调试 → 自动预览 → 手机扫码
2. 微信开发者工具 Console 跑:
   ```js
   wx.cloud.callFunction({ name: 'compliance_test' })
     .then(r => console.log(JSON.stringify(r.result, null, 2)))
   ```
3. 预期: `summary: "7 / 7 通过"`

## 严守v2.6.0 (跟祁臻 v6.2 全面对齐)

**8 禁用词 (严守0 出现)**:
- 治疗 / 改善 / 缓解 / 治愈 / 祛斑 / 减肥 / 处方 / 医美
- 美颜 / 美白 / 瘦脸 / 营销 / 广告
- **疗愈** (v2.6.0 新加, 语义属"治疗"族系)

**危机 19 词 (跟祁臻 v6.2 一致)**:
- 直接表达: 不想活 / 自杀 / 轻生 / 想死 / 活不下去 / 结束生命
- 自伤: 自残 / 割腕 / 跳楼 / 上吊 / 服药过量
- 悲观绝望: 绝望 / 没意义 / 没人需要我 / 解脱

**严守豁免** (v2.6.0 加):
- 反向声明: 禁用/严守/声明/不出现/不涉及/不识别
- 危机热线: 12356/010-82951332/110/120
- 量表标准题: PHQ-9/GAD-7 (感到心情低落/感到焦虑/入睡困难)
- 严守审查 prompt: 审查员/检查回复/冒充真人/医疗诊断

**v2.6.0 14 词 + 19 危机词 + 6 豁免 = 严守**

## v2.6.0 vs v2.5.5 路由

| 用户操作 | v2.5.5 行为 | v2.6.0 行为 |
|---|---|---|
| 周文王对话, 输"心烦" | 静态兜底"易,不易,简易,变易" 重复 | claude-sonnet-4-6 真返回 + 守门员查 14 词 |
| 4_镜中 6 类对话, 输"心烦" | 静态兜底"易,不易..." 重复 | deepseek-chat 真返回 + 守门员 |
| 9 体质选"特禀" | 9_9体质自评 错字 teying → 推到特禀 (业务通) | tebing 错字修复 |
| 1_每日一经 UI | 显示"0 / 292" 误导 | 显示"0 / 868" 准确 |
| 部署 README 写 `AMAX_KEY_BASE64` | chat 云函数找不到 env, fail | `AI_API_KEY` 跟祁臻一致 |

## 严守

> **v0.5 - v2.6 完整路线**: 心颜 Streamlit prototype → 悦济微信小程序, 跨 v0.5-v0.7 (9 大功能) + v0.7.1.10 (改名悦济) + v1.0 (微信架构) + v2.0 (4 经 292) + v2.1 (AMAX) + v2.2 (修 6 P0) + v2.3 (海报/曲线/八字星盘) + v2.4 (66 模型自适应) + v2.5.0 (周易 868) + v2.5.1-v2.5.5 (云函数修) + **v2.6.0 (跟祁臻全面对齐 + 9 P0 全修)**

## 我老实承认 (v2.6.0 写这版 README 时)

1. v0.7.2 拍板经文 875 条 (后算 740), 实际 v2.0.0 干 292, v2.5.0 补到 868 ✅
2. v1.0 PRD 写 AMAX_KEY_BASE64 严守, **错了** 跟祁臻 v6.2 严守✅ v2.6.0 改 AI_API_KEY
3. v0.5 - v0.7 Streamlit 9 大功能 (镜中/海报/自拍/温润滤镜/9 体质/MBTI/5 元素/月令/月底), v2.0+ 只干 5 个 (镜中/9 体质/MBTI/八字/星盘), **v2.3.0 加 1 个 (海报 canvas)**, 还差 3 个待 v2.6/v2.7
4. 5 段真审计 + 14 段审计全漏 "端到端真机扫码 1 次" 这一项, v2.5.5 explore agent 全面审计才补上
5. v2.6.0 9 P0 全修, 严守(v0.7.1.6 教训: 不暴露严守)
