// 悦济 v3.0.5 — 5 滋养曲风 (5 调式) 映射 (阶段 1.5 扩展)
// 5 调式: 宫/商/角/徵/羽 ↔ 5 元素 (土/金/木/火/水) ↔ 5 脏 (脾/肺/肝/心/肾)
// 9 体质 + 镜中 4 维 → 1 调式 + 1 段 mp3
// 严守: 不出现"治疗/疗愈/缓解"等 14 禁用词
// 6 段 v1 mp3 在 assets/music/v3_5modes/ (宫 v1+商 v1+角 v1+徵 v1+羽 v1)

const WUYUE_NAMES = {
  gong: '宫', shang: '商', jiao: '角', zhi: '徵', yu: '羽',
};
const WUYUE_FULL = {
  gong: '宫调 (土/脾)',
  shang: '商调 (金/肺)',
  jiao: '角调 (木/肝)',
  zhi: '徵调 (火/心)',
  yu: '羽调 (水/肾)',
};
const WUYUE_DESCRIPTIONS = {
  gong: '温润土音, 养脾胃, 中和调性',
  shang: '清亮金音, 润肺理气, 收敛调性',
  jiao: '生发木音, 疏肝解郁, 升发调性',
  zhi: '温热火音, 养心安神, 温通调性',
  yu: '沉降水音, 滋肾藏精, 沉降调性',
};

// 5 段 v1 mp3 (本地, assets/music/v3_5modes/)
const WUYUE_V1_MP3 = {
  gong: 'assets/music/v3_5modes/01_gong_v1_guzheng_60bpm.mp3',
  shang: 'assets/music/v3_5modes/02_shang_v1_xiao_70bpm.mp3',
  jiao: 'assets/music/v3_5modes/03_jiao_v1_bamboo_65bpm.mp3',
  zhi: 'assets/music/v3_5modes/04_zhi_v1_erhu_60bpm.mp3',
  yu: 'assets/music/v3_5modes/05_yu_v1_pipa_55bpm.mp3',
};

// 9 体质 → 推荐 1 调式
// 9 体质 key 跟 data_assess.js 一致
const TIZHI_TO_WUYUE = {
  pinghe: 'gong',  // 平和 → 宫 (中正)
  qixu: 'gong',    // 气虚 → 宫 (土养)
  yangxu: 'zhi',   // 阳虚 → 徵 (火温)
  yinxu: 'yu',     // 阴虚 → 羽 (水润)
  tanshi: 'shang', // 痰湿 → 商 (金收)
  shire: 'shang',  // 湿热 → 商 (金清)
  xueyu: 'jiao',   // 血瘀 → 角 (木疏)
  qiyu: 'jiao',    // 气郁 → 角 (木达)
  tebing: 'gong',  // 特禀 → 宫 (中正, 不偏)
};

// 镜中 4 维 (1-10 数字) → 调式微调 (覆盖 9 体质 映射)
function wuyueFromMood4(mood, energy, sleep, skin) {
  if (typeof sleep === 'number' && sleep < 5) return 'yu';      // 睡差 → 羽 (水沉, 助眠)
  if (typeof mood === 'number' && mood < 5) return 'jiao';      // 情绪低 → 角 (木达, 疏肝)
  if (typeof energy === 'number' && energy < 5) return 'gong';   // 累 → 宫 (土养, 中和)
  if (typeof skin === 'number' && skin < 5) return 'yu';        // 肌肤干 → 羽 (水润)
  return null; // 镜中 4 维无显著问题, 走 9 体质
}

// 主推荐: 9 体质 + 镜中 4 维 → 1 调式
function recommendWuyue(tizhi, latest4) {
  const m = latest4 || {};
  const fromMood = wuyueFromMood4(m.mood, m.energy, m.sleep, m.skin);
  if (fromMood) return fromMood;
  return TIZHI_TO_WUYUE[tizhi] || 'gong';
}

// 9 体质 + 4 维 排名 (3 调式供大模型润色选 1)
function rankWuyueCandidates(tizhi, latest4) {
  const primary = recommendWuyue(tizhi, latest4);
  const all = ['gong', 'shang', 'jiao', 'zhi', 'yu'].filter(k => k !== primary);
  return [primary, ...all];
}

module.exports = {
  WUYUE_NAMES, WUYUE_FULL, WUYUE_DESCRIPTIONS, WUYUE_V1_MP3,
  TIZHI_TO_WUYUE, recommendWuyue, rankWuyueCandidates,
};
