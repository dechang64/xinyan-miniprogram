"""悦济 v0.5.2 - 联邦学习 (FL) Mock 数据

严守: FL 是"统计意义上的参考", 不构成任何医疗建议
- 不上传人脸/自拍
- 不上传裸数据 (心情分桶 / 体质标签 / 共修天数 hash, 不传具体值)
- 协议: 上传"加密标签"(E-Tag), server 端只算聚合, 不看单个 user
- 用户必须主动开启 FL 模式才生效
- v0.5.2 Mock 阶段, server 端返回模拟数据; v1.0 真接入 reading-fl SDK

灵感来源: reading-fl (https://github.com/dechang64/reading-fl) - 3 头 (Emotion / Quality / Matching) + HNSW + 区块链审计
"""
import hashlib
import random
from datetime import date


# ══════════════════════════════════════════════════════════
#  FL 严守声明
# ══════════════════════════════════════════════════════════
FL_DISCLAIMER = (
    "悦济 FL 联邦聚合仅做『统计意义上的参考』, "
    "不构成任何医学建议. "
    "严守: 不上传人脸/自拍/裸数据, "
    "server 端只算加密聚合 (E-Tag), 看不到单个 user."
)

FL_PRIVACY = (
    "✦ 严守: ❶ 数据只在本地 ❷ 上传加密标签 (心情分桶 + hash) "
    "❸ server 端看不到单个 user ❹ 默认关闭, 用户主动开才生效"
)


# ══════════════════════════════════════════════════════════
#  E-Tag 加密 (伪 FL 协议)
# ══════════════════════════════════════════════════════════
def mood_to_bucket(mood: int) -> str:
    """心情分桶 (10 档 -> 4 桶, 加噪声, FL 标准做法)"""
    if mood <= 3:
        return "low"
    elif mood <= 6:
        return "mid_low"
    elif mood <= 8:
        return "mid_high"
    else:
        return "high"


def hash_user_tag(user_id: str, salt: str = "yueji_2026") -> str:
    """用户 id + salt -> hash (FL E-Tag)"""
    return hashlib.sha256(f"{user_id}_{salt}".encode()).hexdigest()[:12]


def encrypt_mood(mood: int, user_id: str) -> dict:
    """本地: 心情 -> 加密标签"""
    return {
        "e_tag": hash_user_tag(user_id),
        "mood_bucket": mood_to_bucket(mood),
        "ts": date.today().isoformat(),
        "noise": random.randint(0, 100),
    }


# ══════════════════════════════════════════════════════════
#  Mock FL Server 端 (v0.5.2 模拟, v1.0 替换为真 reading-fl)
# ══════════════════════════════════════════════════════════
MOCK_FL_DATA = {
    "mood_by_age": {
        "20-25": {"low": 0.18, "mid_low": 0.32, "mid_high": 0.35, "high": 0.15},
        "25-30": {"low": 0.12, "mid_low": 0.28, "mid_high": 0.40, "high": 0.20},
        "30-40": {"low": 0.10, "mid_low": 0.25, "mid_high": 0.42, "high": 0.23},
        "40-50": {"low": 0.08, "mid_low": 0.22, "mid_high": 0.45, "high": 0.25},
    },
    "soup_by_tizhi_season": {
        ("yinxu", "夏"): [
            {"name": "绿豆百合汤", "votes": 1248, "fl_score": 0.92},
            {"name": "莲子心茶", "votes": 932, "fl_score": 0.88},
            {"name": "银耳莲子汤", "votes": 756, "fl_score": 0.85},
        ],
        ("yinxu", "秋"): [
            {"name": "银耳莲子汤", "votes": 1856, "fl_score": 0.95},
            {"name": "沙参玉竹老鸭汤", "votes": 1120, "fl_score": 0.90},
            {"name": "雪梨川贝盅", "votes": 893, "fl_score": 0.86},
        ],
        ("tanshi", "夏"): [
            {"name": "冬瓜薏仁汤", "votes": 1432, "fl_score": 0.93},
            {"name": "荷叶冬瓜汤", "votes": 998, "fl_score": 0.87},
            {"name": "四神汤", "votes": 712, "fl_score": 0.84},
        ],
    },
    "checkin_ranking": {
        "20-25": [
            {"rank": 1, "days": 365, "e_tag": "a1b2c3d4e5f6", "note": "神秘人 (FL 隐藏)"},
            {"rank": 2, "days": 287, "e_tag": "g7h8i9j0k1l2", "note": "共修伙伴"},
            {"rank": 3, "days": 245, "e_tag": "m3n4o5p6q7r8", "note": "无名氏"},
        ],
        "30-40": [
            {"rank": 1, "days": 412, "e_tag": "s9t0u1v2w3x4", "note": "资深共修"},
            {"rank": 2, "days": 358, "e_tag": "y5z6a7b8c9d0", "note": "悦济客"},
            {"rank": 3, "days": 312, "e_tag": "e1f2g3h4i5j6", "note": "无名氏"},
        ],
    },
}


def mock_fl_query_mood(age_group: str = "25-30") -> dict:
    """FL 联邦聚合: 同城同年龄段心情分布 (v0.5.2 mock)"""
    if age_group not in MOCK_FL_DATA["mood_by_age"]:
        age_group = "25-30"
    bucket = MOCK_FL_DATA["mood_by_age"][age_group]
    return {
        "type": "mood_distribution",
        "age_group": age_group,
        "sample_size": random.randint(800, 1500),
        "distribution": bucket,
        "interpretation": _interpret_mood_distribution(bucket),
        "privacy": "✦ 看不到单个 user, 只看分布",
    }


def _interpret_mood_distribution(bucket: dict) -> str:
    high_pct = bucket["high"] * 100
    low_pct = bucket["low"] * 100
    if high_pct >= 20 and low_pct <= 12:
        return f"✦ 同龄人中, 心情在高位的比例 {high_pct:.0f}%, 低位 {low_pct:.0f}%, 整体偏滋养"
    elif low_pct >= 15:
        return f"✦ 同龄人中, 心情在低位的比例 {low_pct:.0f}%, 较辛苦. 你不孤单, 继续涵养."
    else:
        return "✦ 同龄人心情分布较平均, 你的状态也在其中"


def mock_fl_query_soup(tizhi: str = "yinxu", season: str = "夏") -> list:
    """FL 联邦推荐: 同体质同季, 哪些汤被 FL 聚合后选最多"""
    key = (tizhi, season)
    if key not in MOCK_FL_DATA["soup_by_tizhi_season"]:
        return []
    return MOCK_FL_DATA["soup_by_tizhi_season"][key]


def mock_fl_query_checkin(age_group: str = "25-30") -> list:
    """FL 联邦排行: 同年龄段连续共修天数排行 (FL 隐藏真名)"""
    if age_group not in MOCK_FL_DATA["checkin_ranking"]:
        age_group = "25-30"
    return MOCK_FL_DATA["checkin_ranking"][age_group]
