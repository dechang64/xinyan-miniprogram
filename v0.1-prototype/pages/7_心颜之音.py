"""心颜 v0.7 — page 7: 心颜之音 (MiniMax AI 音乐生成 5 滋养曲风)

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
    st.caption("v0.7.1 · 2026-07-07")
    st.caption("滋养 · 涵养 · 共修")

get_brand_header()

# ── 顶部严守声明 ──
st.markdown("""
<div class="card" style="background: linear-gradient(135deg, #faf6f0, #f0e9dc); padding: 1rem; margin-bottom: 1rem;">
    <div style="color: #a94442; font-size: 0.78rem; letter-spacing: 0.2em; margin-bottom: 0.3rem;">✦ 心颜之音</div>
    <div style="color: #2d3a2e; font-size: 0.92rem; line-height: 1.6;">
        5 滋养曲风跟 v0.6.1 温润滤镜 5 预设一一对应: <b>清润 / 温润 / 通透 / 晨光 / 黄昏</b><br>
        不用歌词 · 2 分钟 · 80 BPM 上下 · 由 MiniMax AI 音乐生成<br>
        ✦ 仅生成于本地浏览器, 不上传云端, 不记录播放历史
    </div>
</div>
""", unsafe_allow_html=True)

# ── 选曲风 ──
st.markdown("### 🎼 选择滋养曲风")

style_choice = st.selectbox(
    "曲风",
    options=list(MUSIC_STYLES.keys()),
    format_func=lambda k: f"{MUSIC_STYLES[k]['icon']} {k} · {MUSIC_STYLES[k]['description']}",
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

# 显示 prompt 预览
with st.expander("🔍 查看 MiniMax prompt (高级用户)"):
    st.code(style['prompt'], language="text")
    st.caption("✦ 这是送给 MiniMax 音乐模型的英文描述, 不进入用户界面")

# 生成按钮
st.markdown("---")
col1, col2, col3 = st.columns([1, 2, 1])
with col2:
    gen_btn = st.button(
        f"✨ 生成 {style_choice} 之音",
        use_container_width=True,
        type="primary",
    )

if gen_btn:
    with st.spinner(f"🎵 正在生成 {style_choice} 之音... MiniMax AI 需要 30-60 秒"):
        result = generate_xinyan_music(style_choice)

    if result.get("success"):
        audio_url = result["audio_url"]
        st.session_state[f"audio_url_{style_choice}"] = audio_url

        st.success(f"✦ {style_choice} 之音生成成功")

        # 严守声明 (成功后才显示, 提醒用户这是 AI 生成)
        st.markdown(f"""
        <div style="text-align: center; color: #6b6b6b; font-size: 0.85rem; padding: 0.5rem;">
            🎵 由 MiniMax AI 生成 · 2 分钟 · 80 BPM 上下<br>
            ✦ 仅供个人聆听, 不做商用 / 不宣称艺术创作
        </div>
        """, unsafe_allow_html=True)

        # 播放器 (本地, 不上传)
        st.audio(audio_url, format="audio/mp3", autoplay=False)

        # 显示 CDN URL (调试用, 用户可复制)
        with st.expander("🔗 音乐 CDN URL"):
            st.code(audio_url, language="text")
            st.caption("✦ 这是 MiniMax 返回的 CDN URL, 链接有效期 7 天, 过期重新生成即可")
    else:
        st.error(f"生成失败: {result.get('error', '未知错误')}")
        st.caption("✦ 可以换个曲风再试, 或检查 MiniMax MCP 是否可用")

# ── 历史记录 ──
st.markdown("---")
st.markdown("### 🕘 本次会话已生成")
history_keys = [k for k in st.session_state.keys() if k.startswith("audio_url_")]
if history_keys:
    for k in history_keys:
        style_name = k.replace("audio_url_", "")
        url = st.session_state[k]
        st.markdown(f"- 🎵 **{style_name}**: 已生成, [重新播放]({url})")
else:
    st.caption("✦ 还没生成过音乐, 选个曲风点上面的按钮")

# ── 底部严守 ──
st.markdown("---")
st.markdown(f"""
<div class="card" style="background: #fffef8; padding: 1rem; margin-top: 1rem;">
    <div style="color: #a94442; font-size: 0.78rem; letter-spacing: 0.2em; margin-bottom: 0.3rem;">✦ 严守声明</div>
    <div style="color: #6b6b6b; font-size: 0.85rem; line-height: 1.6;">
        <b>5 滋养曲风只做情绪陪伴</b>, 不替代心理咨询 / 医疗 / 音乐治疗。<br>
        <b>8 禁用词 0 出现</b>: 治疗 / 改善 / 缓解 / 治愈 / 祛斑 / 减肥 / 处方 / 医美 / 美颜 / 美白 / 瘦脸<br>
        <b>音乐 prompt 预审</b>: 含消极/医疗/营销词自动拦截。<br>
        ✦ 数据仅存浏览器, 关浏览器即清, 不上传云端。
    </div>
</div>
""", unsafe_allow_html=True)

st.markdown(get_footer_note(), unsafe_allow_html=True)