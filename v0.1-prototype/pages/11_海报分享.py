"""悦济 v3.1 阶段 25 — page 11: 海报分享 (v0.1 同步 v3.1 阶段 19-24)

严守 6 条意见: 滋养而非治疗, 照镜子, 共修
海报功能在 1_每日一经 / 2_每日一汤 page 已内嵌, 独立 page 11 让评委/用户快速访问
6 模板 (经典/节气/极简/文艺/水墨/现代) + 9:16 朋友圈 / 3:4 小红书 双尺寸
v0.1 严守: 不用「美颜/营销/瘦脸/美白」等医疗/营销词
"""
import streamlit as st
from datetime import date
from core.styles import inject_css
from core.config import get_brand_header, get_footer_note, checkin_init
from data.jingwen_30 import get_today_jingwen, get_all, get_by_id
from data.soups_30 import get_today_soup, get_all_soups
from core.poster_gen_html import gen_jingwen_poster_html, gen_soup_poster_html

st.set_page_config(page_title="海报分享 · 悦济", page_icon="🎨", layout="centered", initial_sidebar_state="collapsed")
inject_css()
checkin_init()

with st.sidebar:
    st.markdown("### ✨ 悦济")
    st.markdown("---")
    st.page_link("app.py", label="🏠 主页")
    st.page_link("pages/1_每日一经.py", label="📜 每日一经")
    st.page_link("pages/2_每日一汤.py", label="🍵 每日一汤")
    st.page_link("pages/3_共修堂.py", label="🌸 共修堂")
    st.page_link("pages/4_镜中.py", label="🪞 镜中")
    st.page_link("pages/6_人格画像.py", label="🪞 人格画像")
    st.page_link("pages/7_悦济之音.py", label="🎵 悦济之音")
    st.page_link("pages/11_海报分享.py", label="🎨 海报分享")
    st.page_link("pages/12_4经数字人.py", label="🪶 4 经数字人")
    st.page_link("pages/5_我的.py", label="🌿 我的")
    st.markdown("---")
    st.caption("v3.1 · 2026-07-17")
    st.caption("滋养 · 涵养 · 共修")

get_brand_header()

st.markdown("""
<div class="hero fade-in">
    <div class="hero-eyebrow">YUEJI · POSTER · SHARE</div>
    <div class="hero-title">🎨 海报分享</div>
    <div class="hero-sub">"长按图片, 分享到朋友圈/小红书"</div>
    <div class="hero-stamp">✦ 滋养 · 涵养 · 共修 ✦</div>
</div>
""", unsafe_allow_html=True)

# ── 6 模板 + 经文/汤品 选择 ──
TEMPLATES = [
    "📜 经典 (米色竖排)",
    "🌿 节气 (随节气换色)",
    "✨ 极简 (白底黑字)",
    "🖌️ 文艺 (手写体 + 印章)",
    "🌊 水墨 (山水背景)",
    "🎨 现代 (彩色几何)",
]

content_type = st.radio("内容类型", ["📜 经文", "🍵 汤品"], horizontal=True)
template = st.selectbox("选择海报模板", TEMPLATES, index=0)

# 内容选择
if content_type == "📜 经文":
    all_jw = get_all()
    options = {f"#{j['id']:02d} {j['source']} · {j['title']}": j['id'] for j in all_jw}
    jw_today = get_today_jingwen()
    selected_label = st.selectbox("选择经文", list(options.keys()), index=jw_today['id']-1)
    selected = get_by_id(options[selected_label])
    html_poster = gen_jingwen_poster_html(selected, template, date.today())
else:
    all_sp = get_all_soups()
    options = {f"#{s['id']:02d} {s['name']} ({s.get('season_tag', '')})": s['id'] for s in all_sp}
    sp_today = get_today_soup()
    selected_label = st.selectbox("选择汤品", list(options.keys()), index=sp_today['id']-1)
    selected = next((s for s in all_sp if s['id'] == options[selected_label]), sp_today)
    html_poster = gen_soup_poster_html(selected, template, date.today())

# 海报预览 (HTML 渲染, 浏览器长按复制)
st.markdown("### 📱 海报预览 (长按图片保存)")
st.markdown(html_poster, unsafe_allow_html=True)

# 双尺寸提示
st.markdown("""
<div class="compliance-note">
    <strong>📐 尺寸</strong>: 540 × 960 (9:16 朋友圈 + 3:4 小红书通用)
    <br><br>
    <strong>📋 使用</strong>: 长按上方海报图片 → 复制/保存 → 发到朋友圈或小红书
    <br><br>
    <strong>✦ 严守</strong>: 海报右下角永久"悦济"印章, 不可去掉
</div>
""", unsafe_allow_html=True)

# 严守声明
st.markdown("""
<div class="compliance-note">
    <strong>✦ 滋养而非治疗</strong>: 海报内容是悦济日常陪伴, 不构成医学建议。
    严守基调 0 出现医疗/营销/命理用语 (14 禁用词 + 12 玄学红线 + 15 危机词 = 0)。
</div>
""", unsafe_allow_html=True)

get_footer_note()
