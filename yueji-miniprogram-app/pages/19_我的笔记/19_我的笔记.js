// 19_我的笔记.js — 悦济 v3.1 阶段 3 P0 #5
// 聚合用户沉淀: 笔记 (yueji_notes) + 句级金句 (yueji_sentence_favs) + 整章收藏 (yueji_jingwen_favs)
// 按月分组, 顶部摘要, 3 tab 切换
// 严守: 0 出现 14 严守词, 滋养调性

Page({
  data: {
    tab: 'all',           // all / notes / sentences / jingwen
    summary: { notes: 0, sentences: 0, jingwen: 0, months: 0 },
    groups: [],           // [{month, items: [{type, id, idx?, title, content, source, savedAt}]}]
    hasContent: false,
  },

  onLoad() { this.compute(); },
  onShow() { this.compute(); },

  onTabChange(e) {
    this.setData({ tab: e.currentTarget.dataset.tab });
    this.compute();
  },

  compute() {
    const notes = wx.getStorageSync('yueji_notes') || {};
    const sentFavs = wx.getStorageSync('yueji_sentence_favs') || [];
    const jwFavs = wx.getStorageSync('yueji_jingwen_favs') || [];

    // 笔记列表 [{id, text}]
    const noteList = Object.keys(notes)
      .filter(k => notes[k] && notes[k].trim())
      .map(k => ({ type: 'note', id: parseInt(k), text: notes[k].trim() }));

    // 金句列表 [{id, idx, text, source, title, savedAt}]
    const sentList = sentFavs.map(s => ({ ...s, type: 'sentence' }));

    // 收藏经文 [{id, source, title, savedAt}]
    const jwList = jwFavs.map(j => ({ ...j, type: 'jingwen' }));

    // 按 tab 过滤
    let merged = [];
    if (this.data.tab === 'all') merged = [...noteList, ...sentList, ...jwList];
    else if (this.data.tab === 'notes') merged = noteList;
    else if (this.data.tab === 'sentences') merged = sentList;
    else merged = jwList;

    // 按 savedAt / id 分组
    const byMonth = {};
    for (const item of merged) {
      // 取时间戳
      let ts = Date.now();
      if (item.savedAt && /^\d{4}-\d{2}-\d{2}/.test(item.savedAt)) ts = new Date(item.savedAt).getTime();
      else if (item.id) ts = item.id;  // 退而求其次用 id
      const month = this.monthLabel(ts);
      if (!byMonth[month]) byMonth[month] = [];
      byMonth[month].push({ ...item, savedAt: item.savedAt || (item.id ? `id: ${item.id}` : '') });
    }

    // 转数组, 按月倒序
    const groups = Object.keys(byMonth)
      .sort((a, b) => b.localeCompare(a))
      .map(m => ({
        month: m,
        count: byMonth[m].length,
        items: byMonth[m].sort((a, b) => {
          const ta = a.savedAt || '';
          const tb = b.savedAt || '';
          return tb.localeCompare(ta);
        }),
      }));

    this.setData({
      summary: {
        notes: noteList.length,
        sentences: sentList.length,
        jingwen: jwList.length,
        months: groups.length,
      },
      groups,
      hasContent: groups.length > 0,
    });
  },

  monthLabel(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  },

  // 跳 1.1_经文详情 (金句/收藏/笔记 都跳对应经文)
  onTapItem(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({ url: `/pages/1.1_经文详情/1.1_经文详情?id=${id}` });
  },

  // 复制笔记
  onCopy(e) {
    const text = e.currentTarget.dataset.text;
    if (!text) return;
    wx.setClipboardData({ data: text });
    wx.showToast({ title: '已复制', icon: 'success' });
  },

  // 删除金句
  onUnfav(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    const idx = parseInt(e.currentTarget.dataset.idx);
    if (isNaN(id) || isNaN(idx)) return;

    wx.showModal({
      title: '取消金句',
      content: '从我的金句中移除?',
      success: (res) => {
        if (res.confirm) {
          const sentFavs = wx.getStorageSync('yueji_sentence_favs') || [];
          const newFavs = sentFavs.filter(s => !(s.id === id && s.idx === idx));
          wx.setStorageSync('yueji_sentence_favs', newFavs);
          this.compute();
          wx.showToast({ title: '已移除', icon: 'success' });
        }
      },
    });
  },

  // 跳月底报告
  onGotoMonthly() {
    wx.navigateTo({ url: '/pages/14_月底报告/14_月底报告' });
  },

  // 跳 3 个月胶囊
  onGoto3Months() {
    wx.navigateTo({ url: '/pages/13_给3个月/13_给3个月' });
  },
});
