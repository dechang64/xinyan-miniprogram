"""心颜 v0.1 原型 — page 1: 每日一经

严守 6 条意见: 滋养而非治疗, 照镜子, 共修
"""
import streamlit as st
from core.styles import inject_css
from core.config import (
    get_brand_header, get_footer_note, get_solar_term_strip,
    checkin_init, TIZHI_9,
)
from data.jingwen_30 import get_today_jingwen, get_all, get_by_id
from core.poster_svg import get_decoration
from data.guohua_gen import gen_guohua_b64

st.set_page_config(page_title="每日一经 · 心颜", page_icon="📜", layout="centered", initial_sidebar_state="collapsed")
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
    st.caption("v0.7.1.2 · 2026-07-07")
    st.caption("滋养 · 涵养 · 共修")

# ── brand header ──
get_brand_header()

# ══════════════════════════════════════════════════════════
#  📜 今日一经 (大字显示)
# ══════════════════════════════════════════════════════════
jw = get_today_jingwen()
today_str = get_solar_term_strip()

st.markdown(f"""
<div class="card-jingwen">
    <div class="source">📜 今日一经 · {jw['source']}</div>
    <p style="color: #6b6b6b; font-size: 0.82rem; margin: 0.3rem 0;">{today_str}</p>
    <div class="title">{jw['title']}</div>
    <div class="content">{jw['content']}</div>
    <div class="jieshi"><strong>✦ 简释</strong><br>{jw['jieshi']}</div>
    <p style="margin-top: 0.8rem;">
        <span class="tag">#{jw['tags'][0]}</span>
        <span class="tag">#{jw['tags'][1]}</span>
        <span class="tag">#{jw['tags'][2]}</span>
    </p>
</div>
""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════
#  🎨 海报生成 (v0.1: 6 模板选择 + 预览)
# ══════════════════════════════════════════════════════════
st.markdown("### 🎨 生成海报分享朋友圈")

template = st.selectbox(
    "选择海报模板",
    ["📜 经典 (米色竖排)", "🌿 节气 (随节气换色)", "✨ 极简 (白底黑字)",
     "🖌️ 文艺 (手写体 + 印章)", "🌊 水墨 (山水背景)", "🎨 现代 (彩色几何)"],
    index=0,
)

# 不同模板的颜色
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
direction_text = "竖排古朴" if direction == "vertical" else "横排现代"

# v0.7.1.7.3: AI 即时生成小品国画 (每人不同, 时令 + 经文)
# 缓存键: 经文 id + 模板 (切换经文/模板重新生成)
guohua_cache_key = f"guohua_{jw['id']}_{template}"
if "guohua_cache" not in st.session_state:
    st.session_state["guohua_cache"] = {}

# 生成按钮
col_gen, col_info = st.columns([1, 3])
with col_gen:
    regen = st.button("🎨 生成我的专属画", key="regen_guohua", use_container_width=True)
with col_info:
    if guohua_cache_key in st.session_state["guohua_cache"]:
        cached = st.session_state["guohua_cache"][guohua_cache_key]
        st.caption("✦ 已生成 ({:.0f}s)".format(cached.get("elapsed", 0)))
    else:
        st.caption("✦ 点击按钮, AI 即时为您画一张写意小品")

# 是否需要生成 (首次 / 重新点按钮)
if regen or guohua_cache_key not in st.session_state["guohua_cache"]:
    with st.spinner("🎨 正在为您生成专属写意小品 (约 30 秒)..."):
        r = gen_guohua_b64(jw)
        if r.get("success"):
            st.session_state["guohua_cache"][guohua_cache_key] = r
            st.success("✦ 生成完成, 您的专属画已就位")
        else:
            st.error("生成失败: {} 请刷新页面重试".format(r.get("error", "未知错误")))
            guohua_html = '<div style="width:140px;height:180px;background:rgba(0,0,0,0.05);display:flex;align-items:center;justify-content:center;color:#999;font-size:0.7rem;">生成失败</div>'

# 取出缓存
if guohua_cache_key in st.session_state["guohua_cache"]:
    cached = st.session_state["guohua_cache"][guohua_cache_key]
    guohua_html = '<img src="data:image/png;base64,{}" style="width:140px;height:180px;object-fit:cover;border-radius:4px;display:block;" />'.format(cached.get("b64", ""))
else:
    if "guohua_html" not in dir():
        guohua_html = '<div style="width:140px;height:180px;background:rgba(0,0,0,0.03);border:1px dashed #ccc;display:flex;align-items:center;justify-content:center;color:#999;font-size:0.75rem;">点击"生成我的专属画"</div>'

# v0.7.1.7.1: 海报顶部/底部 + 左右卷轴边饰 SVG
deco_top, deco_bottom, deco_side = get_decoration(template)

st.markdown(f"""
<div class="poster-frame" style="background: {bg}; border-color: {stamp_color}; position: relative;">
    <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 30px; display: flex; align-items: stretch;">{deco_side}</div>
    <div style="position: absolute; right: 0; top: 0; bottom: 0; width: 30px; display: flex; align-items: stretch;">{deco_side}</div>
    <div style="padding: 0 30px;">
        {deco_top}
        <div class="poster-eyebrow" style="color: {stamp_color};">心颜 · XINYAN</div>
        <div class="poster-title" style="color: {fg}; text-align: right;">{jw['title']}</div>
        <div style="display: flex; align-items: flex-start; gap: 1.2rem;">
            <div class="poster-painting">
                {guohua_html}
                <!-- 印章 "心颜" -->
                <div class="poster-seal">心颜</div>
            </div>
            <div class="poster-content" style="color: {fg}; {direction_css} flex: 1; text-align: right;">
                {jw['content']}
            </div>
        </div>
        <div class="poster-stamp" style="color: {stamp_color}; border-color: {stamp_color};">
            心颜共修 · {direction_text}
        </div>
        <p style="color: {fg}; font-size: 0.85rem; margin-top: 1rem; opacity: 0.6; text-align: right;">
            {today_str} · 照镜子, 也是为了更好的自己
        </p>
        {deco_bottom}
    </div>
</div>
""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════
#  ✅ 共修打卡: 读完经文
# ══════════════════════════════════════════════════════════
st.markdown("---")
st.markdown("### 🌸 今日共修")

if not st.session_state.checkin["jingwen"]:
    if st.button("✅ 我读完了今日一经", use_container_width=True, type="primary"):
        st.session_state.checkin["jingwen"] = True
        st.success("✦ 滋养一刻, 今日经文共修完成")
        st.balloons()
        import time
        time.sleep(1)
        st.rerun()
else:
    st.markdown("""
    <div class="task-row done">
        <span class="task-check done">✓</span>
        <span class="task-text">读今日一经 — 已完成</span>
    </div>
    """, unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════
#  📚 往期经文 (可点开看)
# ══════════════════════════════════════════════════════════
st.markdown("---")
st.markdown("### 📚 往期经文")

all_jw = get_all()
options = {}
for j in all_jw:
    label = "#" + str(j["id"]).zfill(2) + " " + j["source"] + " · " + j["title"]
    options[label] = j["id"]
selected_label = st.selectbox("选择往期经文", list(options.keys()), index=jw['id']-1)
selected_id = options[selected_label]

if selected_id != jw['id']:
    sel_jw = get_by_id(selected_id)
    st.markdown(f"""
    <div class="card-jingwen">
        <div class="source">📜 {sel_jw['source']}</div>
        <div class="title">{sel_jw['title']}</div>
        <div class="content">{sel_jw['content']}</div>
        <div class="jieshi"><strong>✦ 简释</strong><br>{sel_jw['jieshi']}</div>
    </div>
    """, unsafe_allow_html=True)
else:
    st.caption("← 当前显示的是今日经文, 切换看往期 →")

# ══════════════════════════════════════════════════════════
#  📌 Footer
# ══════════════════════════════════════════════════════════
get_footer_note()
