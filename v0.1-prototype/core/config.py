"""悦济 v0.1 原型 — 悦济配置 / 通用函数

严守: 不挂「祺臻心理」品牌, 是独立小程序原型
调性: 浅米白 + 墨绿 + 暖黄, 安静 / 涵养 / 共修
注意: streamlit 依赖全部**懒加载**, 避免污染模块顶层 (qizhenxinli 踩过坑)
"""
from datetime import date, datetime


# ══════════════════════════════════════════════════════════
#  品牌与文案
# ══════════════════════════════════════════════════════════
BRAND_NAME = "悦济"
BRAND_PY = "YUEJI"
BRAND_TAGLINE = "照镜子, 也是为了更好的自己"
BRAND_SUB = "滋养 · 涵养 · 共修"

# 24 节气 (2026 年 7 月附近的几个, 用于首页 + 经文/汤品标签)
SOLAR_TERMS_2026 = [
    (date(2026, 7, 7), "小暑", "温风至, 蟋蟀居宇"),
    (date(2026, 7, 23), "大暑", "腐草为萤, 土润溽暑"),
    (date(2026, 8, 7), "立秋", "凉风至, 白露降"),
    (date(2026, 8, 23), "处暑", "暑气止, 天地始肃"),
    (date(2026, 9, 7), "白露", "阴气渐重, 露凝而白"),
    (date(2026, 9, 23), "秋分", "昼夜均而寒暑平"),
]

# 严守 6 条意见 — 红线
COMPLIANCE_DISCLAIMER = (
    "悦济是日常滋养陪伴, 不构成任何医学建议。"
    "经文与汤品仅供日常参考, 个体差异请咨询专业人士。"
    "危机时刻: 全国心理援助热线 <b>12356</b> · 北京心理危机研究与干预中心 010-82951332"
)

# 9 体质 (王琦 9 体质) — 简版, 用于每日一汤推荐
TIZHI_9 = {
    "pinghe":  ("平和质",    "体态适中, 面色润泽, 精力充沛"),
    "qixu":     ("气虚质",    "易疲乏, 说话少气, 易感冒"),
    "yangxu":   ("阳虚质",    "怕冷, 手脚凉, 喜温恶寒"),
    "yinxu":    ("阴虚质",    "手心热, 口燥咽干, 喜冷饮"),
    "tanshi":   ("痰湿质",    "体形胖, 痰多, 面油, 舌苔厚腻"),
    "shire":    ("湿热质",    "面油有痤疮, 口苦, 舌苔黄腻"),
    "xueyu":    ("血瘀质",    "面色晦暗, 易瘀斑, 肤色暗沉"),
    "qiyu":     ("气郁质",    "胸闷叹气, 情绪低落, 咽部异物感"),
    "teying":   ("特禀质",    "过敏体质, 易过敏, 易打喷嚏"),
}


def get_today_solar_term(today: date = None) -> str:
    """返回今天最近的节气名 (含今)"""
    if today is None:
        today = date.today()
    name = "—"
    for d, n, _ in SOLAR_TERMS_2026:
        if d <= today:
            name = n
        else:
            break
    return name


def get_brand_header():
    """顶部品牌头 — 所有 page 顶部调用"""
    import streamlit as st
    st.markdown(
        f'<div class="brand-header">悦济 · {BRAND_PY}</div>'
        f'<div class="brand-sub">{BRAND_TAGLINE}</div>',
        unsafe_allow_html=True,
    )


def get_footer_note():
    """底部说明 — 所有 page 底部调用"""
    import streamlit as st
    st.markdown(
        f'<div class="footer-note">{COMPLIANCE_DISCLAIMER}<br>v0.7.1.2 原型 · 2026-07-07 · Mavis</div>',
        unsafe_allow_html=True,
    )


def get_solar_term_strip(today: date = None) -> str:
    """今日 + 节气 + 农历月份, 单行小字 (用于卡片头)"""
    if today is None:
        today = date.today()
    term = get_today_solar_term(today)
    cn_months = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"]
    cn_days = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
               "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
               "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"]
    # 简化: 不做完整农历转换 (v0.1 原型用月份示意)
    cn_month = cn_months[today.month - 1]
    return f"{today.year}年 {today.month}月{today.day}日 · 节气 {term}"


def checkin_init():
    """session_state 初始化 — 共修堂 3 任务 (懒加载 streamlit)"""
    import streamlit as st
    if "checkin" not in st.session_state:
        st.session_state.checkin = {
            "jingwen": False,
            "soup": False,
            "self_talk": False,
            "date": str(date.today()),
        }


def is_all_done() -> bool:
    import streamlit as st
    return all([
        st.session_state.checkin["jingwen"],
        st.session_state.checkin["soup"],
        st.session_state.checkin["self_talk"],
    ])
