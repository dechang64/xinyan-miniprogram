// 悦济 v3.0.5 — 5 滋养曲风 (5 调式) 映射 (阶段 1.5 扩展)
// 5 调式: 宫/商/角/徵/羽 ↔ 5 元素 (土/金/木/火/水) ↔ 5 脏 (脾/肺/肝/心/肾)
// 9 体质 + 镜中 4 维 → 1 调式 + 随机 1 段 (5 调式 × 6 变体 = 30 段)
// 严守: 不出现"治疗/疗愈/缓解"等 14 禁用词
// 30 段 mp3 走 微信云存储 cloud:// (2 MB 主包限制, 不打包 mp3)
// 30 段 已上传到 yueji-music-v3.0.5/v3.5modes_v2/ (5 调式文件夹名被合并)

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

// 30 段 mp3 cloudPath (已上传到 cloud1-d1g4p3kaa481d1302 / yueji-music-v3.0.5/v3_5modes/)
// 微信云开发把 5 调式文件夹合并了, 30 段都在 v3_5modes/ 下 (注: 路径是 v3_5modes, 不是 v3.5modes_v2)
const CLOUD_PREFIX = 'cloud://cloud1-d1g4p3kaa481d1302.636c-cloud1-d1g4p3kaa481d1302-1453283852/yueji-music-v3.0.5/v3_5modes';

const WUYUE_30_FILEID = {
  gong: [
    `${CLOUD_PREFIX}/01_gong_v1_guzheng_60bpm.mp3`,
    `${CLOUD_PREFIX}/06_gong_guqin_65bpm.mp3`,
    `${CLOUD_PREFIX}/07_gong_pipa_70bpm.mp3`,
    `${CLOUD_PREFIX}/08_gong_muyu_75bpm.mp3`,
    `${CLOUD_PREFIX}/09_gong_bell_80bpm.mp3`,
    `${CLOUD_PREFIX}/10_gong_paigu_55bpm.mp3`,
  ],
  shang: [
    `${CLOUD_PREFIX}/02_shang_v1_xiao_70bpm.mp3`,
    `${CLOUD_PREFIX}/06_shang_bamboo_60bpm.mp3`,
    `${CLOUD_PREFIX}/07_shang_qing_65bpm.mp3`,
    `${CLOUD_PREFIX}/08_shang_gong_75bpm.mp3`,
    `${CLOUD_PREFIX}/09_shang_paixiao_80bpm.mp3`,
    `${CLOUD_PREFIX}/10_shang_bronze_55bpm.mp3`,
  ],
  jiao: [
    `${CLOUD_PREFIX}/03_jiao_v1_bamboo_65bpm.mp3`,
    `${CLOUD_PREFIX}/06_jiao_hulusi_60bpm.mp3`,
    `${CLOUD_PREFIX}/07_jiao_sheng_70bpm.mp3`,
    `${CLOUD_PREFIX}/08_jiao_huangguan_75bpm.mp3`,
    `${CLOUD_PREFIX}/09_jiao_duanxiao_80bpm.mp3`,
    `${CLOUD_PREFIX}/10_jiao_bawu_55bpm.mp3`,
  ],
  zhi: [
    `${CLOUD_PREFIX}/04_zhi_v1_erhu_60bpm.mp3`,
    `${CLOUD_PREFIX}/06_zhi_guzheng_65bpm.mp3`,
    `${CLOUD_PREFIX}/07_zhi_yueqin_70bpm.mp3`,
    `${CLOUD_PREFIX}/08_zhi_ruan_75bpm.mp3`,
    `${CLOUD_PREFIX}/09_zhi_sanxian_80bpm.mp3`,
    `${CLOUD_PREFIX}/10_zhi_banhu_55bpm.mp3`,
  ],
  yu: [
    `${CLOUD_PREFIX}/05_yu_v1_pipa_55bpm.mp3`,
    `${CLOUD_PREFIX}/06_yu_konghou_60bpm.mp3`,
    `${CLOUD_PREFIX}/07_yu_se_65bpm.mp3`,
    `${CLOUD_PREFIX}/08_yu_yangqin_70bpm.mp3`,
    `${CLOUD_PREFIX}/09_yu_bianzhong_75bpm.mp3`,
    `${CLOUD_PREFIX}/10_yu_bianqing_80bpm.mp3`,
  ],
};

// 9 体质 → 推荐 1 调式
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
  if (typeof sleep === 'number' && sleep < 5) return 'yu';
  if (typeof mood === 'number' && mood < 5) return 'jiao';
  if (typeof energy === 'number' && energy < 5) return 'gong';
  if (typeof skin === 'number' && skin < 5) return 'yu';
  return null;
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
  const dateStr = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash = hash & hash;
  }
  const idx = Math.abs(hash) % tracks.length;
  return { wuyue, fileID: tracks[idx], trackIndex: idx };
}

// 把 30 个 fileID 批量转临时 URL (2 小时有效)
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

function rankWuyueCandidates(tizhi, latest4) {
  const primary = recommendWuyue(tizhi, latest4);
  const all = ['gong', 'shang', 'jiao', 'zhi', 'yu'].filter(k => k !== primary);
  return [primary, ...all];
}

module.exports = {
  WUYUE_NAMES, WUYUE_FULL, WUYUE_DESCRIPTIONS, WUYUE_30_FILEID,
  TIZHI_TO_WUYUE, recommendWuyue, recommendWuyueTrack, getTempUrls, rankWuyueCandidates,
};
