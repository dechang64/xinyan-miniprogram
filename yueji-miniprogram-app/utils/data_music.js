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

// 30 段 mp3 cloudPath: 5 段 v1 (v0_5modes/) + 25 段 v2 (v0_5modes_v2/), 两个目录并存
// v1 5 段: 冬生 v3.0.5 阶段 1.5 部署时手动传, 路径 v0_5modes/ (云存储真实路径, 01:23 截图证实子目录名前缀是 v0)
// v2 25 段: 2026-07-14 16:49 批量传 (dl_25_v2.ps1 下载 + 上传), 路径 v0_5modes_v2/
const CLOUD_PREFIX_V1 = 'cloud://cloud1-d1g4p3kaa481d1302.636c-cloud1-d1g4p3kaa481d1302-1453283852/yueji-music-v3.0.5/v0_5modes';
const CLOUD_PREFIX_V2 = 'cloud://cloud1-d1g4p3kaa481d1302.636c-cloud1-d1g4p3kaa481d1302-1453283852/yueji-music-v3.0.5/v0_5modes_v2';

// v3.1 阶段 9: v1 5 段 cloudPath 改名 (matrix-media-xxx 加密名, 冬生 v3.0.5 阶段 1.5 手动传时没指定 cloudPath, 微信云存储自动生成)
// 23:08 + 01:14 + 01:25 三张截图证实: v0_5modes/ 目录下 5 个文件全是 matrix-media-xxx 加密名 (不是 01_gong_v1_...mp3 本地源命名)
// v3.1 阶段 10 (撤回): 6b25d50 撤回 matrix-media 改回 01_gong_v1_...mp3 是错的, 应保留 matrix-media
// 5 个 fileID 按云存储下文件大小排序:
//  1) 781 KB  shang_v1 (2nd smallest)
//  2) 797 KB  gong_v1
//  3) 975 KB  zhi_v1
//  4) 2.12 MB jiao_v1
//  5) 3.16 MB yu_v1 (largest)
// ⚠️ 调式对应 (gong/shang/jiao/zhi/yu) 是按文件大小顺序瞎猜, 30% 概率错配
//    冬生 v3.0.5 阶段 1.5 手动传时心里有数, 真机跑听感后告诉我哪个调式错, 我再调换
// v3.1 阶段 15: V1_FILEID 5 段 fileID 全错 (阶段 9 反推字面看错 + 阶段 11 没查真备份)
// 真值来源 3 处对齐:
//   (1) yueji-music-by-wuyue.zip (2026-07-14 4:48:10) 5 段 v1 mp3 实际文件名 = 冬生从云存储下载
//   (2) gen_music_zip_wuyue.js L25-29 v1Map dict
//   (3) gen_music_zip.js L10-14 v1 数组
// 三处 fileID 一致, 不再瞎改. 修复 STORAGE_FILE_NONEXIST 真因
const V1_FILEID = {
  gong:  `${CLOUD_PREFIX_V1}/matrix-media-1784009991194-b7b3fd0d.mp3`,  // 806086 bytes (788 KB)
  shang: `${CLOUD_PREFIX_V1}/matrix-media-1784010166072-7c890709.mp3`,  // 800326 bytes (782 KB)
  jiao:  `${CLOUD_PREFIX_V1}/matrix-media-1784010166072-92a55a28.mp3`,  // 2227654 bytes (2.12 MB)
  zhi:   `${CLOUD_PREFIX_V1}/matrix-media-1784010166072-ca8feb90.mp3`,  // 3315718 bytes (3.16 MB)
  yu:    `${CLOUD_PREFIX_V1}/matrix-media-1784010166072-96df3bff.mp3`,  // 998470 bytes (975 KB)
};

const WUYUE_30_FILEID = {
  gong: [
    V1_FILEID.gong,
    `${CLOUD_PREFIX_V2}/06_gong_guqin_65bpm.mp3`,
    `${CLOUD_PREFIX_V2}/07_gong_pipa_70bpm.mp3`,
    `${CLOUD_PREFIX_V2}/08_gong_muyu_75bpm.mp3`,
    `${CLOUD_PREFIX_V2}/09_gong_bell_80bpm.mp3`,
    `${CLOUD_PREFIX_V2}/10_gong_paigu_55bpm.mp3`,
  ],
  shang: [
    V1_FILEID.shang,
    `${CLOUD_PREFIX_V2}/06_shang_bamboo_60bpm.mp3`,
    `${CLOUD_PREFIX_V2}/07_shang_qing_65bpm.mp3`,
    `${CLOUD_PREFIX_V2}/08_shang_gong_75bpm.mp3`,
    `${CLOUD_PREFIX_V2}/09_shang_paixiao_80bpm.mp3`,
    `${CLOUD_PREFIX_V2}/10_shang_bronze_55bpm.mp3`,
  ],
  jiao: [
    V1_FILEID.jiao,
    `${CLOUD_PREFIX_V2}/06_jiao_hulusi_60bpm.mp3`,
    `${CLOUD_PREFIX_V2}/07_jiao_sheng_70bpm.mp3`,
    `${CLOUD_PREFIX_V2}/08_jiao_huangguan_75bpm.mp3`,
    `${CLOUD_PREFIX_V2}/09_jiao_duanxiao_80bpm.mp3`,
    `${CLOUD_PREFIX_V2}/10_jiao_bawu_55bpm.mp3`,
  ],
  zhi: [
    V1_FILEID.zhi,
    `${CLOUD_PREFIX_V2}/06_zhi_guzheng_65bpm.mp3`,
    `${CLOUD_PREFIX_V2}/07_zhi_yueqin_70bpm.mp3`,
    `${CLOUD_PREFIX_V2}/08_zhi_ruan_75bpm.mp3`,
    `${CLOUD_PREFIX_V2}/09_zhi_sanxian_80bpm.mp3`,
    `${CLOUD_PREFIX_V2}/10_zhi_banhu_55bpm.mp3`,
  ],
  yu: [
    V1_FILEID.yu,
    `${CLOUD_PREFIX_V2}/06_yu_konghou_60bpm.mp3`,
    `${CLOUD_PREFIX_V2}/07_yu_se_65bpm.mp3`,
    `${CLOUD_PREFIX_V2}/08_yu_yangqin_70bpm.mp3`,
    `${CLOUD_PREFIX_V2}/09_yu_bianzhong_75bpm.mp3`,
    `${CLOUD_PREFIX_V2}/10_yu_bianqing_80bpm.mp3`,
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

// v3.1 阶段 13: 按指定调式 + 日期 hash 选 1 段 (用户点 5 调式 tab 时用, 不依赖 9 体质)
function recommendWuyueTrackByWuyue(wuyueKey) {
  const tracks = WUYUE_30_FILEID[wuyueKey] || [];
  if (tracks.length === 0) return { wuyue: wuyueKey, fileID: '', trackIndex: 0 };
  const dateStr = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash = hash & hash;
  }
  const idx = Math.abs(hash) % tracks.length;
  return { wuyue: wuyueKey, fileID: tracks[idx], trackIndex: idx };
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
  CLOUD_PREFIX_V1, CLOUD_PREFIX_V2,
  TIZHI_TO_WUYUE, recommendWuyue, recommendWuyueTrack, recommendWuyueTrackByWuyue, getTempUrls, rankWuyueCandidates,
};
