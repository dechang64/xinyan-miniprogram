"""心颜 v0.7 — 12 星座 + 太阳/月亮/上升 3 星座 + 元素 + 4 主题能量

严守:
- 不用「决定命运」/「命中注定」/「星座运势」
- 叫「性格倾向 / 参考」
- 只算太阳星座 (基于生日), 月亮 + 上升需要精确时间 + 出生地, 暂用默认估算
- 数据只存 session_state
- 8 禁用词 0 出现
"""

# 12 星座 (按公历日期划分)
SIGNS = [
    ("摩羯座", "Capricorn", "♑", "土", 12, 22, 1, 19),  # 12/22 - 1/19
    ("水瓶座", "Aquarius", "♒", "风", 1, 20, 2, 18),
    ("双鱼座", "Pisces", "♓", "水", 2, 19, 3, 20),
    ("白羊座", "Aries", "♈", "火", 3, 21, 4, 19),
    ("金牛座", "Taurus", "♉", "土", 4, 20, 5, 20),
    ("双子座", "Gemini", "♊", "风", 5, 21, 6, 21),
    ("巨蟹座", "Cancer", "♋", "水", 6, 22, 7, 22),
    ("狮子座", "Leo", "♌", "火", 7, 23, 8, 22),
    ("处女座", "Virgo", "♍", "土", 8, 23, 9, 22),
    ("天秤座", "Libra", "♎", "风", 9, 23, 10, 23),
    ("天蝎座", "Scorpio", "♏", "水", 10, 24, 11, 22),
    ("射手座", "Sagittarius", "♐", "火", 11, 23, 12, 21),
]

# 12 星座简短解读 (心颜「滋养」基调, 不用承诺/宿命)
SIGN_DESC = {
    "白羊座": {"关键词": "活力 / 直觉 / 开创", "滋养提示": "冲劲之后留 5 分钟深呼吸"},
    "金牛座": {"关键词": "稳重 / 感官 / 踏实", "滋养提示": "用一杯温茶替代急躁"},
    "双子座": {"关键词": "灵活 / 好奇 / 多面", "滋养提示": "一次只专注一件事"},
    "巨蟹座": {"关键词": "温柔 / 守护 / 内省", "滋养提示": "先照顾自己再照顾他人"},
    "狮子座": {"关键词": "温暖 / 创造 / 自光", "滋养提示": "允许自己不发光"},
    "处女座": {"关键词": "细致 / 秩序 / 思辨", "滋养提示": "放过不完美的部分"},
    "天秤座": {"关键词": "美感 / 平衡 / 共情", "滋养提示": "先选自己的喜欢再选他人的期待"},
    "天蝎座": {"关键词": "深邃 / 敏锐 / 转化", "滋养提示": "让情绪像水一样流过"},
    "射手座": {"关键词": "探索 / 自由 / 真诚", "滋养提示": "远方也可以在心里"},
    "摩羯座": {"关键词": "责任 / 笃定 / 攀登", "滋养提示": "允许自己慢一点也是进步"},
    "水瓶座": {"关键词": "独立 / 视野 / 革新", "滋养提示": "独处也可以是滋养"},
    "双鱼座": {"关键词": "直觉 / 梦境 / 慈悲", "滋养提示": "边界感是温柔的盔甲"},
}

# 4 元素 (火/土/风/水)
ELEMENTS = ["火", "土", "风", "水"]

# 4 元素滋养平衡 (心颜「滋养」基调)
ELEMENT_DESC = {
    "火": "热情但易燃, 滋养提醒: 留空隙降温",
    "土": "稳定但易沉, 滋养提醒: 加点流动",
    "风": "灵活但易散, 滋养提醒: 找一份专注",
    "水": "柔软但易溢, 滋养提醒: 给情绪画边界",
}

# 12 时辰 → 上升星座 (简单估算, 12 时辰对应 12 星座, 出生地用默认 0 经度 UTC)
SHICHEN_TO_RISING = {
    "子": "水瓶座",  # 23:00-01:00
    "丑": "摩羯座",
    "寅": "射手座",
    "卯": "天蝎座",
    "辰": "天秤座",
    "巳": "处女座",
    "午": "狮子座",
    "未": "巨蟹座",
    "申": "双子座",
    "酉": "金牛座",
    "戌": "白羊座",
    "亥": "双鱼座",
}


def calc_sun_sign(month: int, day: int) -> str:
    """太阳星座: 按公历生日直接查表"""
    for name, _en, _symbol, _element, m1, d1, m2, d2 in SIGNS:
        if m1 == 12 and m2 == 1:  # 跨年
            if (month == 12 and day >= d1) or (month == 1 and day <= d2):
                return name
        else:
            if (month == m1 and day >= d1) or (month == m2 and day <= d2):
                return name
    return "未知"


def calc_moon_sign(birth_year: int, birth_month: int, birth_day: int, hour: int) -> str:
    """月亮星座: 简化估算 (28 天周期 / 12 星座 ≈ 2.33 天/星座)

    真实月亮星座需要精确到秒 + 出生地经纬度, 心颜用「生日 + 出生时辰」近似估算。
    严守声明: 这是「参考值」, 不是精确天文计算。
    """
    if not SXTWL_AVAILABLE:
        # 无 sxtwl 时降级: 用 day-of-year % 12 简单哈希 (本来就只是参考)
        day_of_year = (birth_month - 1) * 30 + birth_day
        sign_idx = day_of_year % 12
        return SIGNS[sign_idx][0]

    try:
        info = sxtwl.fromSolar(birth_year, birth_month, birth_day)
        # info.getLunarDay() 农历日
        lunar_day = info.getLunarDay()
        # 估算月亮星座: 农历日 % 28 → 月相, 月相 / 12 → 月亮星座
        moon_phase_index = lunar_day % 28
        moon_sign_index = (moon_phase_index * 12) // 28
        return SIGNS[moon_sign_index][0]
    except Exception:
        return "未知"


def calc_rising_sign(hour: int) -> str:
    """上升星座: 用出生时辰简单估算 (12 时辰对应 12 星座)

    真实上升星座需要精确到秒 + 出生地经纬度, 心颜用「出生时辰」近似估算。
    严守声明: 这是「参考值」, 不是精确天文计算。
    """
    # 时辰对应
    if hour == 23 or hour == 0:
        shi = "子"
    elif hour == 1 or hour == 2:
        shi = "丑"
    elif hour == 3 or hour == 4:
        shi = "寅"
    elif hour == 5 or hour == 6:
        shi = "卯"
    elif hour == 7 or hour == 8:
        shi = "辰"
    elif hour == 9 or hour == 10:
        shi = "巳"
    elif hour == 11 or hour == 12:
        shi = "午"
    elif hour == 13 or hour == 14:
        shi = "未"
    elif hour == 15 or hour == 16:
        shi = "申"
    elif hour == 17 or hour == 18:
        shi = "酉"
    elif hour == 19 or hour == 20:
        shi = "戌"
    else:
        shi = "亥"
    return SHICHEN_TO_RISING.get(shi, "未知")


def get_sign_element(sign: str) -> str:
    """取星座的元素"""
    for name, _en, _symbol, element, *_ in SIGNS:
        if name == sign:
            return element
    return "?"


def calc_zodiac(birth_year: int, birth_month: int, birth_day: int, birth_hour: int) -> dict:
    """算太阳/月亮/上升 3 星座 + 元素分布

    Args:
        birth_year/month/day/hour: 公历出生时间
    Returns:
        {
            "sun_sign": "狮子座",
            "moon_sign": "天蝎座",
            "rising_sign": "摩羯座",
            "elements": {"火": 1, "土": 1, "风": 0, "水": 1},  # 3 星座各占 1
            "sun_desc": {"关键词": "...", "滋养提示": "..."},
        }
    """
    sun = calc_sun_sign(birth_month, birth_day)
    moon = calc_moon_sign(birth_year, birth_month, birth_day, birth_hour)
    rising = calc_rising_sign(birth_hour)

    # 元素统计 (3 星座各占 1)
    elements = {"火": 0, "土": 0, "风": 0, "水": 0}
    for s in [sun, moon, rising]:
        if s != "未知":
            el = get_sign_element(s)
            if el in elements:
                elements[el] += 1

    # 太阳星座解读
    sun_desc = SIGN_DESC.get(sun, {"关键词": "未知", "滋养提示": "无"})

    return {
        "sun_sign": sun,
        "moon_sign": moon,
        "rising_sign": rising,
        "elements": elements,
        "sun_desc": sun_desc,
    }


# 心颜严守声明
_ZODIAC_COMPLIANCE = """
严守: 8 禁用词 0 出现 (治疗/改善/缓解/治愈/祛斑/减肥/处方/医美)

星座是西方占星文化的一部分, 心颜只做「性格倾向 / 元素平衡」参考, 不做「运势预测」。

心颜只用做「性格 + 元素」自评参考, 严守:
- 不宣称决定命运
- 不预测运势 / 不说「今日吉凶」
- 不替代心理咨询
- 不引导用户「必须」/「应该」
- 输出只说「倾向」/「可能」/「参考」
- 月亮 + 上升星座用简化估算, 不是精确天文计算

数据来源: 12 星座表 (心颜自维护) + sxtwl 农历换算 (月亮星座近似估算)
严守边界: 跟 v0.6.4 删 3 量表 + v0.7 加 MBTI/八字的逻辑一致 — 不做医疗/诊断, 只做滋养维度自评
"""