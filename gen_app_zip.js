const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const ROOT = 'C:\\Users\\decha\\.mavis\\agents\\mavis\\workspace\\xinyan-miniprogram';
const APP = path.join(ROOT, 'yueji-miniprogram-app');

// 删除旧 zip
const outZip = path.join(ROOT, 'yueji-miniprogram-app-v3.0.5.zip');
if (fs.existsSync(outZip)) fs.unlinkSync(outZip);

const zip = new AdmZip();
let total = 0;
let totalSize = 0;

function walk(d, base = '') {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name);
    const rel = path.join(base, e.name).split(path.sep).join('/');
    // 排除 assets/music/* (30 段 mp3 走云存储, 不打包)
    if (rel.startsWith('assets/music/')) continue;
    if (e.isDirectory()) {
      walk(full, rel);
    } else {
      const s = fs.statSync(full);
      // rel = e.g. "pages/0_启动页/0_启动页.js" or "app.json"
      // addLocalFile 第二参: 文件在 zip 内的目录路径, 用 'rel' 去掉文件名
      const dir = rel.includes('/') ? rel.substring(0, rel.lastIndexOf('/')) : '';
      zip.addLocalFile(full, dir);
      total++;
      totalSize += s.size;
    }
  }
}

walk(APP);

zip.writeZip(outZip);
const stat = fs.statSync(outZip);
console.log('zip:', outZip);
console.log('  files:', total);
console.log('  source bytes:', totalSize);
console.log('  zip bytes:', stat.size, '(', (stat.size / 1024 / 1024).toFixed(2), 'MB )');
