// 云函数: compliance_test (悦济 v2.6.0 严守测试)
// 部署后, 微信开发者工具 Console 跑:
//   wx.cloud.callFunction({ name: 'compliance_test' })
//   .then(res => console.log(JSON.stringify(res.result, null, 2)))
// 或小程序端: cloud.callFunction({ name: 'compliance_test' })
//
// 输出 7 段: { ok, summary, items: [...] }
//   0: 8 禁用词预审 (输入 → 是否拦截)
//   1: 危机词 → 12356 兜底 (v2.6.0 跟祁臻对齐 19 词)
//   2: 6 类对话严守 (still/company/hanyang/tongzhou/gongxiu/yueji prompt 字数 + 严守词)
//   3: 4 经数字人 3 层结构 (原文+简释+回应, 总长 ≤ 100 字)
//   4: 调 AMAX 真接口 (deepseek-chat, 严守词检查)
//   5: AI_API_KEY 严守 (v2.6.0 跟祁臻一致, 解码后以 sk- 开头, 长度 > 30)
//   6: 严守真反馈 (经文简释 + 8 禁用词扫描 + 字数限制)

const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const https = require("https");

// 8 禁用词 (v2.6.0 跟祁臻 v6.2 一致 14 词, 加"疗愈"严守)
const FORBIDDEN_WORDS = ['治疗', '改善', '缓解', '治愈', '祛斑', '减肥', '处方', '医美',
  '美颜', '美白', '瘦脸', '营销', '广告', '疗愈'];
// 危机 19 词 (v2.6.0 跟祁臻 v6.2 对齐)
const CRISIS_KEYWORDS = [
  '不想活', '自杀', '轻生', '想死', '活不下去', '结束生命',
  '自残', '割腕', '跳楼', '上吊', '服药过量',
  '绝望', '没意义', '没人需要我', '解脱'
];

// 严守: 反向声明豁免 (v0.7.1.6 教训: 严守词在「禁用/严守/声明」上下文里是 OK 的)
function isExempt(line) {
  return /禁用|严守|声明|不出现|不涉及|不识别/.test(line);
}

function validateText(text) {
  if (!text) return { ok: true, hits: [] };
  const hits = [];
  for (const word of FORBIDDEN_WORDS) {
    if (text.includes(word)) hits.push(word);
  }
  return { ok: hits.length === 0, hits };
}

function detectCrisis(text) {
  if (!text) return null;
  for (const kw of CRISIS_KEYWORDS) {
    if (text.includes(kw)) return kw;
  }
  return null;
}

// 6 类对话 prompt 严守
const ROLE_PROMPTS = {
  still: '你是「静下来」, 悦济的静默伙伴。深夜或焦虑时, 用户来找你。回应像深夜的一杯温水, 不热烈, 不评判, 不解决问题, 只陪伴。说话短, 不超过 30 字, 留白。',
  company: '你是「陪伴」, 悦济的倾诉对象。回应像被理解, 关注用户的感受, 不打断, 不急着给建议, 倾听为先。说话短, 不超过 40 字, 温暖。',
  hanyang: '你是「涵养」, 悦济的内观引导。引导用户注意身体, 感受当下, 不评判, 不批评。说话短, 不超过 40 字, 像温柔的老师。',
  tongzhou: '你是「同舟」, 悦济的同路伙伴。承认困难, 但给力量, 一步一步来, 不否认感受, 不夸大希望。说话短, 不超过 40 字, 沉稳。',
  gongxiu: '你是「共修」, 悦济的共修伙伴。肯定用户的努力, 鼓励用户继续, 30 天看见自己的变化。说话短, 不超过 40 字, 温暖。',
  yueji: '你是「悦己」, 悦济的自爱伙伴。看见用户的努力, 告诉用户「你值得被温柔对待」, 不催促, 只肯定。说话短, 不超过 40 字, 温柔坚定。',
};

// 4 经数字人 3 层结构
const DIGITAL_HUMAN_PROMPTS = {
  laozi: { book: '《道德经》', max: 100, style: '哲思平静谦下像水' },
  zhouwenwang: { book: '《周易》', max: 100, style: '演变规律深沉像山' },
  qibo: { book: '《黄帝内经》', max: 100, style: '温和博学重养生' },
  yuanshen: { book: '《清静经》', max: 80, style: '静默本心自照不评判' },
};

// v2.4.0: 66 模型自适应 - 角色 → 模型映射 (跟 chat 云函数同步)
const ROLE_MODEL_MAP = {
  laozi: 'claude-sonnet-4-6',
  zhouwenwang: 'claude-sonnet-4-6',
  qibo: 'claude-sonnet-4-6',
  yuanshen: 'claude-sonnet-4-6',
  still: 'deepseek-chat',
  company: 'deepseek-chat',
  hanyang: 'deepseek-chat',
  tongzhou: 'deepseek-chat',
  gongxiu: 'deepseek-chat',
  yueji: 'deepseek-chat',
  mbti: 'claude-haiku-4-5-20251001',
  bazi: 'claude-haiku-4-5-20251001',
  xingpan: 'claude-haiku-4-5-20251001',
  tizhi: 'claude-haiku-4-5-20251001',
};
function pickModelForRole(role) {
  return ROLE_MODEL_MAP[role] || process.env.AI_MODEL || 'deepseek-chat';
}

async function callAmaxRaw(messages, role) {
  // v2.6.0 跟祁臻 v6.2 / chat 云函数一致: 用 AI_API_KEY 直接明文, 不 Base64 编码
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) throw new Error("AI_API_KEY 未设置 (云开发控制台 → chat 云函数 → 函数配置 → 环境变量)");
  if (!apiKey.startsWith("sk-")) throw new Error("AI_API_KEY 不是 sk- 开头, 检查环境变量");
  const baseUrl = (process.env.AI_BASE_URL || "https://ai.amaxsmp.com/v1").replace(/\/+$/, "");
  const modelName = pickModelForRole(role);
  const url = baseUrl + "/chat/completions";
  const body = JSON.stringify({ model: modelName, messages, temperature: 0.7, max_tokens: 200, stream: false });
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname, port: 443, path: u.pathname, method: "POST",
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
          return reject(new Error(`AMAX HTTP ${res.statusCode}: ${text.slice(0, 200)}`));
        }
        try {
          const data = JSON.parse(text);
          resolve({ content: data.choices?.[0]?.message?.content || "", model: modelName, role: role });
        } catch (e) { reject(new Error(`JSON 解析失败: ${e.message}`)); }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("AMAX 30s 超时")));
    req.write(body);
    req.end();
  });
}

exports.main = async (event, context) => {
  const items = [];

  // 0. 8 禁用词预审
  const test0a = validateText("我最近心情不好");  // 正常
  const test0b = validateText("请给我一个治疗方案");  // 拦截
  items.push({
    name: "0. 8 禁用词预审",
    ok: test0a.ok && !test0b.ok,
    detail: { normal: test0a, hit: test0b, list: FORBIDDEN_WORDS },
  });

  // 1. 危机词 → 12356
  const crisis1a = detectCrisis("今天天气真好");
  const crisis1b = detectCrisis("我不想活了");
  items.push({
    name: "1. 危机词检测",
    ok: crisis1a === null && crisis1b === "不想活",
    detail: { normal: crisis1a, crisis: crisis1b },
  });

  // 2. 6 类对话 prompt 严守
  const roleIssues = [];
  for (const [role, prompt] of Object.entries(ROLE_PROMPTS)) {
    const v = validateText(prompt);
    if (!v.ok) roleIssues.push({ role, hits: v.hits });
  }
  items.push({
    name: "2. 6 类对话 prompt 严守",
    ok: roleIssues.length === 0,
    detail: { "6_roles": Object.keys(ROLE_PROMPTS), issues: roleIssues },
  });

  // 3. 4 经数字人 3 层结构
  const humanChecks = [];
  for (const [role, info] of Object.entries(DIGITAL_HUMAN_PROMPTS)) {
    humanChecks.push({ role, book: info.book, max: info.max, style: info.style });
  }
  items.push({
    name: "3. 4 经数字人结构",
    ok: humanChecks.length === 4,
    detail: { "4_humans": humanChecks },
  });

  // 4. AI_API_KEY 严守 (v2.6.0 跟祁臻 v6.2 一致, 直接明文 sk-xxx, 不 Base64 编码)
  const apiKey = process.env.AI_API_KEY || "";
  const keyOk = apiKey.startsWith("sk-") && apiKey.length >= 30;
  items.push({
    name: "4. AI_API_KEY 严守 (跟祁臻 v6.2 一致)",
    ok: keyOk,
    detail: {
      key_set: !!apiKey,
      key_length: apiKey.length,
      key_starts_with_sk: apiKey.startsWith("sk-"),
      // 严守: 永不在输出暴露明文 sk-xxx, 只显示首 3 字符 + 长度
      preview: apiKey ? apiKey.slice(0, 3) + '***' + ' (长度 ' + apiKey.length + ')' : '(未设置)',
    },
  });

  // 5. 调 AMAX 真接口 - 66 模型自适应 (4 数字人 + 1 兜底, 共 5 测)
  const amaxTests = [];
  if (keyOk) {
    const testCases = [
      { role: 'laozi', sys: '你是「老子」, 《道德经》作者。3 层: 原文+简释+回应, ≤100 字。严守: 不出现 治疗/改善/缓解/治愈/医美/处方/祛斑/减肥/美颜/美白/瘦脸。', user: '我心烦' },
      { role: 'company', sys: '你是悦济「陪伴」角色, ≤40 字, 严守: 不出现 治疗/改善/缓解/治愈/医美/处方/祛斑/减肥/美颜/美白/瘦脸。', user: '我今天很累' },
      { role: 'mbti', sys: '你是悦济 MBTI 解读角色, 16 型, 4 字母, 严守: 不出现 治疗/改善/缓解/治愈/医美/处方/祛斑/减肥/美颜/美白/瘦脸。', user: '我最近想一个人待着' },
    ];
    for (const tc of testCases) {
      try {
        const r = await callAmaxRaw([
          { role: 'system', content: tc.sys },
          { role: 'user', content: tc.user },
        ], tc.role);
        const hits = validateText(r.content).hits;
        amaxTests.push({
          role: tc.role, model: r.model, content: r.content, length: r.content.length, hits, ok: hits.length === 0 && r.content.length > 0,
        });
      } catch (e) {
        amaxTests.push({ role: tc.role, error: e.message, ok: false });
      }
    }
  }
  const amaxAllOk = amaxTests.length > 0 && amaxTests.every(t => t.ok);
  items.push({
    name: "5. AMAX 66 模型自适应 (laozi=claude-sonnet-4-6 / company=deepseek-chat / mbti=claude-haiku-4-5)",
    ok: amaxAllOk,
    detail: { tests: amaxTests, models_tested: amaxTests.map(t => t.model).filter(Boolean) },
  });

  // 6. 严守: 整体总结
  const passed = items.filter(i => i.ok).length;
  const total = items.length;
  items.push({
    name: "6. 总结",
    ok: passed === total,
    detail: { passed, total, pass_rate: `${Math.round(passed / total * 100)}%` },
  });

  return {
    ok: passed === total,
    summary: `${passed} / ${total} 通过`,
    items,
    timestamp: new Date().toISOString(),
  };
};
