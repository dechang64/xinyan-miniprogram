// 悦济 v1.0 — 八字 (60 甲子查表) + 星盘 + 3 量表 + 9 体质
// 严守: 主观自评 ✅, 命理/星盘仅作文化参考, 量表不诊断
// 从心颜 data/{bazi,zodiac,scales,tizhi}.py 迁移

// ─── 八字 (60 甲子查表) ───
const HEAVENLY_STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const EARTHLY_BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
// 60 甲子 (年柱 / 月柱 / 日柱 查表)
const SIXTY_JIAZI = [
  '甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉',
  '甲戌','乙亥','丙子','丁丑','戊寅','己卯','庚辰','辛巳','壬午','癸未',
  '甲申','乙酉','丙戌','丁亥','戊子','己丑','庚寅','辛卯','壬辰','癸巳',
  '甲午','乙未','丙申','丁酉','戊戌','己亥','庚子','辛丑','壬寅','癸卯',
  '甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥','壬子','癸丑',
  '甲寅','乙卯','丙辰','丁巳','戊午','己未','庚申','辛酉','壬戌','癸亥',
];

function getBazi(year, month, day) {
  // 简化算法: 用 dayOfYear 推算 (心颜 v0.7.1.4 重写后的纯 Python 60 甲子查表)
  const dayOfYear = Math.floor((new Date(year, month - 1, day) - new Date(year, 0, 0)) / 86400000);
  const yearIdx = (year - 4) % 60;
  const monthIdx = (yearIdx * 12 + month - 1) % 60; // 简化
  const dayIdx = dayOfYear % 60;
  const yearPillar = [SIXTY_JIAZI[yearIdx][0], SIXTY_JIAZI[yearIdx][1]];
  const monthPillar = [SIXTY_JIAZI[monthIdx][0], SIXTY_JIAZI[monthIdx][1]];
  const dayPillar = [SIXTY_JIAZI[dayIdx][0], SIXTY_JIAZI[dayIdx][1]];
  return { year_pillar: yearPillar, month_pillar: monthPillar, day_pillar: dayPillar };
}

// ─── 星盘 (3 星座: 太阳 / 月亮 / 上升) ───
function getZodiac(year, month, day) {
  const sunSign = getSunSign(month, day);
  // 月亮 / 上升 用 dayOfYear + birth 简化
  const dayOfYear = Math.floor((new Date(year, month - 1, day) - new Date(year, 0, 0)) / 86400000);
  const moonSigns = ['白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手','摩羯','水瓶','双鱼'];
  const risingSigns = ['白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手','摩羯','水瓶','双鱼'];
  return {
    sun_sign: sunSign,
    moon_sign: moonSigns[dayOfYear % 12] + '座',
    rising_sign: risingSigns[(dayOfYear + 3) % 12] + '座',
  };
}
function getSunSign(month, day) {
  const signs = [
    ['摩羯', 12, 22, 1, 19], ['水瓶', 1, 20, 2, 18], ['双鱼', 2, 19, 3, 20],
    ['白羊', 3, 21, 4, 19], ['金牛', 4, 20, 5, 20], ['双子', 5, 21, 6, 21],
    ['巨蟹', 6, 22, 7, 22], ['狮子', 7, 23, 8, 22], ['处女', 8, 23, 9, 22],
    ['天秤', 9, 23, 10, 23], ['天蝎', 10, 24, 11, 22], ['射手', 11, 23, 12, 21],
  ];
  for (const [name, m1, d1, m2, d2] of signs) {
    if ((month === m1 && day >= d1) || (month === m2 && day <= d2)) {
      return name + '座';
    }
  }
  return '摩羯座';
}

// ─── PHQ-9 心情量表 ───
function scorePHQ9(answers) {
  // answers: 数组 9 项, 每项 0-3
  const total = (answers || []).reduce((s, v) => s + (v || 0), 0);
  let level = '无或极少';
  let advice = '状态很好, 继续滋养自己。';
  if (total >= 5 && total <= 9) { level = '✦ 轻度'; advice = '留意情绪, 试着深呼吸和散步。'; }
  else if (total >= 10 && total <= 14) { level = '✦✦ 中度'; advice = '建议寻求专业支持。悦济不是医疗, 但陪伴你。'; }
  else if (total >= 15) { level = '✦✦✦ 重度'; advice = '强烈建议尽快联系专业人士, 12356 全国心理援助热线。'; }
  return { total, max: 27, level, advice };
}

// ─── GAD-7 焦虑量表 ───
function scoreGAD7(answers) {
  const total = (answers || []).reduce((s, v) => s + (v || 0), 0);
  let level = '无或极少';
  let advice = '状态很好, 继续共修。';
  if (total >= 5 && total <= 9) { level = '✦ 轻度焦虑'; advice = '试着深呼吸和正念冥想。'; }
  else if (total >= 10 && total <= 14) { level = '✦✦ 中度焦虑'; advice = '建议寻求专业支持。'; }
  else if (total >= 15) { level = '✦✦✦ 重度焦虑'; advice = '强烈建议尽快联系 12356 全国心理援助热线。'; }
  return { total, max: 21, level, advice };
}

// ─── 9 体质 (王琦) ───
const TIZHI_9_QUESTIONS = [
  { q: '你容易累吗?', options: [['精力充沛, 不易累', 'pinghe'], ['容易累, 说话声小', 'qixu'], ['怕冷, 手脚凉', 'yangxu'], ['手足心热, 口干', 'yinxu'], ['身体沉重, 痰多', 'tanshi'], ['面部油光, 易长痘', 'shire'], ['面色晦暗, 唇色紫', 'xueyu'], ['情绪低落, 胸闷', 'qiyu'], ['过敏体质, 易起疹', 'tebing']] },
  { q: '你怕冷还是怕热?', options: [['不冷不热', 'pinghe'], ['怕冷', 'yangxu'], ['怕热', 'yinxu'], ['怕热且湿', 'shire'], ['冷热都怕', 'qixu'], ['湿重', 'tanshi'], ['不确定', 'qixu'], ['不确定', 'qiyu'], ['不确定', 'tebing']] },
  { q: '你的大便如何?', options: [['正常', 'pinghe'], ['便溏', 'qixu'], ['便秘', 'yinxu'], ['粘滞不爽', 'tanshi'], ['臭秽', 'shire'], ['便秘色深', 'xueyu'], ['不确定', 'qiyu'], ['不确定', 'tebing'], ['不确定', 'yangxu']] },
  { q: '你的皮肤?', options: [['润泽', 'pinghe'], ['干燥', 'yinxu'], ['油腻', 'tanshi'], ['易过敏', 'tebing'], ['晦暗', 'xueyu'], ['不确定', 'qixu'], ['不确定', 'yangxu'], ['不确定', 'shire'], ['不确定', 'qiyu']] },
  { q: '你的舌苔?', options: [['薄白', 'pinghe'], ['淡白', 'qixu'], ['胖嫩', 'yangxu'], ['少苔', 'yinxu'], ['白厚腻', 'tanshi'], ['黄腻', 'shire'], ['紫暗', 'xueyu'], ['不确定', 'qiyu'], ['不确定', 'tebing']] },
  { q: '你的情绪?', options: [['平和', 'pinghe'], ['低落', 'qixu'], ['低落', 'yangxu'], ['烦躁', 'yinxu'], ['沉闷', 'tanshi'], ['急躁', 'shire'], ['波动大', 'qiyu'], ['低落', 'xueyu'], ['不确定', 'tebing']] },
  { q: '你的睡眠?', options: [['好', 'pinghe'], ['易醒', 'qixu'], ['嗜睡', 'yangxu'], ['失眠多梦', 'yinxu'], ['嗜睡, 头昏', 'tanshi'], ['不安', 'shire'], ['不确定', 'qiyu'], ['不确定', 'xueyu'], ['不确定', 'tebing']] },
  { q: '你的出汗?', options: [['正常', 'pinghe'], ['自汗 (白天)', 'qixu'], ['盗汗 (夜间)', 'yinxu'], ['黏腻', 'tanshi'], ['黏腻', 'shire'], ['不确定', 'yangxu'], ['不确定', 'qiyu'], ['不确定', 'xueyu'], ['不确定', 'tebing']] },
  { q: '你的口渴?', options: [['不渴', 'pinghe'], ['渴不欲饮', 'tanshi'], ['口苦', 'shire'], ['咽干', 'yinxu'], ['不确定', 'qixu'], ['不确定', 'yangxu'], ['不确定', 'qiyu'], ['不确定', 'xueyu'], ['不确定', 'tebing']] },
];

const TIZHI_NAMES = {
  pinghe: '平和质', qixu: '气虚质', yangxu: '阳虚质', yinxu: '阴虚质',
  tanshi: '痰湿质', shire: '湿热质', xueyu: '血瘀质', qiyu: '气郁质', tebing: '特禀质',
};

function scoreTizhi(answers) {
  // answers: 数组 9 项, 每项是 体质 key
  const votes = {};
  for (const k of (answers || [])) {
    if (!k) continue;
    votes[k] = (votes[k] || 0) + 1;
  }
  let winner = 'pinghe', max = 0;
  for (const [k, v] of Object.entries(votes)) {
    if (v > max) { max = v; winner = k; }
  }
  return { votes, winner, winner_name: TIZHI_NAMES[winner] || '平和质' };
}

module.exports = {
  getBazi, getZodiac, scorePHQ9, scoreGAD7, TIZHI_9_QUESTIONS, scoreTizhi, TIZHI_NAMES,
  PHQ9_QUESTIONS: [
    '做事时缺乏兴趣或乐趣',
    '感到心情低落、沮丧或没希望',
    '入睡困难、睡不安稳或嗜睡',
    '感到疲倦或精力不足',
    '食欲不振或暴饮暴食',
    '觉得自己不好, 失败或让自己/家人失望',
    '难以集中注意力, 例如看新闻或看电视',
    '行动或说话速度慢到被察觉, 或坐立不安',
    '有自伤或轻生的念头',
  ],
  PHQ9_OPTIONS: ['完全不会', '几天一次', '一半以上时间', '几乎每天'],
  GAD7_QUESTIONS: [
    '感到紧张、焦虑或急躁',
    '无法停止或控制的担忧',
    '为各种事情过度担忧',
    '难以放松',
    '心情烦躁, 难以静坐',
    '变得易怒或烦躁',
    '担心会发生可怕的事',
  ],
  GAD7_OPTIONS: ['完全不会', '几天一次', '一半以上时间', '几乎每天'],
};
