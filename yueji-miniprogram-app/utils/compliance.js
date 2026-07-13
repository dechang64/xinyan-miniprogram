// 悦济 v2.6.0 — 严守 + 危机检测 + 工具函数
// v2.6.0 跟祁臻 v6.2 对齐: 严守 13 词 + 危机 19 词 + 严守 6 消极情绪词豁免
const FORBIDDEN_WORDS = [
  // 8 禁用词
  '治疗', '改善', '缓解', '治愈', '祛斑', '减肥', '处方', '医美',
  // 营销词
  '美颜', '美白', '瘦脸', '营销', '广告',
  // v2.6.0 加: 严守"疗愈" (祁臻 v6.2 没说但语义上属"治疗"族系, 悦济加严守)
  '疗愈',
];

// v2.6.0 跟祁臻 v6.2 对齐: 危机 19 词 (老 8 词 + 加 11 词: 轻生/割腕/跳楼/上吊/服药过量/绝望/没人需要我)
const CRISIS_KEYWORDS = [
  // 直接表达
  '不想活', '自杀', '轻生', '想死', '活不下去', '结束生命',
  // 自伤
  '自残', '割腕', '跳楼', '上吊', '服药过量',
  // 悲观绝望
  '绝望', '没意义', '没人需要我', '解脱'
];

// 严守豁免 (v2.6.0 跟祁臻 v6.2 一致: 反向声明 + 量表标准题)
// 量表 (PHQ-9/GAD-7) 题目有"焦虑/绝望"等严守词, 豁免
const EXEMPT_LINE_PATTERNS = [
  /禁用/, /严守/, /声明/, /不出现/, /不涉及/, /不识别/,
  /危机/, /热线/, /12356/, /010-82951332/, /110/, /120/,
  // PHQ-9 / GAD-7 / 量表 标准题: 豁免
  /感到.*心情.*低落/, /感到.*沮丧/, /入睡.*困难/, /感到.*焦虑/, /感到.*紧张/,
  // 严守审查 prompt
  /审查员/, /检查.*回复/, /冒充.*真人/, /医疗.*诊断/,
];

function isExempt(text) {
  if (!text) return false;
  for (const p of EXEMPT_LINE_PATTERNS) {
    if (p.test(text)) return true;
  }
  return false;
}

// 8 禁用词预审 (v2.6.0 加 isExempt 豁免)
function validateText(text) {
  if (!text) return true;
  // 整行豁免
  if (isExempt(text)) return true;
  // 逐行豁免 (chat 严守声明多行)
  for (const line of String(text).split('\n')) {
    if (isExempt(line)) continue;
    for (const word of FORBIDDEN_WORDS) {
      if (line.includes(word)) {
        console.warn(`[悦济严守] 检测到禁用词: ${word}`);
        return false;
      }
    }
  }
  return true;
}

// 危机检测
function detectCrisis(text) {
  if (!text) return null;
  for (const kw of CRISIS_KEYWORDS) {
    if (text.includes(kw)) return kw;
  }
  return null;
}

// day-of-year 选 (跟心颜 Streamlit 一致)
function dayOfYear() {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}

// ISO 日期
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

module.exports = {
  FORBIDDEN_WORDS,
  CRISIS_KEYWORDS,
  validateText,
  detectCrisis,
  dayOfYear,
  todayISO,
  // 严守声明
  COMPLIANCE_TEXT: '本产品为生活陪伴, 不涉及医疗作用。如有心理困扰, 请拨打 12356 全国心理援助热线。',
  // 危机响应
  CRISIS_BANNER: '我们注意到您可能正在经历困难时期。悦济是生活陪伴, 无法替代专业支持。',
  CRISIS_HOTLINE: '12356'
};
