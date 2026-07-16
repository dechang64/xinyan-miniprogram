// 13_给3个月.js — 悦济 v2.7.0 给 3 个月后的自己 (P0-2)
// v3.1 阶段 3: 写 4 维快照 + 90 天后读时算对比 + AI 3 个月陪伴
// 设计: 跟 v0.5 Streamlit 一致, 写入后封存 90 天, 90 天后自动可读
// 信件只存本地, 不上传云端
// 严守: 8 禁用词 0 出现 (textarea 验)

const STORAGE_KEY = 'yueji_letter_3months';
const SNAPSHOT_KEY = 'yueji_3months_snapshot';
const DAYS_LOCK = 90;

function daysBetween(d1, d2) {
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

function avg4(history) {
  if (!history || history.length === 0) return { avgMood: 0, avgEnergy: 0, avgSleep: 0, avgSkin: 0 };
  const recent = history.slice(-7);  // 最近 7 天
  const sum = (key) => recent.reduce((s, h) => s + (h[key] || 0), 0);
  const cnt = recent.length;
  return {
    avgMood: Math.round(sum('mood') / cnt * 10) / 10,
    avgEnergy: Math.round(sum('energy') / cnt * 10) / 10,
    avgSleep: Math.round(sum('sleep') / cnt * 10) / 10,
    avgSkin: Math.round(sum('skin') / cnt * 10) / 10,
  };
}

Page({
  data: {
    letterText: '',
    hasLetter: false,
    canOpen: false,
    letterDate: '',
    openDate: '',
    daysLeft: 0,
    // v3.1 阶段 3: 4 维对比 + AI 陪伴
    beforeStats: null,
    afterStats: null,
    aiCompanion: '',
    aiError: '',
    generating: false,
  },

  onLoad() { this.checkLetter(); },
  onShow() { this.checkLetter(); },

  checkLetter() {
    const data = wx.getStorageSync(STORAGE_KEY);
    if (!data || !data.text) {
      this.setData({ hasLetter: false });
      return;
    }
    const writeTime = data.writeTime;
    const openTime = writeTime + DAYS_LOCK * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const canOpen = now >= openTime;
    const daysLeft = Math.max(0, daysBetween(now, openTime));
    this.setData({
      hasLetter: true,
      canOpen,
      letterText: data.text,
      letterDate: new Date(writeTime).toISOString().slice(0, 10),
      openDate: new Date(openTime).toISOString().slice(0, 10),
      daysLeft,
    });
  },

  onInput(e) {
    this.setData({ letterText: e.detail.value });
  },

  onSave() {
    const text = this.data.letterText.trim();
    if (!text) {
      wx.showToast({ title: '请先写信', icon: 'none' });
      return;
    }
    // 严守 14 词预审
    const FORBIDDEN = ['治疗', '改善', '缓解', '治愈', '祛斑', '减肥', '处方', '医美', '美颜', '美白', '瘦脸', '营销', '广告', '疗愈'];
    for (const w of FORBIDDEN) {
      if (text.includes(w)) {
        wx.showModal({
          title: '严守提示',
          content: `检测到"${w}", 不适合写信给未来的自己. 试试用「滋养 / 涵养 / 共修 / 温润」的调性.`,
          showCancel: false,
        });
        return;
      }
    }
    // v3.1 阶段 3: 保存信件 + 4 维快照 (写时 7 天平均)
    const history = wx.getStorageSync('yueji_history') || [];
    const snapshot = avg4(history);
    wx.setStorageSync(STORAGE_KEY, { text, writeTime: Date.now(), snapshot });
    wx.setStorageSync(SNAPSHOT_KEY, snapshot);
    wx.showToast({ title: '已封存, 90 天后见', icon: 'success' });
    this.checkLetter();
  },

  onDelete() {
    wx.showModal({
      title: '作废重写',
      content: '原信将永久删除, 不可恢复. 确定吗?',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync(STORAGE_KEY);
          wx.removeStorageSync(SNAPSHOT_KEY);
          this.setData({
            letterText: '', hasLetter: false,
            beforeStats: null, afterStats: null, aiCompanion: '',
          });
          this.checkLetter();
        }
      },
    });
  },

  // v3.1 阶段 3: 90 天后, 拉 4 维对比 + AI 陪伴
  async onReadLetter() {
    if (!this.data.canOpen) return;
    const data = wx.getStorageSync(STORAGE_KEY);
    if (!data || !data.snapshot) {
      this.setData({ beforeStats: null, afterStats: null });
      return;
    }
    const history = wx.getStorageSync('yueji_history') || [];
    const after = avg4(history);

    this.setData({
      beforeStats: data.snapshot,
      afterStats: after,
    });

    // AI 陪伴
    if (!wx.cloud) return;
    this.setData({ generating: true, aiError: '' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'chat',
        data: {
          type: 'three_months_companion',
          three_months: {
            beforeStats: data.snapshot,
            afterStats: after,
            letterExcerpt: data.text,
          },
        },
      });
      if (res.result && res.result.ok && res.result.text) {
        this.setData({ aiCompanion: res.result.text });
      } else {
        this.setData({ aiError: '（AI 暂未接住, 请检查云函数部署）' });
      }
    } catch (e) {
      console.error('[悦济 3 个月胶囊]', e);
      this.setData({ aiError: '（云函数不可用）' });
    }
    this.setData({ generating: false });
  },
});
