// 15_今日小动.js — 悦济 v3.0.5 阶段 1.5
// 静态规则 (9 体质 + 镜中 4 维) + 大模型润色 (走 chat 云函数 amax-router)
// 严守: 不打卡 / 不卖装备 / 不超 5 分钟 / 不评判
const { recommendMotion, MOTION_TYPES } = require('../../utils/data_motion.js');

Page({
  data: {
    tizhiName: '平和质',
    tizhiKey: 'pinghe',
    latest4: { mood: 5, energy: 5, sleep: 5, skin: 5 },
    motion: null,
    currentMotionKey: 'jingzuo',   // v3.1 阶段 24: 当前选的小动 (跟 16_今日一曲 currentWuyue 一致)
    aiHint: '',
    aiPowered: false,
    loading: true,
  },

  onLoad() {
    this.compute();
  },
  onShow() {
    this.compute();
  },

  // v3.1 阶段 24 修: 接受 forceMotionKey 参数 (onSelectMotion 同步传, 避免 setData 异步问题)
  // 修前: this.setData({ currentMotionKey: key }) + this.compute() — setData 异步, compute() 跑时 this.data.currentMotionKey 还是旧值
  // 修后: this.compute(key) — 同步传参, compute() 立刻用 key 推 motion, UI 100% 同步
  // 跟 16_今日一曲 阶段 14 修法一致
  compute(forceMotionKey) {
    // 1. 拿 9 体质 (从 storage / 默认 pinghe)
    const tizhiKey = wx.getStorageSync('yueji_tizhi') || 'pinghe';
    const TIZHI_NAMES = {
      pinghe: '平和质', qixu: '气虚质', yangxu: '阳虚质', yinxu: '阴虚质',
      tanshi: '痰湿质', shire: '湿热质', xueyu: '血瘀质', qiyu: '气郁质', tebing: '特禀质',
    };

    // 2. 拿镜中 4 维 (从 yueji_history 最新一天 / 默认 5)
    const history = wx.getStorageSync('yueji_history') || [];
    const today = new Date().toISOString().slice(0, 10);
    const latestEntry = history.find(h => h.date === today) || history[history.length - 1] || {};
    const latest4 = {
      mood: latestEntry.mood || 5,
      energy: latestEntry.energy || 5,
      sleep: latestEntry.sleep || 5,
      skin: latestEntry.skin || 5,
    };

    // 3. 静态规则 → 默认 1 类 (forceMotionKey 优先, 跟 16 阶段 14 一致)
    const recommendKey = recommendMotion(tizhiKey, latest4);
    const motionKey = forceMotionKey || recommendKey;
    const motion = MOTION_TYPES[motionKey] || MOTION_TYPES.jingzuo;

    this.setData({
      tizhiKey,
      tizhiName: TIZHI_NAMES[tizhiKey] || '平和质',
      latest4,
      currentMotionKey: motionKey,   // v3.1 阶段 24: 跟 motion.key 同步, tab UI 一致
      motion: { key: motion.key, name: motion.name, desc: motion.desc, icon: motion.icon, color: motion.color, duration: motion.duration, steps: motion.steps },
      loading: false,
    });

    // 4. 大模型润色 (走 chat 云函数, prompt: 1 句为什么不评判)
    this.askAi(tizhiKey, latest4, motion);
  },

  // v3.1 阶段 24: 4 类小动 tab 点击 (跟 16_今日一曲 onSelectWuyue 一致)
  onSelectMotion(e) {
    const key = e.currentTarget.dataset.key;
    if (!MOTION_TYPES[key]) return;
    this.compute(key);
  },

  askAi(tizhiKey, latest4, motion) {
    if (!wx.cloud) return;
    const TIZHI_NAMES = {
      pinghe: '平和质', qixu: '气虚质', yangxu: '阳虚质', yinxu: '阴虚质',
      tanshi: '痰湿质', shire: '湿热质', xueyu: '血瘀质', qiyu: '气郁质', tebing: '特禀质',
    };
    const prompt =
      '你是悦济的「养友」, 用户是 9 体质中的「' + TIZHI_NAMES[tizhiKey] + '」, ' +
      '今天镜中 4 维 (心情/精力/睡眠/肌肤) = ' + latest4.mood + '/' + latest4.energy + '/' + latest4.sleep + '/' + latest4.skin + '. ' +
      '推荐了 5 分钟「' + motion.name + '」(' + motion.desc + '). ' +
      '请用 1 句 (≤40 字) 告诉用户"为什么选这个", 严守: 不评判 / 不医疗 / 不卖装备, 滋养调性. ' +
      '3 层结构: 看到 4 维 (10 字) + 为什么选这个 (15 字) + 慢慢做 (10 字).';

    wx.cloud.callFunction({
      name: 'chat',
      data: { user_input: prompt, role: 'qibo', history: [] },
    }).then((res) => {
      if (res && res.result && res.result.ok && res.result.data && res.result.data.content) {
        this.setData({ aiHint: res.result.data.content, aiPowered: !res.result.data.fallback });
      }
    }).catch((e) => {
      console.warn('[悦济 motion ai]', e);
      this.setData({ aiHint: this.fallbackHint(tizhiKey, latest4, motion) });
    });
  },

  fallbackHint(tizhiKey, latest4, motion) {
    return '你今天 ' + (latest4.sleep < 5 ? '睡得浅' : latest4.mood < 5 ? '心沉一些' : latest4.energy < 5 ? '有些累' : '状态还好') + ', ' + motion.name + ' 5 分钟, 慢慢来, 不评判。';
  },

  onStart() {
    wx.showToast({ title: '开始 ' + this.data.motion.name + ' 5 分钟', icon: 'none', duration: 2000 });
  },
  onClose() {
    wx.navigateBack();
  },
});
