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
      content: '悦济 v1.0\n滋养/涵养/共修/镜中\n\n严守: 本产品为生活陪伴, 不涉及医疗作用。\n\n心理援助热线: 12356',
      showCancel: false,
    });
  },
});
