// 1_每日一经.js — 悦济 v2.0 经文库 (4 经 868 条, 4 tab + 搜索 + 收藏 + 进度)
const JINGWEN_868 = require('../../utils/data_jingwen.js');

Page({
  data: {
    // 868 条
    jingwenList: JINGWEN_868,
    // tab
    activeTab: 'all',
    // 搜索
    searchQuery: '',
    // 状态筛选
    filterStatus: 'all',
    // 用户状态: {id: {status, favorite}}
    userStatus: {},
    // 筛选后
    filteredList: [],
    // 进度
    progressText: '0 / 868',
    progressPercent: 0,
    // 各经数量 (经文详情由 1.1_经文详情 独立页承载, v3.1 阶段 1)
    totalCount: 868,
    daodejingCount: 0,
    zhouyiCount: 0,
    huangdiCount: 0,
    qingjingCount: 0,
  },

  onLoad() {
    this.loadUserStatus();
    this.computeCounts();
    this.applyFilter();
  },

  onShow() {
    this.loadUserStatus();
    this.applyFilter();
  },

  // 加载用户状态 (本地缓存)
  loadUserStatus() {
    try {
      const stored = wx.getStorageSync('jingwen_user_status') || {};
      this.setData({ userStatus: stored });
    } catch (e) {
      console.error('[悦济] 加载经文状态失败', e);
    }
  },

  // 保存用户状态
  saveUserStatus() {
    try {
      wx.setStorageSync('jingwen_user_status', this.data.userStatus);
    } catch (e) {
      console.error('[悦济] 保存经文状态失败', e);
    }
  },

  // 计算各经数量
  computeCounts() {
    const counts = { daodejing: 0, zhouyi: 0, huangdi: 0, qingjing: 0 };
    for (const item of JINGWEN_868) {
      if (item.source.includes('道德经')) counts.daodejing++;
      else if (item.source.includes('周易') || item.source.includes('易')) counts.zhouyi++;
      else if (item.source.includes('黄帝内经') || item.source.includes('素问') || item.source.includes('灵枢')) counts.huangdi++;
      else if (item.source.includes('清静经')) counts.qingjing++;
    }
    this.setData({
      daodejingCount: counts.daodejing,
      zhouyiCount: counts.zhouyi,
      huangdiCount: counts.huangdi,
      qingjingCount: counts.qingjing,
    });
  },

  // 应用筛选
  applyFilter() {
    let list = JINGWEN_868.map(item => {
      const user = this.data.userStatus[item.id] || {};
      return {
        ...item,
        status: user.status || 'unread',
        favorite: user.favorite || false,
      };
    });

    // tab 筛选
    if (this.data.activeTab !== 'all') {
      const tabMap = {
        daodejing: '道德经',
        zhouyi: '周易',
        huangdi: '黄帝内经',
        qingjing: '清静经',
      };
      const source = tabMap[this.data.activeTab];
      list = list.filter(item => item.source.includes(source));
    }

    // 状态筛选
    if (this.data.filterStatus !== 'all') {
      if (this.data.filterStatus === 'favorite') {
        list = list.filter(item => item.favorite);
      } else {
        list = list.filter(item => item.status === this.data.filterStatus);
      }
    }

    // 搜索
    if (this.data.searchQuery) {
      const q = this.data.searchQuery.toLowerCase();
      list = list.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q)
      );
    }

    // 计算进度
    const total = JINGWEN_868.length;
    const done = JINGWEN_868.filter(item => {
      const u = this.data.userStatus[item.id];
      return u && u.status === 'done';
    }).length;
    const percent = Math.round((done / total) * 100);

    this.setData({
      filteredList: list,
      progressText: `${done} / ${total}`,
      progressPercent: percent,
    });
  },

  // tab 切换
  onTabChange(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
    this.applyFilter();
  },

  // 搜索
  onSearchInput(e) {
    this.setData({ searchQuery: e.detail.value });
    this.applyFilter();
  },

  // 状态筛选
  onFilterStatus(e) {
    this.setData({ filterStatus: e.currentTarget.dataset.status });
    this.applyFilter();
  },

  // 点击经文 → 1.1_经文详情 (v3.1 阶段 1: 弹窗升级为独立详情页)
  // 弹窗历史包袱: v3.0.5 阶段 1.4-2 走 chat 云函数 1 句解读 (依赖 zhouwenwang 思友),
  //   1.1_经文详情 已经把"问 4 经 / 白话 / 解读"都做进 4 个 tab, 体验更好
  // 删除: showDetail / detail / onCloseDetail / askAiJingDetail 全部废弃
  // 保留: 列表上的"学习中 / 已读 / 收藏"状态 tag (在卡片底部, 不动)
  onTapItem(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({
      url: `/pages/1.1_经文详情/1.1_经文详情?id=${id}`,
    });
  },

  // 设置状态 (列表卡片状态 tag, 保留)
  onSetStatus(e) {
    const id = e.currentTarget.dataset.id;
    const status = e.currentTarget.dataset.status;
    const userStatus = { ...this.data.userStatus };
    userStatus[id] = { ...(userStatus[id] || {}), status };
    this.setData({ userStatus });
    this.saveUserStatus();
    this.applyFilter();
  },

  // 切换收藏 (列表卡片 ★, 保留)
  onToggleFavorite(e) {
    const id = e.currentTarget.dataset.id;
    const userStatus = { ...this.data.userStatus };
    const current = userStatus[id] || {};
    userStatus[id] = { ...current, favorite: !current.favorite };
    this.setData({ userStatus });
    this.saveUserStatus();
    this.applyFilter();
  },
});
