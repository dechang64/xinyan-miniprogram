// 8_4经数字人.js — 4 经数字人入口 (老子/周文王/岐伯/元神)
const { DIGITAL_HUMAN_LIST } = require('../../utils/data_digital_human.js');
Page({
  data: {
    humans: DIGITAL_HUMAN_LIST,
  },
  onTapHuman(e) {
    const key = e.currentTarget.dataset.key;
    wx.navigateTo({ url: `/pages/8_4经数字人/chat/chat?key=${key}` });
  },

  // v3.1 阶段 2 链路 5: 朋友推荐 — 4 经数字人分享
  // 严守: 不含医疗/营销词, 滋养/共修 调性
  onShareAppMessage() {
    return {
      title: '悦济 · 4 经数字人 · 老子/周文王/岐伯/元神 陪你共修',
      path: '/pages/8_4经数字人/8_4经数字人',
      imageUrl: '',
    };
  },
  onShareTimeline() {
    return {
      title: '悦济 · 4 经数字人 · 共修同行',
      query: '',
    };
  },
});
