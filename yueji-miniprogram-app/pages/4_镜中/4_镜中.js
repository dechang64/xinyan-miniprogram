// 4_镜中.js — 悦济镜中 (v1.1 完整版 + 4 数字人入口 + 云函数 chat)
// 4 滑块 + 30 天曲线 + 6 类对话 (云函数 chat) + 4 数字人入口 (新) + 给 3 个月后的信
// v2.5.4: 删语音录音 (v1.1 加的, 没真测过端到端, 触发 "Record file not exist" 错)
// 严守: 主观自评 ✅ / 客观识别 ❌ / 危机检测 → 12356
const { todayISO, detectCrisis, CRISIS_HOTLINE } = require('../../utils/compliance.js');
const { getRandomResponse } = require('../../utils/dialog.js');

const KEYS = ['mood', 'energy', 'sleep', 'skin'];
const KEY_NAMES = { mood: '心情', energy: '精力', sleep: '睡眠', skin: '肌肤' };
const KEY_COLORS = { mood: '#E8998C', energy: '#F4D35E', sleep: '#B8D8E8', skin: '#A8D5BA' };
const KEY_ICONS = { mood: '💗', energy: '⚡', sleep: '🌙', skin: '🌿' };
const DIALOG_TYPES = {
  still: '静下来', company: '陪伴', hanyang: '涵养', tongzhou: '同舟', gongxiu: '共修', yueji: '悦己',
  laozi: '老子·道德经', zhouwenwang: '文王·易经', qibo: '岐伯·黄帝内经', yuanshen: '元神·清静经',
};

Page({
  data: {
    keys: KEYS,
    keyNames: KEY_NAMES,
    keyColors: KEY_COLORS,
    keyIcons: KEY_ICONS,
    sliders: { mood: 5, energy: 5, sleep: 5, skin: 5 },
    history: [],
    hasLetter: false,
    dialogResponse: '',
    dialogType: '',
    dialogTypeLabel: '',
    dialogAiPowered: false,
    crisisAlert: false,
  },

  onLoad() {
    // 严守: 云环境已在 app.js onLaunch 统一初始化, 此处不再重复 init
    // v1.1.5 移除硬编码 env: 'yueji-prod', 改走 app.js 的 cloud1-0tg4p3kus61d1302
    if (!wx.cloud) {
      console.warn('[悦济] 当前用户基础库 2.2.3 以下, 无 wx.cloud');
    }
    this.loadHistory();
  },
  onShow() { this.loadHistory(); },

  loadHistory() {
    const history = wx.getStorageSync('yueji_history') || [];
    const letter = wx.getStorageSync('yueji_letter') || '';
    this.setData({ history, hasLetter: !!letter });
    // v2.3.0: history 加载后画 30 天曲线 (canvas 2d 真画)
    if (history.length > 0) {
      setTimeout(() => this.drawCurveCanvas(), 100);
    }
  },

  // v2.3.0: 30 天曲线 canvas 2d 真画 (心情/精力/睡眠/肌肤 4 线)
  drawCurveCanvas() {
    const that = this;
    const query = wx.createSelectorQuery();
    query.select('#curveCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const W = 660, H = 400;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.scale(dpr, dpr);

        // 背景
        ctx.fillStyle = '#faf6f0';
        ctx.fillRect(0, 0, W, H);

        const history = that.data.history;
        if (history.length === 0) return;

        // 网格
        ctx.strokeStyle = '#e8dfc8';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
          const y = (H - 40) * i / 4 + 20;
          ctx.beginPath();
          ctx.moveTo(40, y);
          ctx.lineTo(W - 20, y);
          ctx.stroke();
        }

        // 4 维折线
        const keys = ['mood', 'energy', 'sleep', 'skin'];
        const colors = { mood: '#E8998C', energy: '#F4D35E', sleep: '#B8D8E8', skin: '#A8D5BA' };
        const stepX = (W - 60) / Math.max(history.length - 1, 1);

        keys.forEach((k) => {
          ctx.strokeStyle = colors[k];
          ctx.lineWidth = 3;
          ctx.beginPath();
          history.forEach((h, i) => {
            const x = 40 + i * stepX;
            const y = (H - 40) * (1 - h[k] / 10) + 20;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();

          // 点
          ctx.fillStyle = colors[k];
          history.forEach((h, i) => {
            const x = 40 + i * stepX;
            const y = (H - 40) * (1 - h[k] / 10) + 20;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
          });
        });
      });
  },

  onSliderChange(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    const sliders = { ...this.data.sliders };
    sliders[key] = value;
    this.setData({ sliders });
  },

  onSave() {
    const dateStr = todayISO();
    const entry = { date: dateStr, ...this.data.sliders };
    const history = this.data.history.filter(h => h.date !== dateStr);
    history.push(entry);
    const recent = history.slice(-30);
    wx.setStorageSync('yueji_history', recent);
    this.setData({ history: recent });
    wx.showToast({ title: '已记录', icon: 'success' });
  },

  // 6 类对话 - v2.3.0 修: 跟 chat.js 一样, 拿掉静态兜底先 push, 只等云函数返回
  async onTapDialog(e) {
    const t = e.currentTarget.dataset.type;
    const label = DIALOG_TYPES[t] || t;
    this.setData({ dialogType: t, dialogTypeLabel: label, dialogResponse: '...', dialogAiPowered: false });

    if (!wx.cloud) {
      this.setData({ dialogResponse: '云开发未配置' });
      return;
    }

    try {
      const res = await wx.cloud.callFunction({
        name: 'chat',
        data: { user_input: label, role: t, history: [] },
      });
      if (res.result && res.result.ok && res.result.data && res.result.data.content) {
        this.setData({ dialogResponse: res.result.data.content, dialogAiPowered: !res.result.data.fallback });
        if (res.result.data.crisis) this.setData({ crisisAlert: true });
      } else {
        this.setData({ dialogResponse: '（暂未接住）请稍后再试' });
      }
    } catch (e) {
      // v2.6.0 修 P0-9: catch 显式提示 (不再静默兜底), 跟 chat 云函数一致
      console.error('[悦济 chat 云函数]', e);
      wx.showToast({ title: '云函数不可用, 请检查部署', icon: 'none', duration: 3000 });
      this.setData({ dialogResponse: '（AI 暂未接住, 请检查云函数部署 / 环境变量 AI_API_KEY）' });
    }
  },

  onCloseDialog() { this.setData({ dialogResponse: '', dialogType: '', dialogTypeLabel: '', dialogAiPowered: false }); },
  onCloseCrisis() { this.setData({ crisisAlert: false }); },

  onTapCallHotline() { wx.makePhoneCall({ phoneNumber: CRISIS_HOTLINE, fail: () => {} }); },
  onWriteLetter() { wx.navigateTo({ url: '/pages/4_镜中/letter/letter' }); },

  // 4 数字人入口 (v1.1)
  onGotoDigitalHuman() {
    wx.navigateTo({ url: '/pages/8_4经数字人/8_4经数字人' });
  },

  // v2.5.4: 删语音录音 (v1.1 加的, 没真测过端到端, 触发 "Record file not exist" 错)
  // v2.6 路线再实现 (需要: 麦克风权限引导 + 录音 → STT 云函数 → 文字)

  // v3.1 阶段 2 链路 5: 朋友推荐 — 镜中 4 维 / 30 天曲线 / 6 类对话 分享
  // 严守: 不显示分数具体值, 标题用"滋养"调性
  onShareAppMessage() {
    const h = this.data.history;
    return {
      title: h && h.length > 0
        ? `悦济 · 镜中 4 维 · ${h.length} 天滋养自己`
        : '悦济 · 镜中, 是正在成为自己的你',
      path: '/pages/4_镜中/4_镜中',
      imageUrl: '',
    };
  },
  onShareTimeline() {
    const h = this.data.history;
    return {
      title: h && h.length >= 7
        ? `悦济 · 镜中 30 天曲线, 滋养自己 ${h.length} 天`
        : '悦济 · 共修同行 · 镜中是正在成为自己的你',
      query: '',
    };
  },
});
