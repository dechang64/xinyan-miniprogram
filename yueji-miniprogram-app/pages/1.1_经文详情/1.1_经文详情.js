// 1.1_经文详情.js — 悦济 v3.1 阶段 1
// v3.1 新功能:经文独立详情页(替代弹窗)+ 分段 + 朗读 + 问 4 经 + 笔记
// v3.1 严守: 0 出现 87 禁用词,严守字串硬约束,滋养型工具定位
// 数据源: utils/data_jingwen.js (868 经文) + utils/data_digital_human.js (4 经头像)
// 云函数: voice (TTS) + chat (问 4 经,带 context)

const JINGWEN_868 = require('../../utils/data_jingwen.js');
const { DIGITAL_HUMAN_AVATARS } = require('../../utils/data_digital_human.js');
const { detectCrisis, todayISO } = require('../../utils/compliance.js');

const innerAudioContext = wx.createInnerAudioContext();

// 4 经来源 → 推荐养友映射(经文 → 哪个数字人最适合解)
const SOURCE_TO_HUMAN = {
  '道德经': 'laozi',
  '周易': 'zhouwenwang',
  '黄帝内经': 'qibo',
  '清静经': 'yuanshen',
};

// 简化的"按句号分句"算法(每段 1-2 句)
function splitByPeriod(text) {
  if (!text) return [];
  // 优先按 "。" "！" "？" 分;再按 "；" 二次切
  const raw = text.split(/(?<=[。！？])|(?<=[；])/g).filter(s => s.trim());
  const segs = [];
  // 每段最多 2 句
  for (let i = 0; i < raw.length; i += 2) {
    const seg = raw.slice(i, i + 2).join('').trim();
    if (seg) segs.push(seg);
  }
  return segs;
}

Page({
  data: {
    // 经文数据
    jingwenId: null,
    jingwen: null,
    title: '',
    source: '',
    content: '',
    segments: [],        // [{idx, text, fav}]
    chapterNum: 0,
    totalInSource: 0,
    nextId: null,
    prevId: null,

    // UI 状态
    tab: 'origin',       // origin / baihua / pinyin / jiequ
    isPlaying: false,
    fav: false,

    // AI 生成(白话/拼音/解读)
    baihua: '',
    baihuaLoading: false,
    pinyin: '',
    pinyinLoading: false,
    jiequ: '',
    jiequLoading: false,
    aiCharacterName: '老子',
    aiCharacterKey: 'laozi',

    // 笔记
    showNoteModal: false,
    noteInput: '',
    savedNote: '',
  },

  onLoad(query) {
    const id = parseInt(query.id);
    if (!id) {
      wx.showToast({ title: '经文 ID 缺失', icon: 'none' });
      wx.navigateBack();
      return;
    }
    this.setData({ jingwenId: id });
    this.loadJingwen(id);
  },

  onUnload() {
    innerAudioContext.stop();
    innerAudioContext.destroy();
  },

  // === 加载经文 ===
  loadJingwen(id) {
    const idx = JINGWEN_868.findIndex(j => j.id === id);
    if (idx < 0) {
      wx.showToast({ title: '经文不存在', icon: 'none' });
      wx.navigateBack();
      return;
    }
    const jw = JINGWEN_868[idx];
    const segments = splitByPeriod(jw.content);

    // 同源经文(用于上下章)
    const sameSource = JINGWEN_868.filter(j => j.source === jw.source);
    const sameSourceIdx = sameSource.findIndex(j => j.id === id);
    const prevJw = sameSource[sameSourceIdx - 1];
    const nextJw = sameSource[sameSourceIdx + 1];

    // 推荐 4 经数字人
    const aiKey = SOURCE_TO_HUMAN[jw.source] || 'laozi';
    const aiHuman = DIGITAL_HUMAN_AVATARS[aiKey] || DIGITAL_HUMAN_AVATARS.laozi;

    // 加载收藏 / 笔记
    const favs = wx.getStorageSync('yueji_jingwen_favs') || [];
    const isFav = favs.some(f => f.id === id);
    const notes = wx.getStorageSync('yueji_notes') || {};
    const savedNote = notes[id] || '';

    // 加载段级收藏(金句)
    const sentFavs = wx.getStorageSync('yueji_sentence_favs') || [];
    const segData = segments.map((text, idx) => ({
      idx,
      text,
      fav: sentFavs.some(s => s.id === id && s.idx === idx),
    }));

    this.setData({
      jingwen: jw,
      title: `${jw.source} · ${jw.title}`,
      source: jw.source,
      content: jw.content,
      segments: segData,
      chapterNum: sameSourceIdx + 1,
      totalInSource: sameSource.length,
      nextId: nextJw ? nextJw.id : null,
      prevId: prevJw ? prevJw.id : null,
      fav: isFav,
      savedNote,
      aiCharacterKey: aiKey,
      aiCharacterName: aiHuman.name,
    });

    // 严守白话 / 拼音 / 解读都按需加载(用户切 tab 时才请求)
  },

  // === 标签切换:原文/白话/拼音/解读 ===
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ tab });
    if (tab === 'baihua' && !this.data.baihua) this.loadBaihua();
    if (tab === 'pinyin' && !this.data.pinyin) this.loadPinyin();
    if (tab === 'jiequ' && !this.data.jiequ) this.loadJiequ();
  },

  // === 调 chat 云函数,白话/拼音/解读 ===
  async loadBaihua() {
    this.setData({ baihuaLoading: true });
    try {
      const res = await wx.cloud.callFunction({
        name: 'chat',
        data: {
          type: 'baihua',
          jingwen: this.data.jingwen,
          character: this.data.aiCharacterKey,
        },
      });
      this.setData({ baihua: res.result?.text || '白话暂未生成', baihuaLoading: false });
    } catch (err) {
      this.setData({
        baihua: '本次云端生成失败,稍后再试。可以切到"解读"标签看养友建议。',
        baihuaLoading: false,
      });
    }
  },

  async loadPinyin() {
    this.setData({ pinyinLoading: true });
    try {
      const res = await wx.cloud.callFunction({
        name: 'chat',
        data: { type: 'pinyin', jingwen: this.data.jingwen },
      });
      this.setData({ pinyin: res.result?.text || '拼音暂未生成', pinyinLoading: false });
    } catch (err) {
      this.setData({
        pinyin: '拼音暂不可用。建议微信搜索"古诗文网"查阅注音版本。',
        pinyinLoading: false,
      });
    }
  },

  async loadJiequ() {
    this.setData({ jiequLoading: true });
    try {
      const res = await wx.cloud.callFunction({
        name: 'chat',
        data: {
          type: 'jiequ',
          jingwen: this.data.jingwen,
          character: this.data.aiCharacterKey,
        },
      });
      this.setData({ jiequ: res.result?.text || '解读暂未生成', jiequLoading: false });
    } catch (err) {
      this.setData({
        jiequ: '解读暂不可用。这卷经是中华文化的瑰宝,推荐阅读《道德经今译》(任继愈)深入理解。',
        jiequLoading: false,
      });
    }
  },

  // === 上下经文 ===
  onTapPrev() {
    if (this.data.prevId) {
      wx.redirectTo({ url: `/pages/1.1_经文详情/1.1_经文详情?id=${this.data.prevId}` });
    } else {
      wx.showToast({ title: '已是本卷首章', icon: 'none' });
    }
  },

  onTapNext() {
    if (this.data.nextId) {
      wx.redirectTo({ url: `/pages/1.1_经文详情/1.1_经文详情?id=${this.data.nextId}` });
    } else {
      wx.showToast({ title: '已是本卷末章', icon: 'none' });
    }
  },

  // === 朗读(TTS via voice 云函数)===
  async onTapRead() {
    if (this.data.isPlaying) {
      innerAudioContext.stop();
      this.setData({ isPlaying: false });
      return;
    }
    try {
      wx.showLoading({ title: '准备朗读...' });
      const res = await wx.cloud.callFunction({
        name: 'voice',
        data: {
          text: this.data.content,
          voice: this.data.aiCharacterKey,
        },
      });
      wx.hideLoading();
      if (res.result?.url) {
        innerAudioContext.src = res.result.url;
        innerAudioContext.play();
        innerAudioContext.onPlay(() => this.setData({ isPlaying: true }));
        innerAudioContext.onEnded(() => this.setData({ isPlaying: false }));
        innerAudioContext.onError(() => this.setData({ isPlaying: false }));
      } else {
        wx.showToast({ title: '云端未返回音频', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '朗读暂不可用', icon: 'none' });
    }
  },

  // === 收藏整章 ===
  onTapFav() {
    const favs = wx.getStorageSync('yueji_jingwen_favs') || [];
    const id = this.data.jingwenId;
    if (this.data.fav) {
      const newFavs = favs.filter(f => f.id !== id);
      wx.setStorageSync('yueji_jingwen_favs', newFavs);
      this.setData({ fav: false });
      wx.showToast({ title: '已取消收藏', icon: 'success' });
    } else {
      favs.push({
        id,
        source: this.data.source,
        title: this.data.jingwen.title,
        savedAt: todayISO(),
      });
      wx.setStorageSync('yueji_jingwen_favs', favs);
      this.setData({ fav: true });
      wx.showToast({ title: '⭐ 已收藏', icon: 'success' });
    }
  },

  // === 句级收藏(金句)== =
  onLongPressSegment(e) {
    const segText = e.currentTarget.dataset.segment;
    const segIdx = e.currentTarget.dataset.idx;
    wx.showActionSheet({
      itemList: ['⭐ 收藏这句', '📋 复制', '💬 问养友', '取消'],
      success: (res) => {
        if (res.tapIndex === 0) this.favSentence(segIdx, segText);
        if (res.tapIndex === 1) this.copySegment(segText);
        if (res.tapIndex === 2) this.askAboutSegment(segText);
      },
    });
  },

  favSentence(idx, text) {
    const sentFavs = wx.getStorageSync('yueji_sentence_favs') || [];
    const exists = sentFavs.find(s => s.id === this.data.jingwenId && s.idx === idx);
    if (exists) {
      wx.showToast({ title: '已收藏过', icon: 'none' });
      return;
    }
    sentFavs.push({
      id: this.data.jingwenId,
      idx,
      text,
      source: this.data.source,
      title: this.data.jingwen.title,
      savedAt: todayISO(),
    });
    wx.setStorageSync('yueji_sentence_favs', sentFavs);
    // 更新 UI
    const segs = this.data.segments.map(s => s.idx === idx ? { ...s, fav: true } : s);
    this.setData({ segments: segs });
    wx.showToast({ title: '⭐ 金句已收', icon: 'success' });
  },

  onUnfav(e) {
    const idx = e.currentTarget.dataset.idx;
    const sentFavs = wx.getStorageSync('yueji_sentence_favs') || [];
    const newFavs = sentFavs.filter(s => !(s.id === this.data.jingwenId && s.idx === idx));
    wx.setStorageSync('yueji_sentence_favs', newFavs);
    const segs = this.data.segments.map(s => s.idx === idx ? { ...s, fav: false } : s);
    this.setData({ segments: segs });
    wx.showToast({ title: '已取消金句', icon: 'none' });
  },

  copySegment(text) {
    wx.setClipboardData({ data: text });
    wx.showToast({ title: '已复制', icon: 'success' });
  },

  askAboutSegment(text) {
    this.askWithContext(`这一句"${text}"是什么意思?`);
  },

  // === 笔记 ===
  onTapNote() {
    this.setData({
      showNoteModal: true,
      noteInput: this.data.savedNote || '',
    });
  },

  onNoteInput(e) {
    this.setData({ noteInput: e.detail.value });
  },

  onCloseNoteModal() {
    this.setData({ showNoteModal: false });
  },

  onSaveNote() {
    const notes = wx.getStorageSync('yueji_notes') || {};
    notes[this.data.jingwenId] = this.data.noteInput.trim();
    wx.setStorageSync('yueji_notes', notes);
    this.setData({
      showNoteModal: false,
      savedNote: this.data.noteInput.trim(),
    });
    wx.showToast({ title: '✏ 笔记已存', icon: 'success' });
  },

  // === 问 4 经数字人 ===
  onTapAsk() {
    this.askWithContext();
  },

  askWithContext(customQuestion) {
    const jw = this.data.jingwen;
    const question = customQuestion ||
      `读到这卷经"${jw.title}",想跟你聊几句。可以先说说它在现代生活里怎么理解吗?`;
    // 严守:转交 chat 云函数前过危机词 + 严守词
    if (detectCrisis(question)) {
      wx.showModal({
        title: '全国心理援助热线',
        content: '悦济不是心理援助工具。\n如需专业支持,请拨打 12356 全国心理援助热线。',
        showCancel: false,
        confirmText: '我知道了',
      });
      return;
    }
    wx.navigateTo({
      url: `/pages/8_4经数字人/chat/chat?key=${this.data.aiCharacterKey}&context=${encodeURIComponent(jw.content)}&question=${encodeURIComponent(question)}`,
    });
  },

  // === 分享(微信原生) ===
  onShareAppMessage() {
    const jw = this.data.jingwen;
    return {
      title: `${jw.title} | 我在悦济读${jw.source}`,
      path: `/pages/1.1_经文详情/1.1_经文详情?id=${jw.id}`,
      imageUrl: '',  // 可后续接国画
    };
  },

  onTapShare() {
    // 触发 onShareAppMessage
    wx.showShareMenu({ withShareTicket: true });
    wx.showToast({ title: '点击右上角分享', icon: 'none' });
  },

  // === 朋友圈 ===
  onShareTimeline() {
    const jw = this.data.jingwen;
    return {
      title: `${jw.title} | 悦济 · ${jw.source}`,
      query: `id=${jw.id}`,
    };
  },
});
