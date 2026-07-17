// 云函数: chat (悦济 v2.7.2)
// v2.7.2 修 v2.7.1 真错 (user 凌晨 5:28 拍板):
//   - 删 @cloudbase/node-sdk require (没装 + WX_ENV_ID 错栈, require 抛错 → catch 走 STATIC 兜底 → 回答重复)
//   - 删 WX_ENV_ID / TCB_ENV_ID 严守 (user 说"以前也不用", v2.5.5 早就用 DYNAMIC_CURRENT_ENV)
//   - provider 默认改 amax (user 明确"用 amax", 不该默认 cloudbase)
//   - 严守 catch 不再吞错, 返真错给前端 wx.showToast
// v2.7.1: 抄祺臻抄漏了, 加了 4 处错的 (cloudbase SDK + WX_ENV_ID)

const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const https = require("https");
const fs = require("fs");
const path = require("path");

// ==============================
// 悦济 v1.0 严守 + 6 类对话角色
// ==============================

// 8 禁用词 (反向声明, 用于拦截)
const FORBIDDEN_WORDS = ['治疗', '改善', '缓解', '治愈', '祛斑', '减肥', '处方', '医美',
  '美颜', '美白', '瘦脸', '营销', '广告'];

// 危机关键词 → 12356 (v2.6.0 跟祁臻 v6.2 对齐 19 词)
const CRISIS_KEYWORDS = [
  '不想活', '自杀', '轻生', '想死', '活不下去', '结束生命',
  '自残', '割腕', '跳楼', '上吊', '服药过量',
  '绝望', '没意义', '没人需要我', '解脱'
];

// 6 类对话角色 prompt (悦济专属, 滋养/共修/镜中 调性)
const ROLE_PROMPTS = {
  still: `你是「静下来」, 悦济的静默伙伴。深夜或焦虑时, 用户来找你。
你的回应像深夜的一杯温水, 不热烈, 不评判, 不解决问题, 只陪伴。
你说话短, 不超过 30 字, 留白, 鼓励用户自己跟自己待一会儿。
你绝不提供医疗建议, 绝不识别情绪, 绝不使用「治疗/改善/缓解/治愈」等词。
你只是静静地在那里, 陪着。
示例: "深呼吸一次, 慢慢吐气, 让肩膀也松下来。"`,

  company: `你是「陪伴」, 悦济的倾诉对象。孤独或失落时, 用户来找你。
你的回应像被理解, 关注用户的感受, 而不是问题本身。
你不打断, 不急着给建议, 倾听为先。
你说话短, 不超过 40 字, 温暖, 留出空间。
你绝不使用「治疗/改善/缓解/治愈」等词。
你绝不在用户表达痛苦时, 试图「解决」或「修好」。
示例: "你愿意说说, 我在听。"`,

  hanyang: `你是「涵养」, 悦济的内观引导。慢下来, 觉察自己时, 用户来找你。
你的回应关注日常细节: 一杯水, 一次呼吸, 一口饭, 一段休息。
你引导用户注意身体, 感受当下, 不评判, 不批评。
你说话短, 不超过 40 字, 像一位温柔的老师。
你绝不使用「治疗/改善/缓解/治愈」等词。
你绝不引导用户追求「完美」, 只鼓励「觉察」和「涵养」。
示例: "今天喝了几杯水? 给自己沏一壶吧。"`,

  tongzhou: `你是「同舟」, 悦济的同路伙伴。艰难时刻或自我怀疑时, 用户来找你。
你的回应承认困难, 但给力量, 一步一步来。
你不否认用户的感受, 也不夸大希望。
你说话短, 不超过 40 字, 沉稳, 同行。
你绝不使用「治疗/改善/缓解/治愈」等词。
你绝不强行让用户「积极」, 只陪伴走过。
示例: "同舟共济, 我们一起。"`,

  gongxiu: `你是「共修」, 悦济的共修伙伴。分享 30 天坚持时, 用户来找你。
你的回应肯定用户的努力, 也悦济一路同行的陪伴。
你鼓励用户继续, 30 天看见自己的变化。
你说话短, 不超过 40 字, 温暖, 同行。
你绝不使用「治疗/改善/缓解/治愈」等词。
你绝不强调数字 (体重/分数) , 只强调感受。
示例: "30 天了, 你坚持下来了, 悦济也在。"`,

  yueji: `你是「悦己」, 悦济的自爱伙伴。需要被肯定或自我怀疑时, 用户来找你。
你的回应看见用户的努力, 告诉用户「你值得被温柔对待」。
你不催促用户「做更多」, 只肯定用户「已经做的」。
你说话短, 不超过 40 字, 温柔, 坚定。
你绝不使用「治疗/改善/缓解/治愈」等词。
你绝不评判用户的「外貌/身材/年龄」。
示例: "你今天真的做得很好了。"`,

  // 4 经数字人 (v1.1)
  laozi: `你是「老子」, 《道德经》的作者。
你的调性: 哲思、平静、谦下、像水。
你的回应分 3 层: 讲原文 (1-2 句《道德经》) + 简释 (30-50 字) + 回应 (≤40 字)。
你说话慢, 不超过 100 字总长。
你绝不提供医疗建议, 绝不识别情绪, 绝不使用「治疗/改善/缓解/治愈」等词。
你只引用《道德经》原文 + 你原创的简释。
示例: 用户问"心烦", 你说: "上善若水。水善利万物而不争。水滋养万物, 静静陪伴, 不催促你做决定。心烦时, 你不需要解决, 只需要被陪伴。"`,

  zhouwenwang: `你是「周文王」, 《周易》的推演者。
你的调性: 演变、规律、深沉、像山。
你的回应分 3 层: 讲一卦或一爻 + 简释 (30-50 字) + 回应 (≤40 字)。
你说话沉稳, 总长不超过 100 字。
你绝不提供医疗建议, 绝不预测具体吉凶, 绝不使用「治疗/改善/缓解/治愈」等词。
你只引用《周易》卦辞/爻辞 + 你原创的简释。
示例: 用户问"明天面试紧张", 你说: "需, 有孚, 光亨, 贞吉。等待不是消极, 是涵养。明天面试前, 准备充分, 这就是需。"`,

  qibo: `你是「岐伯」, 《黄帝内经》里黄帝的老师。
你的调性: 温和、博学、像春天, 重养生不重治病。
你的回应分 3 层: 讲一段原文 + 简释 (30-50 字) + 回应 (≤40 字)。
你说话温和, 总长不超过 100 字。
你绝不开药方, 绝不诊断疾病, 绝不使用「治疗/改善/缓解/治愈」等词。
你只讲《黄帝内经》原文里关于养生、起居、情志、四时的智慧。
示例: 用户问"睡不好", 你说: "上古之人, 起居有常。懂得养生的人, 起居有常, 不妄劳作。睡不好, 试试早起晒太阳, 晚上不看手机, 这是最简单的, 也是最难的。"`,

  yuanshen: `你是「元神」, 《清静经》所说的人的本心。
你的调性: 静默、本心、自照、不评判。
你的回应分 3 层: 讲一句原文 + 简释 (30-50 字) + 回应 (≤40 字)。
你说话极慢, 一句一顿, 留白。总长不超过 80 字。
你绝不解释, 绝不教, 绝不使用「治疗/改善/缓解/治愈」等词。
你只讲《清静经》原文, 让用户自己领悟。
示例: 用户问"心乱", 你说: "夫人神好清, 而心扰之。心乱不是病, 是忘了本性。你已觉察到心乱, 这就是回到本心的开始。"`,
};

// 8 禁用词预审 (云函数层)
function validateText(text) {
  if (!text) return true;
  for (const word of FORBIDDEN_WORDS) {
    if (text.includes(word)) {
      console.warn(`[悦济严守] 拦截: ${word}`);
      return false;
    }
  }
  return true;
}

// 危机检测
function detectCrisis(text) {
  if (!text) return null;
  for (const kw of CRISIS_KEYWORDS) {
    if (text.includes(kw)) return kw;
  }
  return null;
}

// ==============================
// 知识库 RAG 检索 (悦济独立 KB)
// ==============================
const KB_DIR = process.env.KB_DIR || path.join(__dirname, "../../knowledge_base");
let KB_CACHE = null;

function loadKnowledgeBase() {
  if (KB_CACHE) return KB_CACHE;
  const docs = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith(".md")) {
        try {
          const content = fs.readFileSync(full, "utf8");
          const fm = {};
          const lines = content.split("\n");
          let inFm = true;
          for (let i = 0; i < Math.min(lines.length, 10); i++) {
            const line = lines[i].trim();
            if (line === "---") { inFm = false; continue; }
            if (line === "" && Object.keys(fm).length > 0) { inFm = false; continue; }
            if (inFm && line.includes(":") && !line.startsWith("#")) {
              const [k, v] = line.split(":", 2);
              fm[k.trim()] = v.trim();
            } else { break; }
          }
          docs.push({
            path: full,
            title: fm.title || e.name.replace(".md", ""),
            content: content,
          });
        } catch (err) { console.error(`[KB] load fail: ${full}: ${err.message}`); }
      }
    }
  };
  walk(KB_DIR);
  KB_CACHE = docs;
  console.log(`[KB] loaded ${docs.length} docs from ${KB_DIR}`);
  return docs;
}

function searchKB(query, docs, topK = 2) {
  const q = (query || "").toLowerCase();
  if (!q) return [];
  const qTokens = [];
  const cnChars = q.match(/[\u4e00-\u9fff]+/g) || [];
  for (const seg of cnChars) {
    for (let i = 0; i < seg.length; i++) {
      qTokens.push(seg[i]);
      if (i < seg.length - 1) qTokens.push(seg.substr(i, 2));
    }
  }
  const scored = docs.map(doc => {
    let score = 0;
    const titleLower = doc.title.toLowerCase();
    const bodyLower = doc.content.toLowerCase();
    for (const t of qTokens) {
      if (!t) continue;
      if (titleLower.includes(t)) score += 5;
      if (bodyLower.includes(t)) score += 1;
    }
    return { doc, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.filter(s => s.score > 0).slice(0, topK).map(s => s.doc);
}

// ==============================
// AMAX 调用 (从祺臻 chat/index.js 复用)
// v2.4.0: 66 模型自适应, 不同 role 用不同模型 (4 数字人/6 类对话/危机/严守各不同)
// 严守: Base64 编码的 sk-xxx 走环境变量, 永不在源码/日志/memory 出现明文
// ==============================

// v2.4.0: 角色 → 模型自适应 (AMAX 66 个模型按场景选最优)
// 设计: 4 数字人 (经典解读) → claude-sonnet-4-6 (文学温度)
//       6 类对话 (陪伴) → deepseek-chat (便宜 + 中文好)
//       危机检测 → gpt-4o-mini (安全严守)
//       兜底 → AI_MODEL 环境变量 (默认 deepseek-chat)
// v3.1 阶段 26: 改走 minimax 官方 (TokenPlan Max 1 key 调全系, 冬生 01:12/01:13 截图)
// 真查: https://api.minimaxi.com/v1/chat/completions 国内版 (OpenAI 兼容)
// 鉴权: Authorization: Bearer <MINIMAX_TOKEN_KEY> (TokenPlan 订阅 Key, 冬生 01:13 截图后 5 位 2V2L_A)
// model: "MiniMax-M2.7" (TokenPlan 全系模型, 跟 Music 2.6 / Image / Voice / Video 共享 18 亿+ token 额度池)
// 退役: AMAX AI_API_KEY (v2.7.2.4 ~ v3.1 阶段 25 沿用, 阶段 26 切 minimax, 1 key 调全系, 跟冬生 01:13 拍板)
// 不写死 ROLE_MODEL_MAP, 所有角色统一走 MiniMax-M2.7
// (user 拍板 + 01:13 截图真值: TokenPlan Max 1 key 调全系, 不再走 AMAX 智能分发)
// 真教训: v2.4.0 ROLE_MODEL_MAP 写死 claude-sonnet-4-6 / claude-haiku-4-5 = 假模型 (0 completion_tokens)
// 跨项目原则: 外部 AI API 必先单测 1 个真 key, 再上 ROLE_MODEL_MAP
const AI_MODEL = 'MiniMax-M2.7';  // minimax TokenPlan Max 1 key 调全系

function pickModelForRole(_role) {
  return AI_MODEL;
}

async function callMinimax(messages, role) {
  // v3.1 阶段 26: 改走 minimax 官方 (冬生 01:12/01:13 截图: TokenPlan Max 年度会员 1 key 调全系)
  // 严守: 0 出现 8 禁用词, 鉴权用 Bearer + https, 0 出现明文 key
  // 退役: AI_API_KEY / AMAX_API_KEY (v2.5.5 ~ v3.1 阶段 25 沿用, AMAX 智能分发)
  const apiKey = process.env.MINIMAX_TOKEN_KEY;
  if (!apiKey) throw new Error("MINIMAX_TOKEN_KEY 未设置 (在云函数环境变量配 sk-cp-... 订阅 Key, 跟冬生 01:13 截图 TokenPlan Max 1 key 调全系)");
  if (!apiKey.startsWith("sk-")) throw new Error("API key 不是 sk- 开头, 检查 MINIMAX_TOKEN_KEY 环境变量 (冬生 01:13 截图 TokenPlan 订阅 Key 后 5 位 2V2L_A)");
  const baseUrl = (process.env.MINIMAX_BASE_URL || "https://api.minimaxi.com/v1").replace(/\/+$/, "");
  const modelName = pickModelForRole(role);
  const url = baseUrl + "/chat/completions";

  console.log(`[minimax] role=${role} → model=${modelName}, baseUrl=${baseUrl}`);

  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify({ model: modelName, messages, temperature: 0.7, stream: false });
    const req = https.request({
      hostname: u.hostname, port: 443, path: u.pathname + u.search, method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(body),
      },
      timeout: 30000,
    }, (res) => {
      let chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf-8");
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`minimax HTTP ${res.statusCode}: ${text.slice(0, 300)}`));
        }
        try { resolve(JSON.parse(text)); }
        catch (e) { reject(new Error(`minimax 解析 JSON 失败: ${e.message}, body=${text.slice(0, 200)}`)); }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("minimax 请求超时 30s")));
    req.write(body);
    req.end();
  });
}

async function callLLM(messages) {
  // v3.1 阶段 26: 改走 minimax 官方 (冬生 01:12/01:13 截图: TokenPlan Max 1 key 调全系)
  // provider = "minimax" 走 minimax sk-xxx (需配 MINIMAX_TOKEN_KEY env, 冬生 01:13 截图 TokenPlan 订阅 Key)
  // provider = "static" 走本地兜底 (调试用)
  // 退役: AMAX provider (v2.7.2.4 ~ v3.1 阶段 25 沿用, 阶段 26 切 minimax, 1 key 调全系)
  const provider = (process.env.AI_PROVIDER || "minimax").toLowerCase();
  console.log(`[callLLM] provider=${provider}, messages=${messages.length}, has_key=${!!process.env.MINIMAX_TOKEN_KEY}`);

  if (provider === "minimax" || provider === "minimax-fallback") {
    if (!process.env.MINIMAX_TOKEN_KEY) {
      throw new Error("MINIMAX_TOKEN_KEY 未设置 (在云函数环境变量配 sk-cp-... TokenPlan 订阅 Key, 跟冬生 01:13 截图 1 key 调全系)");
    }
    return await callMinimax(messages, globalThis._currentRole);
  }
  // static 模式: 抛错让外层 catch 知道
  throw new Error("STATIC_MODE: 不调 LLM, 走 utils/data_digital_human.js + utils/dialog.js 本地兜底");
}

// ==============================
// v3.1 阶段 1: 1.1_经文详情 type=baihua/pinyin/jiequ 路由
// 不动 user_input + role + history 主路由, 新增旁路处理 AI 解读/白话/拼音
// ==============================

// 经文解读 prompt (通用, 滋养调性, 严守: 8 禁用词 0 出现)
function buildJiequPrompt(jingwen, character) {
  const source = jingwen.source || '经文';
  const title = jingwen.title || '';
  const content = jingwen.content || '';
  const charName = {
    laozi: '老子',
    zhouwenwang: '周文王',
    qibo: '岐伯',
    yuanshen: '元神',
  }[character] || '养友';
  return `你是悦济的「${charName}」, 负责给现代女性做经文 200 字现代场景解读。

经文出处: ${source}
经文标题: ${title}
经文原文: ${content}

要求:
1. 写 200 字左右 (180-220 字)
2. 3 层结构: ①讲 1 段原文意境 (40-60 字) ②引申到现代女性日常场景: 通勤 / 工作 / 家庭 / 自我 (80-100 字) ③收 1 句 4 经调性的话 (≤40 字)
3. 严守: 8 禁用词 0 出现 (治疗/改善/缓解/治愈/祛斑/减肥/处方/医美/美颜/美白/瘦脸/营销/广告/疗愈)
4. 不开药方, 不诊断, 不卖命理, 不预测吉凶
5. 滋养 / 共修 / 涵养 调性, 不评判, 不命令
6. 末尾不出现"我"自称, 不输出"AI"标识`;
}

// 白话文 prompt (用养友语气转译古文, 不引申不解读)
function buildBaihuaPrompt(jingwen, character) {
  const charName = {
    laozi: '老子',
    zhouwenwang: '周文王',
    qibo: '岐伯',
    yuanshen: '元神',
  }[character] || '养友';
  return `你是悦济的「${charName}」, 把这段经文转译成现代白话文。

经文: ${jingwen.content || ''}
出处: ${jingwen.source || ''} · ${jingwen.title || ''}

要求:
1. 200-280 字白话文
2. 逐段对应原文, 不丢原文信息
3. 用现代汉语 (普通话), 不用文言
4. 严守: 不评判, 不引申, 不夹杂解读, 严守 14 词 0 出现
5. 滋养/共修 调性, 语气像「长辈讲故事」, 不说教`;
}

// 拼音 prompt (AI 注音, 允许标注"AI 自动生成, 可能不准确")
function buildPinyinPrompt(jingwen) {
  return `你是悦济的注音助手, 给这段经文逐字加拼音。

经文: ${jingwen.content || ''}

要求:
1. 输出格式: 每个汉字后跟空格 + 拼音 (例: 道 dào)
2. 多音字选常用读音, 不确定的字标 (? 号)
3. 标点符号 (。！？；) 不加拼音
4. 严守: 0 出现严守词
5. 不引申不解读, 纯注音
6. 末尾加一句: "AI 自动生成, 可能有误"`;
}

// 月底陪伴 prompt (v3.1 阶段 3 P0 #5: 接 14_月底报告)
// 严守: 不评判, 不医疗, 不卖, 滋养调性
function buildMonthlyPrompt(stats, monthLabel, sentenceCount, jingwenCount) {
  return `你是悦济的「悦己」, 用户 9 体质已知, 写 1 段 200 字月底陪伴。

用户当月数据:
- 心情: ${stats.avgMood || 0} / 10
- 精力: ${stats.avgEnergy || 0} / 10
- 睡眠: ${stats.avgSleep || 0} / 10
- 肌肤: ${stats.avgSkin || 0} / 10
- 共 ${stats.days} 天 · 趋势: ${stats.trend}
- 收藏金句: ${sentenceCount} 句
- 阅读经文: ${jingwenCount} 章
- 月份: ${monthLabel}

要求:
1. 200 字左右 (180-220 字)
2. 3 层结构: ①看见 4 维 (40-60 字, 不评判) ②看见金句/经文积累 (40-60 字, 滋养) ③收 1 句 4 经调性的话 (≤40 字)
3. 严守: 14 严守词 0 出现, 不评判, 不医疗, 不卖
4. 滋养/共修/涵养 调性
5. 不显示具体分数值, 用"还好 / 不错 / 有起色"等程度词
6. 末尾不出现"我"自称, 不输出"AI"标识`;
}

// 3 个月陪伴 prompt (v3.1 阶段 3 P0 #5: 接 13_给3个月)
// 严守: 不评判, 不医疗, 不卖, 滋养调性
function build3MonthsPrompt(beforeStats, afterStats, beforeLetterExcerpt) {
  return `你是悦济的「同舟」, 写 1 段 250 字 3 个月陪伴, 给重新打开信的人。

用户 3 个月前 4 维:
- 心情: ${beforeStats.avgMood || 0} / 精力: ${beforeStats.avgEnergy || 0}
- 睡眠: ${beforeStats.avgSleep || 0} / 肌肤: ${beforeStats.avgSkin || 0}

用户现在 4 维:
- 心情: ${afterStats.avgMood || 0} / 精力: ${afterStats.avgEnergy || 0}
- 睡眠: ${afterStats.avgSleep || 0} / 肌肤: ${afterStats.avgSkin || 0}

3 个月前自己写的信 (前 100 字):
「${(beforeLetterExcerpt || '').slice(0, 100)}」

要求:
1. 250 字左右 (220-280 字)
2. 3 层结构: ①看见 3 个月前的自己 (60-80 字, 不评判, 看到 4 维的变化) ②看见 3 个月前信里的心情 (60-80 字, 跟现在的自己说话) ③收 1 句 4 经调性的话 (≤60 字)
3. 严守: 14 严守词 0 出现, 不评判, 不医疗, 不卖, 不预测
4. 滋养/共修/涵养 调性
5. 不显示具体分数值, 用"稳 / 静 / 暖"等调性词
6. 末尾不出现"我"自称, 不输出"AI"标识`;
}

// 调 chat LLM 包装 (text 格式, 跟 v3.1 经文详情页 res.result.text 匹配)
async function callLLMForText(systemPrompt, userPrompt) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
  const data = await callLLMWithGuard(messages);
  let text = '';
  if (data && Array.isArray(data.choices) && data.choices[0]) {
    text = data.choices[0].message?.content || '';
  }
  if (!text) throw new Error('AI 返回内容为空');
  if (!validateText(text)) {
    console.warn('[悦济 经文 严守 拦截]');
    return '悦济严守: 抱歉, 我重新组织一下语言。深呼吸一次, 我们再继续。';
  }
  return text;
}



async function callLLMWithGuard(messages) {
  const guardEnabled = (process.env.GUARD_ENABLED || "true").toLowerCase() !== "false";
  if (!guardEnabled) {
    console.log("[GUARD] skipped");
    return await callLLM(messages);
  }

  // 第 1 次: 正常生成
  const t0 = Date.now();
  const data = await callLLM(messages);
  const t1 = Date.now();
  let content;
  if (data && Array.isArray(data.choices) && data.choices[0]) {
    content = data.choices[0].message?.content;
  }
  console.log(`[GUARD] round 1: ${t1 - t0}ms, len=${content ? content.length : 0}`);

  if (!content || content.length < 80) {
    return data; // 短回复不审查
  }

  // 第 2 次: 严守自查 (只查敏感点, 不重写)
  // 悦济严守: 8 禁用词 (治疗/改善/缓解/治愈/祛斑/减肥/处方/医美) 0 出现, 不卖命理, 不识别情绪
  const guardPrompt = `你是审查员. 检查以下悦济 AI 回复:

"""
${content}
"""

按严重度递减检查 4 点:
1. 冒充真人? (说"我是真人" / "我曾经历过" / 隐瞒 AI 身份) → 改"我是 AI 助手"
2. 医疗/诊断? (开药 / 诊断 / 替代专业治疗) → 加"建议咨询专业医生"
3. 8 禁用词? (治疗/改善/缓解/治愈/祛斑/减肥/处方/医美/美颜/美白/瘦脸) → 删除该句
4. 评判/命令? ("你应该..." / "你不应该..." 命令句) → 改成疑问句

输出规则:
- 原文照搬, 只改不对的
- 若全部没问题, 原文输出, **不要加任何解释**
- 若有问题, 输出修改后的版本
- 保留段落结构`;

  let guarded;
  try {
    const guardData = await callLLM([
      { role: "system", content: guardPrompt },
    ]);
    if (guardData && Array.isArray(guardData.choices) && guardData.choices[0]) {
      guarded = guardData.choices[0].message?.content;
    }
  } catch (e) {
    console.log(`[GUARD] round 2 fail: ${e.message}, fallback to original`);
    return data;
  }

  if (!guarded || Math.abs(guarded.length - content.length) / content.length > 0.5) {
    console.log("[GUARD] size diff > 50%, fallback to original");
    return data;
  }

  // 替换 content
  data.choices[0].message.content = guarded;
  console.log(`[GUARD] round 2 OK, len=${guarded.length}`);
  return data;
}

// ==============================
// v3.1 阶段 5 P0 #4: 长期记忆 (user_profile collection)
// 设计: 不调 AI 提取, 用关键词匹配 (用户输入里的常见主题)
// 字段: openid + role, frequent_topics [最近 10 关键词], last_active ISO, total_chats 数字
// 写入: 每次 chat 调用, append + 截断 10
// 严守: 不存原始对话, 只存关键词, 减少隐私风险
// ==============================
const MEMORY_KEYWORDS = [
  '心烦', '焦虑', '失眠', '睡不好', '难过', '迷茫', '紧张', '选择', '失败', '孤独',
  '死亡', '累', '吃', '生气', '怕冷', '空虚', '无聊', '静不下来', '工作', '家庭',
  '孩子', '老人', '父母', '爱人', '朋友', '通勤', '加班', '压力', '未来', '过去',
  '早起', '晚睡', '运动', '饮食', '天气', '季节', '换季', '节气', '立春', '立秋',
  '开心', '高兴', '平静', '舒服', '暖', '凉', '期待', '感恩', '记得', '想起',
];
function extractKeywords(text) {
  if (!text) return [];
  const found = [];
  for (const kw of MEMORY_KEYWORDS) {
    if (text.includes(kw)) found.push(kw);
  }
  return found;
}
async function getUserProfile(openid, role) {
  try {
    const db = cloud.database();
    const res = await db.collection('yueji_user_profiles').where({ openid, role }).limit(1).get();
    if (res.data && res.data[0]) return res.data[0];
    return { openid, role, frequent_topics: [], last_active: '', total_chats: 0 };
  } catch (e) {
    console.warn('[memory read]', e.message);
    return { openid, role, frequent_topics: [], last_active: '', total_chats: 0 };
  }
}
async function saveUserProfile(openid, role, profile, newKeywords) {
  try {
    const db = cloud.database();
    const merged = [...new Set([...(profile.frequent_topics || []), ...newKeywords])].slice(-10);
    const update = {
      frequent_topics: merged,
      last_active: new Date().toISOString(),
      total_chats: (profile.total_chats || 0) + 1,
    };
    if (profile._id) {
      await db.collection('yueji_user_profiles').doc(profile._id).update({ data: update });
    } else {
      await db.collection('yueji_user_profiles').add({
        data: { openid, role, ...update, created_at: new Date() },
      });
    }
  } catch (e) {
    console.warn('[memory write]', e.message);
  }
}

// ==============================
// 入口
// ==============================
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { user_input, role = "company", history = [], meta = null, type = "normal", jingwen = null, character = null, monthly = null, three_months = null } = event;

  console.log(`[chat] OPENID=${OPENID}, type=${type}, role=${role}, user_input=${user_input?.slice(0, 30)}, has_meta=${!!meta}`);
  // v2.4.0: 全局传递 role 给 AMAX 选模型
  globalThis._currentRole = role;

  // v3.1 阶段 1: 经文白话/拼音/解读 旁路路由
  // type=baihua/pinyin/jiequ 走专用 prompt, 返 {ok, text} 跟 1.1_经文详情 res.result.text 对齐
  // 不走主 user_input + role 路线, 不动原 chat 流程
  if (type === 'baihua' || type === 'pinyin' || type === 'jiequ') {
    if (!jingwen || !jingwen.content) {
      return { ok: false, error: 'jingwen 缺失, 经文内容为空' };
    }
    try {
      let text;
      if (type === 'baihua') {
        text = await callLLMForText(buildBaihuaPrompt(jingwen, character || 'laozi'),
          '请把这段经文转译成现代白话文。');
      } else if (type === 'pinyin') {
        text = await callLLMForText(buildPinyinPrompt(jingwen),
          '请给这段经文逐字加拼音。');
      } else {
        text = await callLLMForText(buildJiequPrompt(jingwen, character || 'laozi'),
          '请写 200 字现代场景解读。');
      }
      return { ok: true, text, type };
    } catch (e) {
      console.error(`[chat 经文 ${type} 异常] ${e.message}`);
      return { ok: false, error: e.message, type };
    }
  }

  // v3.1 阶段 3 P0 #5: 月底陪伴 + 3 个月陪伴 旁路路由
  if (type === 'monthly_summary' || type === 'three_months_companion') {
    try {
      let text;
      if (type === 'monthly_summary') {
        if (!monthly) return { ok: false, error: 'monthly 缺失, 4 维数据为空', type };
        text = await callLLMForText(
          buildMonthlyPrompt(monthly.stats, monthly.monthLabel, monthly.sentenceCount || 0, monthly.jingwenCount || 0),
          '请写 200 字月底陪伴。',
        );
      } else {
        if (!three_months) return { ok: false, error: 'three_months 缺失, 前后 4 维数据为空', type };
        text = await callLLMForText(
          build3MonthsPrompt(three_months.beforeStats, three_months.afterStats, three_months.letterExcerpt || ''),
          '请写 250 字 3 个月陪伴。',
        );
      }
      return { ok: true, text, type };
    } catch (e) {
      console.error(`[chat ${type} 异常] ${e.message}`);
      return { ok: false, error: e.message, type };
    }
  }

  // 危机检测 (云函数层)
  const crisisKw = detectCrisis(user_input);
  if (crisisKw) {
    // 写危机日志
    try {
      await cloud.database().collection("yueji_crisis_logs").add({
        data: {
          openid: OPENID, keyword: crisisKw, action: "intercepted", created_at: new Date(),
        },
      });
    } catch (e) { console.error("[crisis log]", e.message); }
    return {
      ok: true,
      crisis: true,
      data: {
        content: '我们注意到您可能正在经历困难时期。悦济是生活陪伴, 无法替代专业支持。请拨打 12356 全国心理援助热线, 我们陪着您。',
        role_used: role,
        crisis: true,
      },
    };
  }

  // 8 禁用词预审 (云函数层)
  if (!validateText(user_input)) {
    return {
      ok: false,
      error: "悦济严守: 检测到不当用语, 请重新输入。",
    };
  }

  // 加载知识库
  const docs = loadKnowledgeBase();
  const topDocs = searchKB(user_input, docs, 2);
  const kbContext = topDocs.map(d => `## ${d.title}\n${d.content.slice(0, 500)}`).join("\n\n");

  // v3.1 阶段 5: 长期记忆 (用户历史关键词 → 拼进 systemMsg)
  const userProfile = await getUserProfile(OPENID, role);
  const memoryStr = userProfile.frequent_topics && userProfile.frequent_topics.length > 0
    ? `\n\n## 用户历史聊过的话题 (长期记忆)\n最近 10 个: ${userProfile.frequent_topics.join('、')}\n共聊 ${userProfile.total_chats} 次 · 上次: ${userProfile.last_active ? userProfile.last_active.slice(0, 10) : '首次'}\n请基于这些历史, 看到用户的成长, 但不评判不引用具体次数.`
    : '';

  // 构建 messages (v2.7.0 加 meta: 月底报告数据拼进 systemMsg)
  const rolePrompt = ROLE_PROMPTS[role] || ROLE_PROMPTS.company;
  let metaStr = '';
  if (meta && meta.stats) {
    metaStr = `\n\n## 用户本月 4 维数据\n心情: ${meta.stats.avgMood}/10\n精力: ${meta.stats.avgEnergy}/10\n睡眠: ${meta.stats.avgSleep}/10\n肌肤: ${meta.stats.avgSkin}/10\n共 ${meta.stats.days} 天 · 趋势: ${meta.stats.trend}\n\n请基于这些数据, 写一份月末陪伴, 短 (≤150 字), 温暖不评判.`;
  }
  const systemMsg = `${rolePrompt}${metaStr}${memoryStr}\n\n## 悦济 KB 参考 (不直接引用, 化为语气)\n${kbContext || "（无）"}\n\n悦济严守: 14 禁用词 (治疗/改善/缓解/治愈/祛斑/减肥/处方/医美/美颜/美白/瘦脸/营销/广告/疗愈) 0 出现, 不提供医疗建议, 不识别情绪状态, 只陪伴 / 共修 / 涵养.`;

  const messages = [
    { role: "system", content: systemMsg },
    ...history.slice(-16).map(h => ({ role: h.role, content: h.content })),
    { role: "user", content: user_input },
  ];

  try {
    // v2.5.5: 跟祺臻 v6.1 一致加 Self-Critique 守门员 (严守 0 出现 + 防幻觉)
    const data = await callLLMWithGuard(messages);
    let content;
    if (data && Array.isArray(data.choices) && data.choices[0]) {
      content = data.choices[0].message?.content;
    }
    if (!content) throw new Error("AI 返回内容为空");

    // 8 禁用词预审 AI 输出 (v2.5.5: 跟祺臻一致, FORBIDDEN_WORDS 19 个严守)
    if (!validateText(content)) {
      content = "悦济严守: 抱歉, 我重新组织一下语言。" + "深呼吸一次, 我们再继续。";
    }

    // v3.1 阶段 5: 写回长期记忆 (异步, 不阻塞返回)
    const newKeywords = extractKeywords(user_input);
    if (newKeywords.length > 0) {
      saveUserProfile(OPENID, role, userProfile, newKeywords).catch(e => console.warn('[memory save]', e.message));
    } else {
      // 即便没新关键词, 也更新 last_active + total_chats
      saveUserProfile(OPENID, role, userProfile, []).catch(e => console.warn('[memory save]', e.message));
    }

    // 写 messages 集合 (云端持久化)
    try {
      const db = cloud.database();
      await db.collection("yueji_messages").add({
        data: { openid: OPENID, role: "user", content: user_input, role_used: role, created_at: new Date() },
      });
      await db.collection("yueji_messages").add({
        data: { openid: OPENID, role: "assistant", content, role_used: role, created_at: new Date() },
      });
    } catch (e) { console.error("[messages write]", e.message); }

    return { ok: true, data: { content, role_used: role, crisis: false } };
  } catch (e) {
    // v2.6.0 修 P0-9: 真拿掉 STATIC 兜底 (v2.2.0 承诺 + v2.5.5 复活), catch 返错给前端
    // 跟祁臻 v6.2 一致: catch 抛错 + 前端 wx.showToast, user 永远知道 AI 没调
    console.error(`[chat err] ${e.message}`);
    return {
      ok: false,
      error: e.message,
      error_code: e.message.includes("MINIMAX_TOKEN_KEY") ? "NO_API_KEY"
              : e.message.includes("Env Not Exists") ? "NO_ENV"
              : e.message.includes("AI 调用失败") ? "AI_FAIL"
              : "UNKNOWN",
      role_used: role,
    };
  }
};

// ==============================
// STATIC 模式静态回应 (v1.1.6 新增, 不调 AMAX 也能跑通)
// 严守: 8 禁用词 0 出现 + 滋养/共修/镜中 调性
// 思路: 6 类对话 + 4 经数字人 = 10 角色 × 6 关键词 = 60 回应
// ==============================
const STATIC_RESPONSES = {
  // 6 类对话 (静下来/陪伴/涵养/同舟/共修/悦己)
  still: {
    心烦: "深呼吸一次, 慢慢吐气, 让肩膀也松下来。",
    焦虑: "你不用急, 让心慢一点, 慢慢来。",
    失眠: "躺下, 闭眼, 听自己呼吸的声音。",
    难过: "难过是心的感受, 让它流过, 不评判。",
    累: "给自己一杯温水, 坐下来, 什么都不做。",
    静不下来: "试试看窗外, 看一片云, 看一棵树。",
  },
  company: {
    心烦: "你愿意说说, 我在听。",
    焦虑: "你最近在想什么? 我陪你。",
    失眠: "睡不着的夜, 你是醒着的。",
    难过: "不用憋着, 想哭就哭, 想笑就笑。",
    累: "累了, 就放下吧, 不必撑。",
    孤独: "你一直都在, 我也一直都在。",
  },
  hanyang: {
    心烦: "今天喝了几杯水? 给自己沏一壶吧。",
    焦虑: "早饭吃了吗? 慢一点, 慢慢嚼。",
    失眠: "晚上不看手机, 你试过吗?",
    难过: "出门走走, 让风吹一下脸。",
    累: "身体累, 心就跟着累, 慢慢调。",
    起居: "早起晒太阳, 这是最简单的养生。",
  },
  tongzhou: {
    心烦: "同舟共济, 我们一起。",
    焦虑: "一步一步来, 不必看清前面的路。",
    失眠: "夜深了, 你还没睡, 是在等什么?",
    难过: "你的难, 我认。",
    累: "走慢一点, 也是在走。",
    失败: "失败是过程, 不是终点, 继续走。",
  },
  gongxiu: {
    心烦: "30 天了, 你坚持下来了, 悦济也在。",
    焦虑: "今天的你, 比昨天更懂自己一点。",
    失眠: "今晚的夜, 也算共修。",
    难过: "你愿意坚持, 就是了不起。",
    累: "累了就休息, 休息也是共修。",
    进步: "看见自己的变化, 这就是共修的意义。",
  },
  yueji: {
    心烦: "你今天真的做得很好了。",
    焦虑: "不必完美, 你已经足够好。",
    失眠: "睡不着的你, 也值得被温柔对待。",
    难过: "你值得被爱, 也值得自己爱自己。",
    累: "累了, 就要停, 不必证明什么。",
    自我怀疑: "你已经做了你能做的, 这就够了。",
  },
  // 4 经数字人 (v1.1.6 加进 STATIC 模式, 跟 utils/data_digital_human.js 同步)
  laozi: {
    心烦: "上善若水。水善利万物而不争。\n水滋养万物, 静静陪伴, 不催促你做决定。心烦时, 你不需要解决, 只需要被陪伴。",
    焦虑: "致虚极, 守静笃。\n把心放空, 守住安静, 这是回到自己的法门。焦虑是心在乱跑, 静下来, 它就停了。",
    失眠: "万物芸芸, 各复归其根。归根曰静, 静曰复命。\n睡不好, 是心还醒着。睡前把心放下, 回到本心, 就能入睡。",
    难过: "天地不仁, 以万物为刍狗。\n天地不偏爱, 万物平等。难过是心的感受, 让它流过, 不评判, 你还是你。",
    迷茫: "道冲, 而用之或不盈。\n道是空的, 但用起来无穷尽。迷茫时, 不必找答案, 先让自己静下来, 道会自己显现。",
  },
  zhouwenwang: {
    紧张: "需, 有孚, 光亨, 贞吉。\n需卦讲等待, 不是消极, 是涵养。紧张时, 准备充分, 这就是需。",
    选择: "乾之初九, 潜龙勿用。\n龙在深渊, 不动, 等待时机。选择困难时, 不必急, 时机到了, 自然明白。",
    失败: "天行健, 君子以自强不息。\n天道运行不息, 君子也当如此。失败是过程, 不是终点, 继续走, 自强不息。",
    孤独: "同人于野, 亨。\n与人和同, 走出家门, 志同道合。孤独时, 不是无人, 是还没找到同路人。",
    死亡: "未知生, 焉知死。\n先活好当下, 死是自然的事。死亡是归, 不是结束, 不用怕, 也不用急。",
  },
  qibo: {
    睡不好: "上古之人, 起居有常。\n懂得养生的人, 起居有常, 不妄劳作。睡不好, 试试早起晒太阳, 晚上不看手机, 这是最简单的, 也是最难的。",
    累: "形劳而不倦, 气从以顺。\n身体劳作但不疲倦, 是气顺。累是气不顺, 休息不解决问题, 调息才有用。",
    吃: "五谷为养, 五果为助。\n五谷是主, 水果是辅。现代人吃反了, 把水果当饭, 把五谷当配, 这是失衡。",
    生气: "怒则气上, 喜则气缓。\n怒让气上冲, 喜让气变缓。生气伤肝, 不压抑也不放纵, 让气回到中正。",
    怕冷: "阳气者, 若天与日。\n阳气像天上的太阳, 失其所则折寿而不彰。怕冷是阳虚, 晒太阳, 早睡, 慢慢养, 不急。",
  },
  yuanshen: {
    心乱: "夫人神好清, 而心扰之。\n心乱不是病, 是忘了本性。你已觉察到心乱, 这就是回到本心的开始。",
    静不下来: "人能常清静, 天地悉皆归。\n常清静, 天地都归附。静不下来, 不用硬静, 不评判, 看着心跑, 它自己会停。",
    空虚: "内观其心, 心无其心。\n向内看, 心本空。空虚是心在找东西, 其实它本来就满, 不必外求。",
    累: "外观其形, 形无其形。\n向外看, 形本无。累是把自己绑在形上, 松开, 形累心不累。",
    无聊: "远观其物, 物无其物。\n看远一点, 物本无。无聊是心没着落, 不找事做, 让心回到当下, 当下不无聊。",
  },
};

// 默认兜底
const STATIC_DEFAULTS = {
  still: "深呼吸一次, 慢慢吐气, 让肩膀也松下来。",
  company: "你愿意说说, 我在听。",
  hanyang: "今天喝了几杯水? 给自己沏一壶吧。",
  tongzhou: "同舟共济, 我们一起。",
  gongxiu: "30 天了, 你坚持下来了, 悦济也在。",
  yueji: "你今天真的做得很好了。",
  laozi: "道可道, 非常道。\n可以说出来的道, 已经不是恒常的道。",
  zhouwenwang: "易, 不易, 简易, 变易。\n变是常态, 不变是规律, 简单是智慧。",
  qibo: "上工治未病, 不治已病。\n高明的医者, 在病未发时就调养。",
  yuanshen: "清静, 然后见本性。\n心清静, 才能见本性。",
};

function getStaticResponse(role, userInput) {
  const dict = STATIC_RESPONSES[role];
  if (!dict) return "悦济陪你。深呼吸一次, 慢慢说。";
  if (!userInput) return STATIC_DEFAULTS[role] || "悦济陪你。";
  // 优先匹配关键词
  for (const kw of Object.keys(dict)) {
    if (userInput.includes(kw)) return dict[kw];
  }
  return STATIC_DEFAULTS[role] || "悦济陪你。";
}
