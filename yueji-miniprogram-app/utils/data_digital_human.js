// 悦济 v1.1.6 — 4 经数字人 4 张国画头像占位 (从心颜 6 张山水里选 4 张, 后续云存储)
// 严守: 纯国画 + 文字, 0 出现禁用词
// 注: v1.1.6 加 4×5=20 静态回应 (3 层对话: 原文+简释+回应), 不调 AMAX 也能跑通
const DIGITAL_HUMAN_AVATARS = {
  laozi: {
    key: 'laozi',
    name: '老子',
    book: '《道德经》',
    era: '春秋',
    color: '#7a8a9a',
    bgGradient: 'linear-gradient(180deg, #a8b4be 0%, #5a6878 100%)',
    emoji: '☯️',
    intro: '水善利万物而不争。',
    fullIntro: '你将跟老子, 一起读《道德经》81 章。',
    question: '你最近心里有什么牵绊?',
    // 4 经数字人静态回应 (v1.1.6 新增, 不调 AMAX 也能跑通)
    responses: {
      心烦: '上善若水。水善利万物而不争。\n水滋养万物, 静静陪伴, 不催促你做决定。心烦时, 你不需要解决, 只需要被陪伴。',
      焦虑: '致虚极, 守静笃。\n把心放空, 守住安静, 这是回到自己的法门。焦虑是心在乱跑, 静下来, 它就停了。',
      失眠: '万物芸芸, 各复归其根。归根曰静, 静曰复命。\n睡不好, 是心还醒着。睡前把心放下, 回到本心, 就能入睡。',
      难过: '天地不仁, 以万物为刍狗。\n天地不偏爱, 万物平等。难过是心的感受, 让它流过, 不评判, 你还是你。',
      迷茫: '道冲, 而用之或不盈。\n道是空的, 但用起来无穷尽。迷茫时, 不必找答案, 先让自己静下来, 道会自己显现。',
    },
  },
  zhouwenwang: {
    key: 'zhouwenwang',
    name: '周文王',
    book: '《易经》',
    era: '西周',
    color: '#5a4a3a',
    bgGradient: 'linear-gradient(180deg, #8a7a6a 0%, #3a2a1a 100%)',
    emoji: '⛰️',
    intro: '需, 有孚, 光亨。',
    fullIntro: '你将跟周文王, 一起读《周易》64 卦。',
    question: '你在等什么?',
    responses: {
      紧张: '需, 有孚, 光亨, 贞吉。\n需卦讲等待, 不是消极, 是涵养。紧张时, 准备充分, 这就是需。',
      选择: '乾之初九, 潜龙勿用。\n龙在深渊, 不动, 等待时机。选择困难时, 不必急, 时机到了, 自然明白。',
      失败: '天行健, 君子以自强不息。\n天道运行不息, 君子也当如此。失败是过程, 不是终点, 继续走, 自强不息。',
      孤独: '同人于野, 亨。\n与人和同, 走出家门, 志同道合。孤独时, 不是无人, 是还没找到同路人。',
      死亡: '未知生, 焉知死。\n先活好当下, 死是自然的事。死亡是归, 不是结束, 不用怕, 也不用急。',
    },
  },
  qibo: {
    key: 'qibo',
    name: '岐伯',
    book: '《黄帝内经》',
    era: '上古',
    color: '#6a8a6a',
    bgGradient: 'linear-gradient(180deg, #a8c8a8 0%, #4a6a4a 100%)',
    emoji: '🌿',
    intro: '法于阴阳, 和于术数。',
    fullIntro: '你将跟岐伯, 一起读《黄帝内经》养生的智慧。',
    question: '你最近的起居怎样?',
    responses: {
      睡不好: '上古之人, 起居有常。\n懂得养生的人, 起居有常, 不妄劳作。睡不好, 试试早起晒太阳, 晚上不看手机, 这是最简单的, 也是最难的。',
      累: '形劳而不倦, 气从以顺。\n身体劳作但不疲倦, 是气顺。累是气不顺, 休息不解决问题, 调息才有用。',
      吃: '五谷为养, 五果为助。\n五谷是主, 水果是辅。现代人吃反了, 把水果当饭, 把五谷当配, 这是失衡。',
      生气: '怒则气上, 喜则气缓。\n怒让气上冲, 喜让气变缓。生气伤肝, 不压抑也不放纵, 让气回到中正。',
      怕冷: '阳气者, 若天与日。\n阳气像天上的太阳, 失其所则折寿而不彰。怕冷是阳虚, 晒太阳, 早睡, 慢慢养, 不急。',
    },
  },
  yuanshen: {
    key: 'yuanshen',
    name: '元神',
    book: '《清静经》',
    era: '本心',
    color: '#9a8a8a',
    bgGradient: 'linear-gradient(180deg, #d8d0c8 0%, #6a5a5a 100%)',
    emoji: '🪷',
    intro: '夫人神好清, 而心扰之。',
    fullIntro: '你将跟元神, 一起回到《清静经》所说的人的本心。',
    question: '你现在安静吗?',
    responses: {
      心乱: '夫人神好清, 而心扰之。\n心乱不是病, 是忘了本性。你已觉察到心乱, 这就是回到本心的开始。',
      静不下来: '人能常清静, 天地悉皆归。\n常清静, 天地都归附。静不下来, 不用硬静, 不评判, 看着心跑, 它自己会停。',
      空虚: '内观其心, 心无其心。\n向内看, 心本空。空虚是心在找东西, 其实它本来就满, 不必外求。',
      累: '外观其形, 形无其形。\n向外看, 形本无。累是把自己绑在形上, 松开, 形累心不累。',
      无聊: '远观其物, 物无其物。\n看远一点, 物本无。无聊是心没着落, 不找事做, 让心回到当下, 当下不无聊。',
    },
  },
};

// 默认回应 (找不到对应关键词时)
const DEFAULT_RESPONSES = {
  laozi: '道可道, 非常道。\n可以说出来的道, 已经不是恒常的道。你问的, 我用道德经的方式答你。',
  zhouwenwang: '易, 不易, 简易, 变易。\n变是常态, 不变是规律, 简单是智慧。你问的, 我用周易的方式答你。',
  qibo: '上工治未病, 不治已病。\n高明的医者, 在病未发时就调养。你问的, 我用黄帝内经的方式答你。',
  yuanshen: '清静, 然后见本性。\n心清静, 才能见本性。你问的, 我用清静经的方式答你。',
};

const DIGITAL_HUMAN_LIST = Object.values(DIGITAL_HUMAN_AVATARS);

function getDigitalHumanResponse(role, userInput) {
  const avatar = DIGITAL_HUMAN_AVATARS[role];
  if (!avatar) return '悦济陪你。';
  if (!userInput) return avatar.fullIntro;
  // 优先匹配关键词
  for (const kw of Object.keys(avatar.responses || {})) {
    if (userInput.includes(kw)) return avatar.responses[kw];
  }
  return DEFAULT_RESPONSES[role] || avatar.intro;
}

module.exports = { DIGITAL_HUMAN_AVATARS, DIGITAL_HUMAN_LIST, getDigitalHumanResponse };

