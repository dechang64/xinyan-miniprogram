"""心颜 v0.5 — 30 句自我对话金句

严守: 滋养而非治疗, 照镜子, 涵养
6 类标签: 早安 / 晚安 / 疲惫 / 焦虑 / 自卑 / 孤独
"""
import random
from datetime import date

SELF_DIALOGUE_30 = [
    # ── 早安 (5) ──
    {"id": 1, "type": "早安", "text": "今天, 试着多给自己一个微笑。"},
    {"id": 2, "type": "早安", "text": "镜子里的你, 值得被温柔以待。"},
    {"id": 3, "type": "早安", "text": "新的一天, 旧的烦恼, 让它们随风。"},
    {"id": 4, "type": "早安", "text": "今天不需要完美, 只需要真实。"},
    {"id": 5, "type": "早安", "text": "清晨的空气, 也在等你。"},

    # ── 晚安 (5) ──
    {"id": 6, "type": "晚安", "text": "今天辛苦了, 早些休息。"},
    {"id": 7, "type": "晚安", "text": "把一天的疲惫放在枕边, 让它随梦散去。"},
    {"id": 8, "type": "晚安", "text": "好好睡, 明天的你, 会感谢今晚的自己。"},
    {"id": 9, "type": "晚安", "text": "在黑暗中, 也有安静的滋养。"},
    {"id": 10, "type": "晚安", "text": "谢谢你, 一直这么努力。"},

    # ── 疲惫 (5) ──
    {"id": 11, "type": "疲惫", "text": "允许自己慢一点, 世界不会因此停转。"},
    {"id": 12, "type": "疲惫", "text": "累, 是身体在提醒你, 该歇一歇了。"},
    {"id": 13, "type": "疲惫", "text": "不必每一刻都全力以赴, 偶尔的停歇也是前进。"},
    {"id": 14, "type": "疲惫", "text": "你已经很努力了, 这就足够。"},
    {"id": 15, "type": "疲惫", "text": "先照顾好自己, 才能照顾好别人。"},

    # ── 焦虑 (5) ──
    {"id": 16, "type": "焦虑", "text": "担心解决不了未来, 只会偷走现在。"},
    {"id": 17, "type": "焦虑", "text": "深呼吸, 你在这里, 现在是安全的。"},
    {"id": 18, "type": "焦虑", "text": "把「万一」换成「就算」, 心里会松一些。"},
    {"id": 19, "type": "焦虑", "text": "焦虑是身体在说「我需要被看见」, 你被看见了。"},
    {"id": 20, "type": "焦虑", "text": "一步一步来, 不要催自己。"},

    # ── 自卑 (5) ──
    {"id": 21, "type": "自卑", "text": "你和别人不同, 这不是缺陷, 是你的光。"},
    {"id": 22, "type": "自卑", "text": "不要拿自己的短处, 去比别人的长处。"},
    {"id": 23, "type": "自卑", "text": "你看见的瑕疵, 别人可能根本看不见。"},
    {"id": 24, "type": "自卑", "text": "自信不是不自卑, 是自卑时仍能走自己的路。"},
    {"id": 25, "type": "自卑", "text": "今天, 试着原谅自己一个小缺点。"},

    # ── 孤独 (5) ──
    {"id": 26, "type": "孤独", "text": "一个人吃饭, 也可以很慢, 很好。"},
    {"id": 27, "type": "孤独", "text": "独处不是孤独, 是给自己一份礼物。"},
    {"id": 28, "type": "孤独", "text": "陪伴自己, 也是一种爱。"},
    {"id": 29, "type": "孤独", "text": "这一刻你是一个人, 也是你自己。"},
    {"id": 30, "type": "孤独", "text": "不必急, 该来的人, 会在路上。"},
]


def get_today_dialogue(today: date = None, by_type: str = None) -> dict:
    """今日自我对话 (按日期 or 类别)"""
    if by_type:
        candidates = [d for d in SELF_DIALOGUE_30 if d["type"] == by_type]
    else:
        candidates = SELF_DIALOGUE_30
    if not candidates:
        candidates = SELF_DIALOGUE_30
    if today is None:
        today = date.today()
    idx = today.timetuple().tm_yday % len(candidates)
    return candidates[idx]


def get_by_id(did: int) -> dict | None:
    for d in SELF_DIALOGUE_30:
        if d["id"] == did:
            return d
    return None


def get_all_types() -> list:
    return list(set(d["type"] for d in SELF_DIALOGUE_30))
