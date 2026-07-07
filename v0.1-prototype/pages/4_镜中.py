"""心颜 v0.5 — page 4: 镜中 (核心情感 — 照镜子, 也是为了更好的自己)

7 个区块:
1. 4 滑块自评 (心情/精力/睡眠/肌肤) + 保存
2. 30 天心情曲线 (altair, session_state 累积)
3. PHQ-9 量表 (9 题, 弹出式)
4. GAD-7 量表 (7 题, 弹出式)
5. DLQI 量表 (10 题, 弹出式)
6. 今日自我对话 (6 类标签筛选)
7. 「给 3 个月后的自己」彩蛋 (本地 session_state)

严守 6 条意见: 滋养而非治疗, 照镜子, 不诊断
"""
import streamlit as st
import pandas as pd
import altair as alt
from datetime import date, datetime, timedelta
from core.styles import inject_css
from core.config import (
    get_brand_header, get_footer_note, get_solar_term_strip,
    checkin_init, COMPLIANCE_DISCLAIMER,
)
from data.scales import (
    PHQ9_QUESTIONS, PHQ9_OPTIONS, PHQ9_LEVELS, phq9_score,
    GAD7_QUESTIONS, GAD7_OPTIONS, GAD7_LEVELS, gad7_score,
    DLQI_QUESTIONS, DLQI_OPTIONS, DLQI_LEVELS, dlqi_score,
    SCALE_DISCLAIMER, all_scales_meta,
)
from data.self_dialogue import get_today_dialogue, SELF_DIALOGUE_30

st.set_page_config(page_title="镜中 · 心颜", page_icon="🪞", layout="centered")
inject_css()
checkin_init()

# ── sidebar ──
with st.sidebar:
    st.markdown("### ✨ 心颜 · 照镜子")
    st.page_link("app.py", label="🏠 主页")
    st.page_link("pages/1_每日一经.py", label="📜 每日一经")
    st.page_link("pages/2_每日一汤.py", label="🍵 每日一汤")
    st.page_link("pages/3_共修堂.py", label="🌸 共修堂")
    st.page_link("pages/4_镜中.py", label="🪞 镜中")
    st.markdown("---")
    st.caption("v0.5 · 2026-07-06")

# ── brand header ──
get_brand_header()

# ══════════════════════════════════════════════════════════
#  🪞 核心情感 hero
# ══════════════════════════════════════════════════════════
st.markdown("""
<div style="text-align: center; padding: 1.5rem 0 0.5rem 0;">
    <div style="color: #4a7c59; font-size: 1.3rem; font-weight: 500; letter-spacing: 0.15em;">🪞 镜中</div>
    <div style="color: #2d3a2e; font-size: 0.95rem; font-style: italic; margin-top: 0.5rem;">
        镜中, 是正在成为自己的你
    </div>
</div>
""", unsafe_allow_html=True)

# 今日自对话 (顶置)
today_dlg = get_today_dialogue()
st.markdown(f"""
<div class="card" style="background: linear-gradient(135deg, #faf6f0, #f0e9dc); text-align: center; padding: 1.2rem;">
    <div style="color: #a94442; font-size: 0.78rem; letter-spacing: 0.3em; margin-bottom: 0.4rem;">✦ 今日自对话 · {today_dlg['type']}</div>
    <div style="color: #2d3a2e; font-size: 1.15rem; line-height: 1.6; font-family: 'Source Han Serif SC', serif;">「{today_dlg['text']}」</div>
</div>
""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════
#  区块 1: 4 滑块自评
# ══════════════════════════════════════════════════════════
st.markdown("---")
st.markdown("### 🪞 镜中自评 (今日)")
st.caption("为今天的自己打个分, 1-10. 10 是最好状态")

# 初始化 session_state
if "mirror_history" not in st.session_state:
    st.session_state.mirror_history = []  # [{date, mood, energy, sleep, skin}, ...]
if "mirror_today_saved" not in st.session_state:
    st.session_state.mirror_today_saved = None

today_str = date.today().isoformat()

c1, c2 = st.columns(2)
with c1:
    mood = st.slider("🌿 心情", 1, 10, 7, key="sl_mood")
    sleep = st.slider("🌙 睡眠", 1, 10, 7, key="sl_sleep")
with c2:
    energy = st.slider("⚡ 精力", 1, 10, 7, key="sl_energy")
    skin = st.slider("🌸 肌肤感受", 1, 10, 7, key="sl_skin")

avg = (mood + energy + sleep + skin) / 4
st.markdown(f"""
<div style="text-align: center; padding: 0.8rem; color: #4a7c59;">
    今日总分: <strong style="font-size: 1.4rem;">{avg:.1f}</strong> / 10
</div>
""", unsafe_allow_html=True)

if st.button("✨ 记下今日自评", use_container_width=True, type="primary"):
    # 检查今天是否已存
    existing_idx = None
    for i, h in enumerate(st.session_state.mirror_history):
        if h["date"] == today_str:
            existing_idx = i
            break
    new_entry = {
        "date": today_str,
        "mood": mood, "energy": energy, "sleep": sleep, "skin": skin,
        "avg": round(avg, 1),
    }
    if existing_idx is not None:
        st.session_state.mirror_history[existing_idx] = new_entry
        st.info("✦ 今日自评已更新")
    else:
        st.session_state.mirror_history.append(new_entry)
        st.success("✦ 今日自评已记下")
    st.session_state.mirror_today_saved = today_str
    import time
    time.sleep(0.5)
    st.rerun()

# ══════════════════════════════════════════════════════════
#  区块 2: 30 天心情曲线 (altair)
# ══════════════════════════════════════════════════════════
st.markdown("---")
st.markdown("### 📈 30 天心情曲线")
st.caption("✦ 数据仅存你浏览器, 不上传, 关闭页面即清空")

if len(st.session_state.mirror_history) >= 1:
    df = pd.DataFrame(st.session_state.mirror_history)
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date")

    # 多线图
    base = alt.Chart(df).encode(
        x=alt.X("date:T", title="日期", axis=alt.Axis(format="%m/%d")),
        tooltip=["date:T", "mood", "energy", "sleep", "skin", "avg"],
    )

    # 心情线 (主)
    mood_line = base.mark_line(color="#4a7c59", strokeWidth=2.5).encode(
        y=alt.Y("mood:Q", title="分数 (1-10)", scale=alt.Scale(domain=[0, 10])),
    )
    mood_pts = base.mark_circle(color="#4a7c59", size=80).encode(y="mood:Q")

    chart = (mood_line + mood_pts).properties(
        height=280,
        background="transparent",
    ).configure_axis(
        labelColor="#2d3a2e",
        titleColor="#2d3a2e",
        gridColor="#e8dfc8",
    ).configure_view(
        strokeWidth=0,
    )

    st.altair_chart(chart, use_container_width=True)

    # 统计
    if len(df) >= 3:
        st.markdown("#### 📊 这段时间的小观察")
        cols = st.columns(4)
        cols[0].metric("共修天数", f"{len(df)} 天")
        cols[1].metric("心情均值", f"{df['mood'].mean():.1f}")
        cols[2].metric("最高分", f"{df['avg'].max():.1f}")
        cols[3].metric("最低分", f"{df['avg'].min():.1f}")

        # 简单洞察
        if df['mood'].iloc[-1] > df['mood'].iloc[0]:
            st.success("✦ 心情在向上, 继续涵养")
        elif df['mood'].iloc[-1] < df['mood'].iloc[0]:
            st.info("✦ 心情在波动, 这是正常的, 给自己多一份耐心")
        else:
            st.info("✦ 心情平稳, 这也是一种稳定")
else:
    st.markdown("""
    <div class="card" style="text-align: center;">
        <p style="color: #6b6b6b;">记下第一次自评后, 这里会出现你的曲线 🌿</p>
    </div>
    """, unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════
#  区块 3-5: 3 个量表 (tab 切换)
# ══════════════════════════════════════════════════════════
st.markdown("---")
st.markdown("### 📋 轻量量表 (仅参考)")
st.caption("严守: 心颜不是诊断工具, 量表只供日常觉察. 严守红线后接 12356 危机热线")

tab_phq, tab_gad, tab_dlqi = st.tabs(["PHQ-9 心情低落", "GAD-7 焦虑", "DLQI 皮肤生活质量"])

with tab_phq:
    st.markdown("**过去 2 周, 您是否被以下问题困扰?**")
    phq_scores = []
    for i, q in enumerate(PHQ9_QUESTIONS):
        ans = st.radio(
            q,
            PHQ9_OPTIONS,
            index=0,
            key=f"phq_{i}",
            horizontal=True,
            label_visibility="visible",
        )
        phq_scores.append(PHQ9_OPTIONS.index(ans))
    if st.button("📊 解读 PHQ-9", key="btn_phq", type="primary"):
        r = phq9_score(phq_scores)
        st.markdown(f"""
        <div class="card" style="text-align: center; background: linear-gradient(135deg, #faf6f0, #f0e9dc);">
            <div style="color: #a94442; font-size: 0.85rem; letter-spacing: 0.2em;">PHQ-9 总分</div>
            <div style="color: #2d3a2e; font-size: 2rem; font-weight: 600; margin: 0.5rem 0;">{r['total']} / 27</div>
            <div style="color: #4a7c59; font-size: 1.1rem; margin: 0.3rem 0;">{r['level']}</div>
            <div style="color: #6b6b6b; font-size: 0.9rem; margin-top: 0.3rem;">{r['advice']}</div>
        </div>
        """, unsafe_allow_html=True)
        if r['q9_alert']:
            st.error("⚠️ 第 9 题 (自伤念头) 有分, 请务必联系专业人士或拨打 12356 心理援助热线")
        st.markdown(f"""
        <div class="compliance-note">
            <strong>✦ 严守声明</strong>: {SCALE_DISCLAIMER}
        </div>
        """, unsafe_allow_html=True)

with tab_gad:
    st.markdown("**过去 2 周, 您是否被以下问题困扰?**")
    gad_scores = []
    for i, q in enumerate(GAD7_QUESTIONS):
        ans = st.radio(
            q,
            GAD7_OPTIONS,
            index=0,
            key=f"gad_{i}",
            horizontal=True,
            label_visibility="visible",
        )
        gad_scores.append(GAD7_OPTIONS.index(ans))
    if st.button("📊 解读 GAD-7", key="btn_gad", type="primary"):
        r = gad7_score(gad_scores)
        st.markdown(f"""
        <div class="card" style="text-align: center; background: linear-gradient(135deg, #faf6f0, #f0e9dc);">
            <div style="color: #a94442; font-size: 0.85rem; letter-spacing: 0.2em;">GAD-7 总分</div>
            <div style="color: #2d3a2e; font-size: 2rem; font-weight: 600; margin: 0.5rem 0;">{r['total']} / 21</div>
            <div style="color: #4a7c59; font-size: 1.1rem; margin: 0.3rem 0;">{r['level']}</div>
            <div style="color: #6b6b6b; font-size: 0.9rem; margin-top: 0.3rem;">{r['advice']}</div>
        </div>
        """, unsafe_allow_html=True)
        st.markdown(f"""
        <div class="compliance-note">
            <strong>✦ 严守声明</strong>: {SCALE_DISCLAIMER}
        </div>
        """, unsafe_allow_html=True)

with tab_dlqi:
    st.markdown("**过去 1 周, 您的皮肤问题对您的影响**")
    dlqi_scores = []
    for i, q in enumerate(DLQI_QUESTIONS):
        ans = st.radio(
            q,
            DLQI_OPTIONS,
            index=0,
            key=f"dlqi_{i}",
            horizontal=True,
            label_visibility="visible",
        )
        dlqi_scores.append(DLQI_OPTIONS.index(ans))
    if st.button("📊 解读 DLQI", key="btn_dlqi", type="primary"):
        r = dlqi_score(dlqi_scores)
        st.markdown(f"""
        <div class="card" style="text-align: center; background: linear-gradient(135deg, #faf6f0, #f0e9dc);">
            <div style="color: #a94442; font-size: 0.85rem; letter-spacing: 0.2em;">DLQI 总分</div>
            <div style="color: #2d3a2e; font-size: 2rem; font-weight: 600; margin: 0.5rem 0;">{r['total']} / 30</div>
            <div style="color: #4a7c59; font-size: 1.1rem; margin: 0.3rem 0;">{r['level']}</div>
            <div style="color: #6b6b6b; font-size: 0.9rem; margin-top: 0.3rem;">{r['advice']}</div>
        </div>
        """, unsafe_allow_html=True)
        st.markdown(f"""
        <div class="compliance-note">
            <strong>✦ 严守声明</strong>: 心颜严守「滋养而非治疗」原则, DLQI 只测皮肤相关生活质量, 不诊断皮肤疾病. 严守化妆品监管条例 17/43/46/68, 不出现「治疗/治愈」用语.
        </div>
        """, unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════
#  区块 6: 6 类自我对话 (按情绪筛选)
# ══════════════════════════════════════════════════════════
st.markdown("---")
st.markdown("### 💬 给自己的话")
st.caption("✦ 6 类情绪, 选一类听一句")

dlg_type = st.selectbox(
    "你现在的状态?",
    ["早安", "晚安", "疲惫", "焦虑", "自卑", "孤独"],
    index=0,
    label_visibility="collapsed",
)
dlg = get_today_dialogue(by_type=dlg_type)
st.markdown(f"""
<div class="card" style="background: linear-gradient(135deg, #faf6f0, #f0e9dc); text-align: center; padding: 1.5rem;">
    <div style="color: #a94442; font-size: 0.78rem; letter-spacing: 0.3em; margin-bottom: 0.5rem;">{dlg['type']}</div>
    <div style="color: #2d3a2e; font-size: 1.2rem; line-height: 1.6; font-family: 'Source Han Serif SC', serif;">「{dlg['text']}」</div>
</div>
""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════
#  区块 7: 「给 3 个月后的自己」(彩蛋)
# ══════════════════════════════════════════════════════════
st.markdown("---")
st.markdown("### ✉️ 给 3 个月后的自己 (彩蛋)")
st.caption("✦ 写一封信, 3 个月后 (v0.5+ 解锁) 才会显示. 存在你浏览器, 不上传")

if "letter" not in st.session_state:
    st.session_state.letter = ""

letter = st.text_area(
    "今天, 你想对 3 个月后的自己说什么?",
    value=st.session_state.letter,
    placeholder="亲爱的 3 个月后的我: 今天...",
    height=150,
    label_visibility="collapsed",
)
st.session_state.letter = letter

if st.button("📨 寄出 (本地保存)", use_container_width=False, type="primary"):
    if letter.strip():
        st.session_state.letter_saved = True
        st.success("✦ 信已寄出, 3 个月后再见")
    else:
        st.warning("✦ 写一句就好, 哪怕是「想静静」")

# ══════════════════════════════════════════════════════════
#  每月滋养报告 (月底自动生成)
# ══════════════════════════════════════════════════════════
st.markdown("---")
st.markdown("### 📜 每月滋养报告")
st.caption("✦ 月底自动生成, 当前为 v0.5 mock")

if len(st.session_state.mirror_history) >= 5:
    df = pd.DataFrame(st.session_state.mirror_history)
    avg_mood = df['mood'].mean()
    avg_avg = df['avg'].mean()
    high_days = len(df[df['avg'] >= 7])
    low_days = len(df[df['avg'] < 5])

    if avg_mood >= 7:
        summary = "✦ 这段时间, 你整体在滋养状态. 继续保持."
    elif avg_mood >= 5:
        summary = "✦ 这段时间, 心情平稳, 偶有波动. 继续涵养."
    else:
        summary = "✦ 这段时间, 你辛苦了. 请给自己多一点耐心和善待."

    st.markdown(f"""
    <div class="card" style="background: linear-gradient(135deg, #faf6f0, #f0e9dc); padding: 1.5rem;">
        <div style="color: #a94442; font-size: 0.78rem; letter-spacing: 0.3em; margin-bottom: 0.5rem;">本月报告</div>
        <div style="color: #2d3a2e; font-size: 1.05rem; line-height: 1.8; margin: 0.5rem 0;">{summary}</div>
        <div style="color: #6b6b6b; font-size: 0.88rem; line-height: 1.6; margin-top: 0.5rem;">
            ✦ 共修 <strong style="color: #4a7c59;">{len(df)}</strong> 天<br>
            ✦ 心情均值 <strong style="color: #4a7c59;">{avg_mood:.1f}</strong> / 10<br>
            ✦ 滋养日 (≥7) <strong style="color: #4a7c59;">{high_days}</strong> 天<br>
            ✦ 低谷日 (<5) <strong style="color: #a94442;">{low_days}</strong> 天
        </div>
    </div>
    """, unsafe_allow_html=True)
else:
    st.caption("需要至少 5 天自评才能生成报告. 继续每日打卡 🌿")

# ══════════════════════════════════════════════════════════
#  Footer
# ══════════════════════════════════════════════════════════
get_footer_note()
