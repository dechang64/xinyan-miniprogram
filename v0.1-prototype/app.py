"""心颜 v0.6 原型 — 主入口 app.py

6 个 page: 主页 / 每日一经 / 每日一汤 / 共修堂 / 镜中 / 我的
严守 6 条意见: 滋养而非治疗, 照镜子, 共修, 经文, 汤品, 不挂祺臻
"""
import streamlit as st
from core.styles import inject_css
from core.config import (
    BRAND_NAME, BRAND_TAGLINE, get_brand_header, get_footer_note,
    get_solar_term_strip, checkin_init,
)
from data.jingwen_30 import get_today_jingwen
from data.soups_30 import get_today_soup

# ── 页面配置 (第一行 st 命令) ──
st.set_page_config(
    page_title="心颜 · 照镜子, 也是为了更好的自己",
    page_icon="✨",
    layout="centered",
    initial_sidebar_state="collapsed",  # v0.6.3: sidebar 默认收起, 避免重复菜单困扰
)

# ── 注入 CSS + 初始化 ──
inject_css()
checkin_init()

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
    st.caption("v0.7.1.2 · 2026-07-07")
    st.caption("滋养 · 涵养 · 共修")

# ══════════════════════════════════════════════════════════
#  🎬 区块 1: Hero (启动)
# ══════════════════════════════════════════════════════════
today_str = get_solar_term_strip()
st.markdown(f"""
<div class="hero fade-in">
    <div class="hero-eyebrow">XINYAN · DAILY · COMPANION</div>
    <div class="hero-title">心颜</div>
    <div class="hero-sub">"{BRAND_TAGLINE}"</div>
    <div class="hero-stamp">✦ 滋养 · 涵养 · 共修 ✦</div>
    <p style="color: #6b6b6b; font-size: 0.85rem; margin-top: 1rem;">{today_str}</p>
</div>
""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════
#  🪞 区块 2: 镜中 (核心情感 — user 6 条意见 #3)
# ══════════════════════════════════════════════════════════
st.markdown("""
<div style="text-align: center; padding: 1rem 0; color: #4a7c59; font-size: 1.05rem; font-style: italic; letter-spacing: 0.1em;">
    镜中, 是正在成为自己的你
</div>
""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════
#  📜 区块 3: 今日一经 (摘要)
# ══════════════════════════════════════════════════════════
jw = get_today_jingwen()
st.markdown(f"""
<div class="card-jingwen">
    <div class="source">📜 今日一经 · {jw['source']}</div>
    <div class="title">{jw['title']}</div>
    <div class="content">{jw['content']}</div>
    <div class="jieshi">{jw['jieshi'][:80]}...</div>
</div>
""", unsafe_allow_html=True)

if st.button("📜 查看今日一经全文", use_container_width=True):
    st.switch_page("pages/1_每日一经.py")

# ══════════════════════════════════════════════════════════
#  🍵 区块 4: 今日一汤 (摘要)
# ══════════════════════════════════════════════════════════
sp = get_today_soup()
badges_html = "".join([
    f'<span class="tag tag-yellow">{b}</span>'
    for b in [sp["season_tag"], sp["tizhi_tag"]]
])
st.markdown(f"""
<div class="card-soup">
    <div class="source" style="color: #8a6d2a; font-size: 0.85rem; letter-spacing: 0.1em; margin-bottom: 0.4rem;">🍵 今日一汤</div>
    <div class="name">{sp['name']}</div>
    <div style="margin: 0.3rem 0;">{badges_html}</div>
    <div class="ingredients"><strong>食材</strong>: {sp['ingredients']}</div>
    <div class="effect">「{sp['effect']}」</div>
</div>
""", unsafe_allow_html=True)

if st.button("🍵 查看今日一汤做法", use_container_width=True):
    st.switch_page("pages/2_每日一汤.py")

# ══════════════════════════════════════════════════════════
#  🌸 区块 5: 共修堂入口
# ══════════════════════════════════════════════════════════
done_count = sum([
    st.session_state.checkin["jingwen"],
    st.session_state.checkin["soup"],
    st.session_state.checkin["self_talk"],
])
st.markdown(f"""
<div class="card" style="text-align: center;">
    <h3 style="color: #4a7c59 !important; margin: 0 0 0.5rem 0;">🌸 心颜共修堂</h3>
    <p style="color: #2d3a2e; margin: 0.3rem 0;">一群人一起, 慢慢变好</p>
    <p style="color: #6b6b6b; font-size: 0.88rem; margin: 0.3rem 0;">今日共修: <strong style="color: #4a7c59;">{done_count} / 3</strong></p>
</div>
""", unsafe_allow_html=True)

if st.button("🌸 进入共修堂", use_container_width=True):
    st.switch_page("pages/3_共修堂.py")

# ══════════════════════════════════════════════════════════
#  🪞 区块 5.5: 镜中入口 (v0.5 新增)
# ══════════════════════════════════════════════════════════
st.markdown(f"""
<div class="card" style="text-align: center; background: linear-gradient(135deg, #faf6f0, #f0e9dc);">
    <h3 style="color: #4a7c59 !important; margin: 0 0 0.5rem 0;">🪞 镜中</h3>
    <p style="color: #2d3a2e; margin: 0.3rem 0; font-style: italic;">镜中, 是正在成为自己的你</p>
    <p style="color: #6b6b6b; font-size: 0.88rem; margin: 0.3rem 0;">4 滑块自评 · 30 天心情曲线 · 3 个量表 · 6 类自我对话 · 给 3 个月后的信</p>
</div>
""", unsafe_allow_html=True)

if st.button("🪞 进入镜中", use_container_width=True):
    st.switch_page("pages/4_镜中.py")

# ══════════════════════════════════════════════════════════
#  🌿 区块 5.6: 我的入口 (v0.6 新增)
# ══════════════════════════════════════════════════════════
fl_on = st.session_state.get("fl_enabled", False)
fl_badge = " · 🌐 FL 开启" if fl_on else ""
st.markdown(f"""
<div class="card" style="text-align: center;">
    <h3 style="color: #4a7c59 !important; margin: 0 0 0.5rem 0;">🌿 我的</h3>
    <p style="color: #2d3a2e; margin: 0.3rem 0;">共修统计 · 收藏 · 海报历史 · 设置</p>
    <p style="color: #6b6b6b; font-size: 0.88rem; margin: 0.3rem 0;">✦ 数据只存本地, 关浏览器即清空{fl_badge}</p>
</div>
""", unsafe_allow_html=True)

if st.button("🌿 进入我的", use_container_width=True):
    st.switch_page("pages/5_我的.py")

# ══════════════════════════════════════════════════════════
#  📌 区块 6: 严守声明
# ══════════════════════════════════════════════════════════
st.markdown(f"""
<div class="compliance-note">
    <strong>✦ 滋养而非治疗</strong>: 心颜是日常陪伴, 不构成医学建议。经文与汤品仅供日常参考, 个体差异请咨询专业人士。
</div>
""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════
#  📌 Footer
# ══════════════════════════════════════════════════════════
get_footer_note()
