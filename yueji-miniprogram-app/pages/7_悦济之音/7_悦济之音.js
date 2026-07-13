// 7_悦济之音.js — 悦济 5 段滋养曲风 (v1.0 完整版)
// 5 调式: 清润/温润/通透/晨光/黄昏
// v1.0 真实音频: 5 CDN URL (hailuoai.com 7 天有效) + InnerAudioContext 播放器
// 严守: 8 禁用词 0 出现
const STYLES = [
  { key: '清润', icon: '💧', color: '#A8D5BA', scene: '睡前 / 深度放松', bpm: 60, wuxing: '水',
    url: 'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783502569_999058bb.mp3' },
  { key: '温润', icon: '🍵', color: '#E6C79C', scene: '下午茶 / 缓慢工作', bpm: 75, wuxing: '土',
    url: 'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783502616_11c7604e.mp3' },
  { key: '通透', icon: '✨', color: '#B8D8E8', scene: '冥想 / 自我对话', bpm: 85, wuxing: '金',
    url: 'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783502665_d532952c.mp3' },
  { key: '晨光', icon: '🌅', color: '#F4D35E', scene: '晨起 / 静心阅读', bpm: 70, wuxing: '木',
    url: 'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783502769_452db1d0.mp3' },
  { key: '黄昏', icon: '🌆', color: '#E8998C', scene: '傍晚 / 整理一日', bpm: 95, wuxing: '火',
    url: 'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1783502846_a9a8175e.mp3' },
];

const innerAudioContext = wx.createInnerAudioContext({
  useWebAudioImplement: false,
});
innerAudioContext.loop = true; // 循环播放

Page({
  data: {
    styles: STYLES,
    selected: '清润',
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  },

  onLoad() {
    innerAudioContext.onTimeUpdate(() => {
      const current = innerAudioContext.currentTime;
      const duration = innerAudioContext.duration || 0;
      // 严守: 整数秒, 不用 Vue 管道 (v1.1.10 改)
      this.setData({
        currentTime: current,
        duration: duration,
        timeDisplay: `${Math.floor(current)}s / ${Math.floor(duration)}s`,
        hasDuration: duration > 0,
      });
    });
    innerAudioContext.onEnded(() => {
      this.setData({ isPlaying: false });
    });
    innerAudioContext.onError((res) => {
      console.error('[悦济] 音频错误', res);
      wx.showToast({ title: '音频加载失败', icon: 'none' });
      this.setData({ isPlaying: false });
    });
  },

  onUnload() {
    innerAudioContext.stop();
  },

  onSelectStyle(e) {
    const key = e.currentTarget.dataset.key;
    const style = STYLES.find(s => s.key === key);
    if (!style) return;
    this.setData({ selected: key });
    innerAudioContext.src = style.url;
    innerAudioContext.play();
    this.setData({ isPlaying: true });
  },

  onTogglePlay() {
    if (this.data.isPlaying) {
      innerAudioContext.pause();
      this.setData({ isPlaying: false });
    } else {
      const style = STYLES.find(s => s.key === this.data.selected);
      if (style && innerAudioContext.src !== style.url) {
        innerAudioContext.src = style.url;
      }
      innerAudioContext.play();
      this.setData({ isPlaying: true });
    }
  },

  onStop() {
    innerAudioContext.stop();
    this.setData({ isPlaying: false, currentTime: 0 });
  },
});
