// 3_共修堂.js — 悦济 v3.1 阶段 4 P0 #3
// 21 天经文 + 28 天汤品 + 我的进度
// 严守: 0 出现 14 严守词, 共修不打卡 / 不比较 / 不排名, 慢慢来
const JINGWEN_868 = require('../../utils/data_jingwen.js');
const SOUPS_28 = require('../../utils/data_soups.js');
const { todayISO } = require('../../utils/compliance.js');

// 21 天经文共修: 4 经开篇 (道 5 + 周 5 + 黄 5 + 清 6 = 21)
const RITUAL_JINGWEN = (() => {
  const by = { '道德经': [], '周易': [], '黄帝内经': [], '清静经': [] };
  for (const x of JINGWEN_868) {
    if (by[x.source]) by[x.source].push(x);
  }
  const pick = {
    '道德经': by['道德经'].slice(0, 5),
    '周易': by['周易'].slice(0, 5),
    '黄帝内经': by['黄帝内经'].slice(0, 5),
    '清静经': by['清静经'].slice(0, 6),
  };
  const days = [];
  let day = 1;
  for (const src of ['道德经', '周易', '黄帝内经', '清静经']) {
    for (const x of pick[src]) {
      days.push({
        day,
        source: x.source,
        title: x.title,
        jingwenId: x.id,
        short: (x.content || '').slice(0, 24) + ((x.content || '').length > 24 ? '...' : ''),
        color: src === '道德经' ? '#a8c8a8' : src === '周易' ? '#B8D8E8' : src === '黄帝内经' ? '#F4D35E' : '#D8B0A0',
      });
      day++;
    }
  }
  return days;
})();

// 28 天汤品共修: 全 28 款, 剩 2 个留 "敬请期待"
const RITUAL_SOUPS = (() => {
  const days = [];
  for (let i = 0; i < 30; i++) {
    if (i < SOUPS_28.length) {
      const s = SOUPS_28[i];
      days.push({
        day: i + 1,
        soupId: s.id || (i + 1),
        name: s.name,
        tizhi: s.tizhi,
        season: s.season,
        short: (s.desc || '').slice(0, 20) + ((s.desc || '').length > 20 ? '...' : ''),
        available: true,
      });
    } else {
      days.push({
        day: i + 1,
        name: '敬请期待',
        tizhi: '',
        season: '',
        short: '第 ' + (i + 1) + ' 款, 整理中',
        available: false,
      });
    }
  }
  return days;
})();

Page({
  data: {
    tab: 'jingwen',          // jingwen / soup / mine
    summary: { jingwenDone: 0, soupDone: 0, totalDays: 0 },
    ritualJingwen: [],
    ritualSoups: [],
    myDone: [],              // [{type, day, title, source, name, tizhi, doneAt}]
  },

  onLoad() { this.compute(); },
  onShow() { this.compute(); },

  compute() {
    const jwStatus = wx.getStorageSync('jingwen_user_status') || {};
    const soupStatus = wx.getStorageSync('yueji_soup_status') || {};

    // 21 天经文: 检查每章是否 status='done'
    const ritualJw = RITUAL_JINGWEN.map(d => ({
      ...d,
      done: !!(jwStatus[d.jingwenId] && jwStatus[d.jingwenId].status === 'done'),
    }));

    // 28 天汤品: 检查每款
    const ritualSoups = RITUAL_SOUPS.map(d => ({
      ...d,
      done: d.available && !!(soupStatus[d.soupId] && soupStatus[d.soupId].status === 'done'),
    }));

    // 我的进度: 合并已完成的经文/汤品, 按时间倒序
    const myDone = [];
    for (const d of ritualJw) {
      if (d.done) {
        const u = jwStatus[d.jingwenId] || {};
        myDone.push({
          type: 'jingwen',
          day: d.day,
          title: d.title,
          source: d.source,
          name: '',
          tizhi: '',
          doneAt: u.doneAt || '',
        });
      }
    }
    for (const d of ritualSoups) {
      if (d.done) {
        const u = soupStatus[d.soupId] || {};
        myDone.push({
          type: 'soup',
          day: d.day,
          title: '',
          source: '',
          name: d.name,
          tizhi: d.tizhi,
          doneAt: u.doneAt || '',
        });
      }
    }
    myDone.sort((a, b) => (b.doneAt || '').localeCompare(a.doneAt || ''));

    // 摘要
    const summary = {
      jingwenDone: ritualJw.filter(d => d.done).length,
      soupDone: ritualSoups.filter(d => d.done).length,
      totalDays: myDone.length,
    };

    this.setData({
      ritualJingwen: ritualJw,
      ritualSoups,
      myDone,
      summary,
    });
  },

  onTabChange(e) {
    this.setData({ tab: e.currentTarget.dataset.tab });
  },

  // 跳 1.1_经文详情 (21 天经文)
  onTapJing(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({ url: `/pages/1.1_经文详情/1.1_经文详情?id=${id}` });
  },

  // 跳 2_每日一汤 (28 天汤品)
  onTapSoup(e) {
    if (e.currentTarget.dataset.available === false) {
      wx.showToast({ title: '整理中, 敬请期待', icon: 'none' });
      return;
    }
    wx.switchTab({ url: '/pages/2_每日一汤/2_每日一汤' });
  },

  // 标记经文"已读" (快捷, 不进详情)
  onMarkJing(e) {
    const day = e.currentTarget.dataset.day;
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    const status = wx.getStorageSync('jingwen_user_status') || {};
    const cur = status[id] || {};
    const newDone = !(cur.status === 'done');
    status[id] = { ...cur, status: newDone ? 'done' : 'unread', doneAt: newDone ? todayISO() : '' };
    wx.setStorageSync('jingwen_user_status', status);
    this.compute();
    wx.showToast({ title: newDone ? '✦ 已记录' : '已撤销', icon: 'success' });
  },

  // 标记汤品"已喝" (快捷)
  onMarkSoup(e) {
    const day = e.currentTarget.dataset.day;
    const id = e.currentTarget.dataset.id;
    if (e.currentTarget.dataset.available === false) {
      wx.showToast({ title: '整理中, 敬请期待', icon: 'none' });
      return;
    }
    if (!id) return;
    const status = wx.getStorageSync('yueji_soup_status') || {};
    const cur = status[id] || {};
    const newDone = !(cur.status === 'done');
    status[id] = { ...cur, status: newDone ? 'done' : 'unread', doneAt: newDone ? todayISO() : '' };
    wx.setStorageSync('yueji_soup_status', status);
    this.compute();
    wx.showToast({ title: newDone ? '✦ 已记录' : '已撤销', icon: 'success' });
  },
});
