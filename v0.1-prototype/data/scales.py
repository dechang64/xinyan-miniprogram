"""悦济 v0.5 — 3 个轻量量表数据

严守: 不构成医学建议 / 诊断, 仅供日常参考
- PHQ-9 (Patient Health Questionnaire-9): Kroenke 2001, 抑郁筛查
- GAD-7 (Generalized Anxiety Disorder-7): Spitzer 2006, 焦虑筛查
- DLQI (Dermatology Life Quality Index): Finlay 1994, 皮肤生活质量
所有量表均为公版, 中文版广为使用
"""
from datetime import date

# ══════════════════════════════════════════════════════════
#  PHQ-9 (过去 2 周)
# ══════════════════════════════════════════════════════════
PHQ9_QUESTIONS = [
    "做事时提不起兴趣或没有愉悦感",
    "感到心情低落、抑郁或无望",
    "入睡困难、睡不安稳或睡眠过多",
    "感觉疲倦或没有精力",
    "食欲不振或暴饮暴食",
    "觉得自己很失败, 或让自己或家人失望",
    "对事物专注有困难 (阅读 / 看电视时)",
    "行动或说话缓慢 / 或烦躁坐立不安",
    "有不如死掉或用某种方式伤害自己的念头",
]
# 评分 0=完全没有 1=有几天 2=超过一半 3=几乎每天
PHQ9_OPTIONS = ["完全没有", "有几天", "超过一半", "几乎每天"]
PHQ9_KEY_ITEM_9 = 8  # 0-indexed, 第 9 题 (自伤念头) — 关键指标

# 评分标准
PHQ9_LEVELS = [
    (0, 4,  "✦ 无明显抑郁",     "继续涵养, 日常节奏即良方"),
    (5, 9,  "✦ 轻度",         "留意情绪, 试着一杯热茶 / 一次散步"),
    (10, 14, "✦ 中度",         "建议寻求专业心理咨询"),
    (15, 19, "✦ 中重度",       "请重视, 尽快联系专业人士"),
    (20, 27, "✦ 重度",         "请立即寻求专业帮助"),
]


def phq9_score(scores: list) -> dict:
    """输入 9 个分数 (0-3), 返回 {total, level, advice, q9_alert}"""
    total = sum(scores)
    level_text = ""
    advice = ""
    for lo, hi, lvl, adv in PHQ9_LEVELS:
        if lo <= total <= hi:
            level_text = lvl
            advice = adv
            break
    q9 = scores[PHQ9_KEY_ITEM_9] if len(scores) > PHQ9_KEY_ITEM_9 else 0
    return {
        "total": total,
        "max": 27,
        "level": level_text,
        "advice": advice,
        "q9_alert": q9 >= 1,  # 自伤念头 ≥ 1 提示关注
    }


# ══════════════════════════════════════════════════════════
#  GAD-7 (过去 2 周)
# ══════════════════════════════════════════════════════════
GAD7_QUESTIONS = [
    "感到紧张、焦虑或烦躁",
    "无法停止或控制担忧",
    "对各种事情担心太多",
    "难以放松",
    "由于不安而无法静坐",
    "容易烦恼或急躁",
    "感到害怕, 好像将有可怕的事情发生",
]
GAD7_OPTIONS = ["完全没有", "有几天", "超过一半", "几乎每天"]

GAD7_LEVELS = [
    (0, 4,  "✦ 无明显焦虑",     "保持节奏, 涵养即良方"),
    (5, 9,  "✦ 轻度焦虑",      "试着深呼吸 / 散步 / 一杯热茶"),
    (10, 14, "✦ 中度焦虑",      "建议寻求专业咨询"),
    (15, 21, "✦ 重度焦虑",      "请尽快联系专业人士"),
]


def gad7_score(scores: list) -> dict:
    total = sum(scores)
    level_text = ""
    advice = ""
    for lo, hi, lvl, adv in GAD7_LEVELS:
        if lo <= total <= hi:
            level_text = lvl
            advice = adv
            break
    return {"total": total, "max": 21, "level": level_text, "advice": advice}


# ══════════════════════════════════════════════════════════
#  DLQI (过去 1 周, 皮肤生活质量)
# ══════════════════════════════════════════════════════════
DLQI_QUESTIONS = [
    "过去 1 周, 您的皮肤 (瘙痒 / 疼痛 / 刺痛) 对您的影响",
    "过去 1 周, 皮肤问题让您感到尴尬或自卑的程度",
    "过去 1 周, 皮肤问题对您购物 / 做家务 / 园艺的影响",
    "过去 1 周, 皮肤问题对您选择衣服方面的影响",
    "过去 1 周, 皮肤问题对您的社交或休闲活动的影响",
    "过去 1 周, 皮肤问题对您运动方面的影响",
    "过去 1 周, 皮肤问题对您工作或学习的影响",
    "过去 1 周, 皮肤问题对您与伴侣、朋友或亲戚关系的影响",
    "过去 1 周, 皮肤问题对您性生活的影响",
    "过去 1 周, 皮肤问题对您日常生活 (如洗漱 / 化妆) 的影响",
]
# DLQI: 0=没有 1=轻度 2=中度 3=较重
DLQI_OPTIONS = ["没有", "轻度", "中度", "较重"]

DLQI_LEVELS = [
    (0, 1,   "✦ 无影响",       "继续保持"),
    (2, 5,   "✦ 轻度影响",     "日常调养即可"),
    (6, 10,  "✦ 中度影响",     "建议咨询皮肤专业人士"),
    (11, 20, "✦ 重度影响",     "强烈建议专业咨询"),
    (21, 30, "✦ 极重度影响",   "请尽快寻求专业帮助"),
]


def dlqi_score(scores: list) -> dict:
    total = sum(scores)
    level_text = ""
    advice = ""
    for lo, hi, lvl, adv in DLQI_LEVELS:
        if lo <= total <= hi:
            level_text = lvl
            advice = adv
            break
    return {"total": total, "max": 30, "level": level_text, "advice": advice}


# ══════════════════════════════════════════════════════════
#  严守声明
# ══════════════════════════════════════════════════════════
SCALE_DISCLAIMER = (
    "悦济量表仅供日常参考, 不能替代专业诊断。"
    "如自评结果提示中度及以上, 或出现持续困扰、"
    "自伤念头等情况, 请务必咨询专业医生或专业人士。"
)

# PHQ-9 Q9 自伤念头 严守 banner (用户选了 ≥ 1 时强制显示)
PHQ9_Q9_CRISIS_BANNER = (
    "✦ 你刚才选了第 9 题 — 关于自伤念头。"
    "如果你正在经历这样的感受, 请你立即联系:\n"
    "• 全国心理援助热线: 12356 (24 小时)\n"
    "• 北京心理危机研究与干预中心: 010-82951332\n"
    "• 信任的家人或朋友\n\n"
    "你不需要一个人面对。悦济严守: 这是参考工具, 不是诊断, 但你的安全最重要。"
)


def phq9_q9_alert_html(scores: list) -> str:
    """返回 PHQ-9 Q9 自伤念头红色 banner HTML (用户选了 ≥ 1 时显示)"""
    if not scores or len(scores) <= PHQ9_KEY_ITEM_9:
        return ""
    q9 = scores[PHQ9_KEY_ITEM_9]
    if q9 < 1:
        return ""
    return (
        '<div style="background: #fff0f0; border-left: 4px solid #d9534f; '
        'border-radius: 6px; padding: 1rem; margin: 1rem 0; '
        'color: #a94442; font-size: 0.92rem; line-height: 1.7;">'
        '<div style="font-weight: 600; margin-bottom: 0.5rem;">⚠️ 重要提醒</div>'
        + PHQ9_Q9_CRISIS_BANNER.replace("\n", "<br>") +
        "</div>"
    )


def scale_disclaimer_html() -> str:
    """返回严守声明 HTML (放在量表顶部)"""
    return (
        '<div class="compliance-note">'
        '<strong>✦ 严守声明</strong>: ' + SCALE_DISCLAIMER +
        "<br><span style=\"color: #a94442;\">危机时刻: 全国心理援助热线 <b>12356</b> · 北京心理危机研究与干预中心 010-82951332</span>"
        "</div>"
    )


def all_scales_meta() -> dict:
    return {
        "PHQ-9": {
            "name": "心情低落自评 (PHQ-9)",
            "questions": PHQ9_QUESTIONS,
            "options": PHQ9_OPTIONS,
            "range": "0-27",
            "duration": "过去 2 周",
            "scorer": phq9_score,
            "key_alert_fn": phq9_q9_alert_html,
            "source": "Kroenke 2001 (公版)",
        },
        "GAD-7": {
            "name": "焦虑自评 (GAD-7)",
            "questions": GAD7_QUESTIONS,
            "options": GAD7_OPTIONS,
            "range": "0-21",
            "duration": "过去 2 周",
            "scorer": gad7_score,
            "key_alert_fn": None,
            "source": "Spitzer 2006 (公版)",
        },
        "DLQI": {
            "name": "皮肤生活质量 (DLQI)",
            "questions": DLQI_QUESTIONS,
            "options": DLQI_OPTIONS,
            "range": "0-30",
            "duration": "过去 1 周",
            "scorer": dlqi_score,
            "key_alert_fn": None,
            "source": "Finlay 1994 (公版)",
        },
    }
