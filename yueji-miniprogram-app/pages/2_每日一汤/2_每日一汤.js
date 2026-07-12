// 2_每日一汤.js — 悦济每日一盏汤 (v1.0 完整版)
// 9 体质 (王琦) × 30 汤品, dayOfYear seed
const { dayOfYear } = require('../../utils/compliance.js');
const SOUPS_30 = require('../../utils/data_soups.js');
const TANG_DICT = {
  pinghe: '平和', qixu: '气虚', yangxu: '阳虚', yinxu: '阴虚',
  tanshi: '痰湿', shire: '湿热', xueyu: '血瘀', qiyu: '气郁', tebing: '特禀'
};
Page({
  data: {
    tizhiList: Object.entries(TANG_DICT).map(([key, name]) => ({ key, name })),
    selectedTizhi: 'pinghe',
    today: null,
    idx: 0,
    list: [],
  },
  onLoad() {
    this.filterSoups();
    this.setToday();
  },
  onShow() {
    this.setToday();
  },
  filterSoups() {
    const list = SOUPS_30.filter(s => s.tizhi === this.data.selectedTizhi);
    this.setData({ list, idx: 0 });
  },
  setToday() {
    const list = SOUPS_30.filter(s => s.tizhi === this.data.selectedTizhi);
    const idx = dayOfYear() % list.length;
    this.setData({ list, today: list[idx], idx });
  },
  onSelectTizhi(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ selectedTizhi: key });
    this.filterSoups();
    this.setToday();
  },
  onTapNext() {
    const next = (this.data.idx + 1) % this.data.list.length;
    this.setData({ idx: next, today: this.data.list[next] });
  },
  onTapPrev() {
    const prev = (this.data.idx - 1 + this.data.list.length) % this.data.list.length;
    this.setData({ idx: prev, today: this.data.list[prev] });
  },
});
