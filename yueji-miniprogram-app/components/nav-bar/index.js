// components/nav-bar/index.js — 悦济 v3.0.5 阶段 3.9 全局导航栏
// 严守: 仅做导航, 不做医疗/心理
Component({
  properties: {
    title: { type: String, value: '悦济' },
    showHome: { type: Boolean, value: true },
  },
  methods: {
    onBack() {
      // 返回上一级; 如果是首页/无历史, 跳 0_启动页
      wx.navigateBack({
        delta: 1,
        fail: () => wx.reLaunch({ url: '/pages/0_启动页/0_启动页' }),
      });
    },
    onHome() {
      // 直接回主页 (0_启动页)
      wx.reLaunch({ url: '/pages/0_启动页/0_启动页' });
    },
  },
});
