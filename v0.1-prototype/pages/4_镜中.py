"""心颜 v0.6.4 — page 4: 镜中 (核心情感 — 照镜子, 也是为了更好的自己)

6 个区块 (v0.6.4 大幅精简):
1. 4 滑块自评 (心情/精力/睡眠/肌肤) + 保存
2. 30 天心情曲线 (st.line_chart, session_state 累积)
3. 今日自我对话 (6 类标签筛选)
4. 「给 3 个月后的自己」彩蛋 (本地 session_state)
5. 我的镜中签 (海报生成, 9 主题 x 6 风格 + 温润滤镜, 下载到本地)
6. FL 联邦聚合 (v0.5.2 mock, 同城同龄人心情/汤品/共修排行)

v0.6.4 删除: PHQ-9 / GAD-7 / DLQI 3 个量表 (与心颜「滋养而非治疗」基调冲突, 量表细节冗长)
- 用户需要专业测评请去咨询专业人士 (12356 危机热线保留)

严守 6 条意见: 滋养而非治疗, 照镜子, 不诊断
v0.5.1: 干掉 altair, 用 st.line_chart (避免 Cloud Python 3.14 上 altair 5.5 schema 炸)
v0.5.2: 加 镜中签海报 (C 方案) + FL 联邦聚合 (灵感 reading-fl Apache 2.0)
v0.6.1: 加温润滤镜 (5 预设: 原图/清润/温润/通透/晨光/黄昏, 自定义 5 滑块)
v0.6.4: 删 3 量表, 严守「滋养」基调, 镜中 page 精简到 6 区块
"""
import streamlit as st
from datetime import date, datetime, timedelta
from core.styles import inject_css
from core.config import (
    get_brand_header, get_footer_note, get_solar_term_strip,
    checkin_init, COMPLIANCE_DISCLAIMER,
)
# v0.6.4: 删除 3 个量表, 心颜严守「滋养」基调, 不放医疗量表
# (scales.py 保留, 备未来需要时复用, 但镜中 page 不再调用)
from data.self_dialogue import get_today_dialogue, SELF_DIALOGUE_30
from data.jingwen_30 import get_today_jingwen
from data.soups_30 import get_today_soup
from data.posters import (
    POSTER_THEMES, POSTER_STYLES, draw_poster, preview_poster,
    img_to_bytes, POSTER_DISCLAIMER, WATERMARK,
    apply_warm_filter, WARM_FILTER_PRESETS,
)
from data.fl_mock import (
    FL_DISCLAIMER, FL_PRIVACY, mock_fl_query_mood, mock_fl_query_soup,
    mock_fl_query_checkin, hash_user_tag, encrypt_mood, mood_to_bucket,
)

st.set_page_config(page_title="镜中 · 心颜", page_icon="🪞", layout="centered", initial_sidebar_state="collapsed")
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
    st.caption("v0.7.1 · 2026-07-07")
    st.caption("滋养 · 涵养 · 共修")
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
    # 按日期排序
    history_sorted = sorted(st.session_state.mirror_history, key=lambda x: x["date"])

    # 用原生 Python dict 喂 st.line_chart (不用 pandas, 避免依赖)
    chart_data = {
        "🌿 心情": [h["mood"] for h in history_sorted],
        "⚡ 精力": [h["energy"] for h in history_sorted],
        "🌙 睡眠": [h["sleep"] for h in history_sorted],
        "🌸 肌肤": [h["skin"] for h in history_sorted],
    }
    st.line_chart(chart_data, height=280, x_label="日期", y_label="分数 (1-10)")

    # 统计
    if len(history_sorted) >= 3:
        st.markdown("#### 📊 这段时间的小观察")
        mood_list = [h["mood"] for h in history_sorted]
        avg_list = [h["avg"] for h in history_sorted]
        cols = st.columns(4)
        cols[0].metric("共修天数", f"{len(history_sorted)} 天")
        cols[1].metric("心情均值", f"{sum(mood_list)/len(mood_list):.1f}")
        cols[2].metric("最高分", f"{max(avg_list):.1f}")
        cols[3].metric("最低分", f"{min(avg_list):.1f}")

        # 简单洞察
        if mood_list[-1] > mood_list[0]:
            st.success("✦ 心情在向上, 继续涵养")
        elif mood_list[-1] < mood_list[0]:
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
#  区块 3-5 整段删除 (v0.6.4 — 严守「滋养」基调)
# ══════════════════════════════════════════════════════════
st.markdown("---")

# v0.6.4: 替换成「滋养自评入口」+ 严守声明 (心颜不替用户做诊断, 需要专业测评请找专业人士)
st.markdown("### 🪞 心颜自评 (滋养维度)")
st.markdown(f"""
<div class="card" style="background: linear-gradient(135deg, #faf6f0, #f0e9dc);">
    <div style="color: #a94442; font-size: 0.85rem; letter-spacing: 0.2em; margin-bottom: 0.5rem;">✦ 滋养而非诊断</div>
    <div style="color: #2d3a2e; line-height: 1.8;">
        心颜是<strong>日常陪伴</strong>, 不是医疗工具.<br>
        镜中自评只看<strong>心情 / 精力 / 睡眠 / 肌肤</strong> 4 个滋养维度, 不做抑郁 / 焦虑 / 皮肤病诊断.<br>
        如果你最近持续心情低落、焦虑不安或皮肤问题反复, 请联系<strong>专业人士</strong>或拨打<strong>12356</strong> 心理援助热线.
    </div>
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
    mood_list = [h["mood"] for h in st.session_state.mirror_history]
    avg_list = [h["avg"] for h in st.session_state.mirror_history]
    avg_mood = sum(mood_list) / len(mood_list)
    avg_avg = sum(avg_list) / len(avg_list)
    high_days = sum(1 for a in avg_list if a >= 7)
    low_days = sum(1 for a in avg_list if a < 5)

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
#  区块 8: 我的镜中签 (C 方案 — 选主题 + 选风格 + 选背景色, 一键下载)
# ══════════════════════════════════════════════════════════
st.markdown("---")
st.markdown("### 🪞 我的镜中签")
st.caption("✦ 选 1 个主题 + 1 个风格, 一键下载到本地 (1080×1920 朋友圈尺寸)")

# 主题 + 风格选择
c1, c2 = st.columns(2)
with c1:
    theme_options = {t["name"]: t["key"] for t in POSTER_THEMES}
    theme_label = st.selectbox(
        "主题",
        list(theme_options.keys()),
        index=0,
        key="poster_theme",
    )
    theme_key = theme_options[theme_label]
with c2:
    style_label = st.selectbox(
        "风格",
        list(POSTER_STYLES.keys()),
        index=1,  # 默认 节气
        key="poster_style",
    )

# v0.5.3: 拍照 / 上传二选一 (本地处理, 不上传云)
st.markdown("##### 📷 拍照 / 上传 (可选)")
st.caption("✦ 自拍当背景图素材 — 严守: 不上传人脸, 不 AI 测肤, 只本地 Pillow 叠加 0.35 不透明")

col_cam, col_up = st.columns(2)
with col_cam:
    cam_input = st.camera_input(
        "📷 拍一张 (本地摄像头, 不上传)",
        key="poster_cam",
        help="拍完照片仅用于本次海报合成, 关浏览器即清空",
    )
with col_up:
    bg_upload = st.file_uploader(
        "📁 或上传 1 张图片 (jpg/png)",
        type=["jpg", "jpeg", "png"],
        key="poster_bg",
        help="上传图片仅用于本次海报合成, 关浏览器即清空",
    )

# 决定用哪个 (优先拍照, 其次上传)
from PIL import Image
import io

bg_pil_image = None
bg_source = None  # 用于合规说明
if cam_input is not None:
    try:
        bg_pil_image = Image.open(io.BytesIO(cam_input.read()))
        bg_source = "📷 拍照"
    except Exception as e:
        st.warning(f"拍照读取失败: {e}")
elif bg_upload is not None:
    try:
        bg_pil_image = Image.open(bg_upload)
        bg_source = "📁 上传"
    except Exception as e:
        st.warning(f"上传读取失败: {e}")

# v0.5.3: 镜中主题提醒
theme_needs_bg = theme_key in ["mirror_today", "mirror_30day", "mirror_monthly"]
if theme_needs_bg and bg_pil_image is None:
    st.caption("⚠️ 镜中主题需要 1 张自拍/上传, 否则海报只用纯色背景")
elif bg_pil_image is not None:
    st.success(f"✦ 已选背景图 ({bg_source}), 仅本次会话使用, 不上传")

# v0.6.1: 温润滤镜 (5 预设 + 自定义滑块) — 只在有背景图时显示
if bg_pil_image is not None:
    st.markdown("##### 🎨 温润滤镜 (本地处理, 不上传)")
    st.caption("✦ 5 预设 / 自定义滑块 — 严守: 不用「美颜/美白/瘦脸」营销词, 用「清润/温润/通透/晨光/黄昏」, 纯本地 Pillow, 不 AI 测肤")

    preset_label = st.selectbox(
        "选择温润滤镜预设",
        list(WARM_FILTER_PRESETS.keys()),
        index=0,
        key="warm_preset",
        label_visibility="collapsed",
    )

    # 自定义滑块 (advanced expander)
    with st.expander("🔧 自定义滑块 (高级)", expanded=False):
        st.caption("✦ 5 滑块 0.0-1.0, 覆盖预设. 默认值跟预设走, 拖动则自定义.")
        c1, c2 = st.columns(2)
        with c1:
            custom_smooth = st.slider("磨皮 (高斯 + 中值)", 0.0, 1.0, WARM_FILTER_PRESETS[preset_label]["smooth"], 0.05, key="warm_smooth")
            custom_bright = st.slider("亮肤 (Brightness)", 0.0, 1.0, WARM_FILTER_PRESETS[preset_label]["bright"], 0.05, key="warm_bright")
            custom_color = st.slider("通透 (Color 饱和度)", 0.0, 1.0, WARM_FILTER_PRESETS[preset_label]["color"], 0.05, key="warm_color")
        with c2:
            custom_warm = st.slider("暖色 (R+ / B-)", 0.0, 1.0, WARM_FILTER_PRESETS[preset_label]["warm"], 0.05, key="warm_warm")
            custom_contrast = st.slider("对比度 (Contrast)", 0.0, 1.0, WARM_FILTER_PRESETS[preset_label]["contrast"], 0.05, key="warm_contrast")

    # 实时预览: 先用温润滤镜处理
    if st.button("👀 预览温润效果", key="btn_warm_preview"):
        try:
            preview_processed = apply_warm_filter(
                bg_pil_image.copy(),
                preset=preset_label,
                smooth=st.session_state.get("warm_smooth"),
                bright=st.session_state.get("warm_bright"),
                color=st.session_state.get("warm_color"),
                warm=st.session_state.get("warm_warm"),
                contrast=st.session_state.get("warm_contrast"),
            )
            # 缩放到合适尺寸
            preview_processed.thumbnail((400, 700), Image.LANCZOS)
            st.image(preview_processed, caption=f"温润滤镜预览 ({preset_label})", use_container_width=False)
        except Exception as e:
            st.warning(f"预览失败: {e}")

st.markdown(f"""
<div class="compliance-note">
    <strong>✦ 严守</strong>: {POSTER_DISCLAIMER}<br>
    <strong>✦ 永久水印</strong>: 海报右下角永久印「{WATERMARK}」
</div>
""", unsafe_allow_html=True)

# 生成按钮
if st.button("🎨 生成我的镜中签", use_container_width=True, type="primary", key="btn_make_poster"):
    # 取今日经文 + 汤品
    jw = get_today_jingwen()
    sp = get_today_soup()
    # v0.6.1: 先过温润滤镜 (如果用户选了非"原图"预设 或 动了滑块)
    processed_bg = bg_pil_image
    if bg_pil_image is not None:
        preset_label = st.session_state.get("warm_preset", "原图")
        # 检查是否动了滑块 (跟预设默认对比)
        is_custom = any(
            st.session_state.get(f"warm_{k}", WARM_FILTER_PRESETS[preset_label][k])
            != WARM_FILTER_PRESETS[preset_label][k]
            for k in ["smooth", "bright", "color", "warm", "contrast"]
        )
        if preset_label != "原图" or is_custom:
            try:
                processed_bg = apply_warm_filter(
                    bg_pil_image.copy(),
                    preset=preset_label,
                    smooth=st.session_state.get("warm_smooth"),
                    bright=st.session_state.get("warm_bright"),
                    color=st.session_state.get("warm_color"),
                    warm=st.session_state.get("warm_warm"),
                    contrast=st.session_state.get("warm_contrast"),
                )
            except Exception as e:
                st.warning(f"温润滤镜失败, 用原图: {e}")
                processed_bg = bg_pil_image
    # 画 (v0.5.3: 传 bg_pil_image, 自拍当背景 / v0.6.1: 传 processed_bg, 过温润滤镜)
    img = draw_poster(
        theme_key, style_label,
        st.session_state.mirror_history,
        jw, sp,
        bg_image=processed_bg,
    )
    # 存 session 给 download
    st.session_state["_poster_img"] = img
    st.session_state["_poster_bg_source"] = bg_source  # 用于严守说明
    st.success("✦ 镜中签已生成, 下方下载或长按图片保存到手机")

# 显示预览 + 下载
if "_poster_img" in st.session_state:
    img = st.session_state["_poster_img"]
    preview = preview_poster(img)
    st.image(preview, caption="预览 (1080×1920 全尺寸点击下载)", use_container_width=False)

    # 下载按钮
    img_bytes = img_to_bytes(img, format="PNG")
    filename = f"xinyan_mirror_{date.today().isoformat()}.png"
    st.download_button(
        label="📥 下载心颜签 (PNG, 1080×1920)",
        data=img_bytes,
        file_name=filename,
        mime="image/png",
        use_container_width=True,
    )
    st.caption("✦ 下载后: 微信扫码 → 选图片 → 朋友圈发布. 心颜不存图, 不传图, 不分析图.")
    if st.session_state.get("_poster_bg_source"):
        st.caption(f"✦ 海报背景来源: {st.session_state.get('_poster_bg_source')} (本地 Pillow 处理, 不上传到任何 server)")

# ══════════════════════════════════════════════════════════
#  区块 9: FL 联邦聚合 (v0.5.2 mock, 灵感 reading-fl Apache 2.0)
# ══════════════════════════════════════════════════════════
st.markdown("---")
st.markdown("### 🌐 FL 联邦聚合 (v0.5.2 mock)")
st.caption("✦ 灵感 reading-fl (Apache 2.0) — 数据只在本地, server 看不到你")

# FL 开关
fl_enabled = st.checkbox(
    "✦ 开启 FL 联邦聚合 (默认关闭, 严守 ❶ 数据只在本地 ❷ 上传加密标签 ❸ server 看不到单个 user)",
    value=st.session_state.get("fl_enabled", False),
    key="fl_toggle",
    help="关闭时所有 FL 接口都不调用",
)
st.session_state["fl_enabled"] = fl_enabled

if not fl_enabled:
    st.markdown(f"""
    <div class="compliance-note">
        <strong>✦ FL 关闭</strong>: {FL_PRIVACY}<br>
        <strong>✦ 严守</strong>: 心颜镜中不构成任何医学建议, 仅供日常滋养陪伴. 严重时务必就医.
    </div>
    """, unsafe_allow_html=True)
else:
    st.markdown(f"""
    <div class="compliance-note">
        <strong>✦ FL 开启 (mock 模式)</strong>: {FL_DISCLAIMER}<br>
        <strong>✦ 严守</strong>: 心颜镜中不构成任何医学建议, 仅供日常滋养陪伴. 严重时务必就医.
    </div>
    """, unsafe_allow_html=True)

    # 3 个 FL 查询
    fl_tab1, fl_tab2, fl_tab3 = st.tabs(["同龄人心情", "FL 推荐汤品", "FL 共修排行"])

    with fl_tab1:
        st.markdown("**FL 联邦聚合: 同城同年龄段心情分布**")
        age = st.selectbox(
            "年龄段",
            ["20-25", "25-30", "30-40", "40-50"],
            index=1,
            key="fl_age",
        )
        if st.button("🔍 FL 查询 (mock)", key="fl_btn_mood", type="primary"):
            result = mock_fl_query_mood(age)
            st.markdown(f"""
            <div class="card" style="background: linear-gradient(135deg, #faf6f0, #f0e9dc); padding: 1.2rem;">
                <div style="color: #a94442; font-size: 0.78rem; letter-spacing: 0.2em; margin-bottom: 0.4rem;">
                    FL 聚合结果 · 样本 {result['sample_size']} 人
                </div>
                <div style="color: #2d3a2e; font-size: 1rem; line-height: 1.8; margin: 0.3rem 0;">
                    {result['interpretation']}
                </div>
                <div style="color: #6b6b6b; font-size: 0.85rem; line-height: 1.6; margin-top: 0.5rem;">
                    {result['privacy']}<br>
                    ✦ 心情分布:<br>
                    <span class="tag">高位 {result['distribution']['high']*100:.0f}%</span>
                    <span class="tag">中高 {result['distribution']['mid_high']*100:.0f}%</span>
                    <span class="tag">中低 {result['distribution']['mid_low']*100:.0f}%</span>
                    <span class="tag tag-red">低位 {result['distribution']['low']*100:.0f}%</span>
                </div>
            </div>
            """, unsafe_allow_html=True)

    with fl_tab2:
        st.markdown("**FL 联邦推荐: 同体质同季, 哪些汤被 FL 聚合后选最多**")
        c1, c2 = st.columns(2)
        with c1:
            tizhi = st.selectbox(
                "体质",
                ["yinxu (阴虚)", "tanshi (痰湿)", "yangxu (阳虚)", "pinghe (平和)"],
                index=0,
                key="fl_tizhi",
            )
        with c2:
            season = st.selectbox(
                "季节",
                ["夏", "秋", "春", "冬"],
                index=0,
                key="fl_season",
            )

        if st.button("🔍 FL 查询 (mock)", key="fl_btn_soup", type="primary"):
            tizhi_key = tizhi.split(" ")[0]  # "yinxu (阴虚)" -> "yinxu"
            results = mock_fl_query_soup(tizhi_key, season)
            if results:
                for r in results:
                    st.markdown(f"""
                    <div class="card" style="background: linear-gradient(135deg, #faf6f0, #f0e9dc); padding: 0.8rem; margin: 0.3rem 0;">
                        <div style="color: #2d3a2e; font-size: 1.05rem; font-weight: 500;">🍵 {r['name']}</div>
                        <div style="color: #6b6b6b; font-size: 0.85rem; margin-top: 0.3rem;">
                            ✦ FL 聚合票数: <strong style="color: #4a7c59;">{r['votes']}</strong> 票<br>
                            ✦ FL 评分: <strong style="color: #4a7c59;">{r['fl_score']:.2f}</strong>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
                st.caption("✦ 这是 FL 聚合结果, 不是你一个人的选择. server 看不到你的具体选项.")
            else:
                st.info("该组合暂无 FL 聚合数据")

    with fl_tab3:
        st.markdown("**FL 联邦排行: 同年龄段连续共修天数排行 (FL 隐藏真名)**")
        age = st.selectbox(
            "年龄段",
            ["20-25", "25-30", "30-40", "40-50"],
            index=2,
            key="fl_rank_age",
        )
        if st.button("🔍 FL 查询 (mock)", key="fl_btn_rank", type="primary"):
            results = mock_fl_query_checkin(age)
            for r in results:
                medal = ["🥇", "🥈", "🥉"][r['rank']-1]
                st.markdown(f"""
                <div class="card" style="background: linear-gradient(135deg, #faf6f0, #f0e9dc); padding: 0.8rem; margin: 0.3rem 0;">
                    <div style="display: flex; align-items: center;">
                        <div style="font-size: 1.5rem; margin-right: 1rem;">{medal}</div>
                        <div style="flex: 1;">
                            <div style="color: #2d3a2e; font-size: 1.05rem; font-weight: 500;">{r['note']}</div>
                            <div style="color: #6b6b6b; font-size: 0.85rem; margin-top: 0.2rem;">
                                ✦ 连续共修 <strong style="color: #4a7c59;">{r['days']}</strong> 天 ·
                                E-Tag: <code style="color: #a94442;">{r['e_tag']}</code>
                            </div>
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
            st.caption("✦ FL 隐藏真名, 排行只显示 E-Tag + 共修天数, 你不会暴露身份")

# ══════════════════════════════════════════════════════════
#  Footer
# ══════════════════════════════════════════════════════════
get_footer_note()
