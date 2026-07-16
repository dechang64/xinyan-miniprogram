// 16_今日一曲.js — 悦济 v3.0.5 阶段 1.5 扩展 (30 段 cloud://)
// 5 滋养曲风 (宫/商/角/徵/羽) + 9 体质 + 镜中 4 维 → 1 调式 + 日期 hash 选 1 段 (6 变体)
// 严守: 不打卡 / 不卖装备 / 不评判
// 30 段 mp3 走 微信云存储 cloud://, 调 wx.cloud.getTempFileURL 拿临时 URL
const { recommendWuyueTrack, WUYUE_FULL, WUYUE_NAMES, WUYUE_DESCRIPTIONS, getTempUrls, WUYUE_30_FILEID } = require('../../utils/data_music.js');

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
    trackIndex: 0,
    trackTotal: 6,
    aiHint: '',
    aiPowered: false,
    isPlaying: false,
    loading: true,
  },

  onLoad() { this.compute(); },
  onShow() { this.compute(); },

  async compute() {
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

    // 3. 静态映射 + 日期 hash 选 1 段 (30 段中 1)
    const track = recommendWuyueTrack(tizhiKey, latest4);
    // 4. fileID → 临时 URL (2 小时有效)
    let mp3Url = '';
    console.log('[悦济 music] track.fileID =', track.fileID);
    if (track.fileID && track.fileID.startsWith('cloud://')) {
      try {
        const res = await getTempUrls([track.fileID]);
        console.log('[悦济 music] getTempFileURL res =', JSON.stringify(res).slice(0, 200));
        if (res.fileList && res.fileList[0] && res.fileList[0].tempFileURL) {
          mp3Url = res.fileList[0].tempFileURL;
          console.log('[悦济 music] mp3Url 拿到 ✓');
        } else {
          console.warn('[悦济 music] fileList 空, 检查存储安全规则 / 路径是否对');
        }
      } catch (e) {
        console.error('[悦济 music] getTempFileURL 抛错 =', e);
      }
    }

    this.setData({
      tizhiKey,
      tizhiName: TIZHI_NAMES[tizhiKey] || '平和质',
      latest4,
      wuyue: track.wuyue,
      wuyueName: WUYUE_NAMES[track.wuyue],
      wuyueFull: WUYUE_FULL[track.wuyue],
      wuyueDesc: WUYUE_DESCRIPTIONS[track.wuyue],
      mp3Url,
      trackIndex: (track.trackIndex || 0) + 1,
      trackTotal: 6,
      loading: false,
      isPlaying: false,
    });

    // 5. 大模型润色
    this.askAi(tizhiKey, latest4, track.wuyue);
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
    console.log('[悦济 music] onPlay mp3Url =', this.data.mp3Url ? this.data.mp3Url.slice(0, 80) + '...' : '空');
    if (!this.data.mp3Url) {
      // v3.0.5 原始行为: 25 mp3 走 v3.0.5 阶段 1.5 部署的 cloud:// 路径, 复用同套
      // 拿不到 URL 时弹 toast 提示看 console (不假设未部署, 让用户自己调试)
      wx.showToast({ title: 'mp3 URL 空, 请看 console', icon: 'none', duration: 3000 });
      return;
    }
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

  // 换 1 段: 同调式 6 变体中随机选 1 (走 fileID + getTempFileURL)
  async onShuffle() {
    const { WUYUE_30_FILEID, getTempUrls } = require('../../utils/data_music.js');
    const tracks = WUYUE_30_FILEID[this.data.wuyue] || [];
    if (tracks.length <= 1) {
      wx.showToast({ title: '该调式仅 1 段', icon: 'none' });
      return;
    }
    if (this.audioCtx) { this.audioCtx.stop(); this.audioCtx = null; }
    const current = this.data.trackIndex - 1;
    const candidates = tracks.map((_, i) => i).filter(i => i !== current);
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    let mp3Url = '';
    if (tracks[next] && tracks[next].startsWith('cloud://')) {
      const res = await getTempUrls([tracks[next]]);
      if (res.fileList && res.fileList[0] && res.fileList[0].tempFileURL) {
        mp3Url = res.fileList[0].tempFileURL;
      }
    }
    if (!mp3Url) {
      // v3.0.5 原始行为: 复用 v3.0.5 阶段 1.5 部署的 cloud:// 路径
      wx.showToast({ title: '换 1 段 mp3 拿不到, 请看 console', icon: 'none', duration: 3000 });
      return;
    }
    this.setData({
      mp3Url,
      trackIndex: next + 1,
      isPlaying: false,
    });
    setTimeout(() => this.onPlay(), 100);
  },

  onPause() {
    if (this.audioCtx) {
      this.audioCtx.stop();
      this.setData({ isPlaying: false });
    }
  },

  onClose() { wx.navigateBack(); },
});
