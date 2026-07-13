// 悦济 v3.0.5 — 4 类小动 5 分钟 (阶段 1.5)
// 推荐逻辑: 静态规则 (9 体质 + 镜中 4 维) + 大模型润色 (1 句为什么不评判)
// 不打卡 / 不卖装备 / 不超 5 分钟 / 不评判 / 不替代运动
// 9 体质 key 跟 data_assess.js 一致: pinghe/qixu/yangxu/yinxu/tanshi/shire/xueyu/qiyu/tebing

const MOTION_TYPES = {
  jingzuo: {
    key: 'jingzuo',
    name: '静坐',
    desc: '5 分钟静坐, 数呼吸, 不评判',
    icon: '🪷',
    color: '#a8b4be',
    duration: 5,
    steps: [
      '找一个安静的地方, 坐下',
      '脊背自然挺直, 不紧绷',
      '闭上眼, 注意力放在呼吸上',
      '吸气数 1, 呼气数 2, 数到 10 重新开始',
      '心跑掉是正常的, 拉回来就好',
    ],
  },
  lajin: {
    key: 'lajin',
    name: '拉筋',
    desc: '5 个站姿拉筋, 1 分钟 1 个',
    icon: '🌿',
    color: '#a8c8a8',
    duration: 5,
    steps: [
      '站直, 双脚与肩同宽',
      '第 1 分钟: 双手向上, 拉伸脊柱',
      '第 2 分钟: 双手扶腰, 缓慢后仰',
      '第 3 分钟: 弯腰触地, 膝盖可微屈',
      '第 4 分钟: 弓步压腿, 左右各 30 秒',
      '第 5 分钟: 缓慢起身, 深呼吸 3 次',
    ],
  },
  paida: {
    key: 'paida',
    name: '拍打',
    desc: '5 分钟拍打胆经/肝经, 释放郁结',
    icon: '💫',
    color: '#E8998C',
    duration: 5,
    steps: [
      '站直或坐下, 双手自然垂放',
      '第 1 分钟: 拍大腿外侧 (胆经), 上下 30 次',
      '第 2 分钟: 拍两肋 (肝经), 顺肋骨拍',
      '第 3 分钟: 拍肩背, 双手交叉拍',
      '第 4 分钟: 拍胸口, 力度轻柔',
      '第 5 分钟: 深呼吸 3 次, 感受身体',
    ],
  },
  huxi: {
    key: 'huxi',
    name: '呼吸',
    desc: '4-7-8 呼吸法, 4 秒吸气 7 秒屏息 8 秒呼气',
    icon: '🌙',
    color: '#B8D8E8',
    duration: 5,
    steps: [
      '找一个舒适的地方, 坐下或躺下',
      '闭上眼, 用鼻子吸气 4 秒',
      '屏住呼吸 7 秒',
      '用嘴缓慢呼气 8 秒',
      '这是 1 个循环, 共做 4 个循环',
      '最后一分钟: 自然呼吸, 感受身体',
    ],
  },
};

// 静态推荐规则: 9 体质 + 镜中 4 维 → 1 类小动
// 优先级: 镜中 4 维 > 9 体质 > 默认
function recommendMotion(tizhi, latest4) {
  const m = latest4 || {};
  if (typeof m.sleep === 'number' && m.sleep < 5) return 'huxi';
  if (typeof m.mood === 'number' && m.mood < 5) return 'paida';
  if (typeof m.energy === 'number' && m.energy < 5) return 'lajin';
  switch (tizhi) {
    case 'qiyu':
    case 'xueyu':
      return 'paida';
    case 'qixu':
    case 'tanshi':
      return 'lajin';
    case 'yangxu':
    case 'yinxu':
      return 'huxi';
    case 'tebing':
      return 'jingzuo';
    default:
      return 'jingzuo';
  }
}

// 9 体质 + 4 维 综合排序 (返回 3 类供大模型润色)
// 给大模型"选 1"用, 不是直接给用户看
function rankMotionCandidates(tizhi, latest4) {
  const primary = recommendMotion(tizhi, latest4);
  const all = ['jingzuo', 'lajin', 'paida', 'huxi'].filter(k => k !== primary);
  return [primary, ...all];
}

module.exports = { MOTION_TYPES, recommendMotion, rankMotionCandidates };
