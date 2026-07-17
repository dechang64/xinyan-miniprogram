// 悦济 v3.0.5 — 5 自测分 5 天调度 (阶段 1.3)
// 5 自测: 9 体质 / MBTI / 人格画像 / 5 元素 / 月令
// 5 天每天 1 套, 循环 (D1 9 体质 / D2 MBTI / D3 人格 / D4 5 元素 / D5 月令)
// 严守: 主观自评 ✅, 不做客观识别, 可跳过 (不强迫)
// storage key: yueji_test_done_<key>_<YYYY-MM-DD> = true
// 跳过 key: yueji_test_skip_<key> = true (用户主动跳过, 5 天循环里也算完成)

const TESTS_5 = [
  { day: 1, key: 'tizhi',   name: '9 体质自评', page: '/pages/9_9体质自评/9_9体质自评', dur: '90 秒 9 题', desc: '王琦 9 体质, 平和/气虚/阳虚/阴虚/痰湿/湿热/血瘀/气郁/特禀' },
  { day: 2, key: 'mbti',    name: 'MBTI 快测',  page: '/pages/10_MBTI快测/10_MBTI快测', dur: '4 题滑块', desc: 'E/I S/N T/F J/P 4 对, 16 型 → 4 经数字人' },
  { day: 3, key: 'renge',   name: '人格画像',   page: '/pages/6_人格画像/6_人格画像', dur: '4 经阅读', desc: '看 4 经数字人, 自动生成 9 维人格画像' },
  { day: 4, key: 'wuxing',  name: '5 元素',     page: '/pages/12_5元素/12_5元素', dur: '60 秒 5 元素', desc: '5 元素月令, 文化参考不诊断' },
  { day: 5, key: 'yueling', name: '月令',       page: '/pages/13_月令/13_月令', dur: '60 秒 月令', desc: '5 元素月令, 文化参考不诊断' },
];

// 今天是哪天 (1-5, 循环: D6=D1, D7=D2, ...)
function todayTestDay() {
  // 5 天周期: 用 epoch + 5 模
  const dayIdx = Math.floor(Date.now() / 86400000) % 5;
  return dayIdx + 1; // 1-5
}

// 今天的测试
function getTodayTest() {
  const day = todayTestDay();
  return TESTS_5[day - 1];
}

// 今天的测试是否已完成
function isTodayDone(testKey) {
  const dateStr = new Date().toISOString().slice(0, 10);
  return !!wx.getStorageSync('yueji_test_done_' + testKey + '_' + dateStr);
}

// 今天的测试是否已跳过
function isTodaySkipped(testKey) {
  return !!wx.getStorageSync('yueji_test_skip_' + testKey);
}

// 标记今天完成
function markTodayDone(testKey) {
  const dateStr = new Date().toISOString().slice(0, 10);
  wx.setStorageSync('yueji_test_done_' + testKey + '_' + dateStr, true);
}

// 标记今天跳过 (5 天循环里也算完成)
function markTodaySkipped(testKey) {
  wx.setStorageSync('yueji_test_skip_' + testKey, true);
}

// 今天的测试是否已"做过" (完成 OR 跳过)
function isTodayCleared(testKey) {
  return isTodayDone(testKey) || isTodaySkipped(testKey);
}

// 5 自测总状态 (5 天内)
function get5DayStatus() {
  const today = todayTestDay();
  return TESTS_5.map(t => ({
    ...t,
    isToday: t.day === today,
    done: isTodayDone(t.key),
    skipped: isTodaySkipped(t.key),
    cleared: isTodayCleared(t.key),
  }));
}

module.exports = {
  TESTS_5,
  todayTestDay,
  getTodayTest,
  isTodayDone,
  isTodaySkipped,
  markTodayDone,
  markTodaySkipped,
  isTodayCleared,
  get5DayStatus,
};
