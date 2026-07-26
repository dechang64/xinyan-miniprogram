const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const ROOT = 'C:\\Users\\decha\\.mavis\\agents\\mavis\\workspace';
const SRC_V1 = path.join(ROOT, 'xinyan-miniprogram', 'yueji-miniprogram-app', 'assets', 'music', 'v3_5modes');
const SRC_V2 = path.join(ROOT, 'xinyan-miniprogram', 'yueji-miniprogram-app', 'assets', 'music', 'v3_5modes_v2');
const SRC_V1_WS = ROOT; // workspace 根找 matrix-media-*.mp3

const zip = new AdmZip();
let total = 0;

// v1 5 段: gong/01_..., shang/02_..., jiao/03_..., zhi/04_..., yu/05_...
// v2 25 段: gong/06-10, shang/06-10, jiao/06-10, zhi/06-10, yu/06-10
const wuyueMap = {
  '01_gong_v1_guzheng_60bpm.mp3': 'gong',
  '02_shang_v1_xiao_70bpm.mp3': 'shang',
  '03_jiao_v1_bamboo_65bpm.mp3': 'jiao',
  '04_zhi_v1_erhu_60bpm.mp3': 'zhi',
  '05_yu_v1_pipa_55bpm.mp3': 'yu',
};

// 5 段 v1: 优先从 yueji-miniprogram-app/assets/music/v3_5modes 找, 找不到从 workspace matrix-media-*.mp3 找
const v1Map = {
  'matrix-media-1784009991194-b7b3fd0d.mp3': '01_gong_v1_guzheng_60bpm.mp3',
  'matrix-media-1784010166072-7c890709.mp3': '02_shang_v1_xiao_70bpm.mp3',
  'matrix-media-1784010166072-92a55a28.mp3': '03_jiao_v1_bamboo_65bpm.mp3',
  'matrix-media-1784010166072-ca8feb90.mp3': '04_zhi_v1_erhu_60bpm.mp3',
  'matrix-media-1784010166072-96df3bff.mp3': '05_yu_v1_pipa_55bpm.mp3',
};
for (const [src, dst] of Object.entries(v1Map)) {
  const srcPath = path.join(SRC_V1_WS, src);
  if (fs.existsSync(srcPath)) {
    const wu = wuyueMap[dst];
    zip.addLocalFile(srcPath, wu);
    total++;
    console.log('  v1:', src, '->', wu + '/' + dst);
  } else {
    console.log('  MISSING:', src);
  }
}

// 25 段 v2
if (fs.existsSync(SRC_V2)) {
  for (const f of fs.readdirSync(SRC_V2)) {
    if (!f.endsWith('.mp3')) continue;
    // 06_gong_..._65bpm.mp3 -> gong
    const m = f.match(/^\d+_([a-z]+)_/);
    if (!m) continue;
    const wu = m[1];
    zip.addLocalFile(path.join(SRC_V2, f), wu);
    total++;
  }
}

const outZip = path.join(ROOT, 'yueji-music-by-wuyue.zip');
if (fs.existsSync(outZip)) fs.unlinkSync(outZip);
zip.writeZip(outZip);
const stat = fs.statSync(outZip);
console.log('zip:', outZip);
console.log('  files:', total);
console.log('  size:', stat.size, '(', (stat.size/1024/1024).toFixed(2), 'MB)');
console.log('');
console.log('结构:');
for (const wu of ['gong', 'shang', 'jiao', 'zhi', 'yu']) {
  const files = zip.getEntries().filter(e => e.entryName.startsWith(wu + '/'));
  console.log('  ' + wu + ': ' + files.length + ' files');
}
