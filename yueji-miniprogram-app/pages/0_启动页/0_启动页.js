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
  onTapJingwen() { wx.switchTab({ url: '/pages/1_每日一经/1_每日一经' }); },
  onTapSoup() { wx.switchTab({ url: '/pages/2_每日一汤/2_每日一汤' }); },
  onTapJingzhong() { wx.switchTab({ url: '/pages/4_镜中/4_镜中' }); },
});
