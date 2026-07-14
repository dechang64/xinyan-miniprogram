// 启动页 — 6 山水 CDN URL (从 cdn_urls.js; v2.2.0 修出界: 改 swiper 400rpx 顶部轮播)
const GUOHUA = require('../../assets/cdn_urls.js').guohua;

Page({
  data: {
    bgImgs: [],
    todayJing: {},
    todaySoup: {},
  },

  onLoad() {
    // v2.2.0 修出界: 6 山水数组直接给 swiper, 30 秒 autoplay
    this.setData({ bgImgs: Object.values(GUOHUA) });
    this.setToday();
  },

  onShow() {
    this.setToday();
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
  },

  onTapTodayJing() { wx.switchTab({ url: '/pages/1_每日一经/1_每日一经' }); },
  onTapTodaySoup() { wx.switchTab({ url: '/pages/2_每日一汤/2_每日一汤' }); },
  onTapTodayHuman() { wx.navigateTo({ url: '/pages/8_4经数字人/8_4经数字人' }); },
  // v3.0.5 阶段 1.5: 4 类小动 5 分钟 (9 体质 + 镜中 4 维 → 推荐)
  onTapMotion() { wx.navigateTo({ url: '/pages/15_今日小动/15_今日小动' }); },
  // v3.0.5 阶段 1.5 扩展: 5 滋养曲风 (9 体质 + 镜中 4 维 → 1 调式)
  onTapMusic() { wx.navigateTo({ url: '/pages/16_今日一曲/16_今日一曲' }); },
  // v3.0.5 阶段 1.2: 启动页"今日"屏 6 件事 - 今日一问 (复 用 4_镜中 4 维滑块 + 大模型润色)
  onTapAsk() { wx.switchTab({ url: '/pages/4_镜中/4_镜中' }); },
  onTapJingwen() { wx.switchTab({ url: '/pages/1_每日一经/1_每日一经' }); },
  onTapSoup() { wx.switchTab({ url: '/pages/2_每日一汤/2_每日一汤' }); },
  onTapJingzhong() { wx.switchTab({ url: '/pages/4_镜中/4_镜中' }); },
});
