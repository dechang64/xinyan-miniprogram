// 6_人格画像.js — 悦济人格画像 (v1.0 完整版)
// 6 tab: MBTI / 八字 / 星盘 / PHQ-9 / GAD-7 / TIZHI
// 严守: 量表不诊断, 仅作主观自评参考
const { MBTI_8_QUESTIONS, scoreMBTI } = require('../../utils/data_mbti.js');
const { getBazi, getZodiac, scorePHQ9, scoreGAD7, TIZHI_9_QUESTIONS, scoreTizhi, TIZHI_NAMES,
        PHQ9_QUESTIONS, PHQ9_OPTIONS, GAD7_QUESTIONS, GAD7_OPTIONS } = require('../../utils/data_assess.js');

const TABS = [
  { key: 'mbti', name: 'MBTI' },
  { key: 'bazi', name: '八字' },
  { key: 'zodiac', name: '星盘' },
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

  // 八字 / 星盘
  onBirthChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [field]: parseInt(e.detail.value) || 1990 });
  },
  onCalcBazi() {
    const { birthYear, birthMonth, birthDay } = this.data;
    const baziResult = getBazi(birthYear, birthMonth, birthDay);
    const zodiacResult = getZodiac(birthYear, birthMonth, birthDay);
    wx.setStorageSync('yueji_bazi_result', baziResult);
    wx.setStorageSync('yueji_zodiac_result', zodiacResult);
    this.setData({ baziResult, zodiacResult });
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
