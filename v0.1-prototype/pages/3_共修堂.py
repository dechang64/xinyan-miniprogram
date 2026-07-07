"""心颜 v0.1 原型 — page 3: 共修堂

核心壁垒: 3 任务打卡 + 心愿流 + 排行 + 自我对话
严守 6 条意见: 滋养, 照镜子, 共修 (不卖货, 不评美丑, 不医疗)
"""
import streamlit as st
from datetime import date
from core.styles import inject_css
from core.config import (
    get_brand_header, get_footer_note, get_solar_term_strip,
    checkin_init, is_all_done,
)

st.set_page_config(page_title="心颜共修堂", page_icon="🌸", layout="centered", initial_sidebar_state="collapsed")
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
    st.page_link("pages/5_我的.py", label="🌿 我的")
    st.markdown("---")
    st.caption("v0.6.3 · 2026-07-07")
    st.caption("滋养 · 涵养 · 共修")
# ── brand header ──
get_brand_header()

# ══════════════════════════════════════════════════════════
#  🌸 共修堂核心: 3 任务清单
# ══════════════════════════════════════════════════════════
st.markdown("""
<div style="text-align: center; padding: 0.5rem 0; color: #4a7c59; font-size: 1.1rem; font-weight: 500; letter-spacing: 0.1em;">
    🌸 心颜共修堂
</div>
<div style="text-align: center; color: #6b6b6b; font-size: 0.85rem; margin-bottom: 1.5rem; font-style: italic;">
    一群人一起, 慢慢变好
</div>
""", unsafe_allow_html=True)

st.markdown("### 今日共修 3 任务")

# 任务 1: 经文
if st.session_state.checkin["jingwen"]:
    st.markdown("""
    <div class="task-row done">
        <span class="task-check done">✓</span>
        <span class="task-text">读一遍今日经文 (5 分钟)</span>
    </div>
    """, unsafe_allow_html=True)
else:
    st.markdown("""
    <div class="task-row">
        <span class="task-check"></span>
        <span class="task-text">读一遍今日经文 (5 分钟)</span>
    </div>
    """, unsafe_allow_html=True)
    if st.button("📜 去做任务 1", key="t1", use_container_width=True):
        st.switch_page("pages/1_每日一经.py")

# 任务 2: 汤品
if st.session_state.checkin["soup"]:
    st.markdown("""
    <div class="task-row done">
        <span class="task-check done">✓</span>
        <span class="task-text">准备 / 喝下今日一汤 (15 分钟)</span>
    </div>
    """, unsafe_allow_html=True)
else:
    st.markdown("""
    <div class="task-row">
        <span class="task-check"></span>
        <span class="task-text">准备 / 喝下今日一汤 (15 分钟)</span>
    </div>
    """, unsafe_allow_html=True)
    if st.button("🍵 去做任务 2", key="t2", use_container_width=True):
        st.switch_page("pages/2_每日一汤.py")

# 任务 3: 自我对话
if st.session_state.checkin["self_talk"]:
    st.markdown("""
    <div class="task-row done">
        <span class="task-check done">✓</span>
        <span class="task-text">写下 1 句自我对话 (3 分钟)</span>
    </div>
    """, unsafe_allow_html=True)
else:
    st.markdown("""
    <div class="task-row">
        <span class="task-check"></span>
        <span class="task-text">写下 1 句自我对话 (3 分钟)</span>
    </div>
    """, unsafe_allow_html=True)

# ── 任务 3 详情: 自我对话输入 ──
if not st.session_state.checkin["self_talk"]:
    st.markdown("---")
    st.markdown("#### 🪞 镜中的自己, 你今天想对自己说什么?")
    self_talk = st.text_area(
        "写下 1 句",
        placeholder="例如: 谢谢你, 一直很努力。 / 今天辛苦了, 早点休息。 / 你比自己想象的更勇敢。",
        height=80,
        label_visibility="collapsed",
    )
    if st.button("✅ 完成", key="t3_done", type="primary", use_container_width=True):
        if self_talk.strip():
            st.session_state.checkin["self_talk"] = True
            st.session_state['_last_self_talk'] = self_talk
            st.success("✦ 滋养一刻, 今日自我对话完成")
            st.balloons()
            import time
            time.sleep(1)
            st.rerun()
        else:
            st.warning("✦ 先写一句就好, 哪怕是「今天不想说话」也是真实的。")

# 全部完成 — 庆祝
if is_all_done():
    st.markdown("---")
    st.markdown("""
    <div class="card" style="text-align: center; background: linear-gradient(135deg, #faf6f0, #f0e9dc); border: 1px solid #4a7c59;">
        <h2 style="color: #4a7c59 !important; margin: 0.3rem 0;">🌸 今日共修完成</h2>
        <p style="color: #2d3a2e; margin: 0.5rem 0;">一群人一起, 慢慢变好<br>愿今天的你, 离自己更近一点</p>
    </div>
    """, unsafe_allow_html=True)
    if st.button("🌙 收下今日心颜签", use_container_width=True):
        st.session_state['_show_sign'] = True

# ══════════════════════════════════════════════════════════
#  🪞 镜中 — 今日自评 (4 滑块)
# ══════════════════════════════════════════════════════════
st.markdown("---")
st.markdown("### 🪞 镜中自评 (今日)")
st.caption("为今天的自己打个分, 1-10")

c1, c2 = st.columns(2)
with c1:
    mood = st.slider("心情", 1, 10, 7, key="mood")
    sleep = st.slider("睡眠", 1, 10, 7, key="sleep")
with c2:
    energy = st.slider("精力", 1, 10, 7, key="energy")
    skin = st.slider("肌肤感受", 1, 10, 7, key="skin")

# ══════════════════════════════════════════════════════════
#  🌸 心愿流 (其他用户动态, mock 数据)
# ══════════════════════════════════════════════════════════
st.markdown("---")
st.markdown("### 🌸 共修心愿流")
st.caption("✦ 严守红线: 早安 / 晚安 / 汤品 / 经文心得, 不评美丑, 不卖货")

# 初始化心愿流
if 'wishes' not in st.session_state:
    st.session_state.wishes = [
        {"type": "早安", "text": "小暑第三天, 早起煮了一碗绿豆百合汤, 窗外有风。", "from": "素心", "time": "今早 06:42"},
        {"type": "晚安", "text": "今日读了一遍《道德经》第 15 章, 心静下来。晚安。", "from": "清欢", "time": "昨晚 22:18"},
        {"type": "汤品", "text": "今日的莲子百合羹, 女儿说「妈妈这个汤甜甜的」。", "from": "暖阳", "time": "今午 12:05"},
        {"type": "经文", "text": "「天行健, 君子以自强不息。」这句话今天看, 又不一样。", "from": "青禾", "time": "今早 07:30"},
        {"type": "晚安", "text": "今天没完成任务, 但还是对自己说一声晚安。", "from": "知行", "time": "昨晚 23:50"},
    ]

# 显示心愿
for w in st.session_state.wishes:
    st.markdown(f"""
    <div class="wish-card">
        <div class="time">{w['time']} · <span class="type">{w['type']}</span></div>
        <div class="text">{w['text']}</div>
        <div class="from">— {w['from']}</div>
    </div>
    """, unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════
#  ✏️ 写心愿 (新)
# ══════════════════════════════════════════════════════════
st.markdown("---")
st.markdown("### ✏️ 写一条心愿 (早安 / 晚安 / 汤品 / 经文)")
st.caption("✦ 严守红线: 不评美丑 / 不卖货 / 不医疗 / 不政治宗教极端")

c1, c2, c3 = st.columns(3)
with c1:
    wish_type = st.radio("类型", ["早安", "晚安", "汤品", "经文"], horizontal=False)
with c2:
    wish_name = st.text_input("署名 (可选)", placeholder="如: 素心", max_chars=10)
with c3:
    pass  # spacer

wish_text = st.text_area(
    "心愿",
    placeholder="今天你感受到什么? 读了什么经? 喝了什么汤? 早安晚安?",
    height=80,
    label_visibility="collapsed",
)

if st.button("✦ 发布", use_container_width=True, type="primary"):
    if wish_text.strip():
        from datetime import datetime
        now = datetime.now()
        st.session_state.wishes.insert(0, {
            "type": wish_type,
            "text": wish_text,
            "from": wish_name if wish_name.strip() else "心颜客",
            "time": "刚刚",
        })
        st.success("✦ 心愿已发布")
        import time
        time.sleep(0.5)
        st.rerun()
    else:
        st.warning("✦ 写一句就好, 哪怕是「今天想静静」")

# ══════════════════════════════════════════════════════════
#  🏆 共修排行 (mock, v0.1 简化)
# ══════════════════════════════════════════════════════════
st.markdown("---")
st.markdown("### 🏆 共修排行 (v0.1 mock)")

c1, c2, c3, c4 = st.columns(4)
with c1:
    st.metric("连续共修", "1", "天")
with c2:
    st.metric("总共修", "1", "天")
with c3:
    st.metric("心愿数", f"{len([w for w in st.session_state.wishes if w['from'] != '心颜客' and w['from'] != '素心' and w['from'] != '清欢' and w['from'] != '暖阳' and w['from'] != '青禾' and w['from'] != '知行'])}", "条")
with c4:
    st.metric("共修伙伴", "12,840", "人")

st.caption("✦ v0.1 简化: 仅显示本人数据; 真实排行 v0.5 上线")

# ══════════════════════════════════════════════════════════
#  📌 Footer
# ══════════════════════════════════════════════════════════
get_footer_note()
