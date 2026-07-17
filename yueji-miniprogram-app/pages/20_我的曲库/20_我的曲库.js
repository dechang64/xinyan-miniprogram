// pages/20_我的曲库/20_我的曲库.js
// 悦济 v3.1 阶段 23 — 个人曲库 B 基础版 35 段/周 (5 调式 × 7 天)
// 拍板 (2026-07-16 22:00 冬生 '按你的方案开干'):
//   B 基础版: 5 调式 × 7 天 = 35 段, 复用 generate_music 22.4 严守
//   入口: 5_我的 "我的曲库" 卡片 → navigateTo 到本页
//   触发: 用户首登/手动, 调 personal_library 云函数 action=generate
//   缓存: 云存储 yueji-personal-lib/<openid>/<YYYY-MM-DD>_index.json
//   严守: 14 禁用词 + 12 玄学红线 + 15 危机词 0 出现

const { getTempUrls } = require('../../utils/data_music.js');

const WUYUE_KEYS = ['gong', 'shang', 'jiao', 'zhi', 'yu'];
const WUYUE_NAMES = { gong: '宫', shang: '商', jiao: '角', zhi: '徵', yu: '羽' };
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_NAMES = {
  mon: '周一', tue: '周二', wed: '周三', thu: '周四',
  fri: '周五', sat: '周六', sun: '周日',
};

function getWeekStart() {
  const d = new Date();
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - (day - 1));
  return d.toISOString().slice(0, 10);
}

function getWeekDays(weekStart) {
  const start = new Date(weekStart);
  return DAY_KEYS.map((dk, i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    return {
      dayKey: dk,
      dayName: DAY_NAMES[dk],
      date: d.toISOString().slice(0, 10),
      dateShort: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`,
    };
  });
}

Page({
  data: {
    weekStart: '',
    gridDays: [],
    stats: { generated: 0, cached: 0, pending: 35, total: 35 },
    generating: false,
    currentItem: null,
    playerHint: '',
    audioCtx: null,
  },

  onLoad() {
    const weekStart = getWeekStart();
    const gridDays = getWeekDays(weekStart).map((d) => ({
      ...d,
      cells: WUYUE_KEYS.map((w) => ({
        wuyue: w,
        wuyueName: WUYUE_NAMES[w],
        state: 'empty',  // empty | generating | ready | cached
        fileID: null,
      })),
    }));
    this.setData({ weekStart, gridDays });
    this.refreshStatus();
  },

  onShow() {
    this.refreshStatus();
  },

  // v3.1 阶段 23: 查云存储本周索引
  refreshStatus() {
    wx.cloud.callFunction({
      name: 'personal_library',
      data: { action: 'status' },
    }).then((res) => {
      if (res && res.result && res.result.ok) {
        const { total, generated, cached, failed } = res.result;
        const pending = 35 - total;
        this.setData({
          stats: { total, generated, cached, failed, pending },
        });
        this.applyItemsToGrid(res.result.lastUpdate ? [] : []);  // 简化
      }
    }).catch((e) => {
      console.error('[20_我的曲库] refreshStatus 异常:', e);
    });
  },

  // v3.1 阶段 23: 查本周 35 段清单 → 应用到 grid
  applyItemsToGrid(_unused) {
    wx.cloud.callFunction({
      name: 'personal_library',
      data: { action: 'list' },
    }).then((res) => {
      if (res && res.result && res.result.ok && res.result.items) {
        const items = res.result.items;
        const itemMap = new Map();
        for (const it of items) {
          itemMap.set(`${it.dayKey}_${it.wuyue}`, it);
        }
        const gridDays = this.data.gridDays.map((d) => ({
          ...d,
          cells: d.cells.map((c) => {
            const it = itemMap.get(`${d.dayKey}_${c.wuyue}`);
            if (!it) return c;
            return {
              ...c,
              state: it.mock ? 'empty' : (it.isCache ? 'cached' : 'ready'),
              fileID: it.fileID,
            };
          }),
        }));
        this.setData({ gridDays });
      }
    }).catch((e) => {
      console.error('[20_我的曲库] list 异常:', e);
    });
  },

  // v3.1 阶段 23: 用户点 "生成本周曲库" → 调云函数批量生成
  onGenerate() {
    if (this.data.generating) return;
    this.setData({ generating: true });

    wx.showLoading({ title: '正在生成 35 段…', mask: true });
    wx.cloud.callFunction({
      name: 'personal_library',
      data: { action: 'generate' },
    }).then((res) => {
      wx.hideLoading();
      this.setData({ generating: false });
      if (res && res.result && res.result.ok) {
        wx.showToast({
          title: `已生成 ${res.result.generated} 段`,
          icon: 'success',
          duration: 2000,
        });
        this.refreshStatus();
        this.applyItemsToGrid();
      } else {
        wx.showToast({
          title: res.result.error || '生成失败',
          icon: 'none',
        });
      }
    }).catch((e) => {
      wx.hideLoading();
      this.setData({ generating: false });
      console.error('[20_我的曲库] generate 异常:', e);
      wx.showToast({ title: '生成异常, 请稍后重试', icon: 'none' });
    });
  },

  // v3.1 阶段 23: 点 cell → 播放
  onPlayCell(e) {
    const { day, wuyue, fileid } = e.currentTarget.dataset;
    if (!fileid) {
      wx.showToast({ title: '该段尚未生成, 请先生成', icon: 'none' });
      return;
    }

    // 找当前 cell
    const gridDays = this.data.gridDays;
    let dayName = '', wuyueName = '';
    for (const d of gridDays) {
      if (d.dayKey === day) {
        dayName = d.dayName;
        for (const c of d.cells) {
          if (c.wuyue === wuyue) wuyueName = c.wuyueName;
        }
      }
    }

    if (this.audioCtx) { this.audioCtx.stop(); this.audioCtx = null; }

    this.setData({
      currentItem: { dayName, wuyueName },
      playerHint: '加载中…',
    });

    getTempUrls([fileid]).then((res) => {
      const url = res.fileList && res.fileList[0] && res.fileList[0].tempFileURL;
      if (!url) {
        this.setData({ playerHint: '加载失败' });
        return;
      }
      const audioCtx = wx.createInnerAudioContext();
      audioCtx.src = url;
      audioCtx.onPlay(() => this.setData({ playerHint: '播放中' }));
      audioCtx.onError((err) => {
        console.error('[20_我的曲库] audio error:', err);
        this.setData({ playerHint: '播放失败' });
      });
      audioCtx.play();
      this.audioCtx = audioCtx;
    }).catch((e) => {
      console.error('[20_我的曲库] getTempUrls 异常:', e);
      this.setData({ playerHint: '加载异常' });
    });
  },

  onStop() {
    if (this.audioCtx) {
      this.audioCtx.stop();
      this.audioCtx = null;
    }
    this.setData({ currentItem: null, playerHint: '' });
  },

  onUnload() {
    if (this.audioCtx) {
      this.audioCtx.stop();
      this.audioCtx = null;
    }
  },
});
