// patch_navbar.js — 悦济 v3.0.5 阶段 3.9: 批量加 nav-bar usingComponents
// 排除: 0_启动页 (首页) + 5 个 tabBar page (showHome={{false}})
// 5 个 tabBar = 1_每日一经/2_每日一汤/4_镜中/3_共修堂/5_我的
const fs = require('fs');
const path = require('path');

const PAGES = 'C:\\Users\\decha\\.mavis\\agents\\mavis\\workspace\\xinyan-miniprogram\\yueji-miniprogram-app\\pages';
const TABBAR_PAGES = new Set(['1_每日一经', '2_每日一汤', '3_共修堂', '4_镜中', '5_我的']);
const SKIP_PAGES = new Set(['0_启动页']);

const dirEntries = fs.readdirSync(PAGES, { withFileTypes: true });
let total = 0;
let tabbarCount = 0;
let nonTabbarCount = 0;

for (const e of dirEntries) {
  if (!e.isDirectory()) continue;
  const name = e.name;
  if (SKIP_PAGES.has(name)) continue;

  const pageDir = path.join(PAGES, name);
  const jsonPath = path.join(pageDir, `${name}.json`);
  const wxmlPath = path.join(pageDir, `${name}.wxml`);

  if (!fs.existsSync(jsonPath)) continue;

  const isTabbar = TABBAR_PAGES.has(name);
  const showHome = !isTabbar;

  // 1. 改 .json
  let json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  if (!json.usingComponents) json.usingComponents = {};
  json.usingComponents['nav-bar'] = '/components/nav-bar/index';
  fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2) + '\n', 'utf8');

  // 2. 改 .wxml — 顶部插 <nav-bar title="..." showHome="{{...}}"/>
  if (fs.existsSync(wxmlPath)) {
    let wxml = fs.readFileSync(wxmlPath, 'utf8');
    // 推断 title = page 目录名 (去掉数字前缀)
    const title = name.replace(/^\d+_/, '');
    const tag = `  <!-- v3.0.5 阶段 3.9: 全局导航栏 -->\n  <nav-bar title="${title}" showHome="{{${showHome}}}" />\n\n`;

    // 在第一个 <view ...> 之后插入
    const m = wxml.match(/^(.*?<\/?(?:view|scroll-view|swiper)[^>]*>)/s);
    if (m) {
      const insertAt = m[0].length;
      wxml = wxml.slice(0, insertAt) + '\n' + tag + wxml.slice(insertAt);
      fs.writeFileSync(wxmlPath, wxml, 'utf8');
    } else {
      wxml = tag + wxml;
      fs.writeFileSync(wxmlPath, wxml, 'utf8');
    }
  }

  total++;
  if (isTabbar) tabbarCount++;
  else nonTabbarCount++;
  console.log(`  + ${name} (${isTabbar ? 'tabBar showHome=false' : 'showHome=true'})`);
}

console.log('');
console.log('Total:', total);
console.log('  tabBar pages (showHome=false):', tabbarCount);
console.log('  non-tabBar pages (showHome=true):', nonTabbarCount);
