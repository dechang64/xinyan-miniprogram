// 22_汤品详情.js — 悦济 v3.1 阶段 28C 汤品独立详情页
// 拍板 (2026-07-24 21:48 冬生 '1' 选 A+B+C 全做, 22:00 阶段 28C 开工):
//   22_汤品详情 跟 1.1_经文详情 模式对齐 (食材/做法/节气/严守 4 tab + 笔记/收藏/分享/已做)
//   数据源: utils/data_soups.js (30 汤品, name/tizhi/season/desc)
//   严守 14 禁用词 0 出现, 9 体质仅作参考, 不用 '养生方/食疗/调理', 用 '日常滋养汤品/节气膳食'
//
// 严守 4 大红线:
// ❌ 0 医疗诊断 (NMPA 第三类医疗器械)
// ❌ 0 化妆品/保健品/减肥药/医美仪器销售
// ❌ 0 心理危机干预 (引导 12356)
// ❌ 0 玄学 (命理/占星/八字/星盘/算命/转运/化解/风水/玄学/五行/生克/补泻)
//
// 严守 14 禁用词 0 出现:
// ❌ 治疗/改善/缓解/治愈/祛斑/减肥/处方/医美/美颜/美白/瘦脸/营销/广告/疗愈

const SOUPS = require('../../utils/data_soups.js');

// 9 体质中文名 (王琦 9 体质, 仅作参考)
const TIZHI_NAMES = {
  pinghe: '平和',
  qixu: '气虚',
  yangxu: '阳虚',
  yinxu: '阴虚',
  tanshi: '痰湿',
  shire: '湿热',
  xueyu: '血瘀',
  qiyu: '气郁',
  tebing: '特禀',
};

// 4 季 → 节气调性 (中医五运六气, 严守: 不用命理/八字, 用节气养生)
const SEASON_HINT = {
  春: '春养肝, 宜疏肝理气',
  夏: '夏养心, 宜清心静气',
  秋: '秋养肺, 宜润肺生津',
  冬: '冬养肾, 宜温肾固本',
};

// 解析 desc 拆出 食材 + 做法
// 例: '山药 100g + 排骨 200g + 红枣 5 颗, 炖 1 小时。'
// 拆: 食材 = '山药 100g + 排骨 200g + 红枣 5 颗', 做法 = '炖 1 小时'
function parseDesc(desc) {
  if (!desc) return { ingredients: '', steps: '' };
  // 优先按 '，' 切 (中文逗号)
  let parts;
  if (desc.indexOf('，') >= 0) {
    parts = desc.split('，');
  } else if (desc.indexOf(',') >= 0) {
    parts = desc.split(',');
  } else {
    // 兜底: 找 ' 炖' ' 煮' ' 冲' 等动作字
    const m = desc.match(/^([^炖煮冲炒蒸烧]+)([炖煮冲炒蒸烧].*)$/);
    if (m) {
      parts = [m[1], m[2]];
    } else {
      parts = [desc, ''];
    }
  }
  return {
    ingredients: parts[0] ? parts[0].trim() : '',
    steps: parts.slice(1).join('，').trim(),
  };
}

Page({
  data: {
    idx: 0,
    total: SOUPS.length,
    name: '',
    tizhi: '',
    tizhiName: '',
    season: '',
    seasonHint: '',
    ingredients: '',
    steps: '',
    desc: '',

    tab: 'ingredients',  // ingredients / steps / season / safe
    fav: false,
    done: false,
    showNoteModal: false,
    noteInput: '',
  },

  onLoad(options) {
    const idx = parseInt(options.idx || '0', 10);
    this.loadSoup(idx);
  },

  loadSoup(idx) {
    if (idx < 0 || idx >= SOUPS.length) return;
    const soup = SOUPS[idx];
    const parsed = parseDesc(soup.desc);
    const tizhiName = TIZHI_NAMES[soup.tizhi] || soup.tizhi;
    const seasonHint = SEASON_HINT[soup.season] || '';
    // 严守: 严守基调 0 出现禁用词
    this.setData({
      idx,
      name: soup.name,
      tizhi: soup.tizhi,
      tizhiName,
      season: soup.season,
      seasonHint,
      ingredients: parsed.ingredients,
      steps: parsed.steps,
      desc: soup.desc,
    });
    // 标题
    wx.setNavigationBarTitle({ title: soup.name });
    // 读收藏/已做
    this.readFav();
    this.readDone();
  },

  // 上一汤
  onTapPrev() {
    const newIdx = (this.data.idx - 1 + SOUPS.length) % SOUPS.length;
    this.loadSoup(newIdx);
  },

  // 下一汤
  onTapNext() {
    const newIdx = (this.data.idx + 1) % SOUPS.length;
    this.loadSoup(newIdx);
  },

  // 标签切换
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ tab });
  },

  // 收藏
  readFav() {
    try {
      const favs = wx.getStorageSync('yueji_soup_fav') || [];
      this.setData({ fav: favs.includes(this.data.name) });
    } catch (e) {}
  },

  onTapFav() {
    try {
      let favs = wx.getStorageSync('yueji_soup_fav') || [];
      if (favs.includes(this.data.name)) {
        favs = favs.filter((n) => n !== this.data.name);
        this.setData({ fav: false });
        wx.showToast({ title: '已取消收藏', icon: 'none' });
      } else {
        favs.push(this.data.name);
        this.setData({ fav: true });
        wx.showToast({ title: '已收藏', icon: 'success' });
      }
      wx.setStorageSync('yueji_soup_fav', favs);
    } catch (e) {
      wx.showToast({ title: '收藏失败', icon: 'none' });
    }
  },

  // 已做
  readDone() {
    try {
      const progress = wx.getStorageSync('yueji_soup_progress') || {};
      this.setData({ done: !!progress[this.data.name] });
    } catch (e) {}
  },

  onTapDone() {
    try {
      const progress = wx.getStorageSync('yueji_soup_progress') || {};
      if (progress[this.data.name]) {
        // 取消已做
        delete progress[this.data.name];
        this.setData({ done: false });
        wx.showToast({ title: '已取消', icon: 'none' });
      } else {
        progress[this.data.name] = new Date().toISOString();
        this.setData({ done: true });
        wx.showToast({ title: '已记入已做', icon: 'success' });
      }
      wx.setStorageSync('yueji_soup_progress', progress);
    } catch (e) {
      wx.showToast({ title: '记入失败', icon: 'none' });
    }
  },

  // 笔记
  onTapNote() {
    try {
      const notes = wx.getStorageSync('yueji_soup_notes') || {};
      this.setData({ noteInput: notes[this.data.name] || '', showNoteModal: true });
    } catch (e) {
      this.setData({ noteInput: '', showNoteModal: true });
    }
  },

  onNoteInput(e) {
    this.setData({ noteInput: e.detail.value });
  },

  onCloseNoteModal() {
    this.setData({ showNoteModal: false });
  },

  onSaveNote() {
    try {
      const notes = wx.getStorageSync('yueji_soup_notes') || {};
      const content = this.data.noteInput.trim();
      if (content) {
        notes[this.data.name] = content;
        wx.showToast({ title: '已保存', icon: 'success' });
      } else {
        delete notes[this.data.name];
        wx.showToast({ title: '已删除', icon: 'none' });
      }
      wx.setStorageSync('yueji_soup_notes', notes);
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
    this.setData({ showNoteModal: false });
  },

  // 分享
  onTapShare() {
    // 触发 onShareAppMessage
    wx.showToast({ title: '点击右上角分享', icon: 'none' });
  },

  onShareAppMessage() {
    return {
      title: `悦济 · ${this.data.name}`,
      path: `/pages/22_汤品详情/22_汤品详情?idx=${this.data.idx}`,
    };
  },
});
