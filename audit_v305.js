// 5+1 步 v3.0.5 静态审计 (v2.7.2.1 模板 + v3.0.5 9 commit 174 文件)
// 1) 14 禁用词 (治疗/治愈/缓解/改善/处方/医美/祛斑/减肥/美颜/美白/瘦脸/营销/广告/疗愈) 0 出现 (严守字段除外)
// 2) 严守字串刷屏 (// 严守: 0 / wxml 0 / wxss 0)
// 3) 数字开头 key ({} 里 6_xxx 触发 numeric separator)
// 4) require .json (微信小程序 require 不支持 .json)
// 5) wxss class 中文 (可能不报错, 但审计)
// 6) app.json 字段 (pages 数组 / subPackages / tabBar / window / sitemap)

const fs = require('fs');
const path = require('path');

const APP = 'C:\\Users\\decha\\.mavis\\agents\\mavis\\workspace\\xinyan-miniprogram\\yueji-miniprogram-app';

const FORBIDDEN = ['治疗', '治愈', '缓解', '改善', '处方', '医美', '祛斑', '减肥', '美颜', '美白', '瘦脸', '营销', '广告', '疗愈'];
const ALLOW_LINE = /严守:|严守:/; // 严守字段例外

let totalFiles = 0;
let pass = 0;
let warn = 0;
let fail = 0;
const issues = [];

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules') continue;
      walk(full);
    } else {
      auditFile(full);
    }
  }
}

function auditFile(full) {
  const rel = full.split('yueji-miniprogram-app\\').pop();
  if (!rel.match(/\.(js|wxml|wxss|json|wxs)$/)) return;
  totalFiles++;
  const content = fs.readFileSync(full, 'utf8');
  const lines = content.split('\n');
  let fileFail = 0;
  let fileWarn = 0;

  // 1) 14 禁用词 (在严守字串/严守注释里 OK)
  lines.forEach((line, i) => {
    for (const w of FORBIDDEN) {
      if (line.includes(w)) {
        if (line.match(ALLOW_LINE)) continue;
        issues.push({ file: rel, line: i + 1, type: 'FORBIDDEN', text: line.trim().slice(0, 80), word: w });
        fileFail++;
      }
    }
  });

  // 2) 严守字串刷屏 (js 注释 // 严守: 1 行可, 多行警告)
  let complianceCount = 0;
  lines.forEach((line) => { if (line.match(/\/\/\s*严守/)) complianceCount++; });
  if (complianceCount > 1) {
    issues.push({ file: rel, type: 'COMPLIANCE_SPAM', text: `严守字串 ${complianceCount} 次` });
    fileWarn++;
  }

  // 3) 数字开头 key (ES5 numeric separator)
  const numKey = /[{,]\s*(\d[\w]*)\s*:/g;
  let m;
  while ((m = numKey.exec(content)) !== null) {
    issues.push({ file: rel, type: 'NUMERIC_KEY', text: `key "${m[1]}" starts with digit` });
    fileFail++;
  }

  // 4) require .json (微信小程序不支持)
  if (rel.endsWith('.js') && /require\(['"][^'"]+\.json['"]\)/.test(content)) {
    issues.push({ file: rel, type: 'REQUIRE_JSON', text: 'require .json' });
    fileFail++;
  }

  // 5) wxss class 中文 (不报错, 仅警告)
  if (rel.endsWith('.wxss') || rel.endsWith('.wxml')) {
    const cnClass = /\.[\u4e00-\u9fa5]+/g;
    while ((m = cnClass.exec(content)) !== null) {
      issues.push({ file: rel, type: 'CN_CLASS', text: m[0] });
      fileWarn++;
    }
  }

  if (fileFail === 0 && fileWarn === 0) pass++;
  if (fileFail > 0) fail++;
  if (fileWarn > 0) warn++;
}

// 6) app.json 字段
function auditAppJson() {
  const appJson = path.join(APP, 'app.json');
  const j = JSON.parse(fs.readFileSync(appJson, 'utf8'));
  if (!j.pages || !Array.isArray(j.pages)) issues.push({ file: 'app.json', type: 'PAGES_MISSING' });
  if (j.subPackages === undefined) issues.push({ file: 'app.json', type: 'SUBPKG_MISSING' });
  if (j.tabBar && !j.tabBar.list) issues.push({ file: 'app.json', type: 'TABBAR_MISSING' });
  if (j.pages) console.log('app.json pages:', j.pages.length);
}

walk(APP);
auditAppJson();

console.log('=== v3.0.5 5+1 步审计 ===');
console.log('total files audited:', totalFiles);
console.log('pass:', pass);
console.log('warn:', warn);
console.log('fail:', fail);
console.log('issues:', issues.length);
if (issues.length) {
  const byType = {};
  for (const i of issues) { byType[i.type] = (byType[i.type] || 0) + 1; }
  console.log('by type:');
  for (const k of Object.keys(byType)) console.log('  ' + k + ':', byType[k]);
  console.log('\n--- 详细 (前 30) ---');
  for (const i of issues.slice(0, 30)) {
    console.log('[' + i.type + ']', i.file + (i.line ? ':' + i.line : ''), '-', i.text);
  }
}
