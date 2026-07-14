// 17_今日一测引导.js — 悦济 v3.0.5 阶段 2.2
// 5 自测分 5 天 (D1 9 体质 / D2 MBTI / D3 人格 / D4 八字 / D5 星盘)
// 点"开始"跳 自测 page; 点"今天跳过" 5 天循环里算完成
// 严守: 主观自评 ✅, 不强迫, 可跳过
const { getTodayTest, markTodaySkipped, isTodayCleared } = require('../../utils/test_scheduler.js');

Page({
  data: {
    test: {},
  },

  onLoad() {
    const t = getTodayTest();
    this.setData({ test: t });
  },

  onStart() {
    if (!this.data.test || !this.data.test.page) {
      wx.navigateBack();
      return;
    }
    wx.redirectTo({ url: this.data.test.page });
  },

  onSkip() {
    const t = this.data.test;
    if (t && t.key) markTodaySkipped(t.key);
    wx.showToast({ title: '今天跳过了, 明天见', icon: 'none', duration: 1500 });
    setTimeout(() => wx.navigateBack(), 800);
  },

  onClose() { wx.navigateBack(); },
});
