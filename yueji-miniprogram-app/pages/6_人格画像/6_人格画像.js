// 6_人格画像.js — 悦济人格画像 (v3.1 严守修订)
// 7 tab: MBTI / 5 元素 / 月令 / PHQ-9 / GAD-7 / TIZHI / 4 经数字人
// 严守: 量表不诊断, 仅作主观自评参考; 八字/星盘 tab 已改 5 元素/月令 (不算命不算星)
const { MBTI_8_QUESTIONS, scoreMBTI } = require('../../utils/data_mbti.js');
const { scorePHQ9, scoreGAD7, TIZHI_9_QUESTIONS, scoreTizhi, TIZHI_NAMES,
        PHQ9_QUESTIONS, PHQ9_OPTIONS, GAD7_QUESTIONS, GAD7_OPTIONS } = require('../../utils/data_assess.js');

// 5 元素 + 月令 (跟 12_八字 / 13_星盘 一致, 中医 5 脏 5 月对应, 不算命不算星)
const MONTH_WUXING = {
  1: '水', 2: '水', 3: '木', 4: '木', 5: '木',
  6: '火', 7: '火', 8: '火', 9: '土', 10: '金', 11: '金', 12: '金',
};
const MONTH_YUELING = {
  1: '冬主藏, 养肾藏精, 早睡晚起',
  2: '春初养肾仍重要',
  3: '春主生, 养肝疏泄, 早起散步',
  4: '春旺养肝, 多食绿叶',
  5: '春末转夏, 养肝兼清心火',
  6: '夏主长, 养心安神, 避免大汗',
  7: '夏旺养心',
  8: '夏末转秋, 养心兼润肺',
  9: '长夏主化, 养脾胃, 少食生冷',
  10: '秋主收, 养肺润燥',
  11: '秋旺养肺, 多食白色食物',
  12: '冬初养肺仍重要, 转养肾',
};

const TABS = [
  { key: 'mbti', name: 'MBTI' },
  { key: 'bazi', name: '5 元素' },
  { key: 'zodiac', name: '月令' },
  { key: 'phq9', name: '心情' },
  { key: 'gad7', name: '焦虑' },
  { key: 'tizhi', name: '9 体质' },
  { key: 'digital_human', name: '4 经数字人' },
];

Page({
  data: {
    tabs: TABS,
    activeTab: 'mbti',
    // MBTI
    mbtiQuestions: MBTI_8_QUESTIONS,
    mbtiAnswers: new Array(8).fill(null),
    mbtiResult: null,
    // 八字 / 星盘
    birthYear: 1990,
    birthMonth: 6,
    birthDay: 15,
    baziResult: null,
    zodiacResult: null,
    // PHQ-9
    phq9Questions: PHQ9_QUESTIONS,
    phq9Options: PHQ9_OPTIONS,
    phq9Answers: new Array(9).fill(0),
    phq9Result: null,
    // GAD-7
    gad7Questions: GAD7_QUESTIONS,
    gad7Options: GAD7_OPTIONS,
    gad7Answers: new Array(7).fill(0),
    gad7Result: null,
    // TIZHI
    tizhiQuestions: TIZHI_9_QUESTIONS,
    tizhiAnswers: new Array(9).fill(null),
    tizhiResult: null,
  },

  onLoad() {
    this.loadFromStorage();
  },

  loadFromStorage() {
    const mbtiResult = wx.getStorageSync('yueji_mbti_result') || null;
    const baziResult = wx.getStorageSync('yueji_bazi_result') || null;
    const zodiacResult = wx.getStorageSync('yueji_zodiac_result') || null;
    const phq9Result = wx.getStorageSync('yueji_phq9_result') || null;
    const gad7Result = wx.getStorageSync('yueji_gad7_result') || null;
    const tizhiResult = wx.getStorageSync('yueji_tizhi_result') || null;
    this.setData({ mbtiResult, baziResult, zodiacResult, phq9Result, gad7Result, tizhiResult });
  },

  onSwitchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.key });
  },

  // MBTI
  onMBTISelect(e) {
    const { qi, idx } = e.currentTarget.dataset;
    const answers = [...this.data.mbtiAnswers];
    answers[idx] = qi;
    this.setData({ mbtiAnswers: answers });
  },
  onMBTISubmit() {
    if (this.data.mbtiAnswers.some(a => !a)) {
      wx.showToast({ title: '请答完所有题', icon: 'none' });
      return;
    }
    const result = scoreMBTI(this.data.mbtiAnswers);
    wx.setStorageSync('yueji_mbti_result', result);
    this.setData({ mbtiResult: result });
  },

  // 5 元素 / 月令 (v3.1 严守修订, 原八字/星盘)
  onBirthChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [field]: parseInt(e.detail.value) || 1990 });
  },
  onCalcBazi() {
    const { birthMonth } = this.data;
    const m = Math.max(1, Math.min(12, parseInt(birthMonth) || 1));
    const wuxingResult = { wuxing: MONTH_WUXING[m], yueling: MONTH_YUELING[m], month: m };
    const zodiacResult = { wuxing: MONTH_WUXING[m], yueling: MONTH_YUELING[m], month: m };
    wx.setStorageSync('yueji_bazi_result', wuxingResult);
    wx.setStorageSync('yueji_zodiac_result', zodiacResult);
    this.setData({ baziResult: wuxingResult, zodiacResult });
  },

  // PHQ-9
  onPHQ9Select(e) {
    const { idx, value } = e.currentTarget.dataset;
    const answers = [...this.data.phq9Answers];
    answers[idx] = parseInt(value);
    this.setData({ phq9Answers: answers });
  },
  onPHQ9Submit() {
    const result = scorePHQ9(this.data.phq9Answers);
    wx.setStorageSync('yueji_phq9_result', result);
    this.setData({ phq9Result: result });
  },

  // GAD-7
  onGAD7Select(e) {
    const { idx, value } = e.currentTarget.dataset;
    const answers = [...this.data.gad7Answers];
    answers[idx] = parseInt(value);
    this.setData({ gad7Answers: answers });
  },
  onGAD7Submit() {
    const result = scoreGAD7(this.data.gad7Answers);
    wx.setStorageSync('yueji_gad7_result', result);
    this.setData({ gad7Result: result });
  },

  // TIZHI
  onTizhiSelect(e) {
    const { qi, idx, value } = e.currentTarget.dataset;
    const answers = [...this.data.tizhiAnswers];
    answers[idx] = value;
    this.setData({ tizhiAnswers: answers });
  },
  onTizhiSubmit() {
    if (this.data.tizhiAnswers.some(a => !a)) {
      wx.showToast({ title: '请答完所有题', icon: 'none' });
      return;
    }
    const result = scoreTizhi(this.data.tizhiAnswers);
    wx.setStorageSync('yueji_tizhi_result', result);
    this.setData({ tizhiResult: result });
  },

  onGotoDigitalHuman() {
    wx.navigateTo({ url: '/pages/8_4经数字人/8_4经数字人' });
  },
});
