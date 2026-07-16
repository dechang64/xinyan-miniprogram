// 12_5元素速测.js — 悦济 v3.1 严守修订 (原 v2.3 八字 → 5 元素速测)
// 5 元素 (木火土金水) + 出生月份 → 1 主元素 → 推经 + 推汤
// 严守: 不算命 / 不算四柱 / 不推日主 — 5 元素是中医体质框架, 不是命理
const JINGWEN = require('../../utils/data_jingwen.js');
const SOUPS = require('../../utils/data_soups.js');

// 5 元素 (中医体质) — 出生月份 → 主元素 (春木/夏火/长夏土/秋金/冬水)
// 注: 这是 9 体质自评的简化版, 仅用月份 (粗筛), 9 体质自评更精细
const MONTH_WUXING = {
  1: '水', 2: '水',      // 冬
  3: '木', 4: '木', 5: '木',  // 春
  6: '火', 7: '火', 8: '火',  // 夏
  9: '土',                  // 长夏
  10: '金', 11: '金', 12: '金', // 秋
};

// 5 元素 → 推荐经书 (跟 9 体质映射对齐, 跟 5 滋养曲风/5 元素一致)
const WUXING_JING = {
  '木': '黄帝内经',  // 肝
  '火': '黄帝内经',  // 心
  '土': '清静经',    // 脾
  '金': '道德经',    // 肺
  '水': '周易',      // 肾
};

// 5 元素 → 9 体质映射 (跟 9_9体质自评 体系一致)
const WUXING_TIZHI = {
  '木': '气郁',  // 肝木易郁
  '火': '阴虚',  // 心火易伤阴
  '土': '气虚',  // 脾土易虚
  '金': '痰湿',  // 肺金易生痰
  '水': '平和',  // 肾水主藏, 平和
};

const WUXING_DESC = {
  '木': '木生发, 主肝, 春季生人, 推荐黄帝内经疏肝养木。',
  '火': '火温通, 主心, 夏季生人, 推荐黄帝内经养心安神。',
  '土': '土中和, 主脾, 长夏生人, 推荐清静经滋养脾胃。',
  '金': '金收敛, 主肺, 秋季生人, 推荐道德经润肺理气。',
  '水': '水沉降, 主肾, 冬季生人, 推荐周易滋肾藏精。',
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
    const wuxing = MONTH_WUXING[month] || '土';
    const book = WUXING_JING[wuxing] || '黄帝内经';

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
        wuxing, wuxingDesc: WUXING_DESC[wuxing] || '',
        month, birthDate: this.data.birthDate,
        jingwen, soups: tizhiSoups,
      },
    });
  },
});
