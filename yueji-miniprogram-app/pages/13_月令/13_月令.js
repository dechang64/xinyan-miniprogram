// 13_5元素月令.js — 悦济 v3.1 严守修订 (原 v2.3 星盘 → 5 元素月令)
// 5 元素 (木火土金水) + 出生月份 → 主元素 + 月令养生小贴士
// 严守: 不算星座 / 不算命 — 月令养生是中医常识 (春养肝/夏养心/长夏养脾/秋养肺/冬养肾)
const JINGWEN = require('../../utils/data_jingwen.js');
const SOUPS = require('../../utils/data_soups.js');

// 出生月份 → 主元素 + 月令养生 (中医 5 脏 5 月对应)
const MONTH_YUELING = [
  null, // 0 占位
  { wuxing: '水', yueling: '冬主藏, 养肾藏精, 早睡晚起', book: '周易' },     // 1 月
  { wuxing: '水', yueling: '春初养肾仍重要, 推荐周易', book: '周易' },        // 2 月
  { wuxing: '木', yueling: '春主生, 养肝疏泄, 早起散步', book: '黄帝内经' },   // 3 月
  { wuxing: '木', yueling: '春旺养肝, 多食绿叶, 推荐黄帝内经', book: '黄帝内经' }, // 4 月
  { wuxing: '木', yueling: '春末转夏, 养肝兼清心火', book: '黄帝内经' },        // 5 月
  { wuxing: '火', yueling: '夏主长, 养心安神, 避免大汗', book: '黄帝内经' },   // 6 月
  { wuxing: '火', yueling: '夏旺养心, 推荐黄帝内经', book: '黄帝内经' },        // 7 月
  { wuxing: '火', yueling: '夏末转秋, 养心兼润肺', book: '黄帝内经' },         // 8 月
  { wuxing: '土', yueling: '长夏主化, 养脾胃, 少食生冷', book: '清静经' },    // 9 月
  { wuxing: '金', yueling: '秋主收, 养肺润燥, 推荐道德经', book: '道德经' },   // 10 月
  { wuxing: '金', yueling: '秋旺养肺, 多食白色食物', book: '道德经' },         // 11 月
  { wuxing: '金', yueling: '冬初养肺仍重要, 转养肾', book: '道德经' },         // 12 月
];

// 5 元素 → 9 体质映射
const WUXING_TIZHI = {
  '木': '气郁',
  '火': '阴虚',
  '土': '气虚',
  '金': '痰湿',
  '水': '平和',
};

Page({
  data: {
    birthDate: '',
    result: null,
  },

  onPickDate(e) { this.setData({ birthDate: e.detail.value }); },

  onSubmit() {
    if (!this.data.birthDate) {
      wx.showToast({ title: '请选日期', icon: 'none' });
      return;
    }
    const date = new Date(this.data.birthDate + 'T12:00');
    const month = date.getMonth() + 1;
    const yueling = MONTH_YUELING[month] || MONTH_YUELING[9];
    const wuxing = yueling.wuxing;
    const book = yueling.book;

    // 推 3 经
    const jingwen = JINGWEN.filter((j) => j.source.includes(book)).slice(0, 3).map((j) => ({
      id: j.id, source: j.source, title: j.title.slice(0, 20),
    }));

    // 推 3 汤
    const tizhi = WUXING_TIZHI[wuxing] || '平和';
    const tizhiSoups = SOUPS.filter((s) => s.tizhi && s.tizhi.includes(tizhi)).slice(0, 3).map((s) => ({
      id: s.id, name: s.name, desc: (s.desc || '').slice(0, 30),
    }));

    this.setData({
      result: {
        wuxing, yueling: yueling.yueling, book, month, birthDate: this.data.birthDate,
        jingwen, soups: tizhiSoups,
      },
    });
  },
});
