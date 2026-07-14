// 悦济 v3.0.5 — 5 滋养曲风 (5 调式) 映射 (阶段 1.5 扩展)
// 5 调式: 宫/商/角/徵/羽 ↔ 5 元素 (土/金/木/火/水) ↔ 5 脏 (脾/肺/肝/心/肾)
// 9 体质 + 镜中 4 维 → 1 调式 + 随机 1 段 (5 调式 × 6 变体 = 30 段)
// 严守: 不出现"治疗/疗愈/缓解"等 14 禁用词
// 30 段 mp3 走 微信云存储 cloud:// (2 MB 主包限制, 不打包 mp3)

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

// 30 段 mp3 cloudPath 模板 (需 user 上传 30 段到云存储, 然后把 fileID 填这里)
// 路径: cloud://yueji-prod.xxx/music/<gong|shang|jiao|zhi|yu>/<编号>_<乐器>_<BPM>bpm.mp3
// 上传后 fileID 由 wx.cloud.uploadFile 返回, 把 cloud:// 整串粘到下面
const WUYUE_30_FILEID = {
  gong: [
    'cloud://yueji-prod.xxx/music/gong/01_guzheng_60bpm.mp3',     // 需 user 手动上传后替换 fileID
    'cloud://yueji-prod.xxx/music/gong/06_guqin_65bpm.mp3',
    'cloud://yueji-prod.xxx/music/gong/07_pipa_70bpm.mp3',
    'cloud://yueji-prod.xxx/music/gong/08_muyu_75bpm.mp3',
    'cloud://yueji-prod.xxx/music/gong/09_bell_80bpm.mp3',
    'cloud://yueji-prod.xxx/music/gong/10_paigu_55bpm.mp3',
  ],
  shang: [
    'cloud://yueji-prod.xxx/music/shang/02_xiao_70bpm.mp3',
    'cloud://yueji-prod.xxx/music/shang/06_bamboo_60bpm.mp3',
    'cloud://yueji-prod.xxx/music/shang/07_qing_65bpm.mp3',
    'cloud://yueji-prod.xxx/music/shang/08_gong_75bpm.mp3',
    'cloud://yueji-prod.xxx/music/shang/09_paixiao_80bpm.mp3',
    'cloud://yueji-prod.xxx/music/shang/10_bronze_55bpm.mp3',
  ],
  jiao: [
    'cloud://yueji-prod.xxx/music/jiao/03_bamboo_65bpm.mp3',
    'cloud://yueji-prod.xxx/music/jiao/06_hulusi_60bpm.mp3',
    'cloud://yueji-prod.xxx/music/jiao/07_sheng_70bpm.mp3',
    'cloud://yueji-prod.xxx/music/jiao/08_huangguan_75bpm.mp3',
    'cloud://yueji-prod.xxx/music/jiao/09_duanxiao_80bpm.mp3',
    'cloud://yueji-prod.xxx/music/jiao/10_bawu_55bpm.mp3',
  ],
  zhi: [
    'cloud://yueji-prod.xxx/music/zhi/04_erhu_60bpm.mp3',
    'cloud://yueji-prod.xxx/music/zhi/06_guzheng_65bpm.mp3',
    'cloud://yueji-prod.xxx/music/zhi/07_yueqin_70bpm.mp3',
    'cloud://yueji-prod.xxx/music/zhi/08_ruan_75bpm.mp3',
    'cloud://yueji-prod.xxx/music/zhi/09_sanxian_80bpm.mp3',
    'cloud://yueji-prod.xxx/music/zhi/10_banhu_55bpm.mp3',
  ],
  yu: [
    'cloud://yueji-prod.xxx/music/yu/05_pipa_55bpm.mp3',
    'cloud://yueji-prod.xxx/music/yu/06_konghou_60bpm.mp3',
    'cloud://yueji-prod.xxx/music/yu/07_se_65bpm.mp3',
    'cloud://yueji-prod.xxx/music/yu/08_yangqin_70bpm.mp3',
    'cloud://yueji-prod.xxx/music/yu/09_bianzhong_75bpm.mp3',
    'cloud://yueji-prod.xxx/music/yu/10_bianqing_80bpm.mp3',
  ],
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

// 推荐 1 调式 + 随机 1 段 (6 变体中选 1, 用日期 hash 保证每天不重复)
function recommendWuyueTrack(tizhi, latest4) {
  const wuyue = recommendWuyue(tizhi, latest4);
  const tracks = WUYUE_30_FILEID[wuyue] || [];
  if (tracks.length === 0) return { wuyue, fileID: '' };
  // 用日期 (YYYY-MM-DD) hash 选 1 段, 每天不重复
  const dateStr = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash = hash & hash; // 32-bit int
  }
  const idx = Math.abs(hash) % tracks.length;
  return { wuyue, fileID: tracks[idx], trackIndex: idx };
}

// 把 30 个 fileID 批量转临时 URL (2 小时有效, 调用前取)
function getTempUrls(fileIDs) {
  return new Promise((resolve) => {
    if (!wx.cloud || !fileIDs || fileIDs.length === 0) {
      resolve({ fileList: [] });
      return;
    }
    wx.cloud.getTempFileURL({
      fileList: fileIDs,
      success: (res) => resolve(res),
      fail: (e) => { console.warn('[悦济 music getTempFileURL]', e); resolve({ fileList: [] }); },
    });
  });
}

// 9 体质 + 4 维 排名 (3 调式供大模型润色选 1)
function rankWuyueCandidates(tizhi, latest4) {
  const primary = recommendWuyue(tizhi, latest4);
  const all = ['gong', 'shang', 'jiao', 'zhi', 'yu'].filter(k => k !== primary);
  return [primary, ...all];
}

module.exports = {
  WUYUE_NAMES, WUYUE_FULL, WUYUE_DESCRIPTIONS, WUYUE_30_FILEID,
  TIZHI_TO_WUYUE, recommendWuyue, recommendWuyueTrack, getTempUrls, rankWuyueCandidates,
};
