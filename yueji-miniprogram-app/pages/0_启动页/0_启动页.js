// 0_启动页.js — 悦济启动页
// 调性: 镜中, 是正在成为自己的你
// 严守: 不出现医疗/营销字眼
const app = getApp();
Page({
  data: {
    slogan: '镜中, 是正在成为自己的你',
    sub: '悦济, 一群人共修养心',
  },
  onLoad() {
    // 2 秒后跳首页 (镜中 = 第 3 个 tab, 6 哲学第 3 条)
    setTimeout(() => {
      wx.switchTab({ url: '/pages/4_镜中/4_镜中' });
    }, 2000);
  },
  // 用户也可点跳过
  onTapSkip() {
    wx.switchTab({ url: '/pages/4_镜中/4_镜中' });
  },
});
