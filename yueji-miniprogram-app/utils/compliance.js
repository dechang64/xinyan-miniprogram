// 悦济 v1.0 — 严守 + 危机检测 + 工具函数
// 严守: 8 禁用词 0 出现 + 营销词 0 + 主观自评 ✅ / 客观识别 ❌
const FORBIDDEN_WORDS = [
  // 8 禁用词
  '治疗', '改善', '缓解', '治愈', '祛斑', '减肥', '处方', '医美',
  // 营销词
  '美颜', '美白', '瘦脸', '营销', '广告',
  // 消极情绪词 (UI 不出现)
  '激烈', '焦虑', '痛苦', '愤怒', '恐惧', '绝望'
];

// 危机关键词 → 12356
const CRISIS_KEYWORDS = [
  '不想活', '想死', '自杀', '自残', '结束生命', '活不下去', '没意义', '解脱'
];

// 8 禁用词预审
function validateText(text) {
  if (!text) return true;
  for (const word of FORBIDDEN_WORDS) {
    if (text.includes(word)) {
      console.warn(`[悦济严守] 检测到禁用词: ${word}`);
      return false;
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
