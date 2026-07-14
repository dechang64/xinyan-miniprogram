// 16_今日一曲.js — 悦济 v3.0.5 阶段 1.5 扩展
// 5 滋养曲风 (宫/商/角/徵/羽) + 9 体质 + 镜中 4 维 → 1 调式 + 1 mp3
// 严守: 不打卡 / 不卖装备 / 不超 5 分钟 / 不评判
// 6 段 v1 mp3 在 assets/music/v3_5modes/ (本地)
const { recommendWuyue, WUYUE_FULL, WUYUE_NAMES, WUYUE_DESCRIPTIONS, WUYUE_V1_MP3, rankWuyueCandidates } = require('../../utils/data_music.js');

Page({
  data: {
    tizhiName: '平和质',
    tizhiKey: 'pinghe',
    latest4: { mood: 5, energy: 5, sleep: 5, skin: 5 },
    wuyue: 'gong',
    wuyueName: '宫',
    wuyueFull: '宫调 (土/脾)',
    wuyueDesc: '温润土音, 养脾胃, 中和调性',
    mp3Url: '',
    aiHint: '',
    aiPowered: false,
    isPlaying: false,
    loading: true,
  },

  onLoad() { this.compute(); },
  onShow() { this.compute(); },

  compute() {
    // 1. 拿 9 体质
    const tizhiKey = wx.getStorageSync('yueji_tizhi') || 'pinghe';
    const TIZHI_NAMES = {
      pinghe: '平和质', qixu: '气虚质', yangxu: '阳虚质', yinxu: '阴虚质',
      tanshi: '痰湿质', shire: '湿热质', xueyu: '血瘀质', qiyu: '气郁质', tebing: '特禀质',
    };

    // 2. 拿镜中 4 维
    const history = wx.getStorageSync('yueji_history') || [];
    const today = new Date().toISOString().slice(0, 10);
    const latestEntry = history.find(h => h.date === today) || history[history.length - 1] || {};
    const latest4 = {
      mood: latestEntry.mood || 5,
      energy: latestEntry.energy || 5,
      sleep: latestEntry.sleep || 5,
      skin: latestEntry.skin || 5,
    };

    // 3. 静态映射 → 1 调式
    const wuyue = recommendWuyue(tizhiKey, latest4);
    this.setData({
      tizhiKey,
      tizhiName: TIZHI_NAMES[tizhiKey] || '平和质',
      latest4,
      wuyue,
      wuyueName: WUYUE_NAMES[wuyue],
      wuyueFull: WUYUE_FULL[wuyue],
      wuyueDesc: WUYUE_DESCRIPTIONS[wuyue],
      mp3Url: WUYUE_V1_MP3[wuyue],
      loading: false,
      isPlaying: false,
    });

    // 4. 大模型润色 (走 chat 云函数, prompt: 1 句为什么不评判)
    this.askAi(tizhiKey, latest4, wuyue);
  },

  askAi(tizhiKey, latest4, wuyue) {
    if (!wx.cloud) return;
    const TIZHI_NAMES = {
      pinghe: '平和质', qixu: '气虚质', yangxu: '阳虚质', yinxu: '阴虚质',
      tanshi: '痰湿质', shire: '湿热质', xueyu: '血瘀质', qiyu: '气郁质', tebing: '特禀质',
    };
    const prompt =
      '你是悦济的「思友」, 用户是 9 体质中的「' + TIZHI_NAMES[tizhiKey] + '」, ' +
      '今天镜中 4 维 (心情/精力/睡眠/肌肤) = ' + latest4.mood + '/' + latest4.energy + '/' + latest4.sleep + '/' + latest4.skin + '. ' +
      '推荐了「' + WUYUE_FULL[wuyue] + '」(' + WUYUE_DESCRIPTIONS[wuyue] + '). ' +
      '请用 1 句 (≤40 字) 告诉用户"为什么选这个调", 严守: 不评判 / 不医疗 / 不卖, 滋养调性. ' +
      '3 层结构: 看到 4 维 (10 字) + 调式对应 (15 字) + 慢慢听 (10 字).';

    wx.cloud.callFunction({
      name: 'chat',
      data: { user_input: prompt, role: 'zhouwenwang', history: [] },
    }).then((res) => {
      if (res && res.result && res.result.ok && res.result.data && res.result.data.content) {
        this.setData({ aiHint: res.result.data.content, aiPowered: !res.result.data.fallback });
      }
    }).catch((e) => {
      console.warn('[悦济 music ai]', e);
      this.setData({ aiHint: this.fallbackHint(tizhiKey, latest4, wuyue) });
    });
  },

  fallbackHint(tizhiKey, latest4, wuyue) {
    const TIZHI_NAMES = {
      pinghe: '平和质', qixu: '气虚质', yangxu: '阳虚质', yinxu: '阴虚质',
      tanshi: '痰湿质', shire: '湿热质', xueyu: '血瘀质', qiyu: '气郁质', tebing: '特禀质',
    };
    return '你今天 ' + TIZHI_NAMES[tizhiKey] + ', 试试 ' + WUYUE_NAMES[wuyue] + ' 调, 5 分钟, 慢慢听。';
  },

  onPlay() {
    if (!this.data.mp3Url) return;
    const ctx = wx.createInnerAudioContext();
    ctx.src = this.data.mp3Url;
    ctx.loop = true;
    ctx.play();
    this.setData({ isPlaying: true });
    ctx.onEnded(() => this.setData({ isPlaying: false }));
    ctx.onError((res) => {
      console.warn('[悦济 music play]', res);
      this.setData({ isPlaying: false });
      wx.showToast({ title: '播放失败, 请检查 mp3', icon: 'none' });
    });
    this.audioCtx = ctx;
  },

  onPause() {
    if (this.audioCtx) {
      this.audioCtx.stop();
      this.setData({ isPlaying: false });
    }
  },

  onClose() { wx.navigateBack(); },
});
