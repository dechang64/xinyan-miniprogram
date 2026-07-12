// 悦济 v1.0 — 30 款汤品 (从心颜 v0.1-prototype/data/soups_30.py 迁移)
// 9 体质 (王琦) × 4 季, CCTV/北中医方
// 严守: 体质仅作参考, 汤品不涉及医疗
module.exports = [
  // ── 平和 (4 款) ──
  { "name": "山药排骨汤", "tizhi": "pinghe", "season": "春", "desc": "山药 100g + 排骨 200g + 红枣 5 颗, 炖 1 小时。" },
  { "name": "莲藕排骨汤", "tizhi": "pinghe", "season": "秋", "desc": "莲藕 200g + 排骨 300g + 生姜 3 片, 炖 1.5 小时。" },
  { "name": "红枣桂圆汤", "tizhi": "pinghe", "season": "冬", "desc": "红枣 10 颗 + 桂圆肉 30g + 冰糖适量, 炖 30 分钟。" },
  { "name": "百合银耳羹", "tizhi": "pinghe", "season": "夏", "desc": "百合 50g + 银耳 1 朵 + 莲子 20g, 炖 1 小时。" },
  // ── 气虚 (3 款) ──
  { "name": "黄芪炖鸡", "tizhi": "qixu", "season": "秋", "desc": "黄芪 15g + 母鸡半只 + 生姜, 炖 2 小时。" },
  { "name": "党参瘦肉汤", "tizhi": "qixu", "season": "冬", "desc": "党参 15g + 瘦肉 200g + 枸杞, 炖 1 小时。" },
  { "name": "山药薏米粥", "tizhi": "qixu", "season": "夏", "desc": "山药 50g + 薏米 30g + 大米 50g, 煮 40 分钟。" },
  // ── 阳虚 (3 款) ──
  { "name": "当归生姜羊肉汤", "tizhi": "yangxu", "season": "冬", "desc": "当归 10g + 生姜 30g + 羊肉 250g, 炖 2 小时。" },
  { "name": "韭菜虾仁汤", "tizhi": "yangxu", "season": "春", "desc": "韭菜 100g + 虾仁 100g + 鸡蛋 1 个, 煮 15 分钟。" },
  { "name": "肉桂红糖茶", "tizhi": "yangxu", "season": "冬", "desc": "肉桂 3g + 红糖 10g, 热水冲泡 5 分钟。" },
  // ── 阴虚 (3 款) ──
  { "name": "玉竹老鸭汤", "tizhi": "yinxu", "season": "秋", "desc": "玉竹 15g + 老鸭半只 + 麦冬 10g, 炖 2 小时。" },
  { "name": "麦冬石斛茶", "tizhi": "yinxu", "season": "夏", "desc": "麦冬 10g + 石斛 5g, 热水冲泡。" },
  { "name": "银耳莲子羹", "tizhi": "yinxu", "season": "秋", "desc": "银耳 1 朵 + 莲子 30g + 冰糖, 炖 1 小时。" },
  // ── 痰湿 (3 款) ──
  { "name": "薏米红豆粥", "tizhi": "tanshi", "season": "夏", "desc": "薏米 50g + 红豆 50g, 煮 40 分钟。" },
  { "name": "荷叶冬瓜汤", "tizhi": "tanshi", "season": "夏", "desc": "荷叶 1 张 + 冬瓜 300g, 煮 20 分钟。" },
  { "name": "陈皮茯苓茶", "tizhi": "tanshi", "season": "秋", "desc": "陈皮 5g + 茯苓 10g, 热水冲泡。" },
  // ── 湿热 (3 款) ──
  { "name": "绿豆薏米汤", "tizhi": "shire", "season": "夏", "desc": "绿豆 50g + 薏米 30g, 煮 40 分钟。" },
  { "name": "苦瓜瘦肉汤", "tizhi": "shire", "season": "夏", "desc": "苦瓜 1 根 + 瘦肉 100g, 煮 20 分钟。" },
  { "name": "菊花决明子茶", "tizhi": "shire", "season": "夏", "desc": "菊花 5 朵 + 决明子 10g, 热水冲泡。" },
  // ── 血瘀 (3 款) ──
  { "name": "红花桃仁粥", "tizhi": "xueyu", "season": "春", "desc": "红花 3g + 桃仁 10g + 大米 50g, 煮 40 分钟。" },
  { "name": "玫瑰花茶", "tizhi": "xueyu", "season": "春", "desc": "玫瑰花 5 朵, 热水冲泡。" },
  { "name": "山楂红糖汤", "tizhi": "xueyu", "season": "秋", "desc": "山楂 30g + 红糖 10g, 煮 15 分钟。" },
  // ── 气郁 (3 款) ──
  { "name": "玫瑰陈皮茶", "tizhi": "qiyu", "season": "春", "desc": "玫瑰 5 朵 + 陈皮 3g, 热水冲泡。" },
  { "name": "佛手瘦肉汤", "tizhi": "qiyu", "season": "春", "desc": "佛手 10g + 瘦肉 200g, 炖 1 小时。" },
  { "name": "薄荷菊花茶", "tizhi": "qiyu", "season": "夏", "desc": "薄荷 3g + 菊花 5 朵, 热水冲泡。" },
  // ── 特禀 (3 款) ──
  { "name": "黄芪红枣汤", "tizhi": "tebing", "season": "春", "desc": "黄芪 10g + 红枣 10 颗, 煮 30 分钟。" },
  { "name": "灵芝炖鸡", "tizhi": "tebing", "season": "秋", "desc": "灵芝 5g + 母鸡半只, 炖 2 小时。" },
  { "name": "生姜红枣茶", "tizhi": "tebing", "season": "冬", "desc": "生姜 3 片 + 红枣 5 颗, 热水冲泡。" },
];
