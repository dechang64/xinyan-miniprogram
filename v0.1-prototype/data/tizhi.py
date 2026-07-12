"""悦济 v0.7.1 — 9 体质自评 (3 选 1 × 9 题投票)

严守 (核心):
- 只做日常参考, 不构成医学建议
- 9 题每题 3 选 1, 累计投票, 推荐票数最多的体质 (允许并列)
- 不评分判定 (避免「诊断」), 只说「你可能偏 X 体质」
- 9 体质来源于王琦《中医体质分类与判定》(2009), 悦济自编简化版
- 个体差异请咨询专业人士
- 数据 100% 本地 (session_state)
- 8 禁用词 0 出现 (治疗/改善/缓解/治愈/祛斑/减肥/处方/医美/美颜/美白/瘦脸)

设计理念:
- 跟 MBTI 8 题一个量级
- 3 选 1 比 5 李克特简单, 跟用户「3 选 1」心智模型一致
- 每题都关联 3 个体质 (但不直接告诉用户是哪个), 投完统计
"""

# 9 体质 (王琦 2009, 简化版)
TIZHI_9 = {
    "pinghe":  ("平和质", "体态适中, 面色润泽, 精力充沛"),
    "qixu":     ("气虚质", "易疲乏, 说话少气, 易感冒"),
    "yangxu":   ("阳虚质", "怕冷, 手脚凉, 喜温恶寒"),
    "yinxu":    ("阴虚质", "手心热, 口燥咽干, 喜冷饮"),
    "tanshi":   ("痰湿质", "体形胖, 痰多, 面油, 舌苔厚腻"),
    "shire":    ("湿热质", "面油有痤疮, 口苦, 舌苔黄腻"),
    "xueyu":    ("血瘀质", "面色晦暗, 易瘀斑, 肤色暗沉"),
    "qiyu":     ("气郁质", "胸闷叹气, 情绪低落, 咽部异物感"),
    "teying":   ("特禀质", "过敏体质, 易过敏, 易打喷嚏"),
}

# 9 题 × 3 选 1
# 每个选项对应 1 个体质倾向 (但不直接告诉用户)
TIZHI_9_QUESTIONS = [
    {
        "question": "1. 你容易累吗?",
        "options": [
            ("很少累, 精力充沛", "pinghe"),
            ("经常累, 说话没力气, 易感冒", "qixu"),
            ("怕冷, 手脚凉, 喜欢温热", "yangxu"),
        ],
    },
    {
        "question": "2. 你手心热吗?",
        "options": [
            ("不热", "pinghe"),
            ("手心热, 口干, 喜欢冷饮", "yinxu"),
            ("手脚凉", "yangxu"),
        ],
    },
    {
        "question": "3. 你的体形?",
        "options": [
            ("适中, 不胖不瘦", "pinghe"),
            ("偏胖, 痰多, 容易油腻", "tanshi"),
            ("偏瘦, 容易烦躁", "yinxu"),
        ],
    },
    {
        "question": "4. 你的皮肤?",
        "options": [
            ("润泽, 不油不干", "pinghe"),
            ("面油有痤疮, 口苦", "shire"),
            ("面色晦暗, 易瘀斑", "xueyu"),
        ],
    },
    {
        "question": "5. 你的情绪?",
        "options": [
            ("平稳", "pinghe"),
            ("容易低落, 胸闷叹气, 咽部异物感", "qiyu"),
            ("急躁", "shire"),
        ],
    },
    {
        "question": "6. 你过敏吗?",
        "options": [
            ("很少过敏", "pinghe"),
            ("过敏体质, 易打喷嚏, 易起疹子", "teying"),
            ("偶尔过敏, 但不严重", "qixu"),
        ],
    },
    {
        "question": "7. 你的舌头 (刷牙时观察)?",
        "options": [
            ("淡红色, 薄白苔", "pinghe"),
            ("舌苔厚腻", "tanshi"),
            ("舌苔黄腻", "shire"),
        ],
    },
    {
        "question": "8. 你的睡眠?",
        "options": [
            ("好, 一觉到天亮", "pinghe"),
            ("多梦, 易醒", "qiyu"),
            ("入睡困难", "yinxu"),
        ],
    },
    {
        "question": "9. 你的大便?",
        "options": [
            ("正常, 每天 1 次成形", "pinghe"),
            ("偏黏, 不成形, 易粘马桶", "tanshi"),
            ("偏干, 便秘", "xueyu"),
        ],
    },
]


def score_tizhi(choices: list) -> dict:
    """输入 9 个选项 (每项是 tizhi key 字符串), 返回投票结果

    Args:
        choices: list of 9 个体质 key, 如 ['pinghe', 'qixu', 'yinxu', ...]
    Returns:
        {
            "votes": {"pinghe": 3, "qixu": 2, ...},
            "winner": "pinghe",
            "winner_name": "平和质",
            "winner_desc": "体态适中, 面色润泽, 精力充沛",
            "is_tie": False,
            "tied": ["pinghe", "yinxu"],  # 如果并列
        }
    """
    assert len(choices) == 9, f"必须是 9 题, 当前 {len(choices)} 题"

    votes = {}
    for c in choices:
        if c not in TIZHI_9:
            continue
        votes[c] = votes.get(c, 0) + 1

    # 找票数最多的 (允许并列)
    if not votes:
        return {
            "votes": {},
            "winner": None,
            "winner_name": None,
            "winner_desc": None,
            "is_tie": False,
            "tied": [],
        }

    max_votes = max(votes.values())
    tied = [k for k, v in votes.items() if v == max_votes]

    # 默认推荐平和质 (票数最高的那个, 并列选第一个)
    winner = tied[0]
    winner_name, winner_desc = TIZHI_9[winner]

    return {
        "votes": votes,
        "winner": winner,
        "winner_name": winner_name,
        "winner_desc": winner_desc,
        "is_tie": len(tied) > 1,
        "tied": tied,
    }


# 悦济严守声明
_TIZHI_COMPLIANCE = """
严守 (核心红线):
- ❌ 不用「决定体质」/「诊断体质」等承诺式语言
- ❌ 不用「治疗/改善/缓解/治愈/祛斑/减肥/处方/医美/美颜/美白/瘦脸」等医疗/营销词
- ✅ 只说「可能偏 X 体质」/「倾向」/「参考」
- ✅ 个体差异请咨询专业人士
- ✅ 数据仅存浏览器, 关浏览器即清

9 体质来源于王琦《中医体质分类与判定》(2009), 悦济自编简化版问卷 (9 题 × 3 选 1),
不构成医学判定, 仅供参考。
"""