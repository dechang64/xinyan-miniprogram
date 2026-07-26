const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const SRC = 'C:\\Users\\decha\\.mavis\\agents\\mavis\\workspace';
const DST = path.join(SRC, 'xinyan-miniprogram', 'yueji-miniprogram-app', 'assets', 'music');

// 6 段 v1 (5 段 + 1 段 v0.7.1.9 备份)
const v1 = [
  ['matrix-media-1784009991194-b7b3fd0d.mp3', 'v3_5modes/01_gong_v1_guzheng_60bpm.mp3'],
  ['matrix-media-1784010166072-7c890709.mp3', 'v3_5modes/02_shang_v1_xiao_70bpm.mp3'],
  ['matrix-media-1784010166072-92a55a28.mp3', 'v3_5modes/03_jiao_v1_bamboo_65bpm.mp3'],
  ['matrix-media-1784010166072-ca8feb90.mp3', 'v3_5modes/04_zhi_v1_erhu_60bpm.mp3'],
  ['matrix-media-1784010166072-96df3bff.mp3', 'v3_5modes/05_yu_v1_pipa_55bpm.mp3'],
  ['matrix-media-1783422488395-f56411b2.mp3', 'v0_legacy/music_v0.7.1.9.mp3'],
];

// 25 段 v2 (在 yueji-miniprogram-app/assets/music/v3_5modes_v2/ 已下完)
const v2Dir = path.join(DST, 'v3_5modes_v2');
const v2Files = fs.readdirSync(v2Dir).filter(f => f.endsWith('.mp3'));

const zip = new AdmZip();
let total = 0;

// 6 段 v1
for (const [src, dst] of v1) {
  const srcPath = path.join(SRC, src);
  if (fs.existsSync(srcPath)) {
    zip.addLocalFile(srcPath, path.dirname(dst).replace(/\\/g, '/'));
    total++;
  } else {
    console.log('MISSING', src);
  }
}

// 25 段 v2
for (const f of v2Files) {
  const full = path.join(v2Dir, f);
  zip.addLocalFile(full, 'v3_5modes_v2');
  total++;
}

const outZip = path.join(SRC, 'xinyan-miniprogram', 'yueji-music-v3.0.5.zip');
zip.writeZip(outZip);
const stat = fs.statSync(outZip);
console.log('zip:', outZip, stat.size, 'bytes (', (stat.size/1024/1024).toFixed(2), 'MB)', 'total files:', total);
