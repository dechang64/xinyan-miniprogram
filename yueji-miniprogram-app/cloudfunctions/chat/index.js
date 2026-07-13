// 云函数: chat (悦济 v1.0)
// 架构来源: 祺臻心理 qi_wechat v6.2 (commit 2026-07-05)
// 严守: 8 禁用词 0 出现 + 滋养/共修/镜中 调性
// 特色:
//   - 6 类对话角色 (静下来/陪伴/涵养/同舟/共修/悦己) 替代祺臻的 6 心理疗法角色
//   - 悦济独立知识库 (心颜 PRD + 心理声学 + 共修堂规范)
//   - 危机响应: 12356 (国家心理援助) 替代祺臻 12320-5 (深圳)
//   - provider=amax (默认 deepseek-v3) + provider=cloudbase 兜底

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

// 危机关键词 → 12356
const CRISIS_KEYWORDS = ['不想活', '想死', '自杀', '自残', '结束生命', '活不下去', '没意义', '解脱'];

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
// ==============================

async function callAmax(messages) {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = (process.env.AI_BASE_URL || "https://ai.amaxsmp.com/v1").replace(/\/+$/, "");
  if (!apiKey) throw new Error("AI_API_KEY 未设置 (从 AMAX 用户中心拿 sk-xxx)");
  const modelName = process.env.AI_MODEL || "deepseek-v3";
  const url = baseUrl + "/chat/completions";

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
          return reject(new Error(`AMAX HTTP ${res.statusCode}: ${text.slice(0, 300)}`));
        }
        try { resolve(JSON.parse(text)); }
        catch (e) { reject(new Error(`AMAX 解析 JSON 失败: ${e.message}, body=${text.slice(0, 200)}`)); }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("AMAX 请求超时 30s")));
    req.write(body);
    req.end();
  });
}

async function callCloudBase(messages) {
  const ai = cloud.extend.AI.createModel("hunyuan-pro");
  const modelName = process.env.AI_MODEL || "hy3-preview";
  const url = ai.aiBaseUrl + "/cloudbase/chat/completions";
  const resp = await ai.modelRequest({
    url,
    data: { model: modelName, messages, temperature: 0.7, stream: false },
    stream: false,
  });
  let result = (resp && resp.data && typeof resp.data.then === "function") ? await resp.data : resp;
  return result;
}

async function callLLM(messages) {
  const provider = (process.env.AI_PROVIDER || "amax").toLowerCase();
  console.log(`[callLLM] provider=${provider}, messages=${messages.length}`);

  if (provider === "amax" || provider === "amax-fallback") {
    try { return await callAmax(messages); }
    catch (e) {
      console.log(`[FALLBACK] AMAX 失败: ${e.message}, 降级到 CloudBase`);
      if (provider === "amax") throw e; // 纯 amax 不兜底
    }
  }
  return await callCloudBase(messages);
}

// ==============================
// 入口
// ==============================
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { user_input, role = "company", history = [] } = event;

  console.log(`[chat] OPENID=${OPENID}, role=${role}, user_input=${user_input?.slice(0, 30)}`);

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

  // 构建 messages
  const rolePrompt = ROLE_PROMPTS[role] || ROLE_PROMPTS.company;
  const systemMsg = `${rolePrompt}\n\n## 悦济 KB 参考 (不直接引用, 化为语气)\n${kbContext || "（无）"}\n\n悦济严守: 8 禁用词 (治疗/改善/缓解/治愈/祛斑/减肥/处方/医美) 0 出现, 营销词 0 出现, 不提供医疗建议, 不识别情绪状态, 只陪伴 / 共修 / 涵养。`;

  const messages = [
    { role: "system", content: systemMsg },
    ...history.slice(-16).map(h => ({ role: h.role, content: h.content })),
    { role: "user", content: user_input },
  ];

  try {
    const data = await callLLM(messages);
    let content;
    if (data && Array.isArray(data.choices) && data.choices[0]) {
      content = data.choices[0].message?.content;
    }
    if (!content) throw new Error("AI 返回内容为空");

    // 8 禁用词预审 AI 输出
    if (!validateText(content)) {
      content = "悦济严守: 抱歉, 我重新组织一下语言。" + "深呼吸一次, 我们再继续。";
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
    console.error("[chat err]", e.message);
    // 兜底: 静态回应
    return {
      ok: true,
      data: {
        content: "悦济陪你。深呼吸一次, 慢慢说。",
        role_used: role,
        crisis: false,
        fallback: true,
      },
    };
  }
};
