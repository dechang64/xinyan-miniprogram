// 11_海报分享.js — 悦济 v2.3.0 镜中签 + 6 模板 canvas 2d 真生成
// 6 模板: 经典/节气/极简/文艺/水墨/现代
// canvas 2d 1080×1920 → wx.canvasToTempFilePath → wx.saveImageToPhotosAlbum
// 严守: 8 禁用词 0 出现 (海报文案预审)
const JINGWEN = require('../../utils/data_jingwen.js');
const GUOHUA = require('../../assets/cdn_urls.js').guohua;
const FOOD = require('../../assets/cdn_urls.js').food;

const TEMPLATES = [
  { id: 'classic', name: '经典', bg: '#faf6f0', accent: '#a94442', font: 'serif' },
  { id: 'jieqi', name: '节气', bg: '#f0e9dc', accent: '#4a7c59', font: 'serif' },
  { id: 'minimal', name: '极简', bg: '#ffffff', accent: '#2d3a2e', font: 'serif' },
  { id: 'wenyi', name: '文艺', bg: '#f5efe1', accent: '#c9a961', font: 'serif' },
  { id: 'shuimo', name: '水墨', bg: '#e8dfc8', accent: '#2d3a2e', font: 'serif' },
  { id: 'modern', name: '现代', bg: '#4a7c59', accent: '#faf6f0', font: 'sans-serif' },
];

// 海报画图 (核心: 6 模板 + 6 山水或 9 食材图, 文字 + 印章 + 二维码占位)
function drawPoster(ctx, sign, tpl, bgImg) {
  // 背景
  ctx.fillStyle = tpl.bg;
  ctx.fillRect(0, 0, 1080, 1920);

  // 顶部: 山水或食材图 (如果模板需要)
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, 1080, 800);
  }

  // 印章感朱砂红
  ctx.fillStyle = tpl.accent;
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('悦济', 540, 1300);

  // 经文标题
  ctx.fillStyle = tpl.accent === '#faf6f0' ? '#faf6f0' : '#2d3a2e';
  ctx.font = 'bold 64px ' + tpl.font;
  ctx.textAlign = 'center';
  ctx.fillText(sign.title, 540, 1450);

  // 经文内容 (限 60 字)
  ctx.font = '36px ' + tpl.font;
  const lines = wrapText(ctx, sign.content, 920);
  let y = 1530;
  for (const line of lines) {
    ctx.fillText(line, 540, y);
    y += 60;
  }

  // 简释
  ctx.fillStyle = '#6b6b6b';
  ctx.font = '28px ' + tpl.font;
  ctx.fillText('— 简释 —', 540, y + 40);
  y += 100;
  const jieshiLines = wrapText(ctx, sign.jieshi, 880);
  for (const line of jieshiLines) {
    ctx.fillText(line, 540, y);
    y += 50;
  }

  // 底部: 严守
  ctx.fillStyle = '#a8a29e';
  ctx.font = '24px sans-serif';
  ctx.fillText('悦济 · 滋养陪伴 · 不涉及医疗作用', 540, 1880);
}

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  let line = '';
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxWidth) {
      lines.push(line);
      line = ch;
    } else {
      line += ch;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3); // 最多 3 行
}

Page({
  data: {
    templates: TEMPLATES,
    currentTpl: 'classic',
    sign: { title: '', content: '', jieshi: '' },
    signIndex: 0,
    bgImgPath: null,  // 山水或食材图本地路径
  },

  onLoad() {
    this.loadSign();
  },

  loadSign() {
    const idx = this.data.signIndex % JINGWEN.length;
    const j = JINGWEN[idx];
    this.setData({
      sign: {
        title: j.title,
        content: (j.content || '').slice(0, 60),
        jieshi: (j.jieshi || '悦济严守解读, 滋养涵养, 不涉及医疗。').slice(0, 80),
      },
    });
    this.drawCanvas();
  },

  onPickTpl(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ currentTpl: id });
    this.drawCanvas();
  },

  onPrev() {
    this.setData({ signIndex: this.data.signIndex - 1 });
    this.loadSign();
  },

  onSave() {
    const that = this;
    wx.canvasToTempFilePath({
      canvasId: 'posterCanvas',
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => wx.showToast({ title: '已保存', icon: 'success' }),
          fail: (err) => {
            if (err.errMsg.includes('auth')) {
              wx.showModal({ title: '需要相册权限', content: '请在设置中允许', confirmText: '去设置', success: (r) => r.confirm && wx.openSetting() });
            } else {
              wx.showToast({ title: '保存失败', icon: 'none' });
            }
          },
        });
      },
      fail: () => wx.showToast({ title: '生成失败', icon: 'none' }),
    }, that);
  },

  drawCanvas() {
    const that = this;
    const query = wx.createSelectorQuery();
    query.select('#posterCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = 1080 * dpr;
        canvas.height = 1920 * dpr;
        ctx.scale(dpr, dpr);

        const tpl = TEMPLATES.find(t => t.id === that.data.currentTpl) || TEMPLATES[0];

        // 水墨 / 节气 / 现代 模板加背景图
        let bgImg = null;
        if (tpl.id === 'shuimo' || tpl.id === 'jieqi') {
          const url = Object.values(GUOHUA)[Math.floor(Math.random() * Object.values(GUOHUA).length)];
          wx.getImageInfo({ src: url, success: (r) => { drawPoster(ctx, that.data.sign, tpl, r.path); } });
        } else if (tpl.id === 'modern') {
          const url = Object.values(FOOD)[Math.floor(Math.random() * Object.values(FOOD).length)];
          wx.getImageInfo({ src: url, success: (r) => { drawPoster(ctx, that.data.sign, tpl, r.path); } });
        } else {
          drawPoster(ctx, that.data.sign, tpl, null);
        }
      });
  },
});
