// app.js — 悦济 v2.5.3 (云环境初始化 + 严守统一)
// 严守: 8 禁用词 0 出现, 滋养/共修/镜中 调性统一
// v2.5.3 修: 不写死 env, 让 wx.cloud.init() 自动用当前微信开发者工具绑定的环境
// (v2.5.2 写死 env: '44dbe0ce-...' 错, user 实际是 d73d7bd1-..., 环境 ID 是临时 UUID 不是稳定)
App({
  onLaunch() {
    // 统一初始化云开发 (v1.1.5 新增, 修复 v1.1.4 各 page 各自 init 的不一致)
    if (!wx.cloud) {
      console.error('[悦济] 当前微信客户端版本过低, 请升级到最新微信');
    } else {
      // v2.5.3: 不传 env, 微信开发者工具自动用当前绑定的环境
      // v1.1.5 我加的 env 反而坏事 — 写死的 UUID 跟 user 实际环境不匹配
      wx.cloud.init({
        traceUser: true,
      });
      console.log('[悦济] 云环境初始化完成 (自动用当前开发者工具绑定的环境)');
    }
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
