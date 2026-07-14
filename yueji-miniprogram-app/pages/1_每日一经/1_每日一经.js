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
    // 详情
    showDetail: false,
    detail: {},
    // 各经数量
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

  // 点击经文
  onTapItem(e) {
    const id = e.currentTarget.dataset.id;
    const item = JINGWEN_868.find(j => j.id === id);
    if (!item) return;
    const user = this.data.userStatus[id] || {};
    this.setData({
      showDetail: true,
      detail: { ...item, status: user.status || 'unread', favorite: user.favorite || false },
    });
    // v3.0.5 阶段 1.4-2: 详情弹窗 大模型 1 句解读 (走 chat 云函数 amax-router)
    this.askAiJingDetail(item);
  },

  // 大模型 1 句解读 (经文详情) - 走 zhouwenwang 思友
  askAiJingDetail(item) {
    if (!wx.cloud) return;
    const tizhiKey = wx.getStorageSync('yueji_tizhi') || 'pinghe';
    const TIZHI_NAMES = { pinghe: '平和质', qixu: '气虚质', yangxu: '阳虚质', yinxu: '阴虚质', tanshi: '痰湿质', shire: '湿热质', xueyu: '血瘀质', qiyu: '气郁质', tebing: '特禀质' };
    const prompt =
      '你是悦济的「思友」, 用户是 9 体质中的「' + TIZHI_NAMES[tizhiKey] + '」, ' +
      '经文: 「' + item.title + '」 出自 ' + item.source + ', ' +
      '原文: ' + (item.content || '').slice(0, 100) + '. ' +
      '请用 1 句 (≤40 字) 给用户 1 句当下解读, 严守: 不评判 / 不医疗 / 不卖, 滋养调性. ' +
      '3 层结构: 看到 1 句原文 (10 字) + 跟用户 9 体质 (15 字) + 慢慢读 (10 字).';
    this.setData({ 'detail.aiHint': '... 思友说' });
    wx.cloud.callFunction({
      name: 'chat',
      data: { user_input: prompt, role: 'zhouwenwang', history: [] },
    }).then((res) => {
      if (res && res.result && res.result.ok && res.result.data && res.result.data.content) {
        if (this.data.detail.id === item.id) this.setData({ 'detail.aiHint': res.result.data.content });
      }
    }).catch((e) => {
      console.warn('[悦济 jing detail ai]', e);
      this.setData({ 'detail.aiHint': '... 思友说 (润色暂不可用, 请检查云函数部署)' });
    });
  },

  // 关闭详情
  onCloseDetail() {
    this.setData({ showDetail: false });
  },

  // 设置状态
  onSetStatus(e) {
    const id = e.currentTarget.dataset.id;
    const status = e.currentTarget.dataset.status;
    const userStatus = { ...this.data.userStatus };
    userStatus[id] = { ...(userStatus[id] || {}), status };
    this.setData({ userStatus });
    this.saveUserStatus();
    this.applyFilter();
    // 同步更新详情
    if (this.data.showDetail && this.data.detail.id === id) {
      this.setData({ 'detail.status': status });
    }
  },

  // 切换收藏
  onToggleFavorite(e) {
    const id = e.currentTarget.dataset.id;
    const userStatus = { ...this.data.userStatus };
    const current = userStatus[id] || {};
    userStatus[id] = { ...current, favorite: !current.favorite };
    this.setData({ userStatus });
    this.saveUserStatus();
    this.applyFilter();
    if (this.data.showDetail && this.data.detail.id === id) {
      this.setData({ 'detail.favorite': !current.favorite });
    }
  },
});
