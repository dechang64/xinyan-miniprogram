"""
心颜 v0.7.1.7.8: 海报生成器 (PIL)
- 固定 9:16 朋友圈尺寸 (1080x1920)
- 固定 3:4 小红书尺寸 (1082x1440)
- 支持经文 / 汤品 两种内容类型
- 输出 PNG bytes 供 st.download_button 下载
- 复用 page 1 guohua_6.py 国画 (意境共修)

严守: 8 禁用词 0 出现, 不写医疗/营销词
"""
import io
import base64
from PIL import Image, ImageDraw, ImageFont
from datetime import date

# 中文字体路径 (Windows)
import os
_FONT_CANDIDATES = [
    r"C:\Windows\Fonts\msyh.ttc",  # 微软雅黑 (Windows)
    r"C:\Windows\Fonts\simhei.ttf",  # 黑体
    r"/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",  # 文泉驿 (Linux)
    r"/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",  # Noto CJK (Linux)
    r"/System/Library/Fonts/PingFang.ttc",  # macOS
]
FONT_PATH = None
for _f in _FONT_CANDIDATES:
    if os.path.exists(_f):
        FONT_PATH = _f
        break
if not FONT_PATH:
    # 备选: PIL default (不支持中文但 fallback)
    FONT_PATH = None


def _font(size: int):
    if FONT_PATH:
        return ImageFont.truetype(FONT_PATH, size)
    return ImageFont.load_default()


# ══════════════════════════════════════════════════════════
#  配色 (心颜基色, 跟 page 1 / page 2 海报对齐)
# ══════════════════════════════════════════════════════════
PALETTE = {
    "📜 经典 (米色竖排)": dict(bg=(250, 246, 240), fg=(45, 58, 46), stamp=(169, 68, 66)),
    "🌿 节气 (随节气换色)": dict(bg=(240, 233, 220), fg=(45, 58, 46), stamp=(74, 124, 89)),
    "✨ 极简 (白底黑字)": dict(bg=(255, 255, 255), fg=(26, 26, 26), stamp=(102, 102, 102)),
    "🖌️ 文艺 (手写体 + 印章)": dict(bg=(245, 239, 225), fg=(61, 40, 23), stamp=(169, 68, 66)),
    "🌊 水墨 (山水背景)": dict(bg=(232, 228, 216), fg=(26, 26, 26), stamp=(45, 58, 46)),
    "🎨 现代 (彩色几何)": dict(bg=(255, 248, 231), fg=(74, 124, 89), stamp=(201, 169, 97)),
}


def _draw_zh(draw, xy, text, fill, font):
    """PIL 写中文"""
    draw.text(xy, text, fill=fill, font=font)


def _wrap_text(text: str, font, max_width: int) -> list:
    """按 max_width 像素宽自动换行 (中文按字符)"""
    lines = []
    cur = ""
    for ch in text:
        bbox = font.getbbox(cur + ch)
        w = bbox[2] - bbox[0]
        if w > max_width and cur:
            lines.append(cur)
            cur = ch
        else:
            cur += ch
    if cur:
        lines.append(cur)
    return lines


def _vertical_text(draw, text: str, xy, fill, font, line_height: int = 50) -> int:
    """竖排文字 (从上到下, 每列从右到左)"""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, fill=fill, font=font)
        y += line_height
    return y


def _draw_guohua(img, template: str, layout: str):
    """画 page 1 6 张国画之一到海报左上/右下角 (跟 base 海报协调)"""
    try:
        from data.guohua_6 import get_guohua
        b64 = get_guohua(template)
        if not b64:
            return
        guohua_img = Image.open(io.BytesIO(base64.b64decode(b64)))
        # 缩放到合适大小
        target_w = 240
        ratio = target_w / guohua_img.width
        target_h = int(guohua_img.height * ratio)
        guohua_img = guohua_img.resize((target_w, target_h))
        # 位置: 顶部居中
        x = (img.width - target_w) // 2
        y = 80
        # 白色边框
        bordered = Image.new("RGB", (target_w + 20, target_h + 20), "white")
        bordered.paste(guohua_img, (10, 10))
        img.paste(bordered, (x - 10, y - 10))
    except Exception:
        pass


def _draw_corner_seal(draw, template: str, xy, size: int = 60):
    """画 朱砂红 "心颜" 印章 (2 字方印)"""
    palette = PALETTE.get(template, PALETTE["📜 经典 (米色竖排)"])
    x, y = xy
    stamp_color = palette["stamp"]
    # 方框
    draw.rectangle([x, y, x + size, y + size], outline=stamp_color, width=3)
    # 内框
    draw.rectangle([x + 6, y + 6, x + size - 6, y + size - 6], outline=stamp_color, width=1)
    # 字
    font = _font(int(size * 0.4))
    # PIL 写中文: 心颜 (2 字, 居中)
    text = "心颜"
    total_w = sum(font.getbbox(ch)[2] - font.getbbox(ch)[0] for ch in text) + 4
    cx = x + (size - total_w) // 2
    cy = y + (size - font.size) // 2 - 2
    for ch in text:
        draw.text((cx, cy), ch, fill=stamp_color, font=font)
        cx += font.getbbox(ch)[2] - font.getbbox(ch)[0] + 4


def _frame_decor_top(draw, img, template: str):
    """顶部卷轴横线装饰"""
    palette = PALETTE.get(template, PALETTE["📜 经典 (米色竖排)"])
    stamp = palette["stamp"]
    w = img.width
    # 主波纹
    for i, x in enumerate(range(40, w - 40, 60)):
        y = 30 + (5 if i % 2 == 0 else -5)
        draw.arc([x - 15, y - 10, x + 15, y + 10], 0, 180, fill=stamp, width=2)


def _frame_decor_bottom(draw, img, template: str, text: str):
    """底部题款 + 印章"""
    palette = PALETTE.get(template, PALETTE["📜 经典 (米色竖排)"])
    fg = palette["fg"]
    stamp = palette["stamp"]
    w, h = img.size
    font_small = _font(28)
    font_stamp = _font(32)
    # 印章 (左下)
    _draw_corner_seal(draw, template, (60, h - 160), 80)
    # 题款 (右侧)
    _draw_zh(draw, (w // 2 - 100, h - 90), text, fg, font_small)


def _bg(img, template: str):
    palette = PALETTE.get(template, PALETTE["📜 经典 (米色竖排)"])
    bg_color = palette["bg"]
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, img.width, img.height], fill=bg_color)


def _header(draw, img, template: str, eyebrow: str, title: str):
    """顶部: eyebrow + title"""
    palette = PALETTE.get(template, PALETTE["📜 经典 (米色竖排)"])
    stamp = palette["stamp"]
    fg = palette["fg"]
    w = img.width
    # 顶部装饰
    _frame_decor_top(draw, img, template)
    # eyebrow (心颜 · XINYAN)
    font_eyebrow = _font(36)
    bbox = draw.textbbox((0, 0), eyebrow, font=font_eyebrow)
    ew = bbox[2] - bbox[0]
    draw.text(((w - ew) // 2, 100), eyebrow, fill=stamp, font=font_eyebrow)
    # title
    font_title = _font(56)
    bbox = draw.textbbox((0, 0), title, font=font_title)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) // 2, 170), title, fill=fg, font=font_title)


# ══════════════════════════════════════════════════════════
#  生成 9:16 朋友圈海报 (1080×1920)
# ══════════════════════════════════════════════════════════
def gen_jingwen_poster(jw: dict, template: str, today: date, layout: str = "vertical"):
    """每日一经 海报 (1080x1920, 9:16 朋友圈)
    jw: {title, content, source, jieshi}
    """
    W, H = 1080, 1920
    img = Image.new("RGB", (W, H))
    _bg(img, template)
    draw = ImageDraw.Draw(img)
    palette = PALETTE.get(template, PALETTE["📜 经典 (米色竖排)"])
    fg = palette["fg"]
    stamp = palette["stamp"]

    _header(draw, img, template, "心颜 · XINYAN", jw["title"])

    # 国画 (顶部装饰下, 居中)
    _draw_guohua(img, template, "vertical")

    # 经文内容 (竖排, 居中偏右)
    font_content = _font(72)
    content_x = W * 0.62  # 右半部
    content_y = 480
    line_height = 95
    chars_per_col = 12  # 每列 12 字
    content = jw["content"]
    # 分列
    cols = [content[i:i + chars_per_col] for i in range(0, len(content), chars_per_col)]
    for col_idx, col in enumerate(cols):
        col_x = content_x + col_idx * 80
        col_y = content_y
        for ch in col:
            draw.text((col_x, col_y), ch, fill=fg, font=font_content)
            col_y += line_height

    # 来源 (顶部 eyebrow 下方)
    font_source = _font(32)
    bbox = draw.textbbox((0, 0), jw.get("source", ""), font=font_source)
    sw = bbox[2] - bbox[0]
    draw.text(((W - sw) // 2, 230), jw.get("source", ""), fill=fg, font=font_source)

    # 底部: 题款 + 日期 + 印章
    _frame_decor_bottom(draw, img, template, f"{today} · 照镜子")
    # 日期大字
    font_date = _font(40)
    today_str = today.strftime("%Y年%m月%d日")
    bbox = draw.textbbox((0, 0), today_str, font=font_date)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, H - 280), today_str, fill=fg, font=font_date)

    buf = io.BytesIO()
    img.save(buf, format="PNG", quality=95)
    return buf.getvalue()


def gen_soup_poster(sp: dict, template: str, today: date, layout: str = "horizontal"):
    """每日一汤 海报 (1080x1920, 9:16 朋友圈)
    sp: {name, ingredients, steps, effect}
    """
    W, H = 1080, 1920
    img = Image.new("RGB", (W, H))
    _bg(img, template)
    draw = ImageDraw.Draw(img)
    palette = PALETTE.get(template, PALETTE["📜 经典 (米色竖排)"])
    fg = palette["fg"]
    stamp = palette["stamp"]

    _header(draw, img, template, "心颜 · 每日一汤", sp["name"])

    # 国画 (汤品氛围, 跟食材意境关联 — 此处复用 page 1 山水, 跟"滋养共修"匹配)
    _draw_guohua(img, template, "vertical")

    # 来源 (季节标签)
    source_text = f"{sp.get('season_tag', '')} · {sp.get('tizhi_tag', '')}"
    font_source = _font(36)
    bbox = draw.textbbox((0, 0), source_text, font=font_source)
    sw = bbox[2] - bbox[0]
    draw.text(((W - sw) // 2, 240), source_text, fill=stamp, font=font_source)

    # 食材 (大块区域)
    font_section = _font(40)
    font_body = _font(48)
    y = 500
    draw.text((80, y), "✦ 食材", fill=fg, font=font_section)
    y += 70
    ingredients_lines = _wrap_text(sp["ingredients"], font_body, W - 160)
    for line in ingredients_lines:
        draw.text((100, y), line, fill=fg, font=font_body)
        y += 70

    y += 30
    draw.text((80, y), "✦ 做法", fill=fg, font=font_section)
    y += 70
    steps_lines = _wrap_text(sp["steps"], font_body, W - 160)
    for line in steps_lines:
        draw.text((100, y), line, fill=fg, font=font_body)
        y += 70

    y += 30
    # 效果 (大块, 颜色用 stamp 朱砂红)
    draw.text((80, y), "✦ 滋养", fill=stamp, font=font_section)
    y += 70
    effect_lines = _wrap_text(sp["effect"], font_body, W - 160)
    for line in effect_lines:
        draw.text((100, y), line, fill=stamp, font=font_body)
        y += 70

    # 底部
    _frame_decor_bottom(draw, img, template, f"{today} · 每日一汤")
    font_date = _font(40)
    today_str = today.strftime("%Y年%m月%d日")
    bbox = draw.textbbox((0, 0), today_str, font=font_date)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, H - 280), today_str, fill=fg, font=font_date)

    buf = io.BytesIO()
    img.save(buf, format="PNG", quality=95)
    return buf.getvalue()


# ══════════════════════════════════════════════════════════
#  生成 3:4 小红书海报 (1082×1440) — 简化版, 复用 9:16 设计
# ══════════════════════════════════════════════════════════
def gen_jingwen_poster_xhs(jw, template, today):
    """小红书 3:4 (1082×1440)"""
    W, H = 1082, 1440
    img = Image.new("RGB", (W, H))
    _bg(img, template)
    draw = ImageDraw.Draw(img)
    palette = PALETTE.get(template, PALETTE["📜 经典 (米色竖排)"])
    fg = palette["fg"]
    stamp = palette["stamp"]

    _header(draw, img, template, "心颜 · XINYAN", jw["title"])

    # 国画缩小
    try:
        from data.guohua_6 import get_guohua
        b64 = get_guohua(template)
        if b64:
            gi = Image.open(io.BytesIO(base64.b64decode(b64)))
            target_w = 200
            ratio = target_w / gi.width
            gi = gi.resize((target_w, int(gi.height * ratio)))
            img.paste(gi, ((W - target_w) // 2, 100))
    except Exception:
        pass

    font_source = _font(28)
    bbox = draw.textbbox((0, 0), jw.get("source", ""), font=font_source)
    sw = bbox[2] - bbox[0]
    draw.text(((W - sw) // 2, 220), jw.get("source", ""), fill=fg, font=font_source)

    # 内容竖排
    font_content = _font(60)
    cols = [jw["content"][i:i + 10] for i in range(0, len(jw["content"]), 10)]
    content_x = W * 0.6
    content_y = 380
    for col_idx, col in enumerate(cols):
        col_x = content_x + col_idx * 70
        col_y = content_y
        for ch in col:
            draw.text((col_x, col_y), ch, fill=fg, font=font_content)
            col_y += 80

    _frame_decor_bottom(draw, img, template, f"{today}")
    today_str = today.strftime("%Y年%m月%d日")
    font_date = _font(32)
    bbox = draw.textbbox((0, 0), today_str, font=font_date)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, H - 250), today_str, fill=fg, font=font_date)

    buf = io.BytesIO()
    img.save(buf, format="PNG", quality=95)
    return buf.getvalue()