// 3_共修堂.js — 悦济共修 v2.2.0
// v2.2.0 修: 3 任务 list-row 加 bindtap 真跳; v1.1 社群改成 v2.3 路线
Page({
  onTapJing() { wx.switchTab({ url: '/pages/1_每日一经/1_每日一经' }); },
  onTapSoup() { wx.switchTab({ url: '/pages/2_每日一汤/2_每日一汤' }); },
  onTapJingzhong() { wx.switchTab({ url: '/pages/4_镜中/4_镜中' }); },
});
