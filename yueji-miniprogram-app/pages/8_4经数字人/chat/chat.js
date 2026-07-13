// chat.js — 单个数字人对话页 (老子/周文王/岐伯/元神)
// v2.5.4: 删语音录音 (v1.1 加的, 没真测过端到端, 按住录音触发 "Record file not exist" 错)
// v2.5.4 留: 文字输入 + TTS 播放 + 历史记录
const { DIGITAL_HUMAN_AVATARS } = require('../../../utils/data_digital_human.js');
const { detectCrisis, todayISO } = require('../../../utils/compliance.js');

const innerAudioContext = wx.createInnerAudioContext();

Page({
  data: {
    human: null,           // 当前数字人
    messages: [],          // [{role, content, hasAudio}]
    inputText: '',
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
    // 严守: showAudio 字段 (v1.1.10 加, 避开 wxml && 表达式)
    const msg = { role, content, withAudio, showAudio: withAudio && role === 'assistant', time: todayISO() };
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

  // v2.5.4: 删语音录音 (v1.1 加的, 没真测过端到端, 按住录音触发 "Record file not exist" 错)
  // v2.6 路线再实现 (需要: 麦克风权限引导 + 录音 → STT 云函数 → 文字)

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

  // AI 调用 (v2.2.0 修重复: 拿掉静态兜底先 push, 只等云函数返回; catch 显式提示)
  async askAI(userInput) {
    // 危机检测
    const crisisKw = detectCrisis(userInput);
    if (crisisKw) {
      this.pushMessage('user', userInput, false);
      this.pushMessage('assistant', '我们注意到您可能正在经历困难时期。悦济是生活陪伴, 无法替代专业支持。请拨打 12356 全国心理援助热线, 我们陪着您。', true);
      return;
    }

    this.pushMessage('user', userInput, false);

    if (!wx.cloud) {
      this.pushMessage('assistant', '云开发未配置, 请检查 wx.cloud。', false);
      return;
    }

    this.setData({ isAiThinking: true });

    try {
      const history = this.data.messages
        .filter(m => m.role !== 'system')
        .slice(-16)
        .map(m => ({ role: m.role, content: m.content }));
      const res = await wx.cloud.callFunction({
        name: 'chat',
        data: { user_input: userInput, role: this.humanKey, history },
      });
      this.setData({ isAiThinking: false });

      if (res.result && res.result.ok && res.result.data && res.result.data.content) {
        this.pushMessage('assistant', res.result.data.content, true);
      } else {
        const errMsg = (res.result && res.result.error) || 'AI 返回为空';
        console.warn('[悦济 chat 云函数]', errMsg);
        this.pushMessage('assistant', '（暂未接住）请稍后再试, 或换个说法。', false);
      }
    } catch (e) {
      this.setData({ isAiThinking: false });
      console.error('[悦济 chat 云函数 异常]', e);
      // v2.6.0 修 P0-9: catch 显式提示 (不再静默), 跟 chat 云函数一致
      wx.showToast({ title: '云函数不可用, 请检查部署', icon: 'none', duration: 3000 });
      this.pushMessage('assistant', '（AI 暂未接住, 请检查云函数部署 / 环境变量 AI_API_KEY）', false);
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
