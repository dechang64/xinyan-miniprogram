const fs = require('fs');
const wxml = fs.readFileSync('yueji-miniprogram-app/pages/0_启动页/0_启动页.wxml', 'utf8');
const js = fs.readFileSync('yueji-miniprogram-app/pages/0_启动页/0_启动页.js', 'utf8');

const wxmlBindtaps = (wxml.match(/bindtap="([a-zA-Z0-9_]+)"/g) || []).map(s => s.match(/"([^"]+)"/)[1]);
const jsOnTaps = (js.match(/^\s*(on[A-Z][a-zA-Z0-9_]*)\s*\(/gm) || []).map(s => s.match(/(on[A-Z][a-zA-Z0-9_]*)/)[1]);

console.log('wxml bindtap 名称 (' + wxmlBindtaps.length + '):');
for (const t of wxmlBindtaps) console.log('  ' + t);
console.log('js onTap 函 数 (' + jsOnTaps.length + '):');
for (const t of jsOnTaps) console.log('  ' + t);
console.log('');

console.log('wxml 有但 js 没 函 数:');
for (const t of wxmlBindtaps) {
  const exists = jsOnTaps.includes(t) || js.includes(t + ' =') || js.includes(t + '(') || js.includes(t + ' ()');
  if (!exists) console.log('  ' + t + ' (wxml bindtap 但 js 没 函 数)');
}

console.log('js 有但 wxml 没 bindtap:');
for (const t of jsOnTaps) {
  if (!wxmlBindtaps.includes(t)) console.log('  ' + t + ' (js 函 数 但 wxml 没 bindtap)');
}
