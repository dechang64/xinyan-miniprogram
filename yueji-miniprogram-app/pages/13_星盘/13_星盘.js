// 13_星盘.js — 悦济 v2.3.0 12 星座 (公历生日 → 星座 → 推经 + 推汤)
// 严守: 命理类不严守, 不卖不收费
const JINGWEN = require('../../utils/data_jingwen.js');
const SOUPS = require('../../utils/data_soups.js');

const ZODIACS = [
  { name: '摩羯座', start: '12-22', end: '01-19', element: '土', trait: '务实坚韧', reading: '摩羯的沉稳如山, 适合读周易的"潜龙勿用"。', book: '周易' },
  { name: '水瓶座', start: '01-20', end: '02-18', element: '风', trait: '独立创新', reading: '水瓶的天马行空, 适合读道德经的"道法自然"。', book: '道德经' },
  { name: '双鱼座', start: '02-19', end: '03-20', element: '水', trait: '浪漫直觉', reading: '双鱼的柔与深, 适合读清静经的"清静无为"。', book: '清静经' },
  { name: '白羊座', start: '03-21', end: '04-19', element: '火', trait: '热情勇敢', reading: '白羊的烈, 适合读黄帝内经养心安神。', book: '黄帝内经' },
  { name: '金牛座', start: '04-20', end: '05-20', element: '土', trait: '稳重执着', reading: '金牛的踏实, 适合读周易的"厚德载物"。', book: '周易' },
  { name: '双子座', start: '05-21', end: '06-21', element: '风', trait: '机敏多变', reading: '双子的灵, 适合读道德经的"上善若水"。', book: '道德经' },
  { name: '巨蟹座', start: '06-22', end: '07-22', element: '水', trait: '温暖细腻', reading: '巨蟹的柔, 适合读清静经的"心无挂碍"。', book: '清静经' },
  { name: '狮子座', start: '07-23', end: '08-22', element: '火', trait: '自信温暖', reading: '狮子的光, 适合读黄帝内经养气。', book: '黄帝内经' },
  { name: '处女座', start: '08-23', end: '09-22', element: '土', trait: '细致完美', reading: '处女的精, 适合读周易的"各正性命"。', book: '周易' },
  { name: '天秤座', start: '09-23', end: '10-23', element: '风', trait: '优雅和谐', reading: '天秤的衡, 适合读道德经的"万物负阴而抱阳"。', book: '道德经' },
  { name: '天蝎座', start: '10-24', end: '11-22', element: '水', trait: '深刻专注', reading: '天蝎的深, 适合读清静经的"常应常静"。', book: '清静经' },
  { name: '射手座', start: '11-23', end: '12-21', element: '火', trait: '自由乐观', reading: '射手的远, 适合读黄帝内经的"形与神俱"。', book: '黄帝内经' },
];

const ELEMENT_TIZHI = { '火': '阳虚', '土': '气虚', '风': '气郁', '水': '阴虚' };

function getZodiac(dateStr) {
  const [, m, d] = dateStr.split('-').map(Number);
  const md = `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  for (const z of ZODIACS) {
    if (z.start <= z.end) {
      if (md >= z.start && md <= z.end) return z;
    } else {
      // 跨年 (摩羯)
      if (md >= z.start || md <= z.end) return z;
    }
  }
  return ZODIACS[0];
}

Page({
  data: {
    birthDate: '',
    result: null,
  },

  onPickDate(e) { this.setData({ birthDate: e.detail.value }); },

  onSubmit() {
    if (!this.data.birthDate) {
      wx.showToast({ title: '请选日期', icon: 'none' });
      return;
    }
    const z = getZodiac(this.data.birthDate);

    const jingwen = JINGWEN.filter((j) => j.source.includes(z.book)).slice(0, 3).map((j) => ({
      id: j.id, source: j.source, title: j.title.slice(0, 20),
    }));

    const tizhi = ELEMENT_TIZHI[z.element] || '平和';
    const soups = SOUPS.filter((s) => s.tizhi && s.tizhi.includes(tizhi)).slice(0, 3).map((s) => ({
      id: s.id, name: s.name, desc: (s.desc || '').slice(0, 30),
    }));

    this.setData({
      result: {
        zodiac: {
          ...z,
          dateRange: z.start + ' ~ ' + z.end,
        },
        jingwen, soups,
      },
    });
  },
});
