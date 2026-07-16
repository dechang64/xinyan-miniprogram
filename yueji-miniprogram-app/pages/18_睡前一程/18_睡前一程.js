// 18_睡前一程.js — 悦济 v3.1 阶段 2
// 晚 9:00 睡前场景联动: 经文 1 句 + 汤品 1 句 + 滋养曲 1 调 + 5 分钟小动 1 类
// 复用: 9 体质 + 镜中 4 维 → 4 件事同一晚联动 (链路 2)
// 严守: 不打卡 / 不评判 / 不卖 / 不超 5 分钟
const { dayOfYear } = require('../../utils/compliance.js');
const JINGWEN_868 = require('../../utils/data_jingwen.js');
const SOUPS_30 = require('../../utils/data_soups.js');
const { recommendWuyueTrack, WUYUE_NAMES, WUYUE_FULL, WUYUE_DESCRIPTIONS } = require('../../utils/data_music.js');
const { recommendMotion, MOTION_TYPES } = require('../../utils/data_motion.js');

const TIZHI_NAMES = {
  pinghe: '平和质', qixu: '气虚质', yangxu: '阳虚质', yinxu: '阴虚质',
  tanshi: '痰湿质', shire: '湿热质', xueyu: '血瘀质', qiyu: '气郁质', tebing: '特禀质',
};

const SCENE_INTRO = {
  // 9 体质 → 睡前一句话 (严守: 不评判, 不医疗, 滋养)
  pinghe: '平和的你, 睡前让一切归位, 慢慢静下来。',
  qixu: '气虚的你, 睡前一程深呼吸, 养养中气。',
  yangxu: '阳虚的你, 睡前暖暖肚子, 静坐 5 分钟。',
  yinxu: '阴虚的你, 睡前远离屏幕, 让心安。',
  tanshi: '痰湿的你, 睡前拉筋 5 分钟, 排出一天的郁。',
  shire: '湿热的你, 睡前静坐, 让心静下来。',
  xueyu: '血瘀的你, 睡前拍打 5 分钟, 让气血流通。',
  qiyu: '气郁的你, 睡前读 1 句经, 让心舒展。',
  tebing: '特禀的你, 睡前听 1 段曲, 安神。',
};

Page({
  data: {
    tizhiKey: 'pinghe',
    tizhiName: '平和质',
    sceneIntro: '',
    jing: null,        // 今经 1 句
    soup: null,        // 今汤 1 句
    music: null,       // 今曲 1 调
    motion: null,      // 今动 1 类
  },

  onLoad() {
    this.compute();
  },

  onShow() {
    this.compute();
  },

  compute() {
    const day = dayOfYear();
    const tizhiKey = wx.getStorageSync('yueji_tizhi') || 'pinghe';
    const tizhiName = TIZHI_NAMES[tizhiKey] || '平和质';

    // 1. 经文 (按 dayOfYear 选 1 经, 取 1 段 30 字)
    const jw = JINGWEN_868[day % JINGWEN_868.length];
    const jwShort = (jw.content || '').slice(0, 30) + ((jw.content || '').length > 30 ? '...' : '');

    // 2. 汤品 (按 dayOfYear 选 1)
    const sp = SOUPS_30[day % SOUPS_30.length];

    // 3. 滋养曲 (9 体质 + 4 维 → 1 调)
    const history = wx.getStorageSync('yueji_history') || [];
    const today = new Date().toISOString().slice(0, 10);
    const latestEntry = history.find(h => h.date === today) || history[history.length - 1] || {};
    const latest4 = {
      mood: latestEntry.mood || 5,
      energy: latestEntry.energy || 5,
      sleep: latestEntry.sleep || 5,
      skin: latestEntry.skin || 5,
    };
    const music = recommendWuyueTrack(tizhiKey, latest4);

    // 4. 小动 (9 体质 + 4 维 → 1 类, 4 选 1)
    const motionKey = recommendMotion(tizhiKey, latest4);
    const motion = MOTION_TYPES[motionKey];

    this.setData({
      tizhiKey,
      tizhiName,
      sceneIntro: SCENE_INTRO[tizhiKey] || SCENE_INTRO.pinghe,
      jing: {
        id: jw.id,
        source: jw.source,
        title: jw.title,
        short: jwShort,
      },
      soup: {
        id: sp.id,
        name: sp.name,
        tizhi: sp.tizhi,
        short: (sp.desc || '').slice(0, 30) + ((sp.desc || '').length > 30 ? '...' : ''),
      },
      music: {
        wuyue: music.wuyue,
        wuyueName: WUYUE_NAMES[music.wuyue],
        wuyueFull: WUYUE_FULL[music.wuyue],
        wuyueDesc: WUYUE_DESCRIPTIONS[music.wuyue],
      },
      motion: {
        key: motion.key,
        name: motion.name,
        desc: motion.desc,
        icon: motion.icon,
        color: motion.color,
        duration: motion.duration,
      },
    });
  },

  // 跳 1.1_经文详情 (链 1 周末深度)
  onTapJing() {
    wx.navigateTo({ url: `/pages/1.1_经文详情/1.1_经文详情?id=${this.data.jing.id}` });
  },

  // 跳 2_每日一汤
  onTapSoup() {
    wx.switchTab({ url: '/pages/2_每日一汤/2_每日一汤' });
  },

  // 跳 16_今日一曲
  onTapMusic() {
    wx.navigateTo({ url: '/pages/16_今日一曲/16_今日一曲' });
  },

  // 跳 15_今日小动
  onTapMotion() {
    wx.navigateTo({ url: '/pages/15_今日小动/15_今日小动' });
  },
});
