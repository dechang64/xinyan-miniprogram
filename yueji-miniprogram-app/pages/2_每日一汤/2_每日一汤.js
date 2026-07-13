// 2_每日一汤.js — 悦济 v2.0.1 每日一汤 + 9 食材图 (从 CDN; 微信 require() 不支持 .json, 改 .js)
const FOOD_CDN = require('../../assets/cdn_urls.js').food;

Page({
  data: {
    tizhiList: [
      { key: 'pinghe', name: '平和' }, { key: 'qixu', name: '气虚' },
      { key: 'yangxu', name: '阳虚' }, { key: 'yinxu', name: '阴虚' },
      { key: 'tanshi', name: '痰湿' }, { key: 'shire', name: '湿热' },
      { key: 'xueyu', name: '血瘀' }, { key: 'qiyu', name: '气郁' },
      { key: 'tebing', name: '特禀' },
    ],
    selectedTizhi: 'pinghe',
    today: null,
    idx: 0,
    list: [],
    tizhiName: '平和',
    foodImg: '',
  },

  onLoad() {
    this.filterSoups();
    this.setToday();
  },

  onShow() {
    this.setToday();
  },

  // 关键词 → 9 食材 映射 (雪梨/百合/莲藕/红枣/生姜/桂花/枸杞/陈皮/山药)
  matchFoodImg(soupName, soupDesc) {
    const text = soupName + (soupDesc || '');
    const foodKeys = Object.keys(FOOD_CDN);
    for (const k of foodKeys) {
      if (text.includes(k)) return FOOD_CDN[k];
    }
    // 食材名映射
    const map = {
      '雪梨': 'xueli', '梨': 'xueli',
      '百合': 'baihe',
      '莲藕': 'lianou', '藕': 'lianou',
      '红枣': 'hongzao', '枣': 'hongzao',
      '生姜': 'shengjiang', '姜': 'shengjiang',
      '桂花': 'guihua',
      '枸杞': 'gouqi',
      '陈皮': 'chenpi',
      '山药': 'shanyao',
    };
    for (const [name, key] of Object.entries(map)) {
      if (text.includes(name)) return FOOD_CDN[key];
    }
    return '';
  },

  filterSoups() {
    const SOUPS_30 = require('../../utils/data_soups.js');
    const list = SOUPS_30.filter(s => s.tizhi === this.data.selectedTizhi);
    this.setData({ list, idx: 0 });
  },

  setToday() {
    const SOUPS_30 = require('../../utils/data_soups.js');
    const { dayOfYear } = require('../../utils/compliance.js');
    const list = SOUPS_30.filter(s => s.tizhi === this.data.selectedTizhi);
    if (list.length === 0) return;
    const idx = dayOfYear() % list.length;
    const today = list[idx];
    const tizhiName = this.data.tizhiList.find(t => t.key === this.data.selectedTizhi)?.name || '—';
    const foodImg = this.matchFoodImg(today.name, today.desc);
    this.setData({ list, today, idx, tizhiName, foodImg });
  },

  onSelectTizhi(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ selectedTizhi: key });
    this.filterSoups();
    this.setToday();
  },

  onTapNext() {
    const next = (this.data.idx + 1) % this.data.list.length;
    const today = this.data.list[next];
    const foodImg = this.matchFoodImg(today.name, today.desc);
    this.setData({ idx: next, today, foodImg });
  },

  onTapPrev() {
    const prev = (this.data.idx - 1 + this.data.list.length) % this.data.list.length;
    const today = this.data.list[prev];
    const foodImg = this.matchFoodImg(today.name, today.desc);
    this.setData({ idx: prev, today, foodImg });
  },
});
