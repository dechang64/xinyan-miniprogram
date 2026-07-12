"""悦济 v0.6 — page 5: 我的 (共修统计 + 收藏 + 海报历史 + 设置)"""
import streamlit as st
from datetime import date, datetime
from core.styles import inject_css
from core.config import (
    BRAND_NAME, BRAND_PY, BRAND_TAGLINE, BRAND_SUB,
    TIZHI_9, get_brand_header, get_footer_note, get_solar_term_strip,
    COMPLIANCE_DISCLAIMER,
)
from data.jingwen_30 import JINGWEN_30, get_by_id
from data.soups_30 import SOUPS_30
from data.self_dialogue import SELF_DIALOGUE_30, get_by_id

st.set_page_config(page_title="我的 · 悦济", page_icon="🌿", layout="centered", initial_sidebar_state="collapsed")
inject_css()

# sidebar: 只显示品牌 + 严守 caption (导航用 streamlit 自动顶部 nav, 不重复)
# ── sidebar: 自定义中文菜单 (默认收起, 用户主动展开才显示) ──
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
    st.page_link("pages/5_我的.py", label="🌿 我的")
    st.markdown("---")
    st.caption("v0.7.1.2 · 2026-07-07")
    st.caption("滋养 · 涵养 · 共修")
get_brand_header()

# 区块 1: 共修统计
st.markdown("### 🌿 共修统计")
mirror_history = st.session_state.get("mirror_history", [])
checkin = st.session_state.get("checkin", {})
fl_enabled = st.session_state.get("fl_enabled", False)

total_days = len(mirror_history)
consecutive_days = 0
if mirror_history:
    history_dates = sorted(set(h["date"] for h in mirror_history), reverse=True)
    if history_dates and history_dates[0] == date.today().isoformat():
        consecutive_days = 1
        for i in range(1, len(history_dates)):
            if (date.fromisoformat(history_dates[i-1]) - date.fromisoformat(history_dates[i])).days == 1:
                consecutive_days += 1
            else:
                break

c1, c2, c3, c4 = st.columns(4)
c1.metric("共修天数", f"{total_days} 天")
c2.metric("连续打卡", f"{consecutive_days} 天", "📈" if consecutive_days >= 3 else None)
checkin_done = sum(1 for k, v in checkin.items() if v is True)
c3.metric("今日任务", f"{checkin_done} / 3")
c4.metric("FL 模式", "🌐 开启" if fl_enabled else "✦ 关闭")

st.markdown(f"""
<div class="card" style="background: linear-gradient(135deg, #faf6f0, #f0e9dc); text-align: center; padding: 1rem;">
    <div style="color: #a94442; font-size: 0.78rem; letter-spacing: 0.2em; margin-bottom: 0.3rem;">悦济客</div>
    <div style="color: #2d3a2e; font-size: 0.95rem; font-style: italic;">"一群人一起, 慢慢变好"</div>
    <div style="color: #6b6b6b; font-size: 0.85rem; margin-top: 0.4rem;">{get_solar_term_strip()}</div>
</div>
""", unsafe_allow_html=True)

# 区块 2: 收藏
st.markdown("---")
st.markdown("### ⭐ 收藏")
st.caption("✦ 数据仅存你浏览器, 关浏览器即清空")

if "favorites" not in st.session_state:
    st.session_state.favorites = {
        "jingwen": [],
        "soup": [],
        "self_dialogue": [],
    }

tab_jw, tab_sp, tab_dl = st.tabs(["📜 经文", "🍵 汤品", "💬 自对话"])

with tab_jw:
    selected_jw = st.selectbox(
        "选择经文加入收藏",
        ["#" + str(j["id"]).zfill(2) + " " + j["source"] + " · " + j["title"] for j in JINGWEN_30],
        key="fav_jw_add",
        label_visibility="collapsed",
    )
    jw_id = int(selected_jw.split("#")[1].split(" ")[0])
    if st.button("⭐ 收藏", key="fav_jw_btn"):
        if jw_id not in st.session_state.favorites["jingwen"]:
            st.session_state.favorites["jingwen"].append(jw_id)
            st.success("✦ 已收藏")
        else:
            st.info("已经在收藏里了")

    st.markdown("**已收藏**")
    if st.session_state.favorites["jingwen"]:
        for jid in st.session_state.favorites["jingwen"]:
            j = get_by_id(jid)
            if j:
                cc1, cc2 = st.columns([5, 1])
                with cc1:
                    st.markdown("📜 **" + j["source"] + "** · " + j["title"])
                    st.caption(j["content"][:40] + "...")
                with cc2:
                    if st.button("🗑️", key=f"del_jw_{jid}"):
                        st.session_state.favorites["jingwen"].remove(jid)
                        st.rerun()
    else:
        st.caption("还没有收藏经文")

with tab_sp:
    selected_sp = st.selectbox(
        "选择汤品加入收藏",
        ["#" + str(s["id"]).zfill(2) + " " + s["name"] + " · " + s["tizhi_tag"] for s in SOUPS_30],
        key="fav_sp_add",
        label_visibility="collapsed",
    )
    sp_id = int(selected_sp.split("#")[1].split(" ")[0])
    if st.button("⭐ 收藏", key="fav_sp_btn"):
        if sp_id not in st.session_state.favorites["soup"]:
            st.session_state.favorites["soup"].append(sp_id)
            st.success("✦ 已收藏")
        else:
            st.info("已经在收藏里了")

    st.markdown("**已收藏**")
    if st.session_state.favorites["soup"]:
        for sid in st.session_state.favorites["soup"]:
            s = next((x for x in SOUPS_30 if x["id"] == sid), None)
            if s:
                cc1, cc2 = st.columns([5, 1])
                with cc1:
                    st.markdown("🍵 **" + s["name"] + "** · " + s["tizhi_tag"] + " · " + s["season_tag"])
                    st.caption(s["effect"])
                with cc2:
                    if st.button("🗑️", key=f"del_sp_{sid}"):
                        st.session_state.favorites["soup"].remove(sid)
                        st.rerun()
    else:
        st.caption("还没有收藏汤品")

with tab_dl:
    selected_dl = st.selectbox(
        "选择自对话加入收藏",
        ["#" + str(d["id"]).zfill(2) + " [" + d["type"] + "] " + d["text"] for d in SELF_DIALOGUE_30],
        key="fav_dl_add",
        label_visibility="collapsed",
    )
    dl_id = int(selected_dl.split("#")[1].split(" ")[0])
    if st.button("⭐ 收藏", key="fav_dl_btn"):
        if dl_id not in st.session_state.favorites["self_dialogue"]:
            st.session_state.favorites["self_dialogue"].append(dl_id)
            st.success("✦ 已收藏")
        else:
            st.info("已经在收藏里了")

    st.markdown("**已收藏**")
    if st.session_state.favorites["self_dialogue"]:
        for did in st.session_state.favorites["self_dialogue"]:
            d = get_by_id(did)
            if d:
                cc1, cc2 = st.columns([5, 1])
                with cc1:
                    st.markdown("💬 **[" + d["type"] + "]** " + d["text"])
                with cc2:
                    if st.button("🗑️", key=f"del_dl_{did}"):
                        st.session_state.favorites["self_dialogue"].remove(did)
                        st.rerun()
    else:
        st.caption("还没有收藏自对话")

# 区块 3: 海报历史
st.markdown("---")
st.markdown("### 🎨 海报历史 (本次会话)")
st.caption("✦ 历史仅本次浏览器会话保留, 关浏览器即清空")

if "poster_history" not in st.session_state:
    st.session_state.poster_history = []

if not st.session_state.poster_history:
    st.caption("还没有生成过海报. 去镜中签滚到底试试 🎨")
else:
    for i, item in enumerate(reversed(st.session_state.poster_history[-5:])):
        ts = item.get("ts", "")
        theme = item.get("theme", "")
        style = item.get("style", "")
        bg_source = item.get("bg_source", "无背景图")
        st.markdown(f"""
        <div class="card" style="padding: 0.8rem; margin: 0.4rem 0;">
            <div style="color: #a94442; font-size: 0.78rem; letter-spacing: 0.2em;">#{i+1} {ts}</div>
            <div style="color: #2d3a2e; margin: 0.3rem 0;">主题: <strong>{theme}</strong> · 风格: <strong>{style}</strong></div>
            <div style="color: #6b6b6b; font-size: 0.85rem;">背景: {bg_source}</div>
        </div>
        """, unsafe_allow_html=True)

# 区块 4: 设置
st.markdown("---")
st.markdown("### ⚙️ 设置")

st.markdown("#### 🧬 体质")
tizhi_options = {f"{name} — {desc}": key for key, (name, desc) in TIZHI_9.items()}
current_tizhi = st.session_state.get("tizhi", "pinghe")
current_label = next(
    (k for k, v in tizhi_options.items() if v == current_tizhi),
    list(tizhi_options.keys())[0],
)
new_tizhi_label = st.selectbox(
    "你的 9 体质 (王琦 2009)",
    list(tizhi_options.keys()),
    index=list(tizhi_options.keys()).index(current_label) if current_label in tizhi_options else 0,
    label_visibility="collapsed",
)
if st.button("💾 保存体质"):
    st.session_state.tizhi = tizhi_options[new_tizhi_label]
    st.success("✦ 已改体质: " + tizhi_options[new_tizhi_label])

st.markdown("#### 🌸 共修堂 3 任务")
if st.button("🔄 重置今日 3 任务 (经文/汤品/自评)"):
    st.session_state.checkin = {
        "jingwen": False,
        "soup": False,
        "self_talk": False,
        "date": str(date.today()),
    }
    st.success("✦ 今日任务已重置")

st.markdown("#### 🔒 隐私与严守")
st.markdown(f"""
<div class="compliance-note">
    <strong>✦ 严守</strong>: {COMPLIANCE_DISCLAIMER}<br>
    <strong>✦ 隐私</strong>: 悦济所有数据只在本地浏览器 (session_state), 不上传到任何云端. 关浏览器即清空.<br>
    <strong>✦ 自拍</strong>: 悦济自拍仅用于本地海报合成, 不上传, 不 AI 测肤, 不 AI 分析.<br>
    <strong>✦ FL 联邦</strong>: FL 模式默认关闭, 开启时 server 端只算加密聚合, 看不到单个 user.<br>
    <strong>✦ 严守 6 条意见</strong>: 滋养而非治疗 / 照镜子 / 不挂祺臻 / 重点社群 / 每日一经 / 每日一汤
</div>
""", unsafe_allow_html=True)

st.markdown("#### 🌿 关于悦济")
st.markdown(f"""
<div class="card">
    <div style="color: #4a7c59; font-size: 1.1rem; font-weight: 500; margin-bottom: 0.5rem;">{BRAND_NAME} · {BRAND_PY}</div>
    <div style="color: #2d3a2e; font-style: italic; margin: 0.3rem 0;">"{BRAND_TAGLINE}"</div>
    <div style="color: #6b6b6b; font-size: 0.88rem; line-height: 1.6; margin-top: 0.5rem;">
        ✦ v0.6 原型 · 2026-07-07<br>
        ✦ 技术栈: Streamlit 1.45 (Cloud Python 3.14)<br>
        ✦ 知识库: 30 篇经文 + 30 款汤品 + 30 句金句<br>
        ✦ 量表: PHQ-9 / GAD-7 / DLQI (严守不诊断)<br>
        ✦ 海报: 9 主题 × 6 风格 + 自拍背景 (本地 Pillow)<br>
        ✦ FL: 灵感 reading-fl (Apache 2.0), v1.0 真接<br>
        ✦ 团队: Dechang Yu + Mavis (MiniMax Agent Team)
    </div>
</div>
""", unsafe_allow_html=True)

st.markdown("#### ⚠️ 重置全部数据")
st.caption("✦ 清空悦济所有本地数据 (session_state)")
if st.button("🗑️ 重置全部 (慎点)", type="secondary"):
    for key in list(st.session_state.keys()):
        del st.session_state[key]
    st.success("✦ 全部数据已清空, 刷新页面重新开始")
    import time; time.sleep(1); st.rerun()

get_footer_note()