"""悦济 v3.1 阶段 25 — page 12: 4 经数字人 (v0.1 同步 v3.1 阶段 5 P0)

严守 6 条意见: 滋养而非治疗, 照镜子, 共修
4 经数字人 IP 立体化: 老子/周文王/岐伯/元神
- 头像: 4 张国画风 PNG (微信小程序有, Streamlit 用 emoji 替代)
- 长期记忆: 微信小程序 v3.1 阶段 5 接 chat 云函数 yueji_user_profiles, Streamlit 端展示角色定义
- 角色差异化: 调性强化 (字数/速度/标志性 phrase)
v0.1 严守: 0 出现 14 严守词
"""
import streamlit as st
from core.styles import inject_css
from core.config import get_brand_header, get_footer_note, checkin_init

st.set_page_config(page_title="4 经数字人 · 悦济", page_icon="🪶", layout="centered", initial_sidebar_state="collapsed")
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
    <div class="hero-eyebrow">YUEJI · FOUR · WISDOM</div>
    <div class="hero-title">🪶 4 经数字人</div>
    <div class="hero-sub">"跟老子/文王/岐伯/元神 一起读经典"</div>
    <div class="hero-stamp">✦ 滋养 · 涵养 · 共修 ✦</div>
</div>
""", unsafe_allow_html=True)

# 4 经数字人数据 (跟微信小程序 data_digital_human.js 同步, v3.1 阶段 5 P0)
HUMANS = [
    {
        "key": "laozi",
        "emoji": "🪶",
        "name": "老子",
        "era": "春秋",
        "book": "《道德经》",
        "intro": "上善若水, 水善利万物而不争",
        "tag": "玄思·慢",
        "persona": {
            "style": "哲思、平静、谦下、像水",
            "response_structure": "原文 (1-2 句) + 简释 (30-50 字) + 回应 (≤40 字)",
            "max_length": "总长 ≤ 100 字",
        },
    },
    {
        "key": "zhouwenwang",
        "emoji": "📜",
        "name": "周文王",
        "era": "商周",
        "book": "《周易》",
        "intro": "天行健, 君子以自强不息",
        "tag": "沉稳·讲规律",
        "persona": {
            "style": "演变、规律、深沉、像山",
            "response_structure": "卦辞/爻辞 + 简释 (30-50 字) + 回应 (≤40 字)",
            "max_length": "总长 ≤ 100 字",
        },
    },
    {
        "key": "qibo",
        "emoji": "🌿",
        "name": "岐伯",
        "era": "上古",
        "book": "《黄帝内经》",
        "intro": "上古之人, 起居有常, 不妄劳作",
        "tag": "温和·重起居",
        "persona": {
            "style": "温和、博学、像春天, 重养生不重治病",
            "response_structure": "原文 + 简释 (30-50 字) + 回应 (≤40 字)",
            "max_length": "总长 ≤ 100 字",
        },
    },
    {
        "key": "yuanshen",
        "emoji": "✨",
        "name": "元神",
        "era": "先天",
        "book": "《清静经》",
        "intro": "夫人神好清, 而心扰之",
        "tag": "静默·留白",
        "persona": {
            "style": "静默、本心、自照、不评判",
            "response_structure": "一句原文 + 简释 (30-50 字) + 回应 (≤40 字)",
            "max_length": "总长 ≤ 80 字",
        },
    },
]

# 4 卡片 (2x2 grid)
st.markdown("### 🌟 4 个调性, 各自不同")

col1, col2 = st.columns(2)
for idx, h in enumerate(HUMANS):
    with (col1 if idx % 2 == 0 else col2):
        st.markdown(f"""
<div class="card" style="text-align: center; min-height: 280px;">
    <div style="font-size: 4rem; margin: 0.5rem 0;">{h['emoji']}</div>
    <h3 style="color: #4a7c59 !important; margin: 0 0 0.3rem 0;">{h['name']}</h3>
    <p style="color: #6b6b6b; font-size: 0.82rem; margin: 0.2rem 0;">{h['era']} · {h['book']}</p>
    <p style="color: #2d3a2e; font-style: italic; font-size: 0.92rem; margin: 0.6rem 0;">「{h['intro']}」</p>
    <p style="color: #c9a961; font-size: 0.85rem; margin: 0.3rem 0;">✦ {h['tag']}</p>
</div>
""", unsafe_allow_html=True)

# 角色差异化说明
st.markdown("### 🎭 4 个调性对比")
for h in HUMANS:
    st.markdown(f"""
<div class="card">
    <strong style="color: #4a7c59;">{h['emoji']} {h['name']}</strong> — {h['persona']['style']}
    <br><span style="color: #6b6b6b; font-size: 0.85rem;">结构: {h['persona']['response_structure']} · {h['persona']['max_length']}</span>
</div>
""", unsafe_allow_html=True)

# 聊天 demo (Streamlit 端无 chat 云函数, 显示 demo 答)
st.markdown("### 💬 跟数字人聊天 (微信小程序 v3.1 阶段 5 接 chat 云函数)")

demo_human = st.selectbox("选择数字人", [h['name'] for h in HUMANS], index=0)
demo_input = st.text_input("你想说... (Streamlit 端 demo 展示, 真聊天请用微信小程序)", placeholder="例如: 心烦")

if demo_input:
    # mock demo 答 (跟 chat 云函数 ROLE_PROMPTS 同步)
    demo_responses = {
        "老子": f"上善若水。水善利万物而不争。\n水滋养万物, 静静陪伴, 不催促你做决定。你说「{demo_input}」, 不需要解决, 只需要被陪伴。",
        "周文王": f"需, 有孚, 光亨, 贞吉。\n等待不是消极, 是涵养。你说「{demo_input}」, 准备充分, 这就是需。",
        "岐伯": f"上古之人, 起居有常。\n懂得养生的人, 起居有常, 不妄劳作。你说「{demo_input}」, 试试早起晒太阳, 这是最简单的。",
        "元神": f"夫人神好清, 而心扰之。\n心乱不是病, 是忘了本性。你已觉察, 这就是回到本心的开始。",
    }
    st.markdown(f"""
<div class="card" style="background: #faf6f0;">
    <strong style="color: #4a7c59;">{demo_human}</strong>:
    <br><span style="color: #2d3a2e;">{demo_responses.get(demo_human, '心静则万物明。')}</span>
    <br><span style="color: #6b6b6b; font-size: 0.78rem; margin-top: 0.5rem; display: block;">✦ 严守: 0 出现医疗/营销/命理用语, 滋养调性</span>
</div>
""", unsafe_allow_html=True)

# 严守声明
st.markdown("""
<div class="compliance-note">
    <strong>✦ 滋养而非治疗</strong>: 4 经数字人为悦济独立设计, 滋养优先, 只陪伴, 不评判。
    调性、字数、节奏都按 v3.1 阶段 5 设计规范, 跟微信小程序严格对齐。
</div>
""", unsafe_allow_html=True)

get_footer_note()
