// 悦济 v1.0 — MBTI 8 题评分 (从心颜 data/mbti.py 迁移)
// 严守: 主观自评 ✅, 8 维度 16 型, 不诊断性格"好坏"
const MBTI_8_QUESTIONS = [
  { q: '当你参加社交聚会时, 你通常', A: '跟很多人聊天, 包括陌生人', A_letter: 'E', B: '只跟少数人深聊', B_letter: 'I' },
  { q: '在团队合作中, 你更倾向', A: '主导讨论, 推动进程', A_letter: 'E', B: '在幕后支持, 倾听他人', B_letter: 'I' },
  { q: '当你需要充电时, 你会', A: '跟朋友出去, 热闹让人恢复', A_letter: 'E', B: '一个人待着, 安静让人恢复', B_letter: 'I' },
  { q: '你更容易记住', A: '具体的、实在发生过的事', A_letter: 'S', B: '抽象的、概念性的想法', B_letter: 'N' },
  { q: '面对新信息, 你更关注', A: '事实和细节', A_letter: 'S', B: '含义和可能性', B_letter: 'N' },
  { q: '做决定时, 你更依赖', A: '逻辑分析, 客观权衡', A_letter: 'T', B: '价值判断, 考虑他人感受', B_letter: 'F' },
  { q: '当你跟朋友意见不合时', A: '坚持自己的观点, 寻求真理', A_letter: 'T', B: '维护关系, 寻求和谐', B_letter: 'F' },
  { q: '你更喜欢的生活是', A: '有计划, 按部就班', A_letter: 'J', B: '灵活, 随遇而安', B_letter: 'P' },
];

const MBTI_16_TYPES = {
  ISTJ: { name: '物流师', desc: '安静、严肃, 务实可靠。重视传统和忠诚。' },
  ISFJ: { name: '守卫者', desc: '安静、友好, 有责任感。谨慎、勤奋。' },
  INFJ: { name: '提倡者', desc: '富有理想主义和同情心, 有创造力。' },
  INTJ: { name: '建筑师', desc: '富有想象力和战略思维, 追求逻辑。' },
  ISTP: { name: '鉴赏家', desc: '冷静、理性, 擅长分析。' },
  ISFP: { name: '探险家', desc: '温和、敏感, 活在当下。' },
  INFP: { name: '调停者', desc: '理想主义、忠于价值观。' },
  INTP: { name: '逻辑学家', desc: '好奇、独立, 追求知识。' },
  ESTP: { name: '企业家', desc: '精力充沛、务实, 善于应变。' },
  ESFP: { name: '表演者', desc: '热情、富有感染力, 享受当下。' },
  ENFP: { name: '竞选者', desc: '热情、富有想象力, 善于联结。' },
  ENTP: { name: '辩论家', desc: '机敏、好奇, 喜欢挑战。' },
  ESTJ: { name: '总经理', desc: '务实、果断, 天生的管理者。' },
  ESFJ: { name: '执政官', desc: '热情、富有责任感, 关心他人。' },
  ENFJ: { name: '主人公', desc: '富有感染力, 善于激励他人。' },
  ENTJ: { name: '指挥官', desc: '果断、有战略眼光, 善于领导。' },
};

function scoreMBTI(answers) {
  // answers: 数组 8 项, 每项 'A' 或 'B'
  if (!answers || answers.length !== 8) return { type: 'INFP', type_name: '调停者', type_desc: MBTI_16_TYPES.INFP.desc };
  const letters = [];
  for (let i = 0; i < 8; i++) {
    const q = MBTI_8_QUESTIONS[i];
    const a = answers[i];
    letters.push(a === 'A' ? q.A_letter : q.B_letter);
  }
  const type = letters.join('');
  const info = MBTI_16_TYPES[type] || { name: '调停者', desc: MBTI_16_TYPES.INFP.desc };
  return { type, type_name: info.name, type_desc: info.desc, letters };
}

module.exports = { MBTI_8_QUESTIONS, MBTI_16_TYPES, scoreMBTI };
