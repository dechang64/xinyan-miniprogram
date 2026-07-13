// 14_月底报告.js — 悦济 v2.7.0 月底报告 (P0-3)
// 设计: 跟 v0.5 心颜 Streamlit 一致, 30 天 4 维平均 + 趋势, AMAX 真生成月底总结
// 8 禁用词 0 出现
// 数据: 4 维 (心情/精力/睡眠/肌肤) 来自 utils/data_jingwen.js? 不, 来自 4_镜中 wx.setStorage('yueji_history')

function avg(arr) {
  if (!arr.length) return 0;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
}

Page({
  data: {
    hasData: false,
    monthLabel: '',
    stats: { avgMood: 0, avgEnergy: 0, avgSleep: 0, avgSkin: 0, days: 0, trend: '' },
    aiReport: '',
    aiError: '',
    generating: false,
  },

  onLoad() { this.loadStats(); },
  onShow() { this.loadStats(); },

  loadStats() {
    const history = wx.getStorageSync('yueji_history') || [];
    if (history.length === 0) {
      this.setData({ hasData: false });
      return;
    }
    const recent = history.slice(-30);
    const moods = recent.map(h => h.mood);
    const energies = recent.map(h => h.energy);
    const sleeps = recent.map(h => h.sleep);
    const skins = recent.map(h => h.skin);

    // 趋势: 前 7 天 vs 后 7 天平均
    let trend = '平稳';
    if (recent.length >= 14) {
      const first = avg(recent.slice(0, 7).map(h => h.mood));
      const last = avg(recent.slice(-7).map(h => h.mood));
      if (last > first + 0.5) trend = '上升';
      else if (last < first - 0.5) trend = '下降';
    }

    // 月份标签
    const last = recent[recent.length - 1];
    const monthLabel = last.date.slice(0, 7) + ' 共' + recent.length + ' 天';

    this.setData({
      hasData: true,
      monthLabel,
      stats: {
        avgMood: avg(moods),
        avgEnergy: avg(energies),
        avgSleep: avg(sleeps),
        avgSkin: avg(skins),
        days: recent.length,
        trend,
      },
    });
  },

  onGotoJingzhong() {
    wx.switchTab({ url: '/pages/4_镜中/4_镜中' });
  },

  async onGenerate() {
    if (!wx.cloud) {
      this.setData({ aiError: '云开发未配置' });
      return;
    }
    this.setData({ generating: true, aiReport: '', aiError: '' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'chat',
        data: {
          user_input: '请基于我的 30 天 4 维数据 (心情/精力/睡眠/肌肤) 生成一份月末陪伴报告',
          role: 'yueji',  // 悦己 (滋养)
          history: [],
          meta: {
            stats: this.data.stats,
            monthLabel: this.data.monthLabel,
          },
        },
      });
      if (res.result && res.result.ok && res.result.data && res.result.data.content) {
        this.setData({ aiReport: res.result.data.content });
      } else if (res.result && res.result.ok === false) {
        this.setData({ aiError: `（云函数返错: ${res.result.error_code || res.result.error || '未知'}）` });
      } else {
        this.setData({ aiError: '（AI 返回为空）' });
      }
    } catch (e) {
      console.error('[悦济 月底报告]', e);
      this.setData({ aiError: '（云函数不可用, 请检查 AI_API_KEY 部署）' });
    }
    this.setData({ generating: false });
  },
});
