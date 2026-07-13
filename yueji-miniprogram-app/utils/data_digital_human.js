// 悦济 v1.1 — 4 经数字人 4 张国画头像占位 (从心颜 6 张山水里选 4 张, 后续云存储)
// 严守: 纯国画 + 文字, 0 出现禁用词
// 注: v1.1 暂时用纯色 + emoji 占位, 后续 PIL/AMAX 生成真实国画上云存储
const DIGITAL_HUMAN_AVATARS = {
  laozi: {
    key: 'laozi',
    name: '老子',
    book: '《道德经》',
    era: '春秋',
    color: '#7a8a9a', // 远山含黛 (青灰)
    bgGradient: 'linear-gradient(180deg, #a8b4be 0%, #5a6878 100%)',
    emoji: '☯️',
    intro: '水善利万物而不争。',
    fullIntro: '你将跟老子, 一起读《道德经》81 章。',
    question: '你最近心里有什么牵绊?',
  },
  zhouwenwang: {
    key: 'zhouwenwang',
    name: '周文王',
    book: '《易经》',
    era: '西周',
    color: '#5a4a3a', // 阴阳交泰 (深褐)
    bgGradient: 'linear-gradient(180deg, #8a7a6a 0%, #3a2a1a 100%)',
    emoji: '⛰️',
    intro: '需, 有孚, 光亨。',
    fullIntro: '你将跟周文王, 一起读《周易》64 卦。',
    question: '你在等什么?',
  },
  qibo: {
    key: 'qibo',
    name: '岐伯',
    book: '《黄帝内经》',
    era: '上古',
    color: '#6a8a6a', // 云山养气 (青绿)
    bgGradient: 'linear-gradient(180deg, #a8c8a8 0%, #4a6a4a 100%)',
    emoji: '🌿',
    intro: '法于阴阳, 和于术数。',
    fullIntro: '你将跟岐伯, 一起读《黄帝内经》养生的智慧。',
    question: '你最近的起居怎样?',
  },
  yuanshen: {
    key: 'yuanshen',
    name: '元神',
    book: '《清静经》',
    era: '本心',
    color: '#9a8a8a', // 空山寂寂 (灰白)
    bgGradient: 'linear-gradient(180deg, #d8d0c8 0%, #6a5a5a 100%)',
    emoji: '🪷',
    intro: '夫人神好清, 而心扰之。',
    fullIntro: '你将跟元神, 一起回到《清静经》所说的人的本心。',
    question: '你现在安静吗?',
  },
};

const DIGITAL_HUMAN_LIST = Object.values(DIGITAL_HUMAN_AVATARS);

module.exports = { DIGITAL_HUMAN_AVATARS, DIGITAL_HUMAN_LIST };
