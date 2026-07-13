// 10_MBTI快测.js — 悦济 v2.2.0 MBTI 8 维度快测
// 4 对: E/I, S/N, T/F, J/P, 每对 1 滑块 0-100 (0=完全偏左, 100=完全偏右)
// 16 型 → 推荐 4 经 (调性匹配) + 4 数字人 (按调性)
// 严守: 主观自评 ✅, 不做客观识别

const JINGWEN = require('../../utils/data_jingwen.js');

const QUESTIONS = [
  { key: 'EI', text: '您更倾向', leftLabel: 'E 外向 (从外界获得能量)', rightLabel: 'I 内向 (从内心获得能量)' },
  { key: 'SN', text: '您更关注', leftLabel: 'S 实感 (具体事实)', rightLabel: 'N 直觉 (抽象模式)' },
  { key: 'TF', text: '您做决定时', leftLabel: 'T 思考 (逻辑客观)', rightLabel: 'F 情感 (价值人际)' },
  { key: 'JP', text: '您更喜欢', leftLabel: 'J 判断 (有序规划)', rightLabel: 'P 感知 (灵活即兴)' },
];

// 16 型 → 调性 + 推经 + 推数字人
const MBTI_MAP = {
  // E N T J (指挥官)
  ENTJ: { desc: '果断高效, 擅长系统思考。', book: '周易', human: 'zhouwenwang', humanName: '周文王' },
  ENTP: { desc: '思维敏捷, 喜欢探索可能。', book: '道德经', human: 'laozi', humanName: '老子' },
  // I N F J (提倡者)
  INFJ: { desc: '理想主义, 关注深层意义。', book: '清静经', human: 'yuanshen', humanName: '元神' },
  INFP: { desc: '温和内省, 追求真我。', book: '清静经', human: 'yuanshen', humanName: '元神' },
  // E S T P (企业家)
  ESTP: { desc: '务实直接, 享受当下。', book: '黄帝内经', human: 'qibo', humanName: '岐伯' },
  ESFP: { desc: '热情随和, 热爱生活。', book: '黄帝内经', human: 'qibo', humanName: '岐伯' },
  // I S T J (物流师)
  ISTJ: { desc: '踏实可靠, 重视秩序。', book: '周易', human: 'zhouwenwang', humanName: '周文王' },
  ISFJ: { desc: '温暖细致, 守护他人。', book: '黄帝内经', human: 'qibo', humanName: '岐伯' },
  // E N F J
  ENFJ: { desc: '富有感染力, 关注他人成长。', book: '道德经', human: 'laozi', humanName: '老子' },
  // E S F J
  ESFJ: { desc: '体贴周到, 重视和谐。', book: '黄帝内经', human: 'qibo', humanName: '岐伯' },
  // I N T P
  INTP: { desc: '理性好奇, 探索本质。', book: '道德经', human: 'laozi', humanName: '老子' },
  // I S T P
  ISTP: { desc: '冷静理性, 喜欢动手。', book: '周易', human: 'zhouwenwang', humanName: '周文王' },
  // I S F P
  ISFP: { desc: '敏感温柔, 活在当下。', book: '清静经', human: 'yuanshen', humanName: '元神' },
  // E N T P
  ENFP: { desc: '热情洋溢, 充满创意。', book: '道德经', human: 'laozi', humanName: '老子' },
  // I N T J
  INTJ: { desc: '独立深刻, 追求完美。', book: '周易', human: 'zhouwenwang', humanName: '周文王' },
  // E S T P (重复, 已列)
  ESTJ: { desc: '务实果断, 重视规则。', book: '周易', human: 'zhouwenwang', humanName: '周文王' },
};

Page({
  data: {
    questions: QUESTIONS,
    answers: { EI: 50, SN: 50, TF: 50, JP: 50 },
    result: null,
  },

  onSlide(e) {
    const key = e.currentTarget.dataset.key;
    const val = e.detail.value;
    this.setData({ [`answers.${key}`]: val });
  },

  onSubmit() {
    const a = this.data.answers;
    // 50 为中线
    const e_or_i = a.EI >= 50 ? 'E' : 'I';
    const s_or_n = a.SN >= 50 ? 'S' : 'N';
    const t_or_f = a.TF >= 50 ? 'T' : 'F';
    const j_or_p = a.JP >= 50 ? 'J' : 'P';
    const type = e_or_i + s_or_n + t_or_f + j_or_p;

    const map = MBTI_MAP[type] || { desc: '调性中和, 4 经都适合。', book: '黄帝内经', human: 'qibo', humanName: '岐伯' };

    // 推 3 篇经文 (按 book)
    const jingwen = JINGWEN.filter((j) => j.source.includes(map.book)).slice(0, 3).map((j) => ({
      id: j.id, source: j.source, title: j.title.slice(0, 20),
    }));

    this.setData({
      result: { type, ...map, jingwen },
    });
  },

  onTapDigital(e) {
    const key = e.currentTarget.dataset.key || 'laozi';
    wx.navigateTo({ url: `/pages/8_4经数字人/chat/chat?key=${key}` });
  },
});
