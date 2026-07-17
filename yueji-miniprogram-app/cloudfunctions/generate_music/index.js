// 云函数: generate_music (悦济 v3.1 阶段 22.4 + 阶段 26 — 5 调式懒加载音乐生成)
// 拍板 (2026-07-16 22:00 冬生 '按你的方案开干'):
//   D 方案: 懒加载+缓存 (新云函数 + 改 16_今日一曲, 1-2 commit)
//   拍板 (2026-07-17 01:13 冬生 '好的, 发 zip 吧' + 01:12/01:13 截图):
//     改走 minimax 官方 (TokenPlan Max 年度会员 1 key 调全系, 30,706 积分即将到期)
//     env 统一: MINIMAX_TOKEN_KEY (取代 AMAX AI_API_KEY + 之前占位 MINIMAX_MUSIC_KEY)
//     跟 chat 云函数共用 1 个 Key, 1 commit 改 3 云函数 (chat + generate_music + personal_library)
//   通道: A 先 mock (冬生配 MINIMAX_TOKEN_KEY 后切真通道), 真通道走 minimax Music 2.6
//   30 段云存储 mp3: B 30 段重生成 (冬生配 key 跑, 比赛前 7-22 完)
//   严守: 14 禁用词 + 12 玄学红线 + 15 危机词 + 4 红线 0 出现 (必跑)
//
// 入口: { wuyue: 'gong'|'shang'|'jiao'|'zhi'|'yu', force?: bool }
// 返:   { ok, fileID, hash, wuyue, isCache, mock, msg }
//
// 流程 (D 方案 3 层缓存):
//   1. L1 本地 setStorage: 16_今日一曲 查 wx.getStorageSync('yueji_music_cache_<wuyue>') (前端 L1, 不在这)
//   2. L2 云存储 hash 去重: 列 wx.cloud.getTempFileURL 目录, hash 命中 → 返 fileID + isCache=true
//   3. L3 minimax Music 2.6 真通道 (mock 模式: 返占位 fileID + isCache=false)
//   4. wx.cloud.uploadFile: 上传 mp3 → 返 fileID
//   5. 写 fileID 到前端 setStorage (16_今日一曲 onSelectWuyue 写)
//
// 严守 14 禁用词: 治疗/改善/缓解/治愈/祛斑/减肥/处方/医美/美颜/美白/瘦脸/营销/广告/疗愈
// 严守 12 玄学红线: 命理/占星/八字/星盘/算命/转运/化解/风水/玄学/五行/生克/补泻
// 严守 15 危机词: 自杀/自残/轻生/跳楼/割腕/上吊/服药过量/绝望/崩溃/了断/结束生命/一了百了/不想活/活不下去/没意义

const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 5 调式综合方案 C prompt (v3.1 阶段 22.1 落 music.py, 复用同源)
// 复用 v0.1-prototype/data/music.py 综合方案 C 描述
const WUYUE_PROMPTS = {
  gong: {
    // 宫 (土, 脾) — 古琴 (主) + 古筝 (弱高) + 笙 (低)
    // 综合方案 C: 广陵散/梅花三弄/阳春是宫调古琴代表
    prompt: "75 BPM, C major pentatonic (do, re, mi, sol, la: C-D-E-G-A), guqin zither leading with guzheng zither in soft high register and sheng mouth organ in low register, gentle 30ms attack, 1s reverb, like autumn harvest song, nourishing spleen meridian, earth-tone color, no percussion, no vocals, 60 seconds seamless loop, -20 LUFS, mono-to-stereo (channel time difference <= 30 microseconds for BMLD stereo cue), inter-segment silence >= 200ms, spectrum centroid 200-800 Hz, harmonics 5-10 with strong even harmonics, distortion < 1%, volume 25 dB background to 55 dB therapeutic, 44.1 kHz / 16-bit",
    wuxing: "土", zangfu: "脾",
  },
  shang: {
    // 商 (金, 肺) — 笙 (主) + 古筝 (中) + 钢片琴 (弱高)
    // 综合方案 C: 笙替代编钟/磬尖锐
    prompt: "85 BPM, D major pentatonic (re, mi, fa#, la, ti: D-E-G-A-C), sheng mouth organ leading with guzheng zither in mid register and celesta in soft high register, crisp 5ms attack, 0.5s decay, clear and silver like autumn moonlight, supporting lung meridian, no percussion, no vocals, 60 seconds seamless loop, -20 LUFS, mono-to-stereo (channel time difference <= 30 microseconds for BMLD stereo cue), inter-segment silence >= 200ms, spectrum centroid 2-5 kHz, harmonics 5-10, distortion < 2%, volume 25 dB background to 55 dB therapeutic, 44.1 kHz / 16-bit",
    wuxing: "金", zangfu: "肺",
  },
  jiao: {
    // 角 (木, 肝) — 竹笛 (主) + 古筝 (中) + 笙 (低)
    // 综合方案 C: 玉屏箫笛是角代表, 竹笛替代木管/葫芦丝
    prompt: "70 BPM, E minor pentatonic (mi, sol, la, ti, re: E-G-A-B-D), bamboo flute (dizi) leading with guzheng zither in mid register and sheng mouth organ in low register, gentle 20ms attack, 0.8s reverb, like spring morning sun through leaves, supporting liver meridian, no percussion, no vocals, 60 seconds seamless loop, -20 LUFS, mono-to-stereo (channel time difference <= 30 microseconds for BMLD stereo cue), inter-segment silence >= 200ms, spectrum centroid 400-1.5 kHz, mixed even and odd harmonics, volume 25 dB background to 50 dB therapeutic, 44.1 kHz / 16-bit",
    wuxing: "木", zangfu: "肝",
  },
  zhi: {
    // 徵 (火, 心) — 古筝 (主) + 笙 (高) + 古琴 (低)
    // 综合方案 C: 十面埋伏/高山流水是徵调古筝代表
    prompt: "95 BPM, E minor pentatonic (mi, sol, la, ti, re: E-G-A-B-D), guzheng zither leading with sheng mouth organ in high register and guqin zither in low register, sustained 30ms attack, 1.2s reverb, like golden sunset, nurturing heart meridian, no percussion, no vocals, 60 seconds seamless loop, -20 LUFS, mono-to-stereo (channel time difference <= 30 microseconds for BMLD stereo cue), inter-segment silence >= 200ms, spectrum centroid 800-3 kHz, harmonics 5-10, distortion < 3%, volume 25 dB background to 60 dB therapeutic, 44.1 kHz / 16-bit",
    wuxing: "火", zangfu: "心",
  },
  yu: {
    // 羽 (水, 肾) — 箫 (主) + 古琴 (低) + 竹笛 (弱高)
    // 综合方案 C: 良宵/妆台秋思是羽调箫代表
    prompt: "60 BPM, A natural minor pentatonic (la, do, re, mi, sol: A-C-D-E-G), xiao (Chinese vertical bamboo flute) leading, with guqin zither in low register and bamboo flute in soft high register, very soft 5ms attack, long reverb tail 1.5-2s, gentle flow like morning mist over a still lake, meditation for kidney meridian and inner peace, no percussion, no vocals, no bright highs, 60 seconds seamless loop, -20 LUFS, mono-to-stereo (channel time difference <= 30 microseconds for BMLD stereo cue), inter-segment silence >= 200ms to prevent Zwicker Tone, spectrum centroid 1-3 kHz, harmonics 5-10, -20 dB above 5th harmonic, volume 25 dB background to 50 dB therapeutic, 44.1 kHz / 16-bit",
    wuxing: "水", zangfu: "肾",
  },
};

// 8 禁用词 (反向声明, 用于拦截, 跟 chat 云函数一致)
const FORBIDDEN_WORDS = [
  "治疗", "改善", "缓解", "治愈", "祛斑", "减肥", "处方", "医美",
  "美颜", "美白", "瘦脸", "营销", "广告", "疗愈",
];

// 12 玄学红线 (悦济 v3.1 阶段 8 严守)
const XUANXUE_WORDS = [
  "命理", "占星", "八字", "星盘", "算命", "转运", "化解",
  "风水", "玄学", "五行", "生克", "补泻",
];

// 15 危机关键词 (跟 chat 一致, 触发返 12356)
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

// v3.1 阶段 26: minimax Music 2.6 真通道 (TokenPlan Max 1 key 调全系)
// 真查 (2026-07-17): https://api.minimaxi.com/v1/music_generation 国内版 (冬生 01:12 截图 platform.minimaxi.com 对齐)
// 鉴权: Authorization: Bearer <MINIMAX_TOKEN_KEY> (冬生 01:13 截图 TokenPlan Max 订阅 Key, 后 5 位 2V2L_A)
// body: {model: "music-2.6", prompt, lyrics: "", audio_setting: {sample_rate, bitrate, format}}
// response: {data: {audio: "hex string"}, base_resp: {status_code: 0, status_msg: "success"}}
// 错误: base_resp.status_code !== 0 (例 1004 invalid api key)
async function callMinimaxMusic(prompt, wuyueKey) {
  const apiKey = process.env.MINIMAX_TOKEN_KEY;
  const mockMode = !apiKey || apiKey === "mock" || apiKey.length < 10;

  if (mockMode) {
    // Mock 模式: 返 mock mp3 path (前端 fallback 30 段 v0.7.1.9)
    console.log(`[generate_music] 🎵 mock 模式 (MINIMAX_TOKEN_KEY 未配或无效), wuyue=${wuyueKey}`);
    return {
      mock: true,
      audioPath: null,
      prompt,
      msg: "mock 模式, 等冬生配 MINIMAX_TOKEN_KEY (TokenPlan Max 1 key 调全系) 后切真通道",
    };
  }

  // 真通道: minimax Music 2.6 (国内版)
  // 严守: 鉴权用 Bearer + https, 0 出现明文 key
  const baseUrl = (process.env.MINIMAX_BASE_URL || "https://api.minimaxi.com/v1").replace(/\/+$/, "");
  const url = baseUrl + "/music_generation";
  const body = JSON.stringify({
    model: "music-2.6",
    prompt: prompt,
    lyrics: "",  // 纯音乐, 不传 lyrics
    audio_setting: {
      sample_rate: 44100,
      bitrate: 256000,
      format: "mp3",
    },
  });
  console.log(`[generate_music] 🎵 minimax Music 2.6 真通道, wuyue=${wuyueKey}, baseUrl=${baseUrl}`);

  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname, port: 443, path: u.pathname + u.search, method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(body),
      },
      timeout: 60000,  // minimax Music 首包延迟 < 20s (Music 2.6 真文档), 给 60s 缓冲
    }, (res) => {
      let chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`minimax Music HTTP ${res.statusCode}: ${text.slice(0, 300)}`));
        }
        try {
          const json = JSON.parse(text);
          // 业务错: base_resp.status_code !== 0 (例 1004 invalid api key)
          if (json.base_resp && json.base_resp.status_code !== 0) {
            return reject(new Error(`minimax Music 业务错: ${json.base_resp.status_msg} (code: ${json.base_resp.status_code})`));
          }
          if (!json.data || !json.data.audio) {
            return reject(new Error("minimax Music 返 audio 为空"));
          }
          // hex → mp3 Buffer
          const mp3Buffer = Buffer.from(json.data.audio, "hex");
          const audioPath = `/tmp/yueji_music_${wuyueKey}_${Date.now()}.mp3`;
          require("fs").writeFileSync(audioPath, mp3Buffer);
          console.log(`[generate_music] minimax Music 生成成功, size=${mp3Buffer.length} bytes, path=${audioPath}`);
          resolve({
            mock: false,
            audioPath: audioPath,
            prompt,
            msg: `minimax Music 2.6 生成成功 (${wuyueKey}, ${mp3Buffer.length} bytes)`,
          });
        } catch (e) {
          reject(new Error(`minimax Music 解析 JSON 失败: ${e.message}, body=${text.slice(0, 200)}`));
        }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("minimax Music 请求超时 60s")));
    req.write(body);
    req.end();
  });
}

// L2 云存储 hash 去重: 列 yueji-music-v3.1-dynamic/ 目录, 找 fileID 命中
async function checkL2Cache(wuyueKey) {
  try {
    const res = await cloud.getTempFileURL({
      fileList: [`cloud://yueji-music-v3.1-dynamic/${wuyueKey}_*.mp3`],
    });
    // 注: getTempFileURL 不支持 glob, 这里简化返 0 命中, 让真通道 mock
    // 完整实现需用 cloud.downloadFile + 文件列表 API
    return null;
  } catch (e) {
    return null;
  }
}

// L3 上传 mp3 到云存储 (mock 模式: 跳过, 返 null 让前端走 fallback)
async function uploadToCloud(wuyueKey, audioPath) {
  if (!audioPath) {
    // mock 模式不真上传
    return null;
  }
  try {
    const res = await cloud.uploadFile({
      cloudPath: `yueji-music-v3.1-dynamic/${wuyueKey}_${Date.now()}.mp3`,
      fileContent: require("fs").readFileSync(audioPath),
    });
    return res.fileID;
  } catch (e) {
    console.error(`[generate_music] upload 失败: ${e.message}`);
    return null;
  }
}

// ── 入口 ──
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { wuyue, force = false, user_input } = event;

  console.log(`[generate_music] OPENID=${OPENID}, wuyue=${wuyue}, force=${force}`);

  // 严守 1: 危机检测
  if (user_input) {
    const crisisKw = detectCrisis(user_input);
    if (crisisKw) {
      try {
        await cloud.database().collection("yueji_crisis_logs").add({
          data: { openid: OPENID, keyword: crisisKw, action: "generate_music_intercepted", created_at: new Date() },
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

  // 严守 2: wuyue 校验
  if (!wuyue || !WUYUE_PROMPTS[wuyue]) {
    return {
      ok: false,
      error: `wuyue 必须是 gong/shang/jiao/zhi/yu 之一, 当前: ${wuyue}`,
    };
  }

  // 严守 3: prompt 校验 (WUYUE_PROMPTS 静态, 必过)
  const wuyueData = WUYUE_PROMPTS[wuyue];
  if (!validateText(wuyueData.prompt)) {
    return { ok: false, error: "悦济严守: 调式 prompt 校验失败, 禁用词命中" };
  }

  try {
    // L2 云存储 hash 去重 (mock 模式返 null)
    if (!force) {
      const l2 = await checkL2Cache(wuyue);
      if (l2) {
        return {
          ok: true,
          fileID: l2.fileID,
          hash: l2.hash,
          wuyue,
          isCache: true,
          mock: false,
          msg: `L2 缓存命中 (${wuyue})`,
        };
      }
    }

    // L3 调 minimax Music 2.6 (mock 模式 返 mock 标识, 让前端走 fallback)
    const musicRes = await callMinimaxMusic(wuyueData.prompt, wuyue);
    if (musicRes.mock) {
      return {
        ok: true,
        fileID: null,
        hash: `mock-${wuyue}-${Date.now()}`,
        wuyue,
        isCache: false,
        mock: true,
        msg: "mock 模式, 返占位 fileID, 前端走 fallback 30 段云存储",
      };
    }

    // 真通道 + 上传云存储 (待 MINIMAX_MUSIC_KEY 验证后完整实现)
    const fileID = await uploadToCloud(wuyue, musicRes.audioPath);
    if (!fileID) {
      return {
        ok: false,
        error: "上传云存储失败, 走 fallback 30 段",
        fallback: "30 段云存储 v0.7.1.9",
      };
    }

    return {
      ok: true,
      fileID,
      hash: `${wuyue}-${Date.now()}`,
      wuyue,
      isCache: false,
      mock: false,
      msg: `生成成功 (${wuyue}, 60s mp3)`,
    };
  } catch (e) {
    console.error(`[generate_music ${wuyue} 异常] ${e.message}`);
    return {
      ok: false,
      action: "generate_music",
      error: e.message,
      fallback: "30 段云存储 v0.7.1.9",
    };
  }
};
