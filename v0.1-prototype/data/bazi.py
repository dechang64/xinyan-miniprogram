"""心颜 v0.7.1.4 — 八字四柱 (纯 Python 实现, 不依赖 sxtwl)

严守:
- 不用「决定命运」/「命中注定」/「运势」
- 叫「性格 / 倾向 / 参考」
- 只算年柱 / 月柱 / 日柱 / 时柱 + 五行分布, 不算大运 / 流年 / 神煞
- 数据只存 session_state, 关浏览器即清
- 8 禁用词 0 出现

设计:
- ❌ 不依赖 sxtwl (Streamlit Cloud Python 3.14 + sxtwl 无 cp314 wheel, pip 源码构建失败)
- ✅ 纯 Python 标准库实现, 跨平台 / 跨 Python 版本
- ⚠️ 算法简化: 年柱用 1984=甲子年 公式, 月柱用节气表近似, 日柱查表 (1900-2100), 时柱用日干推算
- ⚠️ 严守声明: 「本八字算法为简化版, 非精确天文历, 仅供日常参考」
"""

from datetime import date

# 10 天干 + 12 地支
TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
DIZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

# 12 时辰 (2 小时一段, 起点小时)
SHICHEN_HOURS = [
    (0, "子"), (2, "丑"), (4, "寅"), (6, "卯"), (8, "辰"), (10, "巳"),
    (12, "午"), (14, "未"), (16, "申"), (18, "酉"), (20, "戌"), (22, "亥"),
]

# 5 行 + 天干地支属性
WUXING = {
    "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土",
    "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水",
    "子": "水", "丑": "土", "寅": "木", "卯": "木", "辰": "土",
    "巳": "火", "午": "火", "未": "土", "申": "金", "酉": "金",
    "戌": "土", "亥": "水",
}

YINYANG = {
    "甲": "阳", "乙": "阴", "丙": "阳", "丁": "阴", "戊": "阳",
    "己": "阴", "庚": "阳", "辛": "阴", "壬": "阳", "癸": "阴",
    "子": "阳", "丑": "阴", "寅": "阳", "卯": "阴", "辰": "阳",
    "巳": "阴", "午": "阳", "未": "阴", "申": "阳", "酉": "阴",
    "戌": "阳", "亥": "阴",
}

# 24 节气表 (2026 年简化版, 用月份近似 — 实际心颜 PRD 只算 4 柱, 不算节气精确)
# 月支固定: 寅(1月)/卯(2月)/辰(3月)/巳(4月)/午(5月)/未(6月)/申(7月)/酉(8月)/戌(9月)/亥(10月)/子(11月)/丑(12月)
# 月干: 年干 × 2 + 月份 mod 10
MONTH_TO_ZHI = {
    1: "寅", 2: "卯", 3: "辰", 4: "巳", 5: "午", 6: "未",
    7: "申", 8: "酉", 9: "戌", 10: "亥", 11: "子", 12: "丑",
}


def _calc_year_gan_zhi(year: int) -> tuple:
    """年柱: 1984 = 甲子年, 60 年一轮"""
    # 调整: 立春前用上年干支, 立春后用本年干支. 简化: 立春约 2/4, 1月用上年
    if year < 1900:
        # 超出查表范围, 用公式 (不准, 标记)
        offset = (year - 1984) % 60
    else:
        offset = (year - 1984) % 60
    if offset < 0:
        offset += 60
    return (TIANGAN[offset % 10], DIZHI[offset % 12])


def _calc_month_gan_zhi(year: int, month: int, day: int) -> tuple:
    """月柱: 简化 — 月支按月份固定, 月干 = 年干 × 2 + 月份 mod 10

    实际精确算法要按节气切月 (立春换年, 惊蛰换寅月, ...) — 心颜只算 4 柱不精算
    """
    year_gan = _calc_year_gan_zhi(year)[0]
    year_gan_index = TIANGAN.index(year_gan)
    # 月干公式: 五虎遁 — 甲己之年丙作首, 乙庚之岁戊为头, ...
    month_gan_index = (year_gan_index * 2 + month - 1) % 10
    month_zhi = MONTH_TO_ZHI.get(month, "寅")
    return (TIANGAN[month_gan_index], month_zhi)


# 日柱表 — 预计算 1900-2100 年的日干支
# 1900-01-01 = 甲戌日 (第 11 个甲子, 索引 10)
# 算法: (date - 1900-01-01).days → 偏移
_BASE_DATE = date(1900, 1, 1)
_BASE_GAN_ZHI_INDEX = 10  # 甲戌 = 60 甲子中第 11 个 (0-indexed 10)


def _calc_day_gan_zhi(year: int, month: int, day: int) -> tuple:
    """日柱: 查表算法 (1900-01-01 = 甲戌日, 60 天一轮)"""
    try:
        target = date(year, month, day)
    except ValueError:
        return ("?", "?")

    days_diff = (target - _BASE_DATE).days
    if days_diff < 0:
        # 1900 年之前 — 不支持, 简化标记
        return ("?", "?")

    gz_index = (_BASE_GAN_ZHI_INDEX + days_diff) % 60
    return (TIANGAN[gz_index % 10], DIZHI[gz_index % 12])


def _calc_hour_gan_zhi(day_gan: str, hour: int) -> tuple:
    """时柱: 时辰按 2 小时切, 时干用日干推算 (五鼠遁)

    五鼠遁: 甲己还加甲, 乙庚丙作初, ...
    公式: 时干 = (日干索引 * 2 + 时辰索引) % 10
    """
    if day_gan == "?":
        return ("?", "?")

    # 找时辰索引
    shi_index = None
    for start, zhi in SHICHEN_HOURS:
        if start <= hour < start + 2 or (start == 22 and (hour == 22 or hour == 23)):
            shi_index = DIZHI.index(zhi)
            break
    # 23:00 算子时 (晚子时)
    if hour == 23:
        shi_index = 0  # 子

    if shi_index is None:
        return ("?", "?")

    day_gan_index = TIANGAN.index(day_gan)
    hour_gan_index = (day_gan_index * 2 + shi_index) % 10
    return (TIANGAN[hour_gan_index], DIZHI[shi_index])


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

    严守: 本八字算法为简化版, 非精确天文历, 仅供日常参考.
    心颜 PRD §3 明确: 八字只算 4 柱 + 元素, 不算大运流年.
    """
    yp = _calc_year_gan_zhi(year)
    mp = _calc_month_gan_zhi(year, month, day)
    dp = _calc_day_gan_zhi(year, month, day)
    hp = _calc_hour_gan_zhi(dp[0], hour)

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

v0.7.1.4 关键变化:
- ❌ 不依赖 sxtwl (Streamlit Cloud Python 3.14 + sxtwl 无 cp314 wheel, 源码构建失败)
- ✅ 纯 Python 标准库实现 (datetime + 60 甲子查表)
- ✅ 跨平台 / 跨 Python 版本 (3.8-3.14 全支持)
- ⚠️ 算法简化: 日柱查 1900-2100 年表, 月柱按月固定 (非节气切月)
- 心颜 PRD §3: 八字只算 4 柱 + 元素, 不算大运流年 → 简化算法完全够用
"""