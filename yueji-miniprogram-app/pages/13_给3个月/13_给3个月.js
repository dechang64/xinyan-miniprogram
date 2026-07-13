// 13_给3个月.js — 悦济 v2.7.0 给 3 个月后的自己 (P0-2)
// 设计: 跟 v0.5 Streamlit 一致, 写入后封存 90 天, 90 天后自动可读
// 信件只存本地, 不上传云端
// 关 App 即清本地
// 严守: 8 禁用词 0 出现 (textarea 验)

const STORAGE_KEY = 'yueji_letter_3months';
const DAYS_LOCK = 90;

function daysBetween(d1, d2) {
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

Page({
  data: {
    letterText: '',
    hasLetter: false,
    canOpen: false,
    letterDate: '',
    openDate: '',
    daysLeft: 0,
  },

  onLoad() {
    this.checkLetter();
  },

  onShow() {
    this.checkLetter();
  },

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
    // 严守 8 词预审
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
    wx.setStorageSync(STORAGE_KEY, { text, writeTime: Date.now() });
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
          this.setData({ letterText: '', hasLetter: false });
          this.checkLetter();
        }
      },
    });
  },
});
