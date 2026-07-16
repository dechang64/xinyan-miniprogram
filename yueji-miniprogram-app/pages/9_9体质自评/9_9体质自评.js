// 9_9体质自评.js — 悦济 v2.2.0 王琦 9 体质主观自评
// 9 维度 (阳虚/阴虚/气虚/痰湿/湿热/血瘀/气郁/特禀/平和), 每维度 1 滑块 0-100
// 9 维度 max → primary 体质; 推荐 3 款汤 + 3 篇经文 (从 utils/data_soups.js + data_jingwen.js)
// 严守: 主观自评 ✅, 不做客观识别, 不写医疗

const SOUPS = require('../../utils/data_soups.js');
const JINGWEN = require('../../utils/data_jingwen.js');

const QUESTIONS = [
  { key: 'yangxu', text: '手脚凉, 怕冷 (阳虚倾向)' },
  { key: 'yinxu', text: '手心脚心热, 口干 (阴虚倾向)' },
  { key: 'qixu', text: '容易累, 说话没劲 (气虚倾向)' },
  { key: 'tanshi', text: '身体沉重, 痰多 (痰湿倾向)' },
  { key: 'shire', text: '口苦口干, 油光 (湿热倾向)' },
  { key: 'xueyu', text: '面色暗, 易瘀斑 (血瘀倾向)' },
  { key: 'qiyu', text: '情绪低落, 胸闷 (气郁倾向)' },
  { key: 'tebing', text: '易过敏, 鼻炎 (特禀倾向)' },
  { key: 'pinghe', text: '整体平和, 无明显倾向' },
];

// 9 体质 → 5 款汤名匹配 (CCTV/北中医 30 款里筛)
const TIZHI_SOUP_MAP = {
  '阳虚': ['当归生姜羊肉汤', '桂圆红枣粥', '黄芪炖鸡'],
  '阴虚': ['百合银耳莲子羹', '麦冬石斛茶', '玉竹老鸭汤'],
  '气虚': ['山药红枣粥', '黄芪党参鸡汤', '人参莲子汤'],
  '痰湿': ['薏米红豆粥', '冬瓜薏米排骨汤', '荷叶粥'],
  '湿热': ['绿豆百合汤', '苦瓜豆腐汤', '菊花决明子茶'],
  '血瘀': ['红花玫瑰茶', '山楂红糖水', '三七炖鸡'],
  '气郁': ['陈皮菊花茶', '玫瑰花茶', '佛手蜂蜜茶'],
  '特禀': ['黄芪红枣汤', '山药小米粥', '百合莲子羹'],
  '平和': ['山药排骨汤', '红枣银耳羹', '桂圆莲子粥'],
};

const TIZHI_ADVICE = {
  '阳虚': '避寒凉, 多温补; 艾灸关元 / 足三里; 早睡养阳。',
  '阴虚': '避辛辣, 多滋阴; 练静坐 / 八段锦; 23 点前睡。',
  '气虚': '避过劳, 少说话; 黄芪泡水常饮; 散步 30 分钟。',
  '痰湿': '避甜腻, 多运动; 薏米 / 冬瓜常食; 忌冰啤。',
  '湿热': '避烟酒辛辣, 多食苦瓜绿豆; 早起一杯温开水。',
  '血瘀': '避久坐, 多走动; 山楂 / 红花常食; 练舒展运动。',
  '气郁': '避独处, 多交流; 玫瑰 / 陈皮常饮; 练深呼吸。',
  '特禀': '避过敏源, 多食山药百合; 早起通风; 远离宠物毛。',
  '平和': '保持现状, 9 体质里的"满分"答案。',
};

Page({
  data: {
    questions: QUESTIONS,
    answers: { yangxu: 0, yinxu: 0, qixu: 0, tanshi: 0, shire: 0, xueyu: 0, qiyu: 0, tebing: 0, pinghe: 50 },
    result: null,
  },

  onSlide(e) {
    const key = e.currentTarget.dataset.key;
    const val = e.detail.value;
    this.setData({ [`answers.${key}`]: val });
  },

  onSubmit() {
    const a = this.data.answers;
    // 找 max 的那个 key
    let maxKey = 'pinghe';
    let maxVal = -1;
    for (const k in a) {
      if (a[k] > maxVal) { maxVal = a[k]; maxKey = k; }
    }
    // pinghe 最高才算平和, 否则按 max 算
    let primary;
    if (maxKey === 'pinghe' && maxVal < 50) {
      primary = '平和';
    } else if (maxKey === 'pinghe' && maxVal >= 50) {
      // pinghe 高但其他也高, 取非 pinghe 最高的
      let k2 = 'yangxu'; let v2 = -1;
      for (const k in a) { if (k !== 'pinghe' && a[k] > v2) { v2 = a[k]; k2 = k; } }
      primary = TIZHI_KEY_TO_NAME[k2];
    } else {
      primary = TIZHI_KEY_TO_NAME[maxKey];
    }

    const soupNames = TIZHI_SOUP_MAP[primary] || TIZHI_SOUP_MAP['平和'];
    // 30 款里匹配名字
    const soups = soupNames.map((name) => {
      const hit = SOUPS.find((s) => s.name.includes(name.split('').slice(0, 2).join('')) || name.includes(s.name.slice(0, 2)));
      return hit ? { id: hit.id, name: hit.name, desc: (hit.desc || '').slice(0, 30) } : { id: 0, name, desc: '悦济严守配方' };
    }).slice(0, 3);

    // 3 篇经文: 平和 → 清静经; 其他 → 黄帝内经
    const jingwen = JINGWEN.filter((j) => {
      if (primary === '平和') return j.source.includes('清静经');
      if (primary === '气郁' || primary === '血瘀') return j.source.includes('道德经');
      return j.source.includes('黄帝内经');
    }).slice(0, 3).map((j) => ({ id: j.id, title: j.title.slice(0, 20), source: j.source }));

    this.setData({
      result: {
        primary,
        advice: TIZHI_ADVICE[primary] || TIZHI_ADVICE['平和'],
        soups,
        jingwen,
      },
    });

    // v3.1 阶段 12 F2: 修 v3.0.5 时代 bug — 9 体质结果存到 storage
    // 16_今日一曲 读 'yueji_tizhi' (短 key) 推默认调式
    // 6_人格画像 读 'yueji_tizhi_result' (含 scores)
    // 修前: 9 体质做完结果只在 UI 显示, storage 永远空, 16_今日一曲 默认 pinghe → 宫调
    // 修后: 16_今日一曲 默认调式 = 9 体质自评结果 (不是默认 pinghe)
    wx.setStorageSync('yueji_tizhi', maxKey);
    wx.setStorageSync('yueji_tizhi_result', { primary, scores: a, winner: maxKey });
  },
});

const TIZHI_KEY_TO_NAME = {
  yangxu: '阳虚', yinxu: '阴虚', qixu: '气虚', tanshi: '痰湿', shire: '湿热',
  xueyu: '血瘀', qiyu: '气郁', tebing: '特禀', pinghe: '平和',
};
