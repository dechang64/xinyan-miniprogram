"""
心颜 v0.7.1.7.8-r6: 海报 HTML/SVG 路线 (彻底绕过 PIL 字体坑)
- 不用 PIL 渲染中文, 浏览器/WebView 自动用系统字体
- font-family fallback 链: PingFang SC / Microsoft YaHei / Source Han Sans SC / Noto Sans CJK SC / WenQuanYi Micro Hei
- 海报就是 1 个 540×960 HTML 块, user 长按复制/截图
- Streamlit Cloud 100% 渲染中文
"""
import io
import base64
from datetime import date


def _template_colors(template: str):
    return {
        "📜 经典 (米色竖排)": ("#faf6f0", "#2d3a2e", "#a94442"),
        "🌿 节气 (随节气换色)": ("#f0e9dc", "#2d3a2e", "#4a7c59"),
        "✨ 极简 (白底黑字)": ("#ffffff", "#1a1a1a", "#666666"),
        "🖌️ 文艺 (手写体 + 印章)": ("#f5efe1", "#3d2817", "#a94442"),
        "🌊 水墨 (山水背景)": ("#e8e4d8", "#1a1a1a", "#2d3a2e"),
        "🎨 现代 (彩色几何)": ("#fff8e7", "#4a7c59", "#c9a961"),
    }.get(template, ("#faf6f0", "#2d3a2e", "#a94442"))


FONT_STACK = "'PingFang SC','Microsoft YaHei','Source Han Sans SC','Noto Sans CJK SC','WenQuanYi Micro Hei',sans-serif"


def _frame(html_inner: str, bg: str, fg: str, stamp: str) -> str:
    return f"""<div style="width:540px;height:960px;background:{bg};font-family:{FONT_STACK};color:{fg};padding:50px 40px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;border:3px solid {stamp};border-radius:8px;">{html_inner}</div>"""


def gen_soup_poster_html(sp: dict, template: str, today: date, food_b64: str | None = None) -> str:
    """汤品海报 HTML (CSS 字体走系统 fallback, Cloud 100% 可读)
    food_b64: 食材图 base64 (match_food), 没则 fallback 用 guohua_6 山水
    """
    bg, fg, stamp = _template_colors(template)
    today_str = today.strftime("%Y年%m月%d日")

    # 优先食材图, fallback 山水国画
    img_b64 = food_b64
    if not img_b64:
        try:
            from data.guohua_6 import get_guohua
            img_b64 = get_guohua(template)
        except Exception:
            img_b64 = None

    img_html = ""
    if img_b64:
        img_html = f'<img src="data:image/png;base64,{img_b64}" style="width:300px;max-height:300px;object-fit:cover;border:2px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.15);margin:12px 0;border-radius:4px;" />'

    inner = f"""
  <div style="font-size:14px;letter-spacing:0.3em;color:{stamp};text-align:center;">心颜 · XINYAN</div>
  <div style="font-size:38px;font-weight:600;margin:10px 0;text-align:center;">{sp['name']}</div>
  <div style="font-size:13px;color:{stamp};letter-spacing:0.15em;text-align:center;margin-bottom:15px;">{sp.get('season_tag', '')} · {sp.get('tizhi_tag', '')}</div>
  {img_html}
  <div style="width:100%;margin-top:12px;font-size:16px;line-height:1.7;">
    <div style="color:{stamp};font-weight:600;margin-top:8px;">· 食材</div>
    <div style="margin:4px 0 8px 0;">{sp['ingredients']}</div>
    <div style="color:{stamp};font-weight:600;margin-top:8px;">· 做法</div>
    <div style="margin:4px 0 8px 0;">{sp['steps']}</div>
    <div style="color:{stamp};font-weight:600;margin-top:8px;">· 滋养</div>
    <div style="margin:4px 0 12px 0;color:{stamp};">✦ {sp['effect']}</div>
  </div>
  <div style="margin-top:auto;text-align:center;">
    <div style="display:inline-block;border:1.5px solid {stamp};padding:6px 20px;color:{stamp};font-size:12px;letter-spacing:0.3em;">心颜共修 · 滋养一日</div>
  </div>
  <div style="margin-top:12px;font-size:11px;color:{fg};opacity:0.5;text-align:center;">{today_str} · 每日一汤</div>
"""
    return _frame(inner, bg, fg, stamp)


def gen_jingwen_poster_html(jw: dict, template: str, today: date) -> str:
    """每日一经 海报 HTML"""
    bg, fg, stamp = _template_colors(template)
    today_str = today.strftime("%Y年%m月%d日")

    inner = f"""
  <div style="font-size:14px;letter-spacing:0.3em;color:{stamp};text-align:center;">心颜 · XINYAN</div>
  <div style="font-size:32px;font-weight:600;margin:10px 0;text-align:center;">{jw['title']}</div>
  <div style="font-size:13px;color:{stamp};text-align:center;margin-bottom:15px;">{jw.get('source', '')}</div>
  <div style="width:100%;font-size:18px;line-height:2.0;writing-mode:vertical-rl;text-orientation:upright;height:480px;overflow:hidden;text-align:center;margin:20px auto;border-left:1px solid {stamp};border-right:1px solid {stamp};padding:0 20px;">
    {jw.get('content', '')}
  </div>
  <div style="font-size:14px;color:{stamp};font-style:italic;margin-top:15px;text-align:center;">✦ {jw.get('jieshi', '')}</div>
  <div style="margin-top:auto;text-align:center;">
    <div style="display:inline-block;border:1.5px solid {stamp};padding:6px 20px;color:{stamp};font-size:12px;letter-spacing:0.3em;">心颜共修 · 滋养一日</div>
  </div>
  <div style="margin-top:12px;font-size:11px;color:{fg};opacity:0.5;text-align:center;">{today_str} · 每日一经</div>
"""
    return _frame(inner, bg, fg, stamp)