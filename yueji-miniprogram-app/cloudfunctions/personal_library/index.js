// 云函数: personal_library (悦济 v3.1 阶段 23 — 个人曲库 B 基础版 35 段/周)
// 拍板 (2026-07-16 22:00 冬生 '按你的方案开干'):
//   B 基础版: 5 调式 × 7 天 = 35 段/周 (周一到周日, 每个调式每天 1 段)
//   触发: 用户首登/周一/手动, 批量调 generate_music 35 次 (复用 22.4 严守 + 5 调式 prompt)
//   缓存: 云存储 yueji-personal-lib/<openid>/<YYYY-MM-DD>_<wuyue>.json (35 段索引) +
//         yueji-music-v3.1-dynamic/<wuyue>_<hash>.mp3 (35 段 mp3, 复用 generate_music L2)
//   前端: 新页 20_我的曲库 展示 7 天 × 5 调式 grid, 点击播放
//   严守: 14 禁用词 + 12 玄学红线 + 15 危机词 0 出现 (复用 22.4 严守)
//
// 入口: { action: 'generate'|'list'|'status', weekStart?: 'YYYY-MM-DD' }
// 返:
//   generate: { ok, weekStart, items: [{day, wuyue, fileID, hash, isCache, mock}], generated, cached, failed }
//   list:     { ok, weekStart, items: [...], weekStartDate }
//   status:   { ok, weekStart, total, generated, cached, failed, lastUpdate }
//
// 严守 14 禁用词: 治疗/改善/缓解/治愈/祛斑/减肥/处方/医美/美颜/美白/瘦脸/营销/广告/疗愈
// 严守 12 玄学红线: 命理/占星/八字/星盘/算命/转运/化解/风水/玄学/五行/生克/补泻
// 严守 15 危机词: 自杀/自残/轻生/跳楼/割腕/上吊/服药过量/绝望/崩溃/了断/结束生命/一了百了/不想活/活不下去/没意义

const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const WUYUE_KEYS = ["gong", "shang", "jiao", "zhi", "yu"];  // 5 调式
const WUYUE_NAMES = { gong: "宫", shang: "商", jiao: "角", zhi: "徵", yu: "羽" };
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];  // 7 天

// 严守字串 (复用 generate_music 22.4 严守)
const FORBIDDEN_WORDS = [
  "治疗", "改善", "缓解", "治愈", "祛斑", "减肥", "处方", "医美",
  "美颜", "美白", "瘦脸", "营销", "广告", "疗愈",
];
const XUANXUE_WORDS = [
  "命理", "占星", "八字", "星盘", "算命", "转运", "化解",
  "风水", "玄学", "五行", "生克", "补泻",
];
const CRISIS_KEYWORDS = [
  "不想活", "自杀", "轻生", "想死", "活不下去", "结束生命",
  "自残", "割腕", "跳楼", "上吊", "服药过量",
  "绝望", "没意义", "没人需要我", "解脱",
];

function validateText(text) {
  if (!text) return true;
  for (const w of FORBIDDEN_WORDS) if (text.includes(w)) return false;
  for (const w of XUANXUE_WORDS) if (text.includes(w)) return false;
  return true;
}

function detectCrisis(text) {
  if (!text) return null;
  for (const kw of CRISIS_KEYWORDS) if (text.includes(kw)) return kw;
  return null;
}

// v3.1 阶段 23: 计算 weekStart (本周一日期 YYYY-MM-DD)
// 入参: Date object 或 字符串, 出: YYYY-MM-DD
function getWeekStart(date) {
  const d = date ? new Date(date) : new Date();
  const day = d.getUTCDay() || 7;  // 0=周日 → 7
  d.setUTCDate(d.getUTCDate() - (day - 1));
  return d.toISOString().slice(0, 10);
}

// v3.1 阶段 23: 计算 7 天日期 (weekStart + 0..6)
function getWeekDays(weekStart) {
  const start = new Date(weekStart);
  return DAY_KEYS.map((dk, i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

// v3.1 阶段 23: 读个人曲库云存储索引 (35 段清单)
async function readLibrary(openid, weekStart) {
  try {
    const res = await cloud.downloadFile({
      fileID: `cloud://yueji-personal-lib/${openid}/${weekStart}_index.json`,
    });
    const data = JSON.parse(res.fileContent.toString("utf8"));
    return data;
  } catch (e) {
    return null;  // 不存在
  }
}

// v3.1 阶段 23: 写个人曲库云存储索引
async function writeLibrary(openid, weekStart, items) {
  const fileContent = Buffer.from(JSON.stringify({
    weekStart,
    items,
    lastUpdate: new Date().toISOString(),
  }, null, 2), "utf8");
  try {
    const res = await cloud.uploadFile({
      cloudPath: `yueji-personal-lib/${openid}/${weekStart}_index.json`,
      fileContent,
    });
    return res.fileID;
  } catch (e) {
    console.error(`[personal_library] 写索引失败: ${e.message}`);
    return null;
  }
}

// v3.1 阶段 23: 复用 generate_music 5 调式 prompt (避免重复定义)
// 注: 真实现是调 wx-server-sdk invoke, 但云函数嵌套调云函数需要 cloud.cloudCallFunction
// 简化: 同进程复用 WUYUE_PROMPTS 静态数据, 走 mock 模式
// 真通道: 等冬生配 MINIMAX_MUSIC_KEY 后, generate_music 真通道调通, 这里只取 fileID/hash
const WUYUE_PROMPTS = {
  gong: "75 BPM, C major pentatonic, guqin zither leading with guzheng in high register and sheng mouth organ in low register, gentle 30ms attack, 1s reverb, autumn harvest song, nourishing spleen meridian, no percussion, no vocals, 60s loop",
  shang: "85 BPM, D major pentatonic, sheng mouth organ leading with guzheng in mid register and celesta in soft high register, crisp 5ms attack, autumn moonlight, supporting lung meridian, no percussion, no vocals, 60s loop",
  jiao: "70 BPM, E minor pentatonic, bamboo flute (dizi) leading with guzheng in mid register and sheng mouth organ in low register, gentle 20ms attack, 0.8s reverb, spring morning sun, supporting liver meridian, no percussion, no vocals, 60s loop",
  zhi: "95 BPM, E minor pentatonic, guzheng zither leading with sheng mouth organ in high register and guqin zither in low register, 30ms attack, 1.2s reverb, golden sunset, nurturing heart meridian, no percussion, no vocals, 60s loop",
  yu: "60 BPM, A natural minor pentatonic, xiao (Chinese vertical bamboo flute) leading, with guqin zither in low register and bamboo flute in soft high register, very soft 5ms attack, long reverb 1.5-2s, morning mist over still lake, meditation for kidney meridian, no percussion, no vocals, 60s loop",
};

// v3.1 阶段 26: 单次调 generate_music (真通道, 复用 22.4 L2/L3 + fallback 30 段)
// 真实实现: await cloud.callFunction({ name: 'generate_music', data: { wuyue } })
// 冬生 01:13 拍板: 1 个 MINIMAX_TOKEN_KEY 调全系 (chat + music), generate_music env 也用 MINIMAX_TOKEN_KEY
async function callGenerateMusic(wuyue, date) {
  const apiKey = process.env.MINIMAX_TOKEN_KEY;
  const mockMode = !apiKey || apiKey === "mock" || apiKey.length < 10;

  // 严守: prompt 校验
  if (!validateText(WUYUE_PROMPTS[wuyue])) {
    return { ok: false, error: "prompt 校验失败" };
  }

  if (mockMode) {
    // mock 模式: 返占位, 前端走 fallback
    return {
      ok: true,
      fileID: null,
      hash: `mock-${wuyue}-${date}-${Date.now()}`,
      isCache: false,
      mock: true,
      msg: "mock 模式, 等冬生配 MINIMAX_TOKEN_KEY (TokenPlan Max 1 key 调全系) 后切真通道",
    };
  }

  // 真通道 (待冬生配 key): 调 generate_music 云函数
  try {
    const res = await cloud.callFunction({
      name: "generate_music",
      data: { wuyue },
    });
    if (res && res.result && res.result.ok) {
      return res.result;
    }
    return { ok: false, error: "generate_music 返失败" };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── 入口 ──
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { action = "status", weekStart: inputWeekStart, user_input } = event;

  console.log(`[personal_library] OPENID=${OPENID}, action=${action}, weekStart=${inputWeekStart}`);

  // 严守 1: 危机检测
  if (user_input) {
    const crisisKw = detectCrisis(user_input);
    if (crisisKw) {
      try {
        await cloud.database().collection("yueji_crisis_logs").add({
          data: { openid: OPENID, keyword: crisisKw, action: "personal_library_intercepted", created_at: new Date() },
        });
      } catch (e) { console.error("[crisis log]", e.message); }
      return {
        ok: false,
        crisis: true,
        msg: "我们注意到您可能正在经历困难时期。请拨打 12356 全国心理援助热线, 悦济陪您。",
      };
    }
    if (!validateText(user_input)) {
      return { ok: false, error: "悦济严守: 检测到不当用语, 请重新输入。" };
    }
  }

  // 严守 2: 调式校验
  if (inputWeekStart && typeof inputWeekStart !== "string") {
    return { ok: false, error: "weekStart 必须是 YYYY-MM-DD 字符串" };
  }

  try {
    const weekStart = inputWeekStart || getWeekStart();
    const weekDays = getWeekDays(weekStart);

    // ── action: status (默认) — 查本周状态 ──
    if (action === "status") {
      const lib = await readLibrary(OPENID, weekStart);
      const total = lib && lib.items ? lib.items.length : 0;
      const generated = lib && lib.items ? lib.items.filter((i) => i.fileID && !i.mock).length : 0;
      const cached = lib && lib.items ? lib.items.filter((i) => i.isCache).length : 0;
      const failed = lib && lib.items ? lib.items.filter((i) => i.failed).length : 0;
      return {
        ok: true,
        weekStart,
        total,
        generated,
        cached,
        failed,
        lastUpdate: lib && lib.lastUpdate ? lib.lastUpdate : null,
      };
    }

    // ── action: list — 返本周 35 段清单 ──
    if (action === "list") {
      const lib = await readLibrary(OPENID, weekStart);
      return {
        ok: true,
        weekStart,
        weekStartDate: weekStart,
        items: lib && lib.items ? lib.items : [],
        msg: lib ? "已读取" : "本周尚未生成, 请先 action=generate",
      };
    }

    // ── action: generate — 批量生成 35 段 ──
    if (action === "generate") {
      // 严守 3: 限频 (1 调式 1 天生成 1 次, 避免 35 次重复)
      const lib = await readLibrary(OPENID, weekStart);
      const existingItems = (lib && lib.items) || [];
      const items = [...existingItems];
      const existingMap = new Map();
      for (const it of existingItems) {
        existingMap.set(`${it.day}_${it.wuyue}`, it);
      }

      let generated = 0, cached = 0, failed = 0;
      const failedItems = [];

      for (let i = 0; i < DAY_KEYS.length; i++) {
        for (const wuyue of WUYUE_KEYS) {
          const day = weekDays[i];
          const key = `${DAY_KEYS[i]}_${wuyue}`;
          if (existingMap.has(key)) {
            // 已存在, 跳过
            continue;
          }

          const musicRes = await callGenerateMusic(wuyue, day);
          if (musicRes.ok) {
            const item = {
              dayKey: DAY_KEYS[i],
              day,
              wuyue,
              wuyueName: WUYUE_NAMES[wuyue],
              fileID: musicRes.fileID,
              hash: musicRes.hash,
              isCache: musicRes.isCache || false,
              mock: musicRes.mock || false,
              ts: new Date().toISOString(),
            };
            if (musicRes.isCache) cached++;
            else if (musicRes.mock) generated++;
            else generated++;
            items.push(item);
            existingMap.set(key, item);
          } else {
            failed++;
            failedItems.push({ day, wuyue, error: musicRes.error });
          }
        }
      }

      // 写索引到云存储
      const fileID = await writeLibrary(OPENID, weekStart, items);

      return {
        ok: true,
        weekStart,
        items,
        generated,
        cached,
        failed,
        failedItems,
        indexFileID: fileID,
        msg: `生成完成: 新生成 ${generated} 段, 缓存命中 ${cached} 段, 失败 ${failed} 段`,
      };
    }

    return { ok: false, error: `未知 action: ${action}, 必须是 generate/list/status 之一` };
  } catch (e) {
    console.error(`[personal_library 异常] ${e.message}`);
    return {
      ok: false,
      action,
      error: e.message,
    };
  }
};
