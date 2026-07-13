// chat.js — 单个数字人对话页 (老子/周文王/岐伯/元神)
// 支持: 文字输入 + 语音输入 + TTS 播放 + 历史记录
const { DIGITAL_HUMAN_AVATARS } = require('../../../utils/data_digital_human.js');
const { detectCrisis, todayISO } = require('../../../utils/compliance.js');
const { getRandomResponse } = require('../../../utils/dialog.js');

const innerAudioContext = wx.createInnerAudioContext();
let recorderManager = null; // 延迟初始化

Page({
  data: {
    human: null,           // 当前数字人
    messages: [],          // [{role, content, hasAudio}]
    inputText: '',
    isRecording: false,
    isPlaying: false,
    isAiThinking: false,
  },

  onLoad(query) {
    const key = query.key || 'laozi';
    const human = DIGITAL_HUMAN_AVATARS[key];
    if (!human) {
      wx.showToast({ title: '角色不存在', icon: 'none' });
      wx.navigateBack();
      return;
    }
    this.humanKey = key;
    this.setData({ human });

    // 加载历史
    this.loadHistory();

    // 启动问候
    if (this.data.messages.length === 0) {
      this.pushMessage('assistant', `${human.fullIntro}\n\n${human.question}`, true);
    }
  },

  onUnload() {
    innerAudioContext.stop();
    if (recorderManager) {
      recorderManager.stop();
    }
  },

  loadHistory() {
    const messages = wx.getStorageSync(`yueji_dh_${this.humanKey}_history`) || [];
    this.setData({ messages });
  },

  saveHistory() {
    const recent = this.data.messages.slice(-30);
    wx.setStorageSync(`yueji_dh_${this.humanKey}_history`, recent);
  },

  pushMessage(role, content, withAudio = false) {
    const msg = { role, content, withAudio, time: todayISO() };
    this.setData({ messages: [...this.data.messages, msg] });
    this.saveHistory();
    if (withAudio && role === 'assistant') {
      this.playTTS(content);
    }
  },

  // 文字输入
  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  onSend() {
    const text = this.data.inputText.trim();
    if (!text) return;
    this.setData({ inputText: '' });
    this.askAI(text);
  },

  // 语音输入
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
        wx.showToast({ title: '录音失败', icon: 'none' });
      });
    }
    // 微信小程序录音必须用户授权
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
          success: (res) => {
            if (res.confirm) wx.openSetting();
          },
        });
      },
    });
  },

  onStopRecord() {
    if (recorderManager && this.data.isRecording) {
      recorderManager.stop();
    }
  },

  // STT: 语音转文字
  async callVoiceSTT(filePath) {
    if (!wx.cloud) {
      wx.showToast({ title: '云开发未配置', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '识别中...' });
    try {
      // 上传音频到云存储
      const uploadRes = await wx.cloud.uploadFile({ cloudPath: `voice/${Date.now()}.mp3`, filePath });
      // 调云函数 voice 做 STT
      const res = await wx.cloud.callFunction({
        name: 'voice',
        data: { action: 'stt', fileID: uploadRes.fileID },
      });
      wx.hideLoading();
      if (res.result && res.result.ok && res.result.text) {
        this.askAI(res.result.text);
      } else {
        wx.showToast({ title: '识别失败', icon: 'none' });
      }
    } catch (e) {
      wx.hideLoading();
      console.error('[悦济 STT]', e);
      wx.showToast({ title: '识别失败, 请重试', icon: 'none' });
    }
  },

  // TTS: 文字转语音
  async playTTS(text) {
    if (!wx.cloud) return;
    try {
      const res = await wx.cloud.callFunction({
        name: 'voice',
        data: { action: 'tts', text, role: this.humanKey },
      });
      if (res.result && res.result.ok && res.result.url) {
        innerAudioContext.src = res.result.url;
        innerAudioContext.play();
        this.setData({ isPlaying: true });
        innerAudioContext.onEnded(() => this.setData({ isPlaying: false }));
      }
    } catch (e) {
      console.warn('[悦济 TTS] 不可用:', e.message);
    }
  },

  // AI 调用 (复用 chat 云函数)
  async askAI(userInput) {
    // 危机检测
    const crisisKw = detectCrisis(userInput);
    if (crisisKw) {
      this.pushMessage('user', userInput, false);
      this.pushMessage('assistant', '我们注意到您可能正在经历困难时期。悦济是生活陪伴, 无法替代专业支持。请拨打 12356 全国心理援助热线, 我们陪着您。', true);
      return;
    }

    this.pushMessage('user', userInput, false);
    this.setData({ isAiThinking: true });

    // 先静态兜底
    const fallback = `${this.data.human.intro}\n\n慢慢说, 我在听。`;
    this.setData({ isAiThinking: false });
    this.pushMessage('assistant', fallback, false);

    // 再调云函数
    if (wx.cloud) {
      try {
        const history = this.data.messages
          .filter(m => m.role !== 'system')
          .slice(-16)
          .map(m => ({ role: m.role, content: m.content }));
        const res = await wx.cloud.callFunction({
          name: 'chat',
          data: { user_input: userInput, role: this.humanKey, history },
        });
        if (res.result && res.result.ok && res.result.data && res.result.data.content) {
          // 替换 fallback 那条
          const messages = [...this.data.messages];
          messages[messages.length - 1] = { role: 'assistant', content: res.result.data.content, withAudio: true, time: todayISO() };
          this.setData({ messages });
          this.saveHistory();
          this.playTTS(res.result.data.content);
        }
      } catch (e) {
        console.warn('[悦济 chat 云函数] 不可用, 保留静态:', e.message);
      }
    }
  },

  onStopTTS() {
    innerAudioContext.stop();
    this.setData({ isPlaying: false });
  },

  onClearHistory() {
    wx.showModal({
      title: '清空对话',
      content: '确定要清空跟这个数字人的对话吗?',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync(`yueji_dh_${this.humanKey}_history`);
          this.setData({ messages: [] });
          // 重新启动问候
          this.pushMessage('assistant', `${this.data.human.fullIntro}\n\n${this.data.human.question}`, true);
        }
      },
    });
  },
});
