// 1_每日一经.js — 悦济每日读一篇经 (v1.0 完整版)
// 30 篇经文 (data_jingwen.js), dayOfYear seed
const { dayOfYear } = require('../../utils/compliance.js');
const JINGWEN_30 = require('../../utils/data_jingwen.js');
Page({
  data: {
    today: null,
    idx: 0,
    jingwenList: JINGWEN_30,
  },
  onLoad() {
    this.setToday();
  },
  onShow() {
    this.setToday();
  },
  setToday() {
    const idx = dayOfYear() % JINGWEN_30.length;
    this.setData({ today: JINGWEN_30[idx], idx });
  },
  onTapNext() {
    const next = (this.data.idx + 1) % JINGWEN_30.length;
    this.setData({ today: JINGWEN_30[next], idx: next });
  },
  onTapPrev() {
    const prev = (this.data.idx - 1 + JINGWEN_30.length) % JINGWEN_30.length;
    this.setData({ today: JINGWEN_30[prev], idx: prev });
  },
  onShareAppMessage() {
    return {
      title: this.data.today.title + ' · 悦济',
      path: '/pages/1_每日一经/1_每日一经',
    };
  },
});
