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
});
