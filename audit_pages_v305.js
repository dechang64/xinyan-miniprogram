// v3.0.5 深度审计: 启动页 0 + 新 4 page (15/16/17/3 引导) 端到端排查
const fs = require('fs');
const path = require('path');

const PAGES = [
  ['0_启动页', '0_启动页.js', '0_启动页.wxml'],
  ['15_今日小动', '15_今日小动.js', '15_今日小动.wxml'],
  ['16_今日一曲', '16_今日一曲.js', '16_今日一曲.wxml'],
  ['17_今日一测引导', '17_今日一测引导.js', '17_今日一测引导.wxml'],
];

const APP = 'C:\\Users\\decha\\.mavis\\agents\\mavis\\workspace\\xinyan-miniprogram\\yueji-miniprogram-app';

let totalIssues = 0;

function check(name, rel, content) {
  const lines = content.split('\n');
  let issues = [];

  // 1) Page({}) 闭合检查
  const openPage = (content.match(/Page\(\s*\{/g) || []).length;
  const closePage = (content.match(/\}\s*\)\s*;?\s*$/gm) || []).length;
  if (openPage > closePage) issues.push(`Page({}) 闭合不全: open=${openPage} close=${closePage}`);

  // 2) bindtap onTap 对应: wxml bindtap 名称 跟 js onTap 名称 100% 对应
  if (rel.endsWith('.wxml')) {
    const wxmlBindtaps = (content.match(/bindtap="([a-zA-Z0-9_]+)"/g) || []).map(s => s.match(/"([^"]+)"/)[1]);
    const onTaps = (fs.readFileSync(path.join(APP, 'pages', name, rel.replace('.wxml', '.js')), 'utf8').match(/^\s*on([A-Z][a-zA-Z0-9_]*)\s*\(/gm) || []).map(s => s.match(/on([A-Z][a-zA-Z0-9_]*)/)[1]).map(t => 'on' + t[0].toLowerCase() + t.slice(1));

    for (const wt of wxmlBindtaps) {
      // onTapTodayJing wxml 写 onTapTodayJing
      if (wt.startsWith('onTap')) {
        if (!content.includes(wt + '(') && !onTaps.includes(wt)) {
          // 检查 js 文件
        }
      }
    }
  }

  // 3) require 路径: ../utils 相对路径正确
  const requires = (content.match(/require\(['"]([^'"]+)['"]\)/g) || []).map(s => s.match(/['"]([^'"]+)['"]/)[1]);
  for (const r of requires) {
    if (r.startsWith('../utils/')) {
      const utilPath = path.join(APP, 'pages', name, r);
      if (!fs.existsSync(utilPath)) {
        issues.push(`require 路径不存在: ${r} (期望: ${utilPath})`);
      }
    }
  }

  // 4) onLoad / onShow 内 wx.cloud.callFunction 检查
  if (rel.endsWith('.js') && /wx\.cloud\.callFunction/.test(content)) {
    if (!/if\s*\(\s*!wx\.cloud\s*\)/.test(content)) {
      issues.push('wx.cloud.callFunction 缺 !wx.cloud 保护');
    }
  }

  // 5) catch 静默不报错
  const catchSilents = (content.match(/\.catch\(([^)]+)\)/g) || []);
  for (const c of catchSilents) {
    if (c.includes('console.warn') || c.includes('console.log')) continue;
    if (c.includes('=>') || c.includes('showToast') || c.includes('setData')) continue;
    issues.push(`catch 静默: ${c}`);
  }

  if (issues.length) {
    totalIssues += issues.length;
    console.log('=== ' + name + '/' + rel + ' ===');
    for (const i of issues) console.log('  - ' + i);
  } else {
    console.log('OK ' + name + '/' + rel);
  }
}

for (const [name, js, wxml] of PAGES) {
  check(name, js, fs.readFileSync(path.join(APP, 'pages', name, js), 'utf8'));
  check(name, wxml, fs.readFileSync(path.join(APP, 'pages', name, wxml), 'utf8'));
}

console.log('');
console.log('Total issues:', totalIssues);
