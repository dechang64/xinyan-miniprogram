"""心颜 v0.7.1 — page 6: 人格画像

6 tab 自评工具 (全部严守「非诊断 / 参考」):
- 🧠 MBTI: 8 题 4 维度 → 16 型
- ☯️ 八字: sxtwl 2.x 算年/月/日/时柱 + 元素分布
- ✨ 星盘: 太阳 + 月亮 + 上升 3 星座 + 元素
- 🌧️ 心情: PHQ-9 (9 题) — 心情低落自评 (Kroenke 2001, 公版)
- ⚡ 焦虑: GAD-7 (7 题) — 焦虑自评 (Spitzer 2006, 公版)
- 🧬 体质: 9 题 × 3 选 1 投票 (王琦 9 体质 2009 简化版)

严守 (核心):
- 8 禁用词 0 出现 (治疗/改善/缓解/治愈/祛斑/减肥/处方/医美/美颜/美白/瘦脸)
- 严守声明顶部, 量表/八字/星盘都标「仅供参考 / 不构成医学建议」
- PHQ-9 Q9 自伤念头 ≥ 1 → 强制红色 banner + 12356 + 北京心理危机中心
- 月亮 + 上升星座用简化估算
- 八字只算 4 柱 + 元素, 不算大运流年
- 体质只推荐票数最多的 (允许并列), 不评分判定
- 数据 100% 本地, 关浏览器即清
- 8 禁用词 0 出现
"""

import streamlit as st
from datetime import date
from core.styles import inject_css
from core.config import (
    BRAND_NAME, BRAND_TAGLINE, COMPLIANCE_DISCLAIMER,
    get_brand_header, get_footer_note, get_solar_term_strip,
)
from data.mbti import MBTI_8_QUESTIONS, MBTI_16_TYPES, score_mbti
from data.bazi import calc_bazi, TIANGAN, DIZHI, WUXING
from data.zodiac import calc_zodiac, SIGN_DESC, ELEMENTS
from data.scales import (
    PHQ9_QUESTIONS, PHQ9_OPTIONS, PHQ9_KEY_ITEM_9, phq9_score,
    GAD7_QUESTIONS, GAD7_OPTIONS, gad7_score,
    DLQI_QUESTIONS, DLQI_OPTIONS, dlqi_score,
    SCALE_DISCLAIMER, scale_disclaimer_html, phq9_q9_alert_html,
)
from data.tizhi import TIZHI_9, TIZHI_9_QUESTIONS, score_tizhi

st.set_page_config(
    page_title="人格画像 · 心颜",
    page_icon="🪞",
    layout="centered",
    initial_sidebar_state="collapsed",
)
inject_css()

# ── sidebar: 自定义中文菜单 ──
with st.sidebar:
    st.markdown("### ✨ 心颜")
    st.markdown("---")
    st.page_link("app.py", label="🏠 主页")
    st.page_link("pages/1_每日一经.py", label="📜 每日一经")
    st.page_link("pages/2_每日一汤.py", label="🍵 每日一汤")
    st.page_link("pages/3_共修堂.py", label="🌸 共修堂")
    st.page_link("pages/4_镜中.py", label="🪞 镜中")
    st.page_link("pages/6_人格画像.py", label="🪞 人格画像")
    st.page_link("pages/7_心颜之音.py", label="🎵 心颜之音")
    st.page_link("pages/5_我的.py", label="🌿 我的")
    st.markdown("---")
    st.caption("v0.7.1.3 · 2026-07-07")
    st.caption("滋养 · 涵养 · 共修")

get_brand_header()

# ── 顶部统一严守声明 ──
st.markdown(f"""
<div class="card" style="background: linear-gradient(135deg, #faf6f0, #f0e9dc); padding: 1rem; margin-bottom: 1rem;">
    <div style="color: #a94442; font-size: 0.78rem; letter-spacing: 0.2em; margin-bottom: 0.3rem;">✦ 严守</div>
    <div style="color: #2d3a2e; font-size: 0.92rem; line-height: 1.6;">
        6 个自评工具 <b>只做倾向参考</b>, 不做命理预测 / 医疗诊断 / 体质判定。<br>
        MBTI / 八字 / 星盘 / 心情 / 焦虑 / 体质 <b>全部仅供参考</b>, 个体差异请咨询专业人士。<br>
        ✦ 数据仅存你浏览器, 关浏览器即清
    </div>
</div>
""", unsafe_allow_html=True)

# ── 6 tab ──
tab_mbti, tab_bazi, tab_zodiac, tab_phq, tab_gad, tab_tizhi = st.tabs([
    "🧠 MBTI", "☯️ 八字", "✨ 星盘", "🌧️ 心情", "⚡ 焦虑", "🧬 体质"
])

# ═══════════════════════════════════════════════════════════
# Tab 1: MBTI (8 题简化版)
# ═══════════════════════════════════════════════════════════
with tab_mbti:
    st.markdown("### 🧠 MBTI 性格倾向 (8 题精简版)")
    st.caption("✦ 标准 93 题太重, 心颜用 4 维度 × 2 题, 同样有 16 型结果")

    if "mbti_answers" not in st.session_state:
        st.session_state.mbti_answers = [None] * 8

    dim_labels = [
        ("能量方向", "E 外向 ↔ I 内向"),
        ("信息获取", "S 实感 ↔ N 直觉"),
        ("决策方式", "T 思考 ↔ F 情感"),
        ("生活态度", "J 判断 ↔ P 感知"),
    ]

    for dim_idx, (dim_name, dim_hint) in enumerate(dim_labels):
        st.markdown(f"#### {dim_name}")
        st.caption(dim_hint)
        q1_idx = dim_idx * 2
        q2_idx = dim_idx * 2 + 1

        q1 = MBTI_8_QUESTIONS[q1_idx]
        q2 = MBTI_8_QUESTIONS[q2_idx]

        col1, col2 = st.columns(2)
        with col1:
            # MBTI_8_QUESTIONS 是 tuple: (question, A_text, A_label, B_text, B_label)
            q1_q = q1[0]
            q1_a_text = q1[1]
            q1_a_label = q1[2]
            q1_b_text = q1[3]
            q1_b_label = q1[4]
            st.markdown("**" + q1_q + "**")
            choice1 = st.radio(
                q1_q,
                ["A", "B"],
                format_func=lambda x, _a=q1_a_text, _b=q1_b_text: x + ". " + (_a if x == "A" else _b),
                key=f"mbti_q{q1_idx}",
                index=0 if st.session_state.mbti_answers[q1_idx] is None else (0 if st.session_state.mbti_answers[q1_idx] == 'A' else 1),
                label_visibility="collapsed",
            )
            st.session_state.mbti_answers[q1_idx] = choice1

        with col2:
            q2_q = q2[0]
            q2_a_text = q2[1]
            q2_b_text = q2[3]
            st.markdown("**" + q2_q + "**")
            choice2 = st.radio(
                q2_q,
                ["A", "B"],
                format_func=lambda x, _a=q2_a_text, _b=q2_b_text: x + ". " + (_a if x == "A" else _b),
                key=f"mbti_q{q2_idx}",
                index=0 if st.session_state.mbti_answers[q2_idx] is None else (0 if st.session_state.mbti_answers[q2_idx] == 'A' else 1),
                label_visibility="collapsed",
            )
            st.session_state.mbti_answers[q2_idx] = choice2

        st.markdown("---")

    all_answered = all(a is not None for a in st.session_state.mbti_answers)
    if all_answered:
        # 把 "A"/"B" 转换为对应字母 (E/I/S/N/T/F/J/P), 因为 MBTI_8_QUESTIONS 是 tuple
        # 索引 2 = A_label, 4 = B_label
        letters = []
        for i, choice in enumerate(st.session_state.mbti_answers):
            q = MBTI_8_QUESTIONS[i]
            if choice == "A":
                letters.append(q[2])  # A_label
            else:
                letters.append(q[4])  # B_label
        result = score_mbti(letters)
        mbti_type = result["type"]
        type_name, type_desc = MBTI_16_TYPES[mbti_type]

        st.markdown(f"""
        <div class="card" style="background: linear-gradient(135deg, #e8f0e8, #d8e6d8); text-align: center; padding: 1.5rem;">
            <div style="color: #a94442; font-size: 0.78rem; letter-spacing: 0.2em; margin-bottom: 0.5rem;">✦ 你的 MBTI</div>
            <div style="color: #2d3a2e; font-size: 2.5rem; font-weight: 300; letter-spacing: 0.15em;">{mbti_type}</div>
            <div style="color: #6b6b6b; font-size: 1rem; margin-top: 0.3rem;">{type_name}</div>
            <div style="color: #4a5a4a; font-size: 0.92rem; margin-top: 0.8rem; font-style: italic; line-height: 1.7;">"{type_desc}"</div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("#### 📊 4 维度倾向")
        for dim_key, dim_label in [("EI", "E ↔ I 能量方向"), ("SN", "S ↔ N 信息获取"), ("TF", "T ↔ F 决策方式"), ("JP", "J ↔ P 生活态度")]:
            d = result["dimensions"][dim_key]
            ratio_left = d.get("ratio_E", d.get("ratio_S", d.get("ratio_T", d.get("ratio_J", 0.5))))
            ratio_right = 1 - ratio_left
            st.progress(ratio_left, text=f"{int(ratio_left * 100)}% / {int(ratio_right * 100)}%")

        st.markdown("---")
        st.markdown("""
        <div style="text-align: center; color: #8a8a8a; font-size: 0.85rem; padding: 1rem;">
            ✦ MBTI 只做性格倾向参考, 不做命理预测 / 医疗诊断<br>
            <span style="color: #a94442;">危机时刻: 拨打 12356 心理援助热线</span>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.info("请完成所有 8 题, 即可看到你的 MBTI 倾向 ✨")

# ═══════════════════════════════════════════════════════════
# Tab 2: 八字 (四柱)
# ═══════════════════════════════════════════════════════════
with tab_bazi:
    st.markdown("### ☯️ 八字四柱 (公历生日)")
    st.caption("✦ 心颜只算年柱 / 月柱 / 日柱 / 时柱 + 元素平衡, 不算大运 / 流年 / 神煞")

    col1, col2 = st.columns(2)
    with col1:
        b_year = st.number_input("出生年", min_value=1900, max_value=2026, value=1990, step=1, key="bazi_year")
        b_month = st.number_input("出生月", min_value=1, max_value=12, value=5, step=1, key="bazi_month")
    with col2:
        b_day = st.number_input("出生日", min_value=1, max_value=31, value=15, step=1, key="bazi_day")
        b_hour = st.selectbox(
            "出生时辰",
            options=list(range(0, 24)),
            index=14,
            format_func=lambda h: f"{h:02d}:00",
            key="bazi_hour",
        )

    if st.button("✦ 算四柱", key="bazi_calc"):
        try:
            r = calc_bazi(b_year, b_month, b_day, b_hour)
            yp, mp, dp, hp = r["year_pillar"], r["month_pillar"], r["day_pillar"], r["hour_pillar"]

            st.markdown(f"""
            <div class="card" style="background: linear-gradient(135deg, #faf6f0, #f0e9dc); text-align: center; padding: 1.5rem; margin-top: 1rem;">
                <div style="color: #a94442; font-size: 0.78rem; letter-spacing: 0.2em; margin-bottom: 1rem;">✦ 你的四柱</div>
                <div style="display: flex; justify-content: space-around; align-items: center;">
                    <div><div style="color: #8a8a8a; font-size: 0.8rem;">年柱</div><div style="color: #2d3a2e; font-size: 2rem;">{yp[0]}{yp[1]}</div></div>
                    <div><div style="color: #8a8a8a; font-size: 0.8rem;">月柱</div><div style="color: #2d3a2e; font-size: 2rem;">{mp[0]}{mp[1]}</div></div>
                    <div><div style="color: #8a8a8a; font-size: 0.8rem;">日柱</div><div style="color: #2d3a2e; font-size: 2rem;">{dp[0]}{dp[1]}</div></div>
                    <div><div style="color: #8a8a8a; font-size: 0.8rem;">时柱</div><div style="color: #2d3a2e; font-size: 2rem;">{hp[0]}{hp[1]}</div></div>
                </div>
                <div style="color: #6b6b6b; font-size: 0.92rem; margin-top: 1rem;">日主: <b>{r['day_master']}</b> ({r['yin_yang']}性)</div>
            </div>
            """, unsafe_allow_html=True)

            st.markdown("#### 🌿 元素分布")
            wx = r["wuxing_count"]
            c1, c2, c3, c4, c5 = st.columns(5)
            colors = {"木": "#90c290", "火": "#e6a89c", "土": "#d4b48c", "金": "#d4d4d4", "水": "#a8c5d8"}
            icons = {"木": "🌳", "火": "🔥", "土": "🏔️", "金": "⚙️", "水": "💧"}
            for i, el in enumerate(["木", "火", "土", "金", "水"]):
                with [c1, c2, c3, c4, c5][i]:
                    st.markdown(f"""
                    <div style="background: {colors[el]}20; border: 1px solid {colors[el]}; border-radius: 8px; padding: 0.8rem; text-align: center;">
                        <div style="font-size: 1.5rem;">{icons[el]}</div>
                        <div style="color: #2d3a2e; font-size: 0.95rem; font-weight: 500;">{el}</div>
                        <div style="color: #6b6b6b; font-size: 1.2rem;">{wx[el]}</div>
                    </div>
                    """, unsafe_allow_html=True)

            st.markdown("---")
            st.markdown("""
            <div style="text-align: center; color: #8a8a8a; font-size: 0.85rem; padding: 1rem;">
                ✦ 八字只做元素平衡 + 性格倾向参考, 不算大运流年 / 不做命理预测<br>
                ✦ 心颜严守: 「滋养」而非「决定」<br>
                <span style="color: #a94442;">危机时刻: 拨打 12356 心理援助热线</span>
            </div>
            """, unsafe_allow_html=True)
        except Exception as e:
            st.error(f"计算失败: {e}")

# ═══════════════════════════════════════════════════════════
# Tab 3: 星盘 (太阳 + 月亮 + 上升 3 星座)
# ═══════════════════════════════════════════════════════════
with tab_zodiac:
    st.markdown("### ✨ 3 星座 (太阳 + 月亮 + 上升)")
    st.caption("✦ 月亮 + 上升星座用简化估算 (非精确天文计算), 仅做元素平衡参考")

    col1, col2 = st.columns(2)
    with col1:
        z_year = st.number_input("出生年", min_value=1900, max_value=2026, value=1990, step=1, key="zod_year")
        z_month = st.number_input("出生月", min_value=1, max_value=12, value=5, step=1, key="zod_month")
    with col2:
        z_day = st.number_input("出生日", min_value=1, max_value=31, value=15, step=1, key="zod_day")
        z_hour = st.selectbox(
            "出生时辰",
            options=list(range(0, 24)),
            index=14,
            format_func=lambda h: f"{h:02d}:00",
            key="zod_hour",
        )

    if st.button("✦ 算星座", key="zod_calc"):
        try:
            r = calc_zodiac(z_year, z_month, z_day, z_hour)
            sun, moon, rising = r["sun_sign"], r["moon_sign"], r["rising_sign"]

            st.markdown(f"""
            <div class="card" style="background: linear-gradient(135deg, #faf6f0, #f0e9dc); text-align: center; padding: 1.5rem; margin-top: 1rem;">
                <div style="color: #a94442; font-size: 0.78rem; letter-spacing: 0.2em; margin-bottom: 1rem;">✦ 你的 3 星座</div>
                <div style="display: flex; justify-content: space-around;">
                    <div><div style="color: #8a8a8a; font-size: 0.8rem;">☀️ 太阳</div><div style="color: #2d3a2e; font-size: 1.3rem; margin-top: 0.3rem;">{sun}</div></div>
                    <div><div style="color: #8a8a8a; font-size: 0.8rem;">🌙 月亮</div><div style="color: #2d3a2e; font-size: 1.3rem; margin-top: 0.3rem;">{moon}</div></div>
                    <div><div style="color: #8a8a8a; font-size: 0.8rem;">⬆️ 上升</div><div style="color: #2d3a2e; font-size: 1.3rem; margin-top: 0.3rem;">{rising}</div></div>
                </div>
            </div>
            """, unsafe_allow_html=True)

            st.markdown(f"#### ☀️ {sun} 关键词")
            sun_d = r["sun_desc"]
            st.markdown(f"""
            <div class="card" style="background: #fffef8; padding: 1rem; margin: 0.8rem 0;">
                <div style="color: #6b6b6b; font-size: 0.9rem;">关键词: <span style="color: #2d3a2e;">{sun_d['关键词']}</span></div>
                <div style="color: #6b6b6b; font-size: 0.9rem; margin-top: 0.4rem;">滋养提示: <span style="color: #a94442;">{sun_d['滋养提示']}</span></div>
            </div>
            """, unsafe_allow_html=True)

            st.markdown("#### 🌿 元素分布 (3 星座各占 1)")
            el = r["elements"]
            c1, c2, c3, c4 = st.columns(4)
            for i, (e_name, color, icon) in enumerate([("火", "#e6a89c", "🔥"), ("土", "#d4b48c", "🏔️"), ("风", "#a8c5d8", "🌬️"), ("水", "#90b0d0", "💧")]):
                with [c1, c2, c3, c4][i]:
                    st.markdown(f"""
                    <div style="background: {color}20; border: 1px solid {color}; border-radius: 8px; padding: 0.8rem; text-align: center;">
                        <div style="font-size: 1.5rem;">{icon}</div>
                        <div style="color: #2d3a2e; font-size: 0.95rem; font-weight: 500;">{e_name}</div>
                        <div style="color: #6b6b6b; font-size: 1.2rem;">{el[e_name]}</div>
                    </div>
                    """, unsafe_allow_html=True)

            el_max = max(el.values())
            el_dominant = [k for k, v in el.items() if v == el_max]
            if len(el_dominant) == 1 and el_max >= 2:
                _tips = {
                    "火": "热情但易燃, 滋养提醒: 留空隙降温",
                    "土": "稳定但易沉, 滋养提醒: 加点流动",
                    "风": "灵活但易散, 滋养提醒: 找一份专注",
                    "水": "柔软但易溢, 滋养提醒: 给情绪画边界",
                }
                _tip = _tips.get(el_dominant[0], "")
                st.info("💡 你的 " + el_dominant[0] + " 元素占主导 (" + str(el_max) + " 个), 注意: " + _tip)

            st.markdown("---")
            st.markdown("""
            <div style="text-align: center; color: #8a8a8a; font-size: 0.85rem; padding: 1rem;">
                ✦ 星盘只做性格 + 元素平衡参考, 不做运势预测 / 命理预测<br>
                ✦ 月亮 + 上升星座用简化估算, 精确值需天文软件<br>
                <span style="color: #a94442;">危机时刻: 拨打 12356 心理援助热线</span>
            </div>
            """, unsafe_allow_html=True)
        except Exception as e:
            st.error(f"计算失败: {e}")

# ═══════════════════════════════════════════════════════════
# Tab 4: 心情低落自评 (PHQ-9) — v0.7.1 加回来
# ═══════════════════════════════════════════════════════════
with tab_phq:
    st.markdown("### 🌧️ 心情低落自评 (PHQ-9)")
    st.caption("✦ 国际通用 9 题量表 (Kroenke 2001, 公版), 严守: 不构成医学诊断")

    st.markdown(scale_disclaimer_html(), unsafe_allow_html=True)

    if "phq9_answers" not in st.session_state:
        st.session_state.phq9_answers = [None] * 9

    st.markdown("#### 📝 过去 2 周, 你多久遇到以下情况?")
    for i, q in enumerate(PHQ9_QUESTIONS):
        choice = st.radio(
            q,
            PHQ9_OPTIONS,
            key=f"phq9_q{i}",
            index=PHQ9_OPTIONS.index(st.session_state.phq9_answers[i]) if st.session_state.phq9_answers[i] in PHQ9_OPTIONS else 0,
            horizontal=True,
        )
        st.session_state.phq9_answers[i] = choice

    all_answered = all(c is not None for c in st.session_state.phq9_answers)
    if all_answered:
        scores = [PHQ9_OPTIONS.index(c) for c in st.session_state.phq9_answers]
        result = phq9_score(scores)

        # Q9 自伤念头 → 强制红色 banner
        q9_alert = phq9_q9_alert_html(scores)
        if q9_alert:
            st.markdown(q9_alert, unsafe_allow_html=True)

        st.markdown(f"""
        <div class="card" style="background: linear-gradient(135deg, #e8f0e8, #d8e6d8); text-align: center; padding: 1.5rem;">
            <div style="color: #a94442; font-size: 0.78rem; letter-spacing: 0.2em; margin-bottom: 0.5rem;">✦ PHQ-9 结果</div>
            <div style="color: #2d3a2e; font-size: 2.5rem; font-weight: 300;">{result['total']}</div>
            <div style="color: #6b6b6b; font-size: 0.95rem;">满分 27, 参考区间</div>
            <div style="color: #2d3a2e; font-size: 1.2rem; margin-top: 0.8rem; font-weight: 500;">{result['level']}</div>
            <div style="color: #4a5a4a; font-size: 0.95rem; margin-top: 0.6rem; line-height: 1.7;">{result['advice']}</div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("---")
        st.markdown("""
        <div style="text-align: center; color: #8a8a8a; font-size: 0.85rem; padding: 1rem;">
            ✦ PHQ-9 只是参考工具, 不替代专业诊断<br>
            ✦ 数据仅存浏览器, 关浏览器即清<br>
            <span style="color: #a94442;">危机时刻: 全国心理援助热线 <b>12356</b> · 北京心理危机研究与干预中心 010-82951332</span>
        </div>
        """, unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════
# Tab 5: 焦虑自评 (GAD-7) — v0.7.1 加回来
# ═══════════════════════════════════════════════════════════
with tab_gad:
    st.markdown("### ⚡ 焦虑自评 (GAD-7)")
    st.caption("✦ 国际通用 7 题量表 (Spitzer 2006, 公版), 严守: 不构成医学诊断")

    st.markdown(scale_disclaimer_html(), unsafe_allow_html=True)

    if "gad7_answers" not in st.session_state:
        st.session_state.gad7_answers = [None] * 7

    st.markdown("#### 📝 过去 2 周, 你多久遇到以下情况?")
    for i, q in enumerate(GAD7_QUESTIONS):
        choice = st.radio(
            q,
            GAD7_OPTIONS,
            key=f"gad7_q{i}",
            index=GAD7_OPTIONS.index(st.session_state.gad7_answers[i]) if st.session_state.gad7_answers[i] in GAD7_OPTIONS else 0,
            horizontal=True,
        )
        st.session_state.gad7_answers[i] = choice

    all_answered = all(c is not None for c in st.session_state.gad7_answers)
    if all_answered:
        scores = [GAD7_OPTIONS.index(c) for c in st.session_state.gad7_answers]
        result = gad7_score(scores)

        st.markdown(f"""
        <div class="card" style="background: linear-gradient(135deg, #e8f0e8, #d8e6d8); text-align: center; padding: 1.5rem;">
            <div style="color: #a94442; font-size: 0.78rem; letter-spacing: 0.2em; margin-bottom: 0.5rem;">✦ GAD-7 结果</div>
            <div style="color: #2d3a2e; font-size: 2.5rem; font-weight: 300;">{result['total']}</div>
            <div style="color: #6b6b6b; font-size: 0.95rem;">满分 21, 参考区间</div>
            <div style="color: #2d3a2e; font-size: 1.2rem; margin-top: 0.8rem; font-weight: 500;">{result['level']}</div>
            <div style="color: #4a5a4a; font-size: 0.95rem; margin-top: 0.6rem; line-height: 1.7;">{result['advice']}</div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("---")
        st.markdown("""
        <div style="text-align: center; color: #8a8a8a; font-size: 0.85rem; padding: 1rem;">
            ✦ GAD-7 只是参考工具, 不替代专业诊断<br>
            ✦ 数据仅存浏览器, 关浏览器即清<br>
            <span style="color: #a94442;">危机时刻: 全国心理援助热线 <b>12356</b> · 北京心理危机研究与干预中心 010-82951332</span>
        </div>
        """, unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════
# Tab 6: 9 体质自评 (王琦 2009 简化版) — v0.7.1 新增
# ═══════════════════════════════════════════════════════════
with tab_tizhi:
    st.markdown("### 🧬 9 体质自评 (王琦 2009 简化版)")
    st.caption("✦ 9 题 × 3 选 1 投票, 推荐票数最多的体质, 不评分判定")

    st.markdown("""
    <div class="compliance-note">
        <strong>✦ 严守声明</strong>: 9 体质是中医专业分类, 心颜只做「倾向参考」, 不构成医学判定。
        本问卷不替代专业中医体质辨识, 个体差异请咨询专业人士。
        数据仅存浏览器, 关浏览器即清。
    </div>
    """, unsafe_allow_html=True)

    if "tizhi_answers" not in st.session_state:
        # 每个 question 默认选第一个 (平和倾向), 但 votes 会平
        st.session_state.tizhi_answers = [0] * 9

    st.markdown("#### 📝 9 题 × 3 选 1")
    for i, q_data in enumerate(TIZHI_9_QUESTIONS):
        q_text = q_data["question"]
        st.markdown("**" + q_text + "**")
        option_labels = [opt[0] for opt in q_data["options"]]
        choice_idx = st.radio(
            q_text,
            option_labels,
            key=f"tizhi_q{i}",
            index=st.session_state.tizhi_answers[i] if st.session_state.tizhi_answers[i] < len(option_labels) else 0,
            label_visibility="collapsed",
        )
        # 转成 tizhi key 存
        st.session_state.tizhi_answers[i] = option_labels.index(choice_idx)

    if st.button("✦ 看推荐体质", key="tizhi_calc"):
        # 取所有 9 题答案的体质 key
        choices = []
        for i, q_data in enumerate(TIZHI_9_QUESTIONS):
            opt_idx = st.session_state.tizhi_answers[i]
            choices.append(q_data["options"][opt_idx][1])
        result = score_tizhi(choices)

        if result["winner"]:
            tie_text = ""
            if result["is_tie"]:
                tie_names = [TIZHI_9[k][0] for k in result["tied"]]
                tie_text = f"<br><span style='color: #a94442; font-size: 0.85rem;'>（并列: {' / '.join(tie_names)}）</span>"

            st.markdown(f"""
            <div class="card" style="background: linear-gradient(135deg, #e8f0e8, #d8e6d8); text-align: center; padding: 1.5rem; margin-top: 1rem;">
                <div style="color: #a94442; font-size: 0.78rem; letter-spacing: 0.2em; margin-bottom: 0.5rem;">✦ 推荐体质</div>
                <div style="color: #2d3a2e; font-size: 2.2rem; font-weight: 300; letter-spacing: 0.1em;">{result['winner_name']}</div>
                <div style="color: #6b6b6b; font-size: 0.95rem; margin-top: 0.5rem;">{result['winner_desc']}{tie_text}</div>
            </div>
            """, unsafe_allow_html=True)

            # 票数详情
            st.markdown("#### 📊 投票详情")
            sorted_votes = sorted(result["votes"].items(), key=lambda x: -x[1])
            for tizhi_key, cnt in sorted_votes:
                name, _ = TIZHI_9[tizhi_key]
                st.progress(cnt / 9.0, text=f"{name}: {cnt} 票")

            st.markdown("---")
            st.markdown(f"""
            <div style="text-align: center; color: #8a8a8a; font-size: 0.85rem; padding: 1rem;">
                ✦ 9 体质仅供参考, 不构成医学判定<br>
                ✦ 个体差异请咨询专业中医师<br>
                ✦ 数据仅存浏览器, 关浏览器即清
            </div>
            """, unsafe_allow_html=True)
        else:
            st.error("计算失败, 请重新作答")

st.markdown("---")
st.markdown(get_footer_note(), unsafe_allow_html=True)