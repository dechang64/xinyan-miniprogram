// 16_今日一曲.js — 悦济 v3.1 阶段 12 PRD 完善
// 5 滋养曲风 (宫/商/角/徵/羽) + 9 体质 + 镜中 4 维 → 1 调式 + 日期 hash 选 1 段 (6 变体)
// v3.1 阶段 12:
//   F1. 加 5 调式 tab — 用户自由点选 (按 PRD 第 73/156 行 "5 调式选 1" P0)
//   F2. 9 体质自评 setStorage 修复 (在 9_9体质自评.js) — 16_今日一曲 默认调式不再总是 pinghe → 宫
//   F3. 调式反向映射 (曲风适合 X 体质) — 用户知道当前曲风适合谁
// 严守: 不打卡 / 不卖装备 / 不评判
// 30 段 mp3 走 微信云存储 cloud://, 调 wx.cloud.getTempFileURL 拿临时 URL
const { recommendWuyueTrack, recommendWuyueTrackByWuyue, WUYUE_FULL, WUYUE_NAMES, WUYUE_DESCRIPTIONS, getTempUrls, WUYUE_30_FILEID } = require('../../utils/data_music.js');

// F3: 调式反向映射 (曲风适合 X 体质) — 基于 TIZHI_TO_WUYUE 反查
const WUYUE_TO_TIZHI = {
  gong:  '平和 / 气虚 / 特禀',
  shang: '痰湿 / 湿热',
  jiao:  '血瘀 / 气郁',
  zhi:   '阳虚',
  yu:    '阴虚',
};

const TIZHI_NAMES = {
  pinghe: '平和质', qixu: '气虚质', yangxu: '阳虚质', yinxu: '阴虚质',
  tanshi: '痰湿质', shire: '湿热质', xueyu: '血瘀质', qiyu: '气郁质', tebing: '特禀质',
};

Page({
  data: {
    tizhiName: '平和质',
    tizhiKey: 'pinghe',
    tizhiDone: false,        // v3.1 F2: 9 体质是否已自评
    latest4: { mood: 5, energy: 5, sleep: 5, skin: 5 },
    wuyue: 'gong',
    currentWuyue: 'gong',    // v3.1 F1: 用户当前选的调式 (默认 = 推荐)
    wuyueName: '宫',
    wuyueFull: '宫调 (土/脾)',
    wuyueDesc: '温润土音, 养脾胃, 中和调性',
    wuyueSuit: '平和 / 气虚 / 特禀',  // v3.1 F3: 曲风适合 X 体质
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

  async compute(forceWuyue) {
    // 1. 拿 9 体质 (v3.1 F2: 9 体质自评后才有真值, 之前永远 pinghe)
    const tizhiKey = wx.getStorageSync('yueji_tizhi') || 'pinghe';
    const tizhiDone = !!wx.getStorageSync('yueji_tizhi');

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
    // v3.1 阶段 14 修: 接受 forceWuyue 参数 (onSelectWuyue 同步传过来, 避免 setData 异步问题)
    // 修前: this.data.currentWuyue 在 setData 后 compute() 跑时还没更新 → 老 bug 又回来
    // 修后: forceWuyue 同步传入, compute() 立刻用 forceWuyue 推 track
    const wuyueKey = forceWuyue || this.data.currentWuyue || recommendWuyue(tizhiKey, latest4);
    const track = wuyueKey
      ? recommendWuyueTrackByWuyue(wuyueKey)
      : recommendWuyueTrack(tizhiKey, latest4);
    // 4. fileID → 临时 URL (2 小时有效)
    let mp3Url = '';
    // v3.1 阶段 7.2: 加详细 console.log, 真机跑时直接给调试信息
    const fileIdPrefix = track.fileID ? track.fileID.split('/').slice(0, 4).join('/') : '(空)';
    console.log('========== 悦济 music 调试信息 ==========');
    console.log('[1/4] 当前选调式:', track.wuyue, '变体 idx:', track.trackIndex, 'fileID 前 4 段:', fileIdPrefix);
    console.log('[2/4] CLOUD_PREFIX_V1 (v1 5 段) (在 data_music.js):', require('../../utils/data_music.js').CLOUD_PREFIX_V1);
    console.log('[2/4] CLOUD_PREFIX_V2 (v2 25 段) (在 data_music.js):', require('../../utils/data_music.js').CLOUD_PREFIX_V2);
    console.log('[3/4] track.fileID 完整:', track.fileID);
    console.log('[4/4] wx.cloud 已初始化 (app.js onLaunch):', typeof wx !== 'undefined' && !!wx.cloud);
    if (track.fileID && track.fileID.startsWith('cloud://')) {
      try {
        const res = await getTempUrls([track.fileID]);
        console.log('[悦济 music] getTempFileURL res 完整:', JSON.stringify(res));
        if (res.fileList && res.fileList[0] && res.fileList[0].tempFileURL) {
          mp3Url = res.fileList[0].tempFileURL;
          console.log('[悦济 music] mp3Url 拿到 ✓');
        } else {
          console.warn('[悦济 music] fileList 空, 检查项:');
          console.warn('  A) CLOUD_PREFIX cloudID 跟 user 当前云开发环境 ID 是否一致?');
          console.warn('  B) 25 mp3 是否真在该环境的云存储, 路径是否对?');
          console.warn('  C) app.js onLaunch wx.cloud.init 是否成功 (看 console [悦济] 云环境初始化完成)');
        }
      } catch (e) {
        console.error('[悦济 music] getTempFileURL 抛错 =', e);
        console.error('  完整错误堆栈:', e.stack || '(无 stack)');
      }
    }
    console.log('========== 调试信息结束 ==========');

    this.setData({
      tizhiKey,
      tizhiName: TIZHI_NAMES[tizhiKey] || '平和质',
      tizhiDone,                                    // v3.1 F2
      latest4,
      wuyue: track.wuyue,
      currentWuyue: track.wuyue,  // v3.1 阶段 13: 跟 track.wuyue 同步, 避免 UI 不一致
      wuyueName: WUYUE_NAMES[track.wuyue],
      wuyueFull: WUYUE_FULL[track.wuyue],
      wuyueDesc: WUYUE_DESCRIPTIONS[track.wuyue],
      wuyueSuit: WUYUE_TO_TIZHI[track.wuyue] || '',  // v3.1 F3
      mp3Url,
      trackIndex: (track.trackIndex || 0) + 1,
      trackTotal: 6,
      loading: false,
      isPlaying: false,
    });

    // 5. 大模型润色
    this.askAi(tizhiKey, latest4, track.wuyue);
  },

  // v3.1 阶段 12 F1: 5 调式 tab 点击 — 用户自由选调式
  // v3.1 阶段 14 改: 传 forceWuyue 给 compute() (修 setData 异步问题)
  // 修前: this.setData({ currentWuyue: key }) + this.compute() — setData 异步, compute() 跑时 this.data.currentWuyue 还是旧值
  // 修后: this.compute(key) — 同步传参, compute() 立刻用 key 推 track, UI 100% 同步
  // v3.1 阶段 22.5 D 方案: 懒加载+缓存 (commit ba66299 新云函数 generate_music)
  //   L1 setStorage 缓存命中 → getTempFileURL 播放
  //   L1 未命中 → 调 wx.cloud.callFunction('generate_music') 走 L2/L3 minimax Music 2.6
  //   失败 / mock 模式 → fallback 30 段云存储 v0.7.1.9 (compute(key))
  onSelectWuyue(e) {
    const key = e.currentTarget.dataset.key;
    if (this.audioCtx) { this.audioCtx.stop(); this.audioCtx = null; }

    // 1. L1 setStorage 缓存命中 → getTempFileURL 播放
    const cached = wx.getStorageSync('yueji_music_cache_' + key);
    if (cached && cached.fileID) {
      console.log('[悦济 music D 方案] L1 缓存命中:', key, cached.fileID.slice(0, 50) + '...');
      this.playFromFileID(cached.fileID, key, true);
      return;
    }

    // 2. L1 未命中 → 调 generate_music 云函数 (D 方案懒加载)
    this.setData({
      loading: true,
      aiHint: '正在生成 ' + WUYUE_NAMES[key] + ' 调 mp3...',
      aiPowered: false,
    });
    console.log('[悦济 music D 方案] 调 generate_music:', key);
    wx.cloud.callFunction({
      name: 'generate_music',
      data: { wuyue: key },
    }).then((res) => {
      console.log('[悦济 music D 方案] generate_music 返:', res && res.result);
      if (res && res.result && res.result.ok && res.result.fileID) {
        // 真通道成功 → 写 L1 缓存 + 播放
        wx.setStorageSync('yueji_music_cache_' + key, {
          fileID: res.result.fileID,
          hash: res.result.hash,
          ts: Date.now(),
        });
        this.playFromFileID(res.result.fileID, key, res.result.isCache);
      } else {
        // mock / 失败 → fallback 30 段 v0.7.1.9
        console.warn('[悦济 music D 方案] generate_music 返 mock/失败, fallback 30 段 v0.7.1.9');
        if (WUYUE_30_FILEID[key]) { this.compute(key); }
        else { this.setData({ loading: false, aiHint: '该调式暂不可用' }); }
      }
    }).catch((e) => {
      console.error('[悦济 music D 方案] generate_music 异常, fallback 30 段:', e);
      if (WUYUE_30_FILEID[key]) { this.compute(key); }
      else { this.setData({ loading: false, aiHint: '调式调用失败' }); }
    });
  },

  // v3.1 阶段 22.5: D 方案 fileID 播放 helper (L1 缓存命中 + L2/L3 调 generate_music 后)
  // 走 wx.cloud.getTempFileURL 拿 2h 临时 URL, 自动播放
  playFromFileID(fileID, wuyueKey, isCache) {
    this.setData({ wuyue: wuyueKey, currentWuyue: wuyueKey, loading: true });
    getTempUrls([fileID]).then((res) => {
      const url = res.fileList && res.fileList[0] && res.fileList[0].tempFileURL;
      if (url) {
        this.setData({
          mp3Url: url,
          loading: false,
          aiHint: isCache ? '缓存命中' : '刚刚生成, 已缓存',
        });
        // 自动播放 (UX 友好, 200ms 延迟避免 setData 异步)
        setTimeout(() => this.onPlay(), 200);
      } else {
        console.warn('[悦济 music] getTempFileURL 返空, fallback 30 段');
        if (WUYUE_30_FILEID[wuyueKey]) { this.compute(wuyueKey); }
        else { this.setData({ loading: false }); }
      }
    }).catch((e) => {
      console.error('[悦济 music] getTempFileURL 异常:', e);
      if (WUYUE_30_FILEID[wuyueKey]) { this.compute(wuyueKey); }
      else { this.setData({ loading: false }); }
    });
  },

  askAi(tizhiKey, latest4, wuyue) {
    if (!wx.cloud) return;
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
    return '你今天 ' + TIZHI_NAMES[tizhiKey] + ', 试试 ' + WUYUE_NAMES[wuyue] + ' 调, 5 分钟, 慢慢听。';
  },

  onPlay() {
    console.log('[悦济 music] onPlay mp3Url =', this.data.mp3Url ? this.data.mp3Url.slice(0, 80) + '...' : '空');
    if (!this.data.mp3Url) {
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
