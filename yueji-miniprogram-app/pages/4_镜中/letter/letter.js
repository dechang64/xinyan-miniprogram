// letter.js — 写给 3 个月后的自己
const { todayISO } = require('../../../utils/compliance.js');
Page({
  data: {
    letter: '',
    savedAt: '',
  },
  onLoad() {
    const letter = wx.getStorageSync('yueji_letter') || '';
    const savedAt = wx.getStorageSync('yueji_letter_date') || '';
    this.setData({ letter, savedAt });
  },
  onInput(e) {
    this.setData({ letter: e.detail.value });
  },
  onSave() {
    const text = this.data.letter.trim();
    if (!text) {
      wx.showToast({ title: '写点什么吧', icon: 'none' });
      return;
    }
    const date = todayISO();
    wx.setStorageSync('yueji_letter', text);
    wx.setStorageSync('yueji_letter_date', date);
    this.setData({ savedAt: date });
    wx.showToast({ title: '已保存', icon: 'success' });
  },
  onClear() {
    wx.showModal({
      title: '清除信件',
      content: '确定要清除这封信吗?',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('yueji_letter');
          wx.removeStorageSync('yueji_letter_date');
          this.setData({ letter: '', savedAt: '' });
        }
      },
    });
  },
});
