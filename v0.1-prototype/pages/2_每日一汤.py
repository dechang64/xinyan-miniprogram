"""心颜 v0.1 原型 — page 2: 每日一汤

严守 6 条意见: 滋养而非治疗, 照镜子, 共修
"""
import streamlit as st
from core.styles import inject_css
from core.config import (
    get_brand_header, get_footer_note, get_solar_term_strip,
    checkin_init, TIZHI_9,
)
from data.soups_30 import get_today_soup, get_all, get_by_id, get_by_tizhi, get_by_season

st.set_page_config(page_title="每日一汤 · 心颜", page_icon="🍵", layout="centered", initial_sidebar_state="collapsed")
inject_css()
checkin_init()

# ── sidebar ──
# ── sidebar: 自定义中文菜单 (默认收起, 用户主动展开才显示) ──
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
    st.caption("v0.7 · 2026-07-07")
    st.caption("滋养 · 涵养 · 共修")
# ── brand header ──
get_brand_header()

# ══════════════════════════════════════════════════════════
#  🧬 体质选择 (持久化)
# ══════════════════════════════════════════════════════════
if "tizhi" not in st.session_state:
    st.session_state.tizhi = None

st.markdown("### 🧬 我的体质")
st.caption("先选一个, 后续汤品会优先推荐适合你的")

tizhi_options = {f"{name} — {desc}": key for key, (name, desc) in TIZHI_9.items()}
selected_label = st.selectbox(
    "9 体质 (王琦)",
    list(tizhi_options.keys()),
    index=list(tizhi_options.values()).index(st.session_state.tizhi) if st.session_state.tizhi in tizhi_options.values() else 0,
    label_visibility="collapsed",
)
st.session_state.tizhi = tizhi_options[selected_label]

st.markdown("""
<div class="compliance-note">
    <strong>✦ 严守声明</strong>: 体质测试仅供日常参考, 个体差异请咨询专业人士。
    心颜不构成任何医学建议, 9 体质来源于王琦《中医体质分类与判定》(2009)。
</div>
""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════
#  🍵 今日一汤
# ══════════════════════════════════════════════════════════
sp = get_today_soup()
today_str = get_solar_term_strip()

badges_html = " ".join([
    f'<span class="tag tag-yellow">{b}</span>'
    for b in [sp["season_tag"], sp["tizhi_tag"]]
])

st.markdown(f"""
<div class="card-soup">
    <div class="source" style="color: #8a6d2a; font-size: 0.85rem; letter-spacing: 0.1em; margin-bottom: 0.4rem;">🍵 今日一汤</div>
    <p style="color: #6b6b6b; font-size: 0.82rem; margin: 0.3rem 0;">{today_str}</p>
    <div class="name">{sp['name']}</div>
    <div style="margin: 0.4rem 0;">{badges_html}</div>
    <div class="ingredients"><strong>食材</strong><br>{sp['ingredients']}</div>
    <div class="steps"><strong>做法</strong><br>{sp['steps']}</div>
    <div class="effect">✦ {sp['effect']}</div>
</div>
""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════
#  🔄 换一换 (3 个备选)
# ══════════════════════════════════════════════════════════
st.markdown("### 🔄 换一换")
all_soups = get_all()
import random
random.seed(42)  # v0.1 简化, 用固定随机
others = [s for s in all_soups if s["id"] != sp["id"]]
samples = random.sample(others, k=min(3, len(others)))

cols = st.columns(3)
for i, s in enumerate(samples):
    with cols[i]:
        if st.button(f"🍵 {s['name']}", key=f"swap_{s['id']}", use_container_width=True):
            sp = s
            st.session_state['_selected_soup'] = s
            st.rerun()

# 如果用户点了换一换, 显示
if '_selected_soup' in st.session_state:
    sp = st.session_state['_selected_soup']
    badges_html = " ".join([
        f'<span class="tag tag-yellow">{b}</span>'
        for b in [sp["season_tag"], sp["tizhi_tag"]]
    ])
    st.markdown(f"""
    <div class="card-soup">
        <div class="name">{sp['name']}</div>
        <div style="margin: 0.4rem 0;">{badges_html}</div>
        <div class="ingredients"><strong>食材</strong><br>{sp['ingredients']}</div>
        <div class="steps"><strong>做法</strong><br>{sp['steps']}</div>
        <div class="effect">✦ {sp['effect']}</div>
    </div>
    """, unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════
#  🎨 海报生成
# ══════════════════════════════════════════════════════════
st.markdown("### 🎨 生成海报分享")

template = st.selectbox(
    "选择海报模板",
    ["📜 经典 (米色竖排)", "🌿 节气 (随节气换色)", "✨ 极简 (白底黑字)",
     "🖌️ 文艺 (手写体 + 印章)", "🌊 水墨 (山水背景)", "🎨 现代 (彩色几何)"],
    index=1, key="soup_template",
)

TEMPLATE_STYLES = {
    "📜 经典 (米色竖排)": ("#faf6f0", "#2d3a2e", "#a94442", "vertical"),
    "🌿 节气 (随节气换色)": ("#f0e9dc", "#2d3a2e", "#4a7c59", "horizontal"),
    "✨ 极简 (白底黑字)": ("#ffffff", "#1a1a1a", "#666666", "horizontal"),
    "🖌️ 文艺 (手写体 + 印章)": ("#f5efe1", "#3d2817", "#a94442", "vertical"),
    "🌊 水墨 (山水背景)": ("#e8e4d8", "#1a1a1a", "#2d3a2e", "vertical"),
    "🎨 现代 (彩色几何)": ("#fff8e7", "#4a7c59", "#c9a961", "horizontal"),
}
bg, fg, stamp_color, direction = TEMPLATE_STYLES[template]
direction_css = "writing-mode: vertical-rl; text-orientation: upright;" if direction == "vertical" else ""

st.markdown(f"""
<div class="poster-frame" style="background: {bg}; border-color: {stamp_color};">
    <div class="poster-eyebrow" style="color: {stamp_color};">心颜 · XINYAN</div>
    <div class="poster-title" style="color: {fg};">{sp['name']}</div>
    <div class="poster-content" style="color: {fg}; font-size: 1.05rem; line-height: 1.7;">
        <strong>食材</strong>: {sp['ingredients']}<br><br>
        <strong>做法</strong>: {sp['steps']}<br><br>
        <em>✦ {sp['effect']}</em>
    </div>
    <div class="poster-stamp" style="color: {stamp_color}; border-color: {stamp_color};">
        心颜共修 · 滋养一日
    </div>
</div>
""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════
#  ✅ 共修打卡: 准备汤
# ══════════════════════════════════════════════════════════
st.markdown("---")
st.markdown("### 🌸 今日共修")

if not st.session_state.checkin["soup"]:
    if st.button("✅ 我准备好今日一汤了", use_container_width=True, type="primary"):
        st.session_state.checkin["soup"] = True
        st.success("✦ 滋养一刻, 今日汤品共修完成")
        st.balloons()
        import time
        time.sleep(1)
        st.rerun()
else:
    st.markdown("""
    <div class="task-row done">
        <span class="task-check done">✓</span>
        <span class="task-text">准备 / 喝下今日一汤 — 已完成</span>
    </div>
    """, unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════
#  📚 按体质 / 按季节 浏览全部汤品
# ══════════════════════════════════════════════════════════
st.markdown("---")
st.markdown("### 📚 全部汤品 (按体质)")

tizhi_filter = st.selectbox(
    "按体质筛选",
    ["全部"] + [name for key, (name, desc) in TIZHI_9.items()],
    index=0,
)

if tizhi_filter == "全部":
    filtered = all_soups
else:
    # 找 key
    tizhi_key = None
    for key, (name, desc) in TIZHI_9.items():
        if name == tizhi_filter:
            tizhi_key = key
            break
    filtered = get_by_tizhi(tizhi_key) if tizhi_key else all_soups

st.caption(f"共 {len(filtered)} 款")
for s in filtered[:10]:  # v0.1 简化, 只显示前 10
    with st.expander(f"🍵 {s['name']} · {s['tizhi_tag']} · {s['season_tag']}"):
        st.markdown(f"""
        <div class="card-soup">
            <div class="ingredients"><strong>食材</strong>: {s['ingredients']}</div>
            <div class="steps"><strong>做法</strong>: {s['steps']}</div>
            <div class="effect">✦ {s['effect']}</div>
        </div>
        """, unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════
#  📌 Footer
# ══════════════════════════════════════════════════════════
get_footer_note()
