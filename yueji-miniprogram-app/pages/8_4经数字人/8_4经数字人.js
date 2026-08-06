// 8_4经数字人.js — 先哲数字人入口 (老子/孔子/周文王/岐伯/元神, 5 位)
const { DIGITAL_HUMAN_LIST } = require('../../utils/data_digital_human.js');
Page({
  data: {
    humans: DIGITAL_HUMAN_LIST,
  },
  onTapHuman(e) {
    const key = e.currentTarget.dataset.key;
    wx.navigateTo({ url: `/pages/8_4经数字人/chat/chat?key=${key}` });
  },

  // v3.1.x 阶段 2 链路 5 扩展: 朋友推荐 — 先哲数字人分享
  // 严守: 不含医疗/营销词, 滋养/共修 调性
  onShareAppMessage() {
    return {
      title: '悦济 · 先哲数字人 · 陪你共修',
      path: '/pages/8_4经数字人/8_4经数字人',
      imageUrl: '',
    };
  },
  onShareTimeline() {
    return {
      title: '悦济 · 先哲数字人 · 共修同行',
      query: '',
    };
  },
});
