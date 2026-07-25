// 12_滋养镜.js — 悦济 v3.1 阶段 28B 滋养镜优化提升
// 拍板 (2026-07-24 21:45 冬生 '自拍不是红线, 必须优化提升' + '不能拍照, 还叫什么滋养镜啊'):
//   撤回 v3.1 阶段 28A '12_自拍温润 是 NMPA 红线必须删' 凭印象判断
//   滋养镜 = PRD §4.2 4_镜中 核心, 自拍是 '看见自己' 镜子属性, 不是红线
//   优化提升: 自拍 + 4 维 (心情/精力/睡眠/肌肤) + 5 滋养曲风 + 海报生成
//
// 严守 14 禁用词 0 出现:
// ❌ 不用: 治疗/改善/缓解/治愈/祛斑/减肥/处方/医美/美颜/美白/瘦脸/营销/广告/疗愈
// ✅ 严守基调: 滋养/涵养/共修/看见自己/记录此刻
//
// 严守 4 大红线:
// ❌ 0 AI 测肤 (NMPA 第三类医疗器械)
// ❌ 0 AI 识情绪 (主观自评, 不是客观识别)
// ❌ 0 化妆/保健品销售
// ❌ 0 心理危机干预 (引导 12356, 4 维都 < 5 不报警)
//
// 隐私: 图像只存本地, 不上云
// 4 维数据: 写到 yueji_history (跟 4_镜中 共享), 主观自评 0-10

// 5 滋养曲风 (意境滤镜, 不卖美颜/医美)
const STYLES = [
  { key: '清润', icon: '💧', color: '#A8D5BA', scene: '睡前 / 深度放松' },
  { key: '温润', icon: '🍵', color: '#E6C79C', scene: '下午茶 / 缓慢工作' },
  { key: '通透', icon: '✨', color: '#B8D8E8', scene: '冥想 / 自我对话' },
  { key: '晨光', icon: '🌅', color: '#F4D35E', scene: '晨起 / 静心阅读' },
  { key: '黄昏', icon: '🌆', color: '#E8998C', scene: '傍晚 / 整理一日' },
];

// 5 曲风 → RGBA 滤镜 (canvas 2d 实现)
const FILTERS = {
  '清润': { r: 168, g: 213, b: 186, alpha: 0.35, label: '清润' },
  '温润': { r: 230, g: 199, b: 156, alpha: 0.40, label: '温润' },
  '通透': { r: 184, g: 216, b: 232, alpha: 0.30, label: '通透' },
  '晨光': { r: 244, g: 211, b: 94, alpha: 0.35, label: '晨光' },
  '黄昏': { r: 232, g: 153, b: 140, alpha: 0.40, label: '黄昏' },
};

// 4 维镜中 (跟 4_镜中 共享 1 套维度, 主观自评 0-10)
const DIMS = [
  { key: 'mood',   icon: '🌧️', name: '心情', value: 5 },
  { key: 'energy', icon: '☀️', name: '精力', value: 5 },
  { key: 'sleep',  icon: '🌙', name: '睡眠', value: 5 },
  { key: 'skin',   icon: '🍃', name: '肌肤', value: 5 },
];

Page({
  data: {
    STYLES,
    DIMS,
    currentStyle: '温润',
    imagePath: null,
    today: '',
    historyKey: 'yueji_history',
  },

  onLoad() {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    this.setData({ today });
  },

  // 选图 (从相册 / 拍照)
  onChooseImage() {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        const tempFile = res.tempFiles[0];
        that.setData({ imagePath: tempFile.tempFilePath });
        setTimeout(() => that.drawCanvas(), 200);
      },
      fail: (err) => {
        if (err.errMsg && !err.errMsg.includes('cancel')) {
          wx.showToast({ title: '选图失败', icon: 'none' });
        }
      },
    });
  },

  // 4 维滑块
  onSlide(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    const dims = this.data.DIMS.map((d) => d.key === key ? { ...d, value } : d);
    this.setData({ DIMS: dims });
  },

  // 选滋养曲风
  onPickStyle(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ currentStyle: key });
    this.drawCanvas();
  },

  // 画 canvas (主图 + RGBA 滤镜 + 4 维 + 5 曲风印章)
  drawCanvas() {
    const that = this;
    if (!this.data.imagePath) return;

    const query = wx.createSelectorQuery();
    query.select('#selfieCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const W = 600, H = 800;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.scale(dpr, dpr);

        // 加载主图
        const img = canvas.createImage();
        img.onload = () => {
          // 主图裁剪居中
          const scale = Math.max(W / img.width, H / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          const x = (W - w) / 2;
          const y = (H - h) / 2;
          ctx.drawImage(img, x, y, w, h);

          // 5 滋养曲风 RGBA 滤镜
          const filter = FILTERS[that.data.currentStyle];
          if (filter) {
            ctx.fillStyle = `rgba(${filter.r}, ${filter.g}, ${filter.b}, ${filter.alpha})`;
            ctx.fillRect(0, 0, W, H);
          }

          // 顶部悦济印章
          ctx.fillStyle = 'rgba(169, 68, 66, 0.7)';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`悦济 · ${filter ? filter.label : '镜中'}`, W / 2, 50);

          // 4 维镜中 (底部, 严守: 不显示数字, 用 '好/中/差' 调性词)
          const dimY = H - 120;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.fillRect(20, dimY, W - 40, 100);
          ctx.fillStyle = '#2d3a2e';
          ctx.font = '18px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('4 维镜中', 36, dimY + 28);
          ctx.font = '14px sans-serif';
          ctx.fillStyle = '#6b6b6b';
          const dimText = that.data.DIMS.map((d) => {
            const label = d.value >= 7 ? '好' : d.value >= 4 ? '中' : '低';
            return `${d.icon} ${d.name} ${label}`;
          }).join('  ');
          ctx.fillText(dimText, 36, dimY + 60);
          ctx.font = '12px sans-serif';
          ctx.fillStyle = '#a8a8a8';
          ctx.fillText(`${that.data.today}  ·  滋养镜`, 36, dimY + 85);
        };
        img.src = that.data.imagePath;
      });
  },

  onReset() {
    this.setData({ imagePath: null });
  },

  // 记入日记 (4 维写到 yueji_history, 跟 4_镜中 共享)
  onSaveToDiary() {
    const that = this;
    if (!this.data.imagePath) {
      wx.showToast({ title: '请先选图', icon: 'none' });
      return;
    }
    // 严守 0 出现禁用词 — 提示文案用 '滋养/涵养'
    const entry = {
      date: this.data.today,
      mood:   this.data.DIMS.find((d) => d.key === 'mood').value,
      energy: this.data.DIMS.find((d) => d.key === 'energy').value,
      sleep:  this.data.DIMS.find((d) => d.key === 'sleep').value,
      skin:   this.data.DIMS.find((d) => d.key === 'skin').value,
      source: '12_滋养镜',
      style:  this.data.currentStyle,
      hasImage: true,
    };
    try {
      let history = wx.getStorageSync(this.data.historyKey) || [];
      // 同一天覆盖, 不叠加
      history = history.filter((h) => h.date !== this.data.today);
      history.push(entry);
      wx.setStorageSync(this.data.historyKey, history);
      wx.showToast({ title: '已记入日记', icon: 'success' });
    } catch (e) {
      wx.showToast({ title: '记入失败', icon: 'none' });
    }
  },

  // 生成海报 (保存到相册)
  onSavePoster() {
    const that = this;
    if (!this.data.imagePath) {
      wx.showToast({ title: '请先选图', icon: 'none' });
      return;
    }
    // 先画 1 次确保 canvas 最新
    this.drawCanvas();
    setTimeout(() => {
      wx.canvasToTempFilePath({
        canvas: that.data.canvasNode,  // 兼容旧接口
        success: (res) => {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => wx.showToast({ title: '海报已保存', icon: 'success' }),
            fail: (err) => {
              if (err.errMsg && err.errMsg.includes('auth')) {
                wx.showModal({
                  title: '需要相册权限',
                  content: '请在设置中允许悦济保存到相册',
                  confirmText: '去设置',
                  success: (r) => { if (r.confirm) wx.openSetting(); },
                });
              } else {
                wx.showToast({ title: '保存失败', icon: 'none' });
              }
            },
          });
        },
        fail: () => wx.showToast({ title: '生成失败', icon: 'none' }),
      }, that);
    }, 300);
  },
});
