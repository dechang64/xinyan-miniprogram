// 12_八字.js — 悦济 v2.3.0 八字解读 (v0.7 Streamlit 移植)
// 4 柱 (年月日时) → 8 字 (天干地支) → 日主五行 → 推经 + 推汤
// 严守: 命理类不严守, 不卖不收费, 仅作传统文化参考
const JINGWEN = require('../../utils/data_jingwen.js');
const SOUPS = require('../../utils/data_soups.js');

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const WUXING_OF_GAN = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };

// 推月柱 (简化: 每月固定地支, 天干按年干推)
function getMonthGanZhi(yearGan, month) {
  const monthZhi = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  // 甲己之年丙作首: 甲己 → 1月丙寅, 乙庚 → 戊寅, 丙辛 → 庚寅, 丁壬 → 壬寅, 戊癸 → 甲寅
  const yearGanIdx = TIANGAN.indexOf(yearGan);
  const startGanIdx = [2, 4, 6, 8, 0][yearGanIdx % 5];  // 丙戊庚壬甲
  const ganIdx = (startGanIdx + month - 1) % 10;
  return { gan: TIANGAN[ganIdx], zhi: monthZhi[month - 1] };
}

// 推日柱 (简化: 用日期到基准日的差 mod 60, 不准, 仅 v0.7 demo)
function getDayGanZhi(date) {
  // 2000-01-01 甲子, 简化计算
  const base = new Date('2000-01-01');
  const days = Math.floor((date - base) / (1000 * 60 * 60 * 24));
  const idx = (days % 60 + 60) % 60;
  return { gan: TIANGAN[idx % 10], zhi: DIZHI[idx % 12] };
}

// 推时柱
function getHourGanZhi(dayGan, hour) {
  const hourZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const zhi = hourZhi[Math.floor(hour / 2) % 12];
  // 五鼠遁: 甲己日子时起甲子
  const dayGanIdx = TIANGAN.indexOf(dayGan);
  const startGanIdx = [0, 2, 4, 6, 8][dayGanIdx % 5];
  const hourIdx = Math.floor(hour / 2) % 12;
  const ganIdx = (startGanIdx + hourIdx) % 10;
  return { gan: TIANGAN[ganIdx], zhi };
}

// 推年柱 (用立春, 简化用公历年)
function getYearGanZhi(year) {
  // 1984 甲子
  const idx = (year - 1984) % 60;
  return { gan: TIANGAN[(idx % 10 + 10) % 10], zhi: DIZHI[(idx % 12 + 12) % 12] };
}

const WUXING_DESC = {
  '木': '木主仁, 性直情和, 适合滋养肝胆, 推荐黄帝内经。',
  '火': '火主礼, 性急热情, 适合滋养心血管, 推荐黄帝内经。',
  '土': '土主信, 性稳厚重, 适合滋养脾胃, 推荐清静经。',
  '金': '金主义, 性刚果断, 适合滋养肺大肠, 推荐道德经。',
  '水': '水主智, 性灵善变, 适合滋养肾膀胱, 推荐周易。',
};

const WUXING_JING = {
  '木': '黄帝内经', '火': '黄帝内经', '土': '清静经', '金': '道德经', '水': '周易',
};

Page({
  data: {
    birthDate: '',
    birthTime: '12:00',
    result: null,
  },

  onPickDate(e) { this.setData({ birthDate: e.detail.value }); },
  onPickTime(e) { this.setData({ birthTime: e.detail.value }); },

  onSubmit() {
    if (!this.data.birthDate) {
      wx.showToast({ title: '请选日期', icon: 'none' });
      return;
    }
    const date = new Date(this.data.birthDate + 'T' + this.data.birthTime);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const hour = date.getHours();

    const yearP = getYearGanZhi(year);
    const monthP = getMonthGanZhi(yearP.gan, month);
    const dayP = getDayGanZhi(date);
    const hourP = getHourGanZhi(dayP.gan, hour);

    const wuxing = WUXING_OF_GAN[dayP.gan] || '木';
    const book = WUXING_JING[wuxing] || '黄帝内经';

    // 推 3 经
    const jingwen = JINGWEN.filter((j) => j.source.includes(book)).slice(0, 3).map((j) => ({
      id: j.id, source: j.source, title: j.title.slice(0, 20),
    }));

    // 推 3 汤 (按五行对应 5 款)
    const wuxingToTizhi = { '木': '阳虚', '火': '阴虚', '土': '气虚', '金': '痰湿', '水': '平和' };
    const tizhi = wuxingToTizhi[wuxing] || '平和';
    const tizhiSoups = SOUPS.filter((s) => s.tizhi && s.tizhi.includes(tizhi)).slice(0, 3).map((s) => ({
      id: s.id, name: s.name, desc: (s.desc || '').slice(0, 30),
    }));

    this.setData({
      result: {
        year: yearP, month: monthP, day: dayP, hour: hourP,
        wuxing, wuxingDesc: WUXING_DESC[wuxing] || '',
        jingwen, soups: tizhiSoups,
      },
    });
  },
});
