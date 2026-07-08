"""心颜 v0.7.1.1 — page 7: 心颜之音 (5 滋养曲风 + MiniMax AI 生成示例)

v0.7.1.1 关键变化:
- 之前: 用户点「生成」按钮 → 调 mavis CLI → 调 MiniMax MCP 生成新 MP3
- 现在: 用户选曲风 → 直接展示预生成 MP3 (5 个示例 CDN URL, MiniMax hailuoai.com)
  + 真生成按钮放折叠 (本地 dev 需 mavis daemon, Cloud 禁用)
- 原因: Streamlit Cloud Linux 容器没装 mavis.cmd, subprocess 找不到

严守 (核心):
- 5 滋养曲风跟 v0.6.1 温润滤镜 5 预设一一对应 (清润/温润/通透/晨光/黄昏)
- 不用激烈 / 焦虑 / 痛苦 / 消极 情绪
- 不用「美颜/美白/瘦脸/营销」等营销词
- 不用「治疗/改善/缓解/治愈」等医疗词
- 音乐 prompt 预审: 含消极/医疗/营销词自动拦截
- 数据只存 session_state, 关浏览器即清
- 8 禁用词 0 出现
"""

import streamlit as st
from core.styles import inject_css
from core.config import (
    BRAND_NAME, BRAND_TAGLINE, COMPLIANCE_DISCLAIMER,
    get_brand_header, get_footer_note,
)
from data.music import (
    MUSIC_STYLES, list_styles, generate_xinyan_music, get_style_prompt,
    DEMO_URLS,
)

st.set_page_config(
    page_title="心颜之音 · 心颜",
    page_icon="🎵",
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
    st.caption("滋养 · 涵养 · 共修")

get_brand_header()

# ── 顶部卡 (v0.7.1.7.6 简化: 删技术细节, 给用户简单意境) ──
st.markdown("""
<div class="card" style="background: linear-gradient(135deg, #faf6f0, #f0e9dc); padding: 1rem; margin-bottom: 1rem;">
    <div style="color: #a94442; font-size: 0.78rem; letter-spacing: 0.2em; margin-bottom: 0.3rem;">✦ 心颜之音</div>
    <div style="color: #2d3a2e; font-size: 0.95rem; line-height: 1.7;">
        5 段滋养曲风, 陪你慢慢静下来。<br>
        <span style="color: #6b6b6b; font-size: 0.85rem;">不用歌词 · 意境陪伴 · 关浏览器即清</span>
    </div>
</div>
""", unsafe_allow_html=True)

# ── 选曲风 ──
st.markdown("### 🎼 选择滋养曲风")

style_choice = st.selectbox(
    "曲风",
    options=list(MUSIC_STYLES.keys()),
    format_func=lambda k: MUSIC_STYLES[k]["icon"] + " " + k + " · " + MUSIC_STYLES[k]["description"],
    key="music_style",
    label_visibility="collapsed",
)

style = MUSIC_STYLES[style_choice]

# 显示当前曲风卡片
st.markdown(f"""
<div class="card" style="background: {style['color']}30; border: 1px solid {style['color']}; text-align: center; padding: 1.5rem; margin: 0.8rem 0;">
    <div style="font-size: 3rem;">{style['icon']}</div>
    <div style="color: #2d3a2e; font-size: 1.8rem; font-weight: 300; letter-spacing: 0.15em; margin-top: 0.5rem;">{style_choice}</div>
    <div style="color: #6b6b6b; font-size: 0.95rem; margin-top: 0.5rem;">{style['description']}</div>
    <div style="color: #a94442; font-size: 0.85rem; margin-top: 0.8rem;">适合场景: {style['scene']}</div>
</div>
""", unsafe_allow_html=True)

# ── 自动播放 demo MP3 (Cloud 兼容, base64 嵌进 repo) ──
st.markdown("---")
st.markdown("### 🎧 聆听滋养曲风")

if style_choice in DEMO_URLS:
    audio_url = DEMO_URLS[style_choice]
    st.audio(audio_url, format="audio/mp3", autoplay=False)
else:
    st.warning(f"⚠️ {style_choice} 暂无预生成示例, 请选择其他曲风")

# ── 真生成模式 (本地 dev 高级用户) ──
with st.expander("🔧 高级: 真生成模式 (本地 dev 需 mavis daemon)"):
    st.markdown("""
    <div class="compliance-note" style="background: #fff8e8; border-left: 4px solid #d4a73c; padding: 0.8rem; margin-bottom: 0.8rem;">
        ⚠️ <b>本地开发模式</b>: 调用 MiniMax MCP 真生成新音乐 (~30-60 秒).<br>
        Streamlit Cloud 不支持 (Linux 容器无 mavis.cmd), 仅本地 dev 可用.
    </div>
    """, unsafe_allow_html=True)

    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        real_gen_btn = st.button(
            f"✨ 真生成 {style_choice} 之音",
            key="real_gen_btn",
            use_container_width=True,
        )

    if real_gen_btn:
        with st.spinner(f"🎵 正在调 MiniMax MCP 真生成 {style_choice}... 30-60 秒"):
            result = generate_xinyan_music(style_choice, use_demo=False)

        if result.get("success"):
            st.success(f"✦ {style_choice} 真生成成功")
            st.audio(result["audio_url"], format="audio/mp3", autoplay=False)
            with st.expander("🔗 真生成 CDN URL"):
                st.code(result["audio_url"], language="text")
        else:
            err = result.get("error", "未知错误")
            st.error(f"❌ 真生成失败: {err}")
            st.caption("✦ 检查本地 mavis daemon 是否运行 (mavis mcp ls)")

# ── 历史记录 ──
st.markdown("---")
st.markdown("### 🕘 本次会话已聆听")
history_keys = [k for k in st.session_state.keys() if k.startswith("audio_url_")]
if history_keys:
    for k in history_keys:
        style_name = k.replace("audio_url_", "")
        url = st.session_state[k]
        st.markdown(f"- 🎵 **{style_name}**: 已播放, [重新听]({url})")
else:
    st.caption("✦ 还没听过曲风, 上面选一个曲风即可聆听")

# ── 底部严守 (简化: 删技术细节) ──
st.markdown("---")
st.markdown(f"""
<div style="text-align: center; color: #a94442; font-size: 0.85rem; padding: 0.8rem; opacity: 0.85;">
    情绪陪伴, 不替代心理咨询或医疗。
</div>
""", unsafe_allow_html=True)

st.markdown(get_footer_note(), unsafe_allow_html=True)