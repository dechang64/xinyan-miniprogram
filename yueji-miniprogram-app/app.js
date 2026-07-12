// app.js — 悦济 v1.0
// 严守: 8 禁用词 0 出现, 滋养/共修/镜中 调性统一
App({
  onLaunch() {
    // 严守: 关 App 即清本地数据
    // 严守: 不调用 getUserInfo, 仅用 wx.login 拿 openid (后续 v1.1 接云函数)
    console.log('悦济启动');
  },
  globalData: {
    appName: '悦济',
    slogan: '镜中, 是正在成为自己的你',
    // 严守声明
    compliance: '本产品为生活陪伴, 不涉及医疗作用。如有心理困扰, 请拨打 12356 全国心理援助热线。',
    // 5 滋养曲风 (跟心颜 v0.7.1.9 一致, 严守调性)
    styles: [
      { key: '清润', icon: '💧', color: '#A8D5BA', scene: '睡前 / 深度放松' },
      { key: '温润', icon: '🍵', color: '#E6C79C', scene: '下午茶 / 缓慢工作' },
      { key: '通透', icon: '✨', color: '#B8D8E8', scene: '冥想 / 自我对话' },
      { key: '晨光', icon: '🌅', color: '#F4D35E', scene: '晨起 / 静心阅读' },
      { key: '黄昏', icon: '🌆', color: '#E8998C', scene: '傍晚 / 整理一日' },
    ],
  },
});
