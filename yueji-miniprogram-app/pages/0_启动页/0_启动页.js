// 启动页 — 6 山水 CDN URL (从 cdn_urls.js; v2.2.0 修出界: 改 swiper 400rpx 顶部轮播)
const GUOHUA = require('../../assets/cdn_urls.js').guohua;
const { getTodayTest, isTodayCleared, get5DayStatus, markTodaySkipped } = require('../../utils/test_scheduler.js');

Page({
  data: {
    bgImgs: [],
    todayJing: {},
    todaySoup: {},
    todayTest: {},
    todayTestCleared: false,
    test5Status: [],
  },

  onLoad() {
    // v2.2.0 修出界: 6 山水数组直接给 swiper, 30 秒 autoplay
    this.setData({ bgImgs: Object.values(GUOHUA) });
    this.setToday();
    this.setTodayTest();
    // v3.0.5 阶段 3.6: 延迟调 askAi 函 (让 Page 绑完事再走云函)
    setTimeout(() => {
      const tizhiKey = wx.getStorageSync('yueji_tizhi') || 'pinghe';
      const TIZHI_NAMES = { pinghe: '平和质', qixu: '气虚质', yangxu: '阳虚质', yinxu: '阴虚质', tanshi: '痰湿质', shire: '湿热质', xueyu: '血瘀质', qiyu: '气郁质', tebing: '特禀质' };
      this.askAiJingHint(this.data.todayJing, tizhiKey, TIZHI_NAMES);
      this.askAiSoupHint(this.data.todaySoup, tizhiKey, TIZHI_NAMES);
    }, 200);
  },

  onShow() {
    this.setToday();
    this.setTodayTest();
  },

  setToday() {
    const { dayOfYear } = require('../../utils/compliance.js');
    const JINGWEN_868 = require('../../utils/data_jingwen.js');
    const SOUPS_30 = require('../../utils/data_soups.js');
    const day = dayOfYear();

    const jingIdx = day % JINGWEN_868.length;
    const todayJing = JINGWEN_868[jingIdx];

    const soupIdx = day % SOUPS_30.length;
    const todaySoup = SOUPS_30[soupIdx];

    this.setData({
      todayJing: {
        id: todayJing.id,
        source: todayJing.source,
        title: todayJing.title,
        content: todayJing.content.slice(0, 80) + (todayJing.content.length > 80 ? '...' : ''),
      },
      todaySoup: {
        id: todaySoup.id,
        name: todaySoup.name,
        tizhi: todaySoup.tizhi,
        ingredients: todaySoup.desc || '—',
      },
    });
    // v3.0.5 阶段 3.6: askAi 移 onLoad setTimeout 200ms 延后调, 不卡 Page 绑
  },

  // 大模型 1 句解读 (今经) - 由 onLoad setTimeout 200ms 触发
  askAiJingHint(todayJing, tizhiKey, TIZHI_NAMES) {
    if (!wx.cloud) return;
    if (!todayJing || !todayJing.id) return;
    const prompt =
      '你是悦济的「思友」, 用户是 9 体质中的「' + TIZHI_NAMES[tizhiKey] + '」, ' +
      '今日经文: 「' + todayJing.title + '」 出自 ' + todayJing.source + ', ' +
      '原文 80 字: ' + todayJing.content + '. ' +
      '请用 1 句 (≤40 字) 解读, 严守: 不评判 / 不医疗 / 不卖, 滋养调性. ' +
      '3 层结构: 看到 1 句原文 (10 字) + 跟用户 9 体质 (15 字) + 慢慢读 (10 字).';
    wx.cloud.callFunction({
      name: 'chat',
      data: { user_input: prompt, role: 'zhouwenwang', history: [] },
    }).then((res) => {
      if (res && res.result && res.result.ok && res.result.data && res.result.data.content) {
        const j = this.data.todayJing;
        if (j.id === todayJing.id) this.setData({ 'todayJing.aiHint': res.result.data.content });
      }
    }).catch((e) => console.warn('[悦济 jing ai]', e));
  },

  // 大模型 1 句为什么 (今汤) - 由 onLoad setTimeout 200ms 触发
  askAiSoupHint(todaySoup, tizhiKey, TIZHI_NAMES) {
    if (!wx.cloud) return;
    if (!todaySoup || !todaySoup.id) return;
    const prompt =
      '你是悦济的「养友」, 用户是 9 体质中的「' + TIZHI_NAMES[tizhiKey] + '」, ' +
      '今日汤: 「' + todaySoup.name + '」 适合 ' + todaySoup.tizhi + ' 体质, ' +
      '成分: ' + (todaySoup.desc || '—') + '. ' +
      '请用 1 句 (≤40 字) 告诉用户"为什么选这个", 严守: 不评判 / 不医疗 / 不卖, 滋养调性. ' +
      '3 层结构: 看到 9 体质 (10 字) + 为什么这个汤 (15 字) + 慢慢喝 (10 字).';
    wx.cloud.callFunction({
      name: 'chat',
      data: { user_input: prompt, role: 'qibo', history: [] },
    }).then((res) => {
      if (res && res.result && res.result.ok && res.result.data && res.result.data.content) {
        const s = this.data.todaySoup;
        if (s.id === todaySoup.id) this.setData({ 'todaySoup.aiHint': res.result.data.content });
      }
    }).catch((e) => console.warn('[悦济 soup ai]', e));
  },

  onTapTodayJing() { wx.switchTab({ url: '/pages/1_每日一经/1_每日一经' }); },
  onTapTodaySoup() { wx.switchTab({ url: '/pages/2_每日一汤/2_每日一汤' }); },
  onTapTodayHuman() { wx.navigateTo({ url: '/pages/8_4经数字人/8_4经数字人' }); },
  // v3.0.5 阶段 1.5: 4 类小动 5 分钟 (9 体质 + 镜中 4 维 → 推荐)
  onTapMotion() { wx.navigateTo({ url: '/pages/15_今日小动/15_今日小动' }); },
  // v3.0.5 阶段 1.5 扩展: 5 滋养曲风 (9 体质 + 镜中 4 维 → 1 调式)
  onTapMusic() { wx.navigateTo({ url: '/pages/16_今日一曲/16_今日一曲' }); },
  // v3.1 阶段 2 链路 2: 晚 9:00 睡前一程 4 件事联动
  onTapNightRitual() { wx.navigateTo({ url: '/pages/18_睡前一程/18_睡前一程' }); },
  // v3.0.5 阶段 1.2: 启动页"今日"屏 6 件事 - 今日一问 (复 用 4_镜中 4 维滑块 + 大模型润色)
  onTapAsk() { wx.switchTab({ url: '/pages/4_镜中/4_镜中' }); },
  onTapJingwen() { wx.switchTab({ url: '/pages/1_每日一经/1_每日一经' }); },
  onTapSoup() { wx.switchTab({ url: '/pages/2_每日一汤/2_每日一汤' }); },
  onTapJingzhong() { wx.switchTab({ url: '/pages/4_镜中/4_镜中' }); },

  // v3.0.5 阶段 1.3: 5 自测分 5 天 (今天第 N 套) - 跳 5 自测
  setTodayTest() {
    const t = getTodayTest();
    const cleared = isTodayCleared(t.key);
    const status = get5DayStatus();
    this.setData({ todayTest: t, todayTestCleared: cleared, test5Status: status });
  },
  // v3.0.5 阶段 2.2: 跳 17_今日一测引导 (D1 引导弹窗), 引导页内点"开始"再跳自测 page
  onTapTodayTest() {
    wx.navigateTo({ url: '/pages/17_今日一测引导/17_今日一测引导' });
  },
  // 跳过今天测试 (5 天循环里也算完成, 严守: 不强迫)
  onSkipTodayTest() {
    const t = this.data.todayTest;
    if (!t || !t.key) return;
    markTodaySkipped(t.key);
    wx.showToast({ title: '今天跳过了, 明天见', icon: 'none', duration: 1500 });
    this.setTodayTest();
  },

  // v3.1 阶段 2 链路 5: 朋友推荐 — 微信原生分享 (好友 / 朋友圈)
  // 严守: 标题不含医疗/营销词, 滋养调性
  onShareAppMessage() {
    const j = this.data.todayJing;
    const s = this.data.todaySoup;
    return {
      title: `悦济 · ${j ? j.source : '共修同行'} · ${s ? s.name : '滋养一程'}`,
      path: '/pages/0_启动页/0_启动页',
      imageUrl: '',
    };
  },
  onShareTimeline() {
    const j = this.data.todayJing;
    return {
      title: `悦济 · ${j ? j.title : '共修同行'} · 镜中是正在成为自己的你`,
      query: '',
    };
  },
});
