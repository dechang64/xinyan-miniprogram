"""心颜 v0.5.2 — 我的镜中签 (海报生成)

6 模板 × 6 主题 = 36 种组合
严守 6 条意见: 不上传人脸/自拍, 不 AI 测肤, 海报右下角永久水印
"""
import io
from datetime import date
from PIL import Image, ImageDraw, ImageFont

# 海报尺寸 (朋友圈 1080×1920 比例)
POSTER_W, POSTER_H = 1080, 1920
# 缩放 (Streamlit 预览)
PREVIEW_W, PREVIEW_H = 540, 960

# 6 主题 (从镜中数据来)
POSTER_THEMES = [
    {"key": "self_talk", "name": "今日自对话", "max_chars": 80},
    {"key": "mood_curve", "name": "30 天心情曲线", "max_chars": 0},  # 特殊: 用图表
    {"key": "jingwen", "name": "今日经文", "max_chars": 100},
    {"key": "soup", "name": "今日汤品", "max_chars": 150},
    {"key": "self_rating", "name": "4 滑块自评", "max_chars": 0},  # 特殊: 用分数卡
    {"key": "monthly", "name": "月底报告", "max_chars": 100},
]

# 6 风格 (跟 v0.5 每日一经/汤品海报一致)
POSTER_STYLES = {
    "📜 经典 (米色竖排)": {
        "bg": "#faf6f0", "fg": "#2d3a2e", "stamp": "#a94442",
        "border": "#a94442", "direction": "vertical",
        "font_family": "Songti SC, STSong, SimSun",
    },
    "🌿 节气 (随节气换色)": {
        "bg": "#f0e9dc", "fg": "#2d3a2e", "stamp": "#4a7c59",
        "border": "#4a7c59", "direction": "horizontal",
        "font_family": "Source Han Serif SC, Songti SC",
    },
    "✨ 极简 (白底黑字)": {
        "bg": "#ffffff", "fg": "#1a1a1a", "stamp": "#666666",
        "border": "#1a1a1a", "direction": "horizontal",
        "font_family": "Helvetica, Arial",
    },
    "🖌️ 文艺 (手写体 + 印章)": {
        "bg": "#f5efe1", "fg": "#3d2817", "stamp": "#a94442",
        "border": "#a94442", "direction": "vertical",
        "font_family": "STKaiti, KaiTi",
    },
    "🌊 水墨 (山水背景)": {
        "bg": "#e8e4d8", "fg": "#1a1a1a", "stamp": "#2d3a2e",
        "border": "#2d3a2e", "direction": "vertical",
        "font_family": "Songti SC, STSong",
    },
    "🎨 现代 (彩色几何)": {
        "bg": "#fff8e7", "fg": "#4a7c59", "stamp": "#c9a961",
        "border": "#c9a961", "direction": "horizontal",
        "font_family": "Helvetica, Arial",
    },
}

# 严守水印 (右下角永久, 不可去掉)
WATERMARK = "心颜 · 照镜子, 也是为了更好的自己"

# 严守声明
POSTER_DISCLAIMER = (
    "心颜镜中签仅供日常滋养陪伴, "
    "不上传人脸/自拍, 不 AI 测肤, 不构成任何医学建议。"
)


def get_text_for_theme(theme_key: str, mirror_history: list, jingwen: dict, soup: dict) -> dict:
    """根据主题返回 {title, content, subtitle, extra}"""
    if theme_key == "self_talk":
        from data.self_dialogue import get_today_dialogue
        d = get_today_dialogue()
        return {
            "title": d["type"],
            "content": d["text"],
            "subtitle": f"今日 · {date.today().isoformat()}",
            "extra": None,
        }
    elif theme_key == "jingwen":
        return {
            "title": jingwen["source"],
            "content": jingwen["content"],
            "subtitle": jingwen["title"],
            "extra": jingwen["jieshi"][:60] + "...",
        }
    elif theme_key == "soup":
        return {
            "title": soup["name"],
            "content": soup["ingredients"],
            "subtitle": soup["season_tag"] + " · " + soup["tizhi_tag"],
            "extra": soup["effect"],
        }
    elif theme_key == "self_rating":
        if not mirror_history:
            return {
                "title": "今日自评",
                "content": "暂无自评记录",
                "subtitle": "去镜中记下今天的自己",
                "extra": None,
            }
        latest = mirror_history[-1]
        return {
            "title": "今日自评",
            "content": f"🌿 心情 {latest['mood']}/10\n⚡ 精力 {latest['energy']}/10\n🌙 睡眠 {latest['sleep']}/10\n🌸 肌肤 {latest['skin']}/10",
            "subtitle": f"总分 {latest['avg']}/10",
            "extra": None,
        }
    elif theme_key == "mood_curve":
        if len(mirror_history) < 2:
            return {
                "title": "30 天心情",
                "content": "记录 ≥ 2 天后\n解锁心情曲线",
                "subtitle": "镜中共修",
                "extra": None,
            }
        return {
            "title": "30 天心情",
            "content": "30 天共修曲线",
            "subtitle": f"共 {len(mirror_history)} 天",
            "extra": "".join(["▁▂▃▄▅▆▇█"[min(7, int(h['mood']/1.3))] for h in mirror_history[-30:]]),
        }
    elif theme_key == "monthly":
        if len(mirror_history) < 5:
            return {
                "title": "月底报告",
                "content": "记录 ≥ 5 天\n解锁月底报告",
                "subtitle": "继续共修",
                "extra": None,
            }
        avg_mood = sum(h['mood'] for h in mirror_history) / len(mirror_history)
        high_days = sum(1 for h in mirror_history if h['avg'] >= 7)
        return {
            "title": "月底滋养报告",
            "content": f"共修 {len(mirror_history)} 天\n滋养日 (≥7) {high_days} 天\n心情均值 {avg_mood:.1f}/10",
            "subtitle": "照镜子, 也是为了更好的自己",
            "extra": None,
        }
    return {}


def get_font(size: int, family: str = "Source Han Serif SC, Songti SC") -> ImageFont.FreeTypeFont:
    """加载字体, 失败 fallback 到 default"""
    families = [f.strip() for f in family.split(",")]
    for fname in families:
        # 尝试常见系统字体
        try:
            return ImageFont.truetype(fname, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def draw_poster(theme_key: str, style_key: str, mirror_history: list,
                jingwen: dict, soup: dict) -> Image.Image:
    """画一张海报 (1080x1920), 返回 PIL Image"""
    style = POSTER_STYLES[style_key]
    text_data = get_text_for_theme(theme_key, mirror_history, jingwen, soup)

    # 创建画布
    img = Image.new("RGB", (POSTER_W, POSTER_H), color=style["bg"])
    draw = ImageDraw.Draw(img)

    # 边框
    border = 8
    draw.rectangle(
        [(border, border), (POSTER_W - border, POSTER_H - border)],
        outline=style["border"],
        width=4,
    )

    # 角章 (四角小方框)
    for cx, cy in [(80, 80), (POSTER_W - 80, 80), (80, POSTER_H - 80), (POSTER_W - 80, POSTER_H - 80)]:
        draw.rectangle([(cx - 30, cy - 30), (cx + 30, cy + 30)], outline=style["stamp"], width=3)

    # 字体
    font_brand = get_font(36, style["font_family"])
    font_title = get_font(72, style["font_family"])
    font_subtitle = get_font(40, style["font_family"])
    font_content = get_font(54, style["font_family"])
    font_extra = get_font(32, style["font_family"])
    font_stamp = get_font(28, style["font_family"])
    font_watermark = get_font(28, style["font_family"])

    # 顶部品牌
    draw.text((POSTER_W // 2 - 60, 200), "心颜", fill=style["stamp"], font=font_brand)
    draw.text((POSTER_W // 2 - 60, 250), "XINYAN", fill=style["stamp"], font=font_brand)

    # 类型 (title)
    title = text_data["title"]
    bbox = draw.textbbox((0, 0), title, font=font_title)
    title_w = bbox[2] - bbox[0]
    draw.text(
        ((POSTER_W - title_w) // 2, 360),
        title,
        fill=style["stamp"],
        font=font_title,
    )

    # 副标题
    subtitle = text_data["subtitle"]
    bbox = draw.textbbox((0, 0), subtitle, font=font_subtitle)
    sub_w = bbox[2] - bbox[0]
    draw.text(
        ((POSTER_W - sub_w) // 2, 480),
        subtitle,
        fill=style["fg"],
        font=font_subtitle,
    )

    # 分隔线
    draw.line([(180, 560), (POSTER_W - 180, 560)], fill=style["border"], width=2)

    # 主内容
    content = text_data["content"]
    lines = content.split("\n") if "\n" in content else [content]
    y = 620
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font_content)
        line_w = bbox[2] - bbox[0]
        if line_w > POSTER_W - 200:
            # 截断
            while line and line_w > POSTER_W - 200:
                line = line[:-2]
                bbox = draw.textbbox((0, 0), line + "...", font=font_content)
                line_w = bbox[2] - bbox[0]
            line = line + "..."
        draw.text(
            ((POSTER_W - line_w) // 2, y),
            line,
            fill=style["fg"],
            font=font_content,
        )
        y += 90

    # 额外说明
    if text_data.get("extra"):
        extra = text_data["extra"]
        y_extra = y + 40
        if y_extra < POSTER_H - 320:
            # 包裹文字
            max_chars = 32
            while len(extra) > max_chars:
                extra = extra[:-2] + "..."
            bbox = draw.textbbox((0, 0), extra, font=font_extra)
            extra_w = bbox[2] - bbox[0]
            draw.text(
                ((POSTER_W - extra_w) // 2, y_extra),
                extra,
                fill=style["fg"],
                font=font_extra,
            )

    # 印章 (底部)
    stamp_text = "心颜共修"
    bbox = draw.textbbox((0, 0), stamp_text, font=font_stamp)
    stamp_w = bbox[2] - bbox[0]
    stamp_x = POSTER_W - 200
    stamp_y = POSTER_H - 280
    draw.rectangle(
        [(stamp_x - 20, stamp_y - 20), (stamp_x + stamp_w + 20, stamp_y + 50)],
        outline=style["stamp"],
        width=2,
    )
    draw.text((stamp_x, stamp_y), stamp_text, fill=style["stamp"], font=font_stamp)

    # 严守水印 (右下角永久)
    bbox = draw.textbbox((0, 0), WATERMARK, font=font_watermark)
    wm_w = bbox[2] - bbox[0]
    draw.text(
        (POSTER_W - wm_w - 60, POSTER_H - 160),
        WATERMARK,
        fill=style["stamp"],
        font=font_watermark,
    )

    # 严守声明 (底部小字)
    disclaimer = "✦ 不上传人脸/自拍, 不 AI 测肤, 仅供日常陪伴"
    draw.text((60, POSTER_H - 80), disclaimer, fill=style["fg"], font=font_watermark)

    return img


def preview_poster(img: Image.Image) -> Image.Image:
    """生成 540x960 预览 (Streamlit 显示用)"""
    return img.resize((PREVIEW_W, PREVIEW_H), Image.LANCZOS)


def img_to_bytes(img: Image.Image, format: str = "PNG") -> bytes:
    """PIL Image → bytes (给 st.download_button)"""
    buf = io.BytesIO()
    img.save(buf, format=format, quality=95)
    return buf.getvalue()
