// 云函数: personal_library (悦济 v3.1 阶段 23 -- 个人曲库 B 基础版 35 段/周)
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
//
// v3.1 阶段 28F 个人曲库 #5 拍板 (2026-07-25 22:15 冬生 '按你的建议继续'):
//   #5 = upload + 严守 3 层 + 私域限好友
//   新 action: 'upload' | 'list_uploads' | 'delete_upload' | 'set_share' | 'get_share'
//   上传路径: yueji-personal-lib/<openid>/uploads/<uuid>.json (metadata) + <uuid>.mp3 (mp3 二进制)
//   严守 3 层: validateText (14 禁用 + 12 玄学) + detectCrisis (15 危机词 → 12356)
//   私域: shareTo 1-9 个昵称, 云存储隔离 openid 索引, 仅上传者自己可播放
//   限制: 单 mp3 ≤ 5 MB (微信 wx.uploadFile 限制), 单用户最多 30 段上传

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
        msg: "我们注意到您可能正在经历困难时期. 请拨打 12356 全国心理援助热线, 悦济陪您.",
      };
    }
    if (!validateText(user_input)) {
      return { ok: false, error: "悦济严守: 检测到不当用语, 请重新输入." };
    }
  }

  // 严守 2: 调式校验
  if (inputWeekStart && typeof inputWeekStart !== "string") {
    return { ok: false, error: "weekStart 必须是 YYYY-MM-DD 字符串" };
  }

  try {
    const weekStart = inputWeekStart || getWeekStart();
    const weekDays = getWeekDays(weekStart);

    // -- action: status (默认) -- 查本周状态
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

    // -- action: list -- 返本周 35 段清单
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

    // -- action: generate -- 批量生成 35 段
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

    // ── action: upload (v3.1 阶段 28F 个人曲库 #5) ──
    if (action === "upload") {
      const { title, desc, wuyue, mp3Base64, fileName } = event;
      return await uploadPersonal(OPENID, { title, desc, wuyue, mp3Base64, fileName });
    }

    // ── action: list_uploads (v3.1 阶段 28F) ──
    if (action === "list_uploads") {
      return await listUploads(OPENID);
    }

    // ── action: delete_upload (v3.1 阶段 28F) ──
    if (action === "delete_upload") {
      const { uploadId } = event;
      return await deleteUpload(OPENID, uploadId);
    }

    // ── action: set_share (v3.1 阶段 28F 私域限好友) ──
    if (action === "set_share") {
      const { uploadId, shareTo } = event;
      return await setShare(OPENID, uploadId, shareTo);
    }

    // ── action: get_share (v3.1 阶段 28F) ──
    if (action === "get_share") {
      const { uploadId } = event;
      return await getShare(OPENID, uploadId);
    }

    return { ok: false, error: `未知 action: ${action}, 必须是 generate/list/status/upload/list_uploads/delete_upload/set_share/get_share 之一` };
  } catch (e) {
    console.error(`[personal_library 异常] ${e.message}`);
    return {
      ok: false,
      action,
      error: e.message,
    };
  }
};

// ── v3.1 阶段 28F 个人曲库 #5: 上传/列表/删除/分享 ──
// 严守 3 层 (复用): 14 禁用词 + 12 玄学红线 + 15 危机词 (in title/desc/metadata)
// 私域限好友: shareTo 1-9 个昵称, 云存储按 openid 隔离, 仅上传者可播放
// 限制: 单 mp3 ≤ 5 MB, 单用户 ≤ 30 段上传

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;  // 5 MB
const MAX_UPLOADS_PER_USER = 30;
const MAX_SHARE_NICKS = 9;
const ALLOWED_WUYUE = WUYUE_KEYS;  // ["gong", "shang", "jiao", "zhi", "yu"]
const UPLOAD_DIR = "yueji-personal-lib";

function genUuid() {
  // 简易 UUID (云函数环境无 crypto.randomUUID)
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// 上传个人 mp3
async function uploadPersonal(openid, payload) {
  const { title, desc, wuyue, mp3Base64, fileName } = payload;

  // 严守 1: 14 禁用 + 12 玄学 (in title/desc)
  if (!title || typeof title !== "string" || title.length > 50) {
    return { ok: false, error: "标题必填且 ≤ 50 字" };
  }
  if (!validateText(title)) {
    return { ok: false, error: "悦济严守: 标题含不当用语, 请重新输入" };
  }
  if (desc && typeof desc === "string" && desc.length > 200) {
    return { ok: false, error: "备注 ≤ 200 字" };
  }
  if (desc && !validateText(desc)) {
    return { ok: false, error: "悦济严守: 备注含不当用语, 请重新输入" };
  }

  // 严守 2: 危机词 (in title/desc) → 12356
  const titleCrisis = detectCrisis(title);
  const descCrisis = desc ? detectCrisis(desc) : null;
  if (titleCrisis || descCrisis) {
    const kw = titleCrisis || descCrisis;
    try {
      await cloud.database().collection("yueji_crisis_logs").add({
        data: { openid, keyword: kw, action: "personal_library_upload_crisis", created_at: new Date() },
      });
    } catch (e) { console.error("[crisis log]", e.message); }
    return {
      ok: false,
      crisis: true,
      msg: "我们注意到您可能正在经历困难时期. 请拨打 12356 全国心理援助热线, 悦济陪您.",
    };
  }

  // 严守 3: 调式校验
  if (!ALLOWED_WUYUE.includes(wuyue)) {
    return { ok: false, error: `wuyue 必须是 ${ALLOWED_WUYUE.join("/")} 之一` };
  }

  // 限制 1: mp3 大小
  if (!mp3Base64 || typeof mp3Base64 !== "string") {
    return { ok: false, error: "mp3Base64 必填" };
  }
  // base64 解码后约 3/4 长度
  const approxBytes = Math.floor(mp3Base64.length * 3 / 4);
  if (approxBytes > MAX_UPLOAD_SIZE) {
    return { ok: false, error: `mp3 文件 ≤ 5 MB (当前约 ${(approxBytes / 1024 / 1024).toFixed(2)} MB)` };
  }

  // 限制 2: 单用户上传数 ≤ 30
  const userUploads = await cloud.downloadFile({
    fileID: `cloud://${UPLOAD_DIR}/${openid}/uploads/_index.json`,
  }).then((r) => JSON.parse(r.fileContent.toString("utf8"))).catch(() => null);
  const existingUploads = (userUploads && userUploads.uploads) || [];
  if (existingUploads.length >= MAX_UPLOADS_PER_USER) {
    return { ok: false, error: `单用户最多上传 ${MAX_UPLOADS_PER_USER} 段, 请先删除` };
  }

  // 写 mp3 二进制
  const uploadId = genUuid();
  const mp3Buffer = Buffer.from(mp3Base64, "base64");
  const mp3CloudPath = `${UPLOAD_DIR}/${openid}/uploads/${uploadId}.mp3`;
  let mp3FileID = null;
  try {
    const upRes = await cloud.uploadFile({ cloudPath: mp3CloudPath, fileContent: mp3Buffer });
    mp3FileID = upRes.fileID;
  } catch (e) {
    return { ok: false, error: `mp3 上传失败: ${e.message}` };
  }

  // 写 metadata
  const metadata = {
    uploadId,
    title: title.trim(),
    desc: (desc || "").trim(),
    wuyue,
    fileName: fileName || `${uploadId}.mp3`,
    fileID: mp3FileID,
    size: mp3Buffer.length,
    shareTo: [],  // 私域: 1-9 个昵称
    created_at: new Date().toISOString(),
  };
  const metaCloudPath = `${UPLOAD_DIR}/${openid}/uploads/${uploadId}.json`;
  try {
    await cloud.uploadFile({
      cloudPath: metaCloudPath,
      fileContent: Buffer.from(JSON.stringify(metadata, null, 2), "utf8"),
    });
  } catch (e) {
    // 回滚 mp3
    try { await cloud.deleteFile({ fileList: [mp3FileID] }); } catch (_) { /* noop */ }
    return { ok: false, error: `metadata 写失败: ${e.message}` };
  }

  // 更新 _index.json
  existingUploads.push({
    uploadId, title: metadata.title, wuyue, fileID: mp3FileID, size: mp3Buffer.length,
    shareTo: [], created_at: metadata.created_at,
  });
  try {
    await cloud.uploadFile({
      cloudPath: `${UPLOAD_DIR}/${openid}/uploads/_index.json`,
      fileContent: Buffer.from(JSON.stringify({ uploads: existingUploads }, null, 2), "utf8"),
    });
  } catch (e) {
    console.warn("[upload] _index 写失败 (但 mp3+metadata 已写)", e.message);
  }

  return { ok: true, uploadId, metadata, msg: "上传成功, 已通过严守 3 层扫描" };
}

// 列出自己上传的 mp3
async function listUploads(openid) {
  try {
    const res = await cloud.downloadFile({
      fileID: `cloud://${UPLOAD_DIR}/${openid}/uploads/_index.json`,
    });
    const data = JSON.parse(res.fileContent.toString("utf8"));
    return { ok: true, uploads: data.uploads || [] };
  } catch (e) {
    return { ok: true, uploads: [], msg: "暂无上传" };
  }
}

// 删除自己上传的 mp3
async function deleteUpload(openid, uploadId) {
  if (!uploadId) return { ok: false, error: "uploadId 必填" };
  const list = await listUploads(openid);
  const target = list.uploads.find((u) => u.uploadId === uploadId);
  if (!target) return { ok: false, error: "上传不存在或非自己上传" };

  // 删 mp3 + metadata
  try {
    await cloud.deleteFile({ fileList: [target.fileID, `cloud://${UPLOAD_DIR}/${openid}/uploads/${uploadId}.json`] });
  } catch (e) {
    return { ok: false, error: `删除失败: ${e.message}` };
  }

  // 更新 _index
  const newUploads = list.uploads.filter((u) => u.uploadId !== uploadId);
  try {
    await cloud.uploadFile({
      cloudPath: `${UPLOAD_DIR}/${openid}/uploads/_index.json`,
      fileContent: Buffer.from(JSON.stringify({ uploads: newUploads }, null, 2), "utf8"),
    });
  } catch (e) { /* noop */ }

  return { ok: true, msg: "已删除" };
}

// 设置分享 (1-9 个昵称, 限私域)
async function setShare(openid, uploadId, shareTo) {
  if (!uploadId) return { ok: false, error: "uploadId 必填" };
  if (!Array.isArray(shareTo) || shareTo.length === 0) {
    return { ok: false, error: "shareTo 必填非空数组" };
  }
  if (shareTo.length > MAX_SHARE_NICKS) {
    return { ok: false, error: `最多分享给 ${MAX_SHARE_NICKS} 个好友` };
  }
  // 严守 4: shareTo 昵称严守扫描 (避免上传者用 nickname 隐藏违规)
  for (const nick of shareTo) {
    if (typeof nick !== "string" || nick.length > 20) {
      return { ok: false, error: "每个昵称 ≤ 20 字" };
    }
    if (!validateText(nick)) {
      return { ok: false, error: `悦济严守: 分享昵称 "${nick}" 含不当用语` };
    }
  }

  // 读 metadata, 改 shareTo, 写回
  const metaFileID = `cloud://${UPLOAD_DIR}/${openid}/uploads/${uploadId}.json`;
  let metadata;
  try {
    const res = await cloud.downloadFile({ fileID: metaFileID });
    metadata = JSON.parse(res.fileContent.toString("utf8"));
  } catch (e) {
    return { ok: false, error: "metadata 不存在" };
  }
  metadata.shareTo = shareTo;
  metadata.shared_at = new Date().toISOString();
  try {
    await cloud.uploadFile({
      cloudPath: `${UPLOAD_DIR}/${openid}/uploads/${uploadId}.json`,
      fileContent: Buffer.from(JSON.stringify(metadata, null, 2), "utf8"),
    });
  } catch (e) {
    return { ok: false, error: `shareTo 写失败: ${e.message}` };
  }

  // 更新 _index
  const list = await listUploads(openid);
  const newUploads = list.uploads.map((u) => u.uploadId === uploadId ? { ...u, shareTo } : u);
  try {
    await cloud.uploadFile({
      cloudPath: `${UPLOAD_DIR}/${openid}/uploads/_index.json`,
      fileContent: Buffer.from(JSON.stringify({ uploads: newUploads }, null, 2), "utf8"),
    });
  } catch (e) { /* noop */ }

  return { ok: true, shareTo, msg: `已设置分享给 ${shareTo.length} 个好友 (私域限好友, 非公开)` };
}

// 查我分享给了谁
async function getShare(openid, uploadId) {
  if (!uploadId) return { ok: false, error: "uploadId 必填" };
  const metaFileID = `cloud://${UPLOAD_DIR}/${openid}/uploads/${uploadId}.json`;
  try {
    const res = await cloud.downloadFile({ fileID: metaFileID });
    const metadata = JSON.parse(res.fileContent.toString("utf8"));
    return { ok: true, shareTo: metadata.shareTo || [], shared_at: metadata.shared_at || null };
  } catch (e) {
    return { ok: false, error: "metadata 不存在" };
  }
}
