"""心颜 v0.7 — 八字四柱 简化版 (年柱 / 月柱 / 日柱 / 时柱)

严守:
- 不用「决定命运」/「命格注定」
- 叫「性格 / 倾向 / 参考」
- 输出年柱 / 月柱 / 日柱 / 时柱 4 柱 (天干 + 地支), 不算 10 神 / 大运 / 流年
- 数据只存 session_state, 关浏览器即清
- 8 禁用词 0 出现
"""

import sxtwl

# 10 天干 + 10 地支 (标准)
TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
DIZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

# 12 时辰 (2 小时一段)
SHICHEN = [
    ("23:00-01:00", "子", "23"),
    ("01:00-03:00", "丑", "01"),
    ("03:00-05:00", "寅", "03"),
    ("05:00-07:00", "卯", "05"),
    ("07:00-09:00", "辰", "07"),
    ("09:00-11:00", "巳", "09"),
    ("11:00-13:00", "午", "11"),
    ("13:00-15:00", "未", "13"),
    ("15:00-17:00", "申", "15"),
    ("17:00-19:00", "酉", "17"),
    ("19:00-21:00", "戌", "19"),
    ("21:00-23:00", "亥", "21"),
]

# 5 行 + 10 天干属性
WUXING = {
    "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土",
    "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水",
    "子": "水", "丑": "土", "寅": "木", "卯": "木", "辰": "土",
    "巳": "火", "午": "火", "未": "土", "申": "金", "酉": "金",
    "戌": "土", "亥": "水",
}

# 10 天干阴阳 (单/双)
YINYANG = {
    "甲": "阳", "乙": "阴", "丙": "阳", "丁": "阴", "戊": "阳",
    "己": "阴", "庚": "阳", "辛": "阴", "壬": "阳", "癸": "阴",
    "子": "阳", "丑": "阴", "寅": "阳", "卯": "阴", "辰": "阳",
    "巳": "阴", "午": "阳", "未": "阴", "申": "阳", "酉": "阴",
    "戌": "阳", "亥": "阴",
}

# 12 时辰范围 (小时整数 → 地支索引)
HOUR_TO_SHI_INDEX = {
    23: 0, 0: 0,  # 子
    1: 1, 2: 1,   # 丑
    3: 2, 4: 2,   # 寅
    5: 3, 6: 3,   # 卯
    7: 4, 8: 4,   # 辰
    9: 5, 10: 5,  # 巳
    11: 6, 12: 6, # 午
    13: 7, 14: 7, # 未
    15: 8, 16: 8, # 申
    17: 9, 18: 9, # 酉
    19: 10, 20: 10, # 戌
    21: 11, 22: 11, # 亥
}


def _calc_year_gan_zhi(year: int) -> tuple:
    """年柱: 1984 = 甲子年, 60 年一轮"""
    offset = (year - 1984) % 60
    if offset < 0:
        offset += 60
    gan = TIANGAN[offset % 10]
    zhi = DIZHI[offset % 12]
    return (gan, zhi)


def _calc_month_gan_zhi(year: int, month: int, day: int) -> tuple:
    """月柱: 用 sxtwl 公历转干支"""
    try:
        info = sxtwl.fromSolar(year, month, day)
        # info.getMonthGZ() 返回 GZ 对象 (tg 干索引, dz 支索引)
        gz = info.getMonthGZ()
        return (TIANGAN[gz.tg], DIZHI[gz.dz])
    except Exception as e:
        print(f"[bazi] 月柱计算失败: {e}")
        return ("?", "?")


def _calc_day_gan_zhi(year: int, month: int, day: int) -> tuple:
    """日柱: 用 sxtwl 公历算日干支"""
    try:
        info = sxtwl.fromSolar(year, month, day)
        gz = info.getDayGZ()
        return (TIANGAN[gz.tg], DIZHI[gz.dz])
    except Exception as e:
        print(f"[bazi] 日柱计算失败: {e}")
        return ("?", "?")


def _calc_hour_gan_zhi(year: int, month: int, day: int, hour: int) -> tuple:
    """时柱: 用 sxtwl.getHourGZ()"""
    try:
        info = sxtwl.fromSolar(year, month, day)
        gz = info.getHourGZ(hour)
        return (TIANGAN[gz.tg], DIZHI[gz.dz])
    except Exception as e:
        print(f"[bazi] 时柱计算失败: {e}")
        return ("?", "?")


def calc_bazi(year: int, month: int, day: int, hour: int) -> dict:
    """算 4 柱八字 (严守「参考」基调, 不宣称决定命运)

    Args:
        year/month/day/hour: 公历生日 (hour 0-23)
    Returns:
        {
            "year_pillar": ("甲", "子"),
            "month_pillar": ("丙", "寅"),
            "day_pillar": ("戊", "午"),
            "hour_pillar": ("癸", "亥"),
            "day_master": "戊",  # 日干 (命主)
            "wuxing_count": {"木": 2, "火": 1, "土": 2, "金": 1, "水": 2},
            "yin_yang": "阳"
        }
    """
    yp = _calc_year_gan_zhi(year)
    mp = _calc_month_gan_zhi(year, month, day)
    dp = _calc_day_gan_zhi(year, month, day)
    hp = _calc_hour_gan_zhi(year, month, day, hour)

    # 五行统计
    wuxing_count = {"木": 0, "火": 0, "土": 0, "金": 0, "水": 0}
    for gz in [yp, mp, dp, hp]:
        for ch in gz:
            if ch in WUXING:
                wuxing_count[WUXING[ch]] += 1

    # 日主阴阳
    day_master = dp[0]
    yin_yang = YINYANG.get(day_master, "?")

    return {
        "year_pillar": yp,
        "month_pillar": mp,
        "day_pillar": dp,
        "hour_pillar": hp,
        "day_master": day_master,
        "wuxing_count": wuxing_count,
        "yin_yang": yin_yang,
    }


# 心颜严守声明
_BAZI_COMPLIANCE = """
严守: 8 禁用词 0 出现 (治疗/改善/缓解/治愈/祛斑/减肥/处方/医美)

八字是中国传统命理文化的一部分, 心颜只做「文化参考」, 不做「命理预测」。

心颜只用做「性格倾向 + 元素平衡」自评参考, 严守:
- 不宣称决定命运
- 不替代心理咨询
- 不引导用户「必须」/「应该」
- 输出只说「倾向」/「可能」/「参考」
- 数据只存 session_state, 关浏览器即清

数据来源: sxtwl 2.x (寿星天文历, 开源天文算法库)
严守边界: 跟 v0.6.4 删 3 量表的逻辑一致 — 不做医疗/诊断, 只做滋养维度自评
"""