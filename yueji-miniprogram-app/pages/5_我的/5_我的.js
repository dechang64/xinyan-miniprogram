// 5_我的.js — 悦济我的
// 严守声明 + 设置 + 重置
const app = getApp();
Page({
  data: {
    userInfo: null,
    compliance: app.globalData.compliance,
  },
  onLoad() {
    this.loadProfile();
  },
  onShow() {
    this.loadProfile();
  },
  loadProfile() {
    // 严守: 不调 getUserProfile, 只用本地缓存
    const profile = wx.getStorageSync('yueji_profile') || {};
    this.setData({ userInfo: profile });
  },
  onReset() {
    wx.showModal({
      title: '重置数据',
      content: '将清空镜中记录、海报历史。确定吗?',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.showToast({ title: '已清空', icon: 'success' });
          this.loadProfile();
        }
      },
    });
  },
  onTapAbout() {
    wx.showModal({
      title: '关于悦济',
      content: '悦济 v2.2.0\n滋养/涵养/共修/镜中\n\n严守: 本产品为生活陪伴, 不涉及医疗作用。\n\n心理援助热线: 12356',
      showCancel: false,
    });
  },

  // v2.2.0 镜像区 4 入口 + v2.3.0 加 2 (八字/星盘) + v2.7.0 加 3 (自拍/给3月/月报)
  onTapJingzhong() { wx.switchTab({ url: '/pages/4_镜中/4_镜中' }); },
  onTapTizhi() { wx.navigateTo({ url: '/pages/9_9体质自评/9_9体质自评' }); },
  onTapMBTI() { wx.navigateTo({ url: '/pages/10_MBTI快测/10_MBTI快测' }); },
  onTapBazi() { wx.navigateTo({ url: '/pages/12_八字/12_八字' }); },
  onTapXingpan() { wx.navigateTo({ url: '/pages/13_星盘/13_星盘' }); },
  onTapPoster() { wx.navigateTo({ url: '/pages/11_海报分享/11_海报分享' }); },
  onTapDigital() { wx.navigateTo({ url: '/pages/8_4经数字人/8_4经数字人' }); },
  // v2.7.0 加
  onTapSelfie() { wx.navigateTo({ url: '/pages/12_自拍温润/12_自拍温润' }); },
  onTapLetter3() { wx.navigateTo({ url: '/pages/13_给3个月/13_给3个月' }); },
  onTapMonthly() { wx.navigateTo({ url: '/pages/14_月底报告/14_月底报告' }); },
  // v3.1 阶段 3 P0 #5
  onTapMyNotes() { wx.navigateTo({ url: '/pages/19_我的笔记/19_我的笔记' }); },
  onTapNightRitual() { wx.navigateTo({ url: '/pages/18_睡前一程/18_睡前一程' }); },
});
