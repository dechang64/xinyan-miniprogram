// 12_自拍温润.js — 悦济 v2.7.0 自拍 + 5 滋养曲风温润滤镜 (P0-1)
// 设计: 跟 v0.6.1 心颜一致, 5 预设 + 1 自定义滑块, 严守 0 出现 8 禁用词
// 自拍是图像美化, 不算医疗器械 (NMPA 第三类), 主观自评
// 隐私: 图像只存本地

const STYLES = [
  { key: '清润', icon: '💧', color: '#A8D5BA', scene: '睡前 / 深度放松' },
  { key: '温润', icon: '🍵', color: '#E6C79C', scene: '下午茶 / 缓慢工作' },
  { key: '通透', icon: '✨', color: '#B8D8E8', scene: '冥想 / 自我对话' },
  { key: '晨光', icon: '🌅', color: '#F4D35E', scene: '晨起 / 静心阅读' },
  { key: '黄昏', icon: '🌆', color: '#E8998C', scene: '傍晚 / 整理一日' },
];

// 5 曲风 → RGBA 滤镜 (PIL 复刻, canvas 2d 实现)
const FILTERS = {
  '清润': { r: 168, g: 213, b: 186, alpha: 0.35, label: '清润' },
  '温润': { r: 230, g: 199, b: 156, alpha: 0.40, label: '温润' },
  '通透': { r: 184, g: 216, b: 232, alpha: 0.30, label: '通透' },
  '晨光': { r: 244, g: 211, b: 94, alpha: 0.35, label: '晨光' },
  '黄昏': { r: 232, g: 153, b: 140, alpha: 0.40, label: '黄昏' },
};

Page({
  data: {
    STYLES,
    currentStyle: '温润',
    imagePath: null,
  },

  // 选图
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

  // 选滋养曲风
  onPickStyle(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ currentStyle: key });
    this.drawCanvas();
  },

  // 画 canvas (主图 + RGBA 滤镜覆盖)
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

          // 滋养曲风 RGBA 滤镜 (PIL 复刻)
          const filter = FILTERS[that.data.currentStyle];
          if (filter) {
            ctx.fillStyle = `rgba(${filter.r}, ${filter.g}, ${filter.b}, ${filter.alpha})`;
            ctx.fillRect(0, 0, W, H);
          }

          // 顶部悦济印章, 不出现禁用词
          ctx.fillStyle = 'rgba(169, 68, 66, 0.7)';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`悦济 · ${filter ? filter.label : '镜中'}`, W / 2, 50);
        };
        img.src = that.data.imagePath;
      });
  },

  onReset() {
    this.setData({ imagePath: null });
  },

  onSave() {
    const that = this;
    wx.canvasToTempFilePath({
      canvasId: 'selfieCanvas',
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => wx.showToast({ title: '已保存', icon: 'success' }),
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
  },
});
