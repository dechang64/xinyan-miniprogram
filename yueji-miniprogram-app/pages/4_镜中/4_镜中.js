// 4_镜中.js — 悦济镜中 (v1.1 完整版 + 语音 + 4 数字人入口 + 云函数 chat)
// 4 滑块 + 30 天曲线 + 6 类对话 (云函数 chat) + 4 数字人入口 (新) + 给 3 个月后的信
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

let recorderManager = null;

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
    isRecording: false,
  },

  onLoad() {
    if (!wx.cloud) {
      console.warn('[悦济] 当前用户基础库 2.2.3 以下, 无 wx.cloud');
    } else {
      wx.cloud.init({ env: 'yueji-prod' }); // user 部署时改 envId
    }
    this.loadHistory();
  },
  onShow() { this.loadHistory(); },

  loadHistory() {
    const history = wx.getStorageSync('yueji_history') || [];
    const letter = wx.getStorageSync('yueji_letter') || '';
    this.setData({ history, hasLetter: !!letter });
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

  // 6 类对话 - 调云函数 (云函数不可用则兜底静态)
  async onTapDialog(e) {
    const t = e.currentTarget.dataset.type;
    const label = DIALOG_TYPES[t] || t;
    this.setData({ dialogType: t, dialogTypeLabel: label, dialogResponse: '...', dialogAiPowered: false });

    // 先用静态兜底
    const fallback = getRandomResponse(t);
    this.setData({ dialogResponse: fallback });

    // 再异步调云函数 (v1.0 试 AMAX, 失败保留静态)
    if (wx.cloud) {
      try {
        const res = await wx.cloud.callFunction({
          name: 'chat',
          data: {
            user_input: label,
            role: t,
            history: [],
          },
        });
        if (res.result && res.result.ok && res.result.data && res.result.data.content) {
          this.setData({ dialogResponse: res.result.data.content, dialogAiPowered: !res.result.data.fallback });
          if (res.result.data.crisis) {
            this.setData({ crisisAlert: true });
          }
        }
      } catch (e) {
        console.warn('[悦济 chat 云函数] 不可用, 保留静态:', e.message);
      }
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

  // 语音输入 (v1.1, 给 6 类对话)
  onStartRecord() {
    if (!recorderManager) {
      recorderManager = wx.getRecorderManager();
      recorderManager.onStop((res) => {
        this.setData({ isRecording: false });
        if (res && res.tempFilePath) {
          this.callVoiceSTT(res.tempFilePath);
        }
      });
      recorderManager.onError((err) => {
        this.setData({ isRecording: false });
        console.error('[悦济 录音]', err);
      });
    }
    wx.authorize({
      scope: 'scope.record',
      success: () => {
        this.setData({ isRecording: true });
        recorderManager.start({ format: 'mp3', duration: 60000 });
      },
      fail: () => {
        wx.showModal({
          title: '需要麦克风权限',
          content: '请在设置中允许悦济使用麦克风',
          confirmText: '去设置',
          success: (res) => { if (res.confirm) wx.openSetting(); },
        });
      },
    });
  },

  onStopRecord() {
    if (recorderManager && this.data.isRecording) {
      recorderManager.stop();
    }
  },

  async callVoiceSTT(filePath) {
    if (!wx.cloud) {
      wx.showToast({ title: '云开发未配置', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '识别中...' });
    try {
      const uploadRes = await wx.cloud.uploadFile({ cloudPath: `voice/${Date.now()}.mp3`, filePath });
      const res = await wx.cloud.callFunction({
        name: 'voice',
        data: { action: 'stt', fileID: uploadRes.fileID },
      });
      wx.hideLoading();
      if (res.result && res.result.ok && res.result.text) {
        // 用语音文字触发「静下来」对话 (默认)
        this.onTapDialogWithInput(res.result.text, 'still');
      } else {
        wx.showToast({ title: '识别失败', icon: 'none' });
      }
    } catch (e) {
      wx.hideLoading();
      console.error('[悦济 STT]', e);
      wx.showToast({ title: '识别失败, 请重试', icon: 'none' });
    }
  },

  async onTapDialogWithInput(userInput, role = 'still') {
    const label = DIALOG_TYPES[role] || role;
    this.setData({ dialogType: role, dialogTypeLabel: label, dialogResponse: '...', dialogAiPowered: false });
    const fallback = getRandomResponse(role);
    this.setData({ dialogResponse: fallback });

    if (wx.cloud) {
      try {
        const res = await wx.cloud.callFunction({
          name: 'chat',
          data: { user_input: userInput, role, history: [] },
        });
        if (res.result && res.result.ok && res.result.data && res.result.data.content) {
          this.setData({ dialogResponse: res.result.data.content, dialogAiPowered: !res.result.data.fallback });
          if (res.result.data.crisis) {
            this.setData({ crisisAlert: true });
          }
        }
      } catch (e) {
        console.warn('[悦济 chat 云函数] 不可用, 保留静态:', e.message);
      }
    }
  },
});
